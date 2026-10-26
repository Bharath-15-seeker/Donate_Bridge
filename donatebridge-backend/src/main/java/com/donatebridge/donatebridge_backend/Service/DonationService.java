package com.donatebridge.donatebridge_backend.Service;

import com.donatebridge.donatebridge_backend.Model.Donation;
import com.donatebridge.donatebridge_backend.Model.DonationStatus;
import com.donatebridge.donatebridge_backend.Model.Requirement;
import com.donatebridge.donatebridge_backend.Model.RequirementStatus;
import com.donatebridge.donatebridge_backend.Repository.DonationRepository;
import com.donatebridge.donatebridge_backend.Repository.RequirementRepository;
import com.donatebridge.donatebridge_backend.Repository.DonationRequestRepository;
import com.donatebridge.donatebridge_backend.Repository.PickupRepository;
import com.donatebridge.donatebridge_backend.Model.PickupStatus;
import com.donatebridge.donatebridge_backend.Model.DonationRequestStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Service
public class DonationService {

    private final DonationRepository donationRepository;
    private final CloudinaryService cloudinaryService;
    private final RequirementRepository requirementRepository;
    private final DonationRequestRepository requestRepository;
    private final PickupRepository pickupRepository;

    public DonationService(
            DonationRepository donationRepository,
            CloudinaryService cloudinaryService,
            RequirementRepository requirementRepository,
            DonationRequestRepository requestRepository,
            PickupRepository pickupRepository) {

        this.donationRepository = donationRepository;
        this.cloudinaryService = cloudinaryService;
        this.requirementRepository = requirementRepository;
        this.requestRepository = requestRepository;
        this.pickupRepository = pickupRepository;
    }

    // =========================
    // CREATE DONATION
    // =========================

    public Donation createDonation(
            Donation donation,
            Long donorId,
            List<MultipartFile> images) {

        // Set donor
        donation.setDonorId(donorId);

        // =========================
        // REQUIREMENT VALIDATION
        // =========================

        if (donation.getRequirementId() != null) {

            Requirement requirement = requirementRepository
                    .findById(donation.getRequirementId())
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Requirement not found"));

            // Requirement must be active
            if (requirement.getStatus()
                    != RequirementStatus.ACTIVE) {

                throw new RuntimeException(
                        "Requirement is no longer active");
            }
        }

        // Set donation status
        donation.setStatus(DonationStatus.AVAILABLE);

        // =========================
        // UPLOAD IMAGES
        // =========================

        List<String> imageUrls = new ArrayList<>();

        if (images != null) {

            for (MultipartFile image : images) {

                if (!image.isEmpty()) {

                    String imageUrl =
                            cloudinaryService.uploadImage(image);

                    imageUrls.add(imageUrl);
                }
            }
        }

        donation.setImageUrls(imageUrls);

        // Save donation
        return donationRepository.save(donation);
    }

    // =========================
    // GET MY DONATIONS
    // =========================

    public List<Donation> getMyDonations(Long donorId) {
        return donationRepository.findByDonorId(donorId);
    }

    public List<Donation> getMyDonations(Long donorId, Long userId) {
        if (userId != null && donorId != null) {
            return donationRepository.findByDonorIdIn(List.of(donorId, userId));
        } else if (donorId != null) {
            return donationRepository.findByDonorId(donorId);
        } else if (userId != null) {
            return donationRepository.findByDonorId(userId);
        }
        return List.of();
    }

    // =========================
    // GET DONATION BY ID
    // =========================

    public Donation getDonationById(Long id) {

        return donationRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Donation not found"));
    }

    // =========================
    // UPDATE DONATION
    // =========================

