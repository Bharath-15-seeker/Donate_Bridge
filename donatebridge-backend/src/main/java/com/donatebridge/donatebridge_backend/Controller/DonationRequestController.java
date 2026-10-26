package com.donatebridge.donatebridge_backend.Controller;

import com.donatebridge.donatebridge_backend.Model.DonationRequest;
import com.donatebridge.donatebridge_backend.Model.Donor;
import com.donatebridge.donatebridge_backend.Model.NGO;
import com.donatebridge.donatebridge_backend.Model.User;
import com.donatebridge.donatebridge_backend.Model.VerificationStatus;
import com.donatebridge.donatebridge_backend.Repository.DonorRepository;
import com.donatebridge.donatebridge_backend.Repository.NGORepository;
import com.donatebridge.donatebridge_backend.Repository.UserRepository;
import com.donatebridge.donatebridge_backend.Service.DonationRequestService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/requests")
public class DonationRequestController {

    private final DonationRequestService requestService;
    private final UserRepository userRepository;
    private final NGORepository ngoRepository;
    private final DonorRepository donorRepository;

    public DonationRequestController(
            DonationRequestService requestService,
            UserRepository userRepository,
            NGORepository ngoRepository,
            DonorRepository donorRepository) {

        this.requestService = requestService;
        this.userRepository = userRepository;
        this.ngoRepository = ngoRepository;
        this.donorRepository = donorRepository;
    }

    // =========================
    // CREATE REQUEST - NGO
    // =========================

    @PostMapping
    public ResponseEntity<DonationRequest> createRequest(
            @RequestBody DonationRequest request,
            Authentication authentication) {

        User user = userRepository
                .findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"));

        NGO ngo = ngoRepository
                .findByUserId(user.getId())
                .orElseGet(() -> {
                    NGO newNgo = new NGO();
                    newNgo.setUserId(user.getId());
                    newNgo.setVerificationStatus(VerificationStatus.PENDING);
                    return ngoRepository.save(newNgo);
                });

        if (ngo.getVerificationStatus() != VerificationStatus.VERIFIED) {
            throw new IllegalStateException("Your NGO profile must be approved by an admin before requesting donations");
        }

        DonationRequest savedRequest =
                requestService.createRequest(
                        request,
                        ngo.getId()
                );

        return ResponseEntity.ok(savedRequest);
    }

    // =========================
    // MY REQUESTS - NGO / DONOR
    // =========================

    @GetMapping("/my")
    public ResponseEntity<List<DonationRequest>> getMyRequests(
            Authentication authentication) {

        User user = userRepository
                .findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"));

        if (user.getRole() == com.donatebridge.donatebridge_backend.Model.Role.DONOR) {
            Donor donor = donorRepository
                    .findByUserId(user.getId())
                    .orElse(null);
            Long donorId = donor != null ? donor.getId() : null;

            return ResponseEntity.ok(
                    requestService.getDonorRequests(
                            donorId,
                            user.getId()
                    )
            );
        }

        NGO ngo = ngoRepository
                .findByUserId(user.getId())
                .orElse(null);

        if (ngo == null) {
            return ResponseEntity.ok(List.of());
        }

        return ResponseEntity.ok(
                requestService.getMyRequests(
                        ngo.getId()
                )
        );
    }

    // =========================
    // GET REQUEST BY ID
    // =========================

    @GetMapping("/{id}")
    public ResponseEntity<DonationRequest> getRequestById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                requestService.getRequestById(id)
        );
    }

    // =========================
    // ACCEPT REQUEST - DONOR
    // =========================

    @PutMapping("/{id}/accept")
    public ResponseEntity<DonationRequest> acceptRequest(
            @PathVariable Long id,
            Authentication authentication) {

        User user = userRepository
                .findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"));

        Donor donor = donorRepository
                .findByUserId(user.getId())
                .orElse(null);
        Long donorId = donor != null ? donor.getId() : null;

        return ResponseEntity.ok(
                requestService.acceptRequest(
                        id,
                        donorId,
                        user.getId()
                )
        );
    }

    // =========================
    // REJECT REQUEST - DONOR
    // =========================

    @PutMapping("/{id}/reject")
    public ResponseEntity<DonationRequest> rejectRequest(
            @PathVariable Long id,
            Authentication authentication) {

        User user = userRepository
                .findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"));

        Donor donor = donorRepository
                .findByUserId(user.getId())
                .orElse(null);
        Long donorId = donor != null ? donor.getId() : null;

        return ResponseEntity.ok(
                requestService.rejectRequest(
                        id,
                        donorId,
                        user.getId()
                )
        );
    }
}
