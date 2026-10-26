package com.donatebridge.donatebridge_backend.Service;

import com.donatebridge.donatebridge_backend.Model.*;
import com.donatebridge.donatebridge_backend.Repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PickupService {

    private final PickupRepository pickupRepository;
    private final DonationRepository donationRepository;
    private final DonationRequestRepository donationRequestRepository;
    private final DonorRepository donorRepository;
    private final NGORepository ngoRepository;
    private final NotificationService notificationService;
    private final RequirementRepository requirementRepository;

    public PickupService(
            PickupRepository pickupRepository,
            DonationRepository donationRepository,
            DonationRequestRepository donationRequestRepository,
            DonorRepository donorRepository,
            NGORepository ngoRepository,
            NotificationService notificationService,
            RequirementRepository requirementRepository) {

        this.pickupRepository = pickupRepository;
        this.donationRepository = donationRepository;
        this.donationRequestRepository = donationRequestRepository;
        this.donorRepository = donorRepository;
        this.ngoRepository = ngoRepository;
        this.notificationService = notificationService;
        this.requirementRepository = requirementRepository;
    }

    // =========================
    // CREATE PICKUP
    // =========================

    public Pickup createPickup(
            Long donationId,
            String pickupAddress,
            String deliveryAddress) {

        Pickup pickup = new Pickup();

        pickup.setDonationId(donationId);
        pickup.setPickupAddress(pickupAddress);
        pickup.setDeliveryAddress(deliveryAddress);
        pickup.setStatus(PickupStatus.ASSIGNED);
        pickup.setAssignedAt(LocalDateTime.now());

        return pickupRepository.save(pickup);
    }

    // =========================
    // GET PICKUP BY ID
    // =========================

    public Pickup getPickupById(Long id) {

        return pickupRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Pickup not found"));
    }

    // =========================
    // GET PICKUP BY DONATION ID
    // =========================

    public Pickup getPickupByDonationId(Long donationId) {
        return pickupRepository.findByDonationId(donationId).orElse(null);
    }

    // =========================
    // GET VOLUNTEER PICKUPS
    // =========================

    public List<Pickup> getMyPickups(Long volunteerId) {

        return pickupRepository.findByVolunteerId(volunteerId);
    }

    // =========================
    // GET AVAILABLE PICKUPS
    // =========================

    public List<Pickup> getAvailablePickups() {

        return pickupRepository.findByStatus(
                PickupStatus.ASSIGNED
        );
    }

    // =========================
    // ACCEPT PICKUP
    // =========================

    public Pickup acceptPickup(Long id, Long volunteerId) {

        Pickup pickup = getPickupById(id);

        if (pickup.getStatus() != PickupStatus.ASSIGNED) {
            throw new RuntimeException(
                    "Only assigned pickups can be accepted");
        }

        if (pickup.getVolunteerId() != null) {
            throw new RuntimeException(
                    "Pickup is already assigned to a volunteer");
        }

        pickup.setVolunteerId(volunteerId);

        Pickup savedPickup = pickupRepository.save(pickup);

        // Update donation status to PICKUP_ASSIGNED
        donationRepository.findById(pickup.getDonationId()).ifPresent(d -> {
            d.setStatus(DonationStatus.PICKUP_ASSIGNED);
            donationRepository.save(d);
        });

        // Notify donor
        Long donorUserId = getDonorUserId(pickup.getDonationId());

        notificationService.createNotification(
                donorUserId,
                NotificationType.PICKUP_ACCEPTED,
                "A volunteer has accepted the pickup for your donation."
        );

        // Notify NGO
        Long ngoUserId = getNgoUserId(pickup.getDonationId());

        notificationService.createNotification(
                ngoUserId,
                NotificationType.PICKUP_ACCEPTED,
                "A volunteer has accepted the pickup for your requested donation."
        );

        return savedPickup;
    }

    // =========================
    // START PICKUP
    // =========================

    public Pickup startPickup(Long id, Long volunteerId) {

        Pickup pickup = getPickupById(id);

        checkVolunteer(pickup, volunteerId);

        if (pickup.getStatus() != PickupStatus.ASSIGNED) {
            throw new RuntimeException(
                    "Pickup must be ASSIGNED before starting"
            );
        }

        pickup.setStatus(PickupStatus.STARTED);
        pickup.setStartedAt(LocalDateTime.now());

        Pickup savedPickup = pickupRepository.save(pickup);

        // Update donation status to PICKUP_STARTED
        donationRepository.findById(pickup.getDonationId()).ifPresent(d -> {
            d.setStatus(DonationStatus.PICKUP_STARTED);
            donationRepository.save(d);
        });

        // Notify donor
        Long donorUserId = getDonorUserId(pickup.getDonationId());

        notificationService.createNotification(
                donorUserId,
                NotificationType.PICKUP_STARTED,
                "The volunteer has started the pickup."
        );

        // Notify NGO
        Long ngoUserId = getNgoUserId(pickup.getDonationId());

        notificationService.createNotification(
                ngoUserId,
                NotificationType.PICKUP_STARTED,
                "The volunteer has started the pickup."
        );

        return savedPickup;
    }

    // =========================
    // MARK PICKED UP
    // =========================

    public Pickup markPickedUp(Long id, Long volunteerId) {

        Pickup pickup = getPickupById(id);

        checkVolunteer(pickup, volunteerId);

        if (pickup.getStatus() != PickupStatus.STARTED) {
            throw new RuntimeException(
                    "Pickup must be STARTED before marking as picked up"
            );
        }

        pickup.setStatus(PickupStatus.PICKED_UP);
        pickup.setPickedUpAt(LocalDateTime.now());

        Pickup savedPickup = pickupRepository.save(pickup);

        // Update donation status to PICKED_UP
        donationRepository.findById(pickup.getDonationId()).ifPresent(d -> {
            d.setStatus(DonationStatus.PICKED_UP);
            donationRepository.save(d);
        });

        // Notify donor
        Long donorUserId = getDonorUserId(pickup.getDonationId());

        notificationService.createNotification(
                donorUserId,
                NotificationType.DONATION_PICKED_UP,
                "Your donation has been picked up by the volunteer."
        );

        // Notify NGO
        Long ngoUserId = getNgoUserId(pickup.getDonationId());

        notificationService.createNotification(
                ngoUserId,
                NotificationType.DONATION_PICKED_UP,
                "The donated item has been picked up and is on the way."
        );

        return savedPickup;
    }

    // =========================
    // MARK DELIVERED
    // =========================

    public Pickup markDelivered(Long id, Long volunteerId) {

        Pickup pickup = getPickupById(id);

        checkVolunteer(pickup, volunteerId);

        if (pickup.getStatus() != PickupStatus.PICKED_UP) {
            throw new RuntimeException(
                    "Pickup must be PICKED_UP before marking as delivered"
            );
        }

        pickup.setStatus(PickupStatus.DELIVERED);
        pickup.setDeliveredAt(LocalDateTime.now());

        Pickup savedPickup = pickupRepository.save(pickup);

        // Update donation status to DELIVERED
        donationRepository.findById(pickup.getDonationId()).ifPresent(d -> {
            d.setStatus(DonationStatus.DELIVERED);
            donationRepository.save(d);
        });

        // Notify donor
        Long donorUserId = getDonorUserId(pickup.getDonationId());

        notificationService.createNotification(
                donorUserId,
                NotificationType.DONATION_DELIVERED,
                "Your donated item has been delivered to the NGO."
        );

        // Notify NGO
        Long ngoUserId = getNgoUserId(pickup.getDonationId());

        notificationService.createNotification(
                ngoUserId,
                NotificationType.DONATION_DELIVERED,
                "The donated item has been delivered successfully."
        );

        return savedPickup;
    }

    // =========================
    // COMPLETE PICKUP
    // =========================

    public Pickup completePickup(Long id, Long volunteerId) {

        Pickup pickup = getPickupById(id);

        checkVolunteer(pickup, volunteerId);

        if (pickup.getStatus() != PickupStatus.DELIVERED) {
            throw new RuntimeException(
                    "Pickup must be DELIVERED before completing"
            );
        }

        pickup.setStatus(PickupStatus.COMPLETED);
        pickup.setCompletedAt(LocalDateTime.now());

        Pickup savedPickup = pickupRepository.save(pickup);

        // Update donation status to COMPLETED
        donationRepository.findById(pickup.getDonationId()).ifPresent(d -> {
            d.setStatus(DonationStatus.COMPLETED);
            donationRepository.save(d);

            // If this donation fulfilled a requirement, mark requirement FULFILLED
            if (d.getRequirementId() != null) {
                requirementRepository.findById(d.getRequirementId()).ifPresent(req -> {
                    req.setStatus(RequirementStatus.FULFILLED);
                    requirementRepository.save(req);
                });
            }
        });

        // Notify donor
        Long donorUserId = getDonorUserId(pickup.getDonationId());

        notificationService.createNotification(
                donorUserId,
                NotificationType.PICKUP_COMPLETED,
                "The donation pickup has been completed successfully."
        );

        // Notify NGO
        Long ngoUserId = getNgoUserId(pickup.getDonationId());

        notificationService.createNotification(
                ngoUserId,
                NotificationType.PICKUP_COMPLETED,
                "The donation process has been completed successfully."
        );

        return savedPickup;
    }

    // =========================
    // CHECK VOLUNTEER
    // =========================

    private void checkVolunteer(
            Pickup pickup,
            Long volunteerId) {

        if (pickup.getVolunteerId() == null) {

            throw new RuntimeException(
                    "No volunteer has been assigned to this pickup");
        }

        if (!pickup.getVolunteerId().equals(volunteerId)) {

            throw new RuntimeException(
                    "You are not assigned to this pickup");
        }
    }

    private Long getDonorUserId(Long donationId) {

        Donation donation = donationRepository.findById(donationId)
                .orElseThrow(() ->
                        new RuntimeException("Donation not found"));

        Donor donor = donorRepository.findById(donation.getDonorId())
                .or(() -> donorRepository.findByUserId(donation.getDonorId()))
                .orElse(null);

        return donor != null ? donor.getUserId() : donation.getDonorId();
    }

    private Long getNgoUserId(Long donationId) {

        DonationRequest request = donationRequestRepository
                .findByDonationId(donationId)
                .stream()
                .filter(r -> r.getStatus() == DonationRequestStatus.ACCEPTED)
                .findFirst()
                .orElseThrow(() ->
                        new RuntimeException("Accepted donation request not found"));

        NGO ngo = ngoRepository.findById(request.getNgoId())
                .orElseThrow(() ->
                        new RuntimeException("NGO not found"));

        return ngo.getUserId();
    }

}
