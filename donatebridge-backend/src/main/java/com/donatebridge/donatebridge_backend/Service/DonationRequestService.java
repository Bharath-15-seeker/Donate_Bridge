package com.donatebridge.donatebridge_backend.Service;

import com.donatebridge.donatebridge_backend.Model.*;
import com.donatebridge.donatebridge_backend.Repository.DonationRepository;
import com.donatebridge.donatebridge_backend.Repository.DonationRequestRepository;
import com.donatebridge.donatebridge_backend.Repository.DonorRepository;
import com.donatebridge.donatebridge_backend.Repository.NGORepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class DonationRequestService {

    private final DonationRequestRepository requestRepository;
    private final DonationRepository donationRepository;
    private final PickupService pickupService;
    private final NGORepository ngoRepository;
    private final NotificationService notificationService;
    private final DonorRepository donorRepository;

    public DonationRequestService(
            DonationRequestRepository requestRepository,
            DonationRepository donationRepository,
            PickupService pickupService,
            NGORepository ngoRepository,
            NotificationService notificationService,
            DonorRepository donorRepository) {

        this.requestRepository = requestRepository;
        this.donationRepository = donationRepository;
        this.pickupService = pickupService;
        this.ngoRepository = ngoRepository;
        this.notificationService = notificationService;
        this.donorRepository = donorRepository;
    }

    // =========================
    // CREATE REQUEST
    // =========================

    public DonationRequest createRequest(
            DonationRequest request,
            Long ngoId) {

        Donation donation = donationRepository.findById(request.getDonationId())
                .orElseThrow(() ->
                        new RuntimeException("Donation not found"));

        if (donation.getStatus() != DonationStatus.AVAILABLE) {
            throw new RuntimeException("Donation is not available");
        }

        if (requestRepository.existsByDonationIdAndNgoIdAndStatus(
                request.getDonationId(),
                ngoId,
                DonationRequestStatus.PENDING)) {

            throw new RuntimeException(
                    "You have already requested this donation");
        }

        // Set request information
        request.setNgoId(ngoId);
        request.setStatus(DonationRequestStatus.PENDING);

        // Save request
        DonationRequest savedRequest =
                requestRepository.save(request);

        // Find donor profile (by id or userId)
        Donor donor = donorRepository.findById(donation.getDonorId())
                .or(() -> donorRepository.findByUserId(donation.getDonorId()))
                .orElse(null);

        Long donorUserId = donor != null ? donor.getUserId() : donation.getDonorId();

        // Create notification for donor
        notificationService.createNotification(
                donorUserId,
                NotificationType.DONATION_REQUEST,
                "New donation request received for your donation."
        );

        return savedRequest;
    }

    // =========================
    // MY REQUESTS
    // =========================

    public List<DonationRequest> getMyRequests(
            Long ngoId) {

        return requestRepository.findByNgoId(ngoId);
    }

    public List<DonationRequest> getDonorRequests(Long donorId, Long userId) {
        List<Long> searchIds = new ArrayList<>();
        if (donorId != null) searchIds.add(donorId);
        if (userId != null) searchIds.add(userId);

        if (searchIds.isEmpty()) {
            return List.of();
        }

        List<Donation> donations = donationRepository.findByDonorIdIn(searchIds);
        List<Long> donationIds = donations.stream().map(Donation::getId).toList();
        return requestRepository.findAll().stream()
                .filter(r -> donationIds.contains(r.getDonationId()))
                .toList();
    }

    public List<DonationRequest> getDonorRequests(Long donorId) {
        return getDonorRequests(donorId, null);
    }

    // =========================
    // GET REQUEST BY ID
    // =========================

    public DonationRequest getRequestById(
            Long id) {

        return requestRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Donation request not found"));
    }

    // =========================
    // ACCEPT REQUEST
    // =========================

    @Transactional
    public DonationRequest acceptRequest(Long id, Long donorId, Long userId) {

        // 1. Find the request
        DonationRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Donation request not found"));

        // 2. Find the donation and verify that this donor owns it
        Donation donation = donationRepository.findById(request.getDonationId())
                .orElseThrow(() -> new RuntimeException("Donation not found"));

        boolean isOwner = (donorId != null && donation.getDonorId().equals(donorId))
                || (userId != null && donation.getDonorId().equals(userId));

        if (!isOwner) {
            throw new RuntimeException("You are not allowed to accept this request");
        }

        // 3. Request must be pending
        if (request.getStatus() != DonationRequestStatus.PENDING) {
            throw new RuntimeException("Only pending requests can be accepted");
        }

        // 4. Donation must be available
        if (donation.getStatus() != DonationStatus.AVAILABLE) {
            throw new RuntimeException("Donation is no longer available");
        }

        // 5. Find NGO
        NGO ngo = ngoRepository.findById(request.getNgoId())
                .orElseThrow(() ->
                        new RuntimeException("NGO not found")
                );

        // 6. Accept request
        request.setStatus(DonationRequestStatus.ACCEPTED);

        // 7. Accept donation
        donation.setStatus(DonationStatus.ACCEPTED);

        donationRepository.save(donation);
        requestRepository.save(request);

        // 8. Automatically create pickup with fallback addresses
        String pickupAddr = (donation.getPickupAddress() != null && !donation.getPickupAddress().isBlank())
                ? donation.getPickupAddress() : "Donor Address";
        String deliveryAddr = (ngo.getAddress() != null && !ngo.getAddress().isBlank())
                ? ngo.getAddress() : "NGO Receiving Center";

        pickupService.createPickup(
                donation.getId(),
                pickupAddr,
                deliveryAddr
        );

        return request;
    }

    public DonationRequest acceptRequest(Long id, Long donorId) {
        return acceptRequest(id, donorId, null);
    }

    // =========================
    // REJECT REQUEST
    // =========================

    public DonationRequest rejectRequest(
            Long id,
            Long donorId,
            Long userId) {

        DonationRequest request =
                requestRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Donation request not found"));

        Donation donation =
                donationRepository.findById(request.getDonationId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Donation not found"));

        boolean isOwner = (donorId != null && donation.getDonorId().equals(donorId))
                || (userId != null && donation.getDonorId().equals(userId));

        if (!isOwner) {
            throw new RuntimeException("You are not the owner of this donation");
        }

        if (request.getStatus()
                != DonationRequestStatus.PENDING) {

            throw new RuntimeException(
                    "Only pending requests can be rejected");
        }

        request.setStatus(
                DonationRequestStatus.REJECTED
        );

        return requestRepository.save(request);
    }

    public DonationRequest rejectRequest(
            Long id,
            Long donorId) {
        return rejectRequest(id, donorId, null);
    }
}