    public Donation updateDonation(
            Long id,
            Donation updatedDonation,
            Long donorId,
            Long userId,
            List<MultipartFile> images) {

        Donation existingDonation =
                donationRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Donation not found"));

        // Check ownership
        boolean isOwner = (donorId != null && existingDonation.getDonorId().equals(donorId))
                || (userId != null && existingDonation.getDonorId().equals(userId));

        if (!isOwner) {
            throw new RuntimeException(
                    "You are not allowed to update this donation");
        }

        // Only AVAILABLE donations can be updated
        if (existingDonation.getStatus()
                != DonationStatus.AVAILABLE) {

            throw new RuntimeException(
                    "Only available donations can be updated");
        }

        // =========================
        // UPDATE REQUIREMENT
        // =========================

        if (updatedDonation.getRequirementId() != null) {

            Requirement requirement = requirementRepository
                    .findById(updatedDonation.getRequirementId())
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Requirement not found"));

            if (requirement.getStatus()
                    != RequirementStatus.ACTIVE) {

                throw new RuntimeException(
                        "Requirement is no longer active");
            }

            existingDonation.setRequirementId(
                    updatedDonation.getRequirementId()
            );

        } else {
            existingDonation.setRequirementId(null);
        }

        // =========================
        // UPDATE DONATION DETAILS
        // =========================

        existingDonation.setTitle(
                updatedDonation.getTitle());

        existingDonation.setDescription(
                updatedDonation.getDescription());

        existingDonation.setCategory(
                updatedDonation.getCategory());

        existingDonation.setQuantity(
                updatedDonation.getQuantity());

        existingDonation.setUnit(
                updatedDonation.getUnit());

        existingDonation.setCondition(
                updatedDonation.getCondition());

        existingDonation.setPickupAddress(
                updatedDonation.getPickupAddress());

        existingDonation.setLatitude(
                updatedDonation.getLatitude());

        existingDonation.setLongitude(
                updatedDonation.getLongitude());

        // =========================
        // UPDATE IMAGES
        // =========================

        if (images != null && !images.isEmpty()) {

            List<String> imageUrls = new ArrayList<>();

            for (MultipartFile image : images) {

                if (!image.isEmpty()) {

                    String imageUrl =
                            cloudinaryService.uploadImage(image);

                    imageUrls.add(imageUrl);
                }
            }

            existingDonation.setImageUrls(imageUrls);
        }

        return donationRepository.save(existingDonation);
    }

    public Donation updateDonation(
            Long id,
            Donation updatedDonation,
            Long donorId,
            List<MultipartFile> images) {
        return updateDonation(id, updatedDonation, donorId, null, images);
    }

    // =========================
    // PERMANENT DONATION DELETION
    // =========================

    @Transactional
    public Donation deleteDonation(Long id, Long donorId, Long userId) {
        Donation donation = donationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Donation not found"));

        boolean isOwner = (donorId != null && java.util.Objects.equals(donation.getDonorId(), donorId))
                || (userId != null && java.util.Objects.equals(donation.getDonorId(), userId));
        if (!isOwner) {
            throw new RuntimeException("You are not allowed to delete this donation");
        }
        if (donation.getStatus() != DonationStatus.AVAILABLE && donation.getStatus() != DonationStatus.CANCELLED) {
            throw new RuntimeException("This donation cannot be deleted because its request or delivery workflow has already started");
        }

        // Pending/rejected requests can be removed with the donation. Do not delete accepted or active workflows.
        boolean hasAcceptedRequest = requestRepository.findByDonationId(id).stream()
                .anyMatch(r -> r.getStatus() == DonationRequestStatus.ACCEPTED);
        boolean hasActivePickup = pickupRepository.findByDonationId(id)
                .map(p -> p.getStatus() != PickupStatus.CANCELLED && p.getStatus() != PickupStatus.COMPLETED)
                .orElse(false);
        if (hasAcceptedRequest || hasActivePickup) {
            throw new RuntimeException("This donation is linked to an active request or pickup and cannot be deleted yet");
        }

        requestRepository.deleteAllByDonationId(id);
        pickupRepository.deleteAllByDonationId(id);
        donationRepository.delete(donation);
        return donation;
    }

    @Transactional
    public Donation adminDeleteDonation(Long id) {
        Donation donation = donationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Donation not found"));
        requestRepository.deleteAllByDonationId(id);
        pickupRepository.deleteAllByDonationId(id);
        donationRepository.delete(donation);
        return donation;
    }

    /** Backward-compatible method name retained for callers; deletion is now permanent. */
    public Donation cancelDonation(Long id, Long donorId, Long userId) {
        return deleteDonation(id, donorId, userId);
    }

    public Donation cancelDonation(Long id, Long donorId) {
        return deleteDonation(id, donorId, null);
    }

    // =========================
    // GET AVAILABLE DONATIONS
    // =========================

    public List<Donation> getAvailableDonations() {

        return donationRepository.findByStatus(
                DonationStatus.AVAILABLE
        );
    }
}
