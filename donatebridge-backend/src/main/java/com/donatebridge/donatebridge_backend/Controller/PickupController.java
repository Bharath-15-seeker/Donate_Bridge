package com.donatebridge.donatebridge_backend.Controller;

import com.donatebridge.donatebridge_backend.Model.AvailabilityStatus;
import com.donatebridge.donatebridge_backend.Model.Pickup;
import com.donatebridge.donatebridge_backend.Model.User;
import com.donatebridge.donatebridge_backend.Model.VerificationStatus;
import com.donatebridge.donatebridge_backend.Model.Volunteer;
import com.donatebridge.donatebridge_backend.Repository.UserRepository;
import com.donatebridge.donatebridge_backend.Repository.VolunteerRepository;
import com.donatebridge.donatebridge_backend.Service.PickupService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pickups")
public class PickupController {

    private final PickupService pickupService;
    private final UserRepository userRepository;
    private final VolunteerRepository volunteerRepository;

    public PickupController(
            PickupService pickupService,
            UserRepository userRepository,
            VolunteerRepository volunteerRepository) {

        this.pickupService = pickupService;
        this.userRepository = userRepository;
        this.volunteerRepository = volunteerRepository;
    }

    // =========================
    // GET AVAILABLE PICKUPS
    // =========================

    @GetMapping("/available")
    public ResponseEntity<List<Pickup>> getAvailablePickups() {

        return ResponseEntity.ok(
                pickupService.getAvailablePickups()
        );
    }

    // =========================
    // GET MY PICKUPS
    // =========================

    @GetMapping("/my")
    public ResponseEntity<List<Pickup>> getMyPickups(
            Authentication authentication) {

        Long volunteerId = getVolunteerId(authentication);

        return ResponseEntity.ok(
                pickupService.getMyPickups(volunteerId)
        );
    }

    // =========================
    // GET PICKUP BY ID
    // =========================

    @GetMapping("/{id}")
    public ResponseEntity<Pickup> getPickupById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                pickupService.getPickupById(id)
        );
    }

    // =========================
    // GET PICKUP BY DONATION ID
    // =========================

    @GetMapping("/donation/{donationId}")
    public ResponseEntity<Pickup> getPickupByDonationId(
            @PathVariable Long donationId) {

        Pickup pickup = pickupService.getPickupByDonationId(donationId);
        if (pickup == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(pickup);
    }

    // =========================
    // ACCEPT PICKUP
    // =========================

    @PostMapping("/{id}/accept")
    public ResponseEntity<Pickup> acceptPickup(
            @PathVariable Long id,
            Authentication authentication) {

        Long volunteerId = getVolunteerId(authentication);

        return ResponseEntity.ok(
                pickupService.acceptPickup(
                        id,
                        volunteerId
                )
        );
    }

    // =========================
    // START PICKUP
    // =========================

    @PostMapping("/{id}/start")
    public ResponseEntity<Pickup> startPickup(
            @PathVariable Long id,
            Authentication authentication) {

        Long volunteerId = getVolunteerId(authentication);

        return ResponseEntity.ok(
                pickupService.startPickup(
                        id,
                        volunteerId
                )
        );
    }

    // =========================
    // MARK PICKED UP
    // =========================

    @PostMapping("/{id}/picked-up")
    public ResponseEntity<Pickup> markPickedUp(
            @PathVariable Long id,
            Authentication authentication) {

        Long volunteerId = getVolunteerId(authentication);

        return ResponseEntity.ok(
                pickupService.markPickedUp(
                        id,
                        volunteerId
                )
        );
    }

    // =========================
    // MARK DELIVERED
    // =========================

    @PostMapping("/{id}/delivered")
    public ResponseEntity<Pickup> markDelivered(
            @PathVariable Long id,
            Authentication authentication) {

        Long volunteerId = getVolunteerId(authentication);

        return ResponseEntity.ok(
                pickupService.markDelivered(
                        id,
                        volunteerId
                )
        );
    }

    // =========================
    // COMPLETE PICKUP
    // =========================

    @PostMapping("/{id}/complete")
    public ResponseEntity<Pickup> completePickup(
            @PathVariable Long id,
            Authentication authentication) {

        Long volunteerId = getVolunteerId(authentication);

        return ResponseEntity.ok(
                pickupService.completePickup(
                        id,
                        volunteerId
                )
        );
    }

    // =========================
    // GET VOLUNTEER ID
    // =========================

    private Long getVolunteerId(
            Authentication authentication) {

        User user = userRepository
                .findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"));

        Volunteer volunteer = volunteerRepository
                .findByUserId(user.getId())
                .orElseGet(() -> {
                    Volunteer v = new Volunteer();
                    v.setUserId(user.getId());
                    v.setAvailabilityStatus(AvailabilityStatus.OFFLINE);
                    v.setVerificationStatus(VerificationStatus.PENDING);
                    return volunteerRepository.save(v);
                });

        if (volunteer.getVerificationStatus() != VerificationStatus.VERIFIED) {
            throw new IllegalStateException("Your volunteer profile must be approved by an admin before accepting or handling pickups");
        }

        return volunteer.getId();
    }
}
