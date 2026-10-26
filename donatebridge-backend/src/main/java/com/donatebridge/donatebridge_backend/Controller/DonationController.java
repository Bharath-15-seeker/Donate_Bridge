package com.donatebridge.donatebridge_backend.Controller;

import com.donatebridge.donatebridge_backend.Model.Donation;
import com.donatebridge.donatebridge_backend.Model.Donor;
import com.donatebridge.donatebridge_backend.Model.User;
import com.donatebridge.donatebridge_backend.Model.VerificationStatus;
import com.donatebridge.donatebridge_backend.Repository.DonorRepository;
import com.donatebridge.donatebridge_backend.Repository.UserRepository;
import com.donatebridge.donatebridge_backend.Service.DonationService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/donations")
public class DonationController {

    private final DonationService donationService;
    private final UserRepository userRepository;
    private final DonorRepository donorRepository;

    public DonationController(
            DonationService donationService,
            UserRepository userRepository,
            DonorRepository donorRepository) {

        this.donationService = donationService;
        this.userRepository = userRepository;
        this.donorRepository = donorRepository;
    }

    // =========================
    // CREATE DONATION
    // =========================

    @PostMapping(
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<Donation> createDonation(

            @RequestPart("data")
            Donation donation,

            @RequestPart(value = "images", required = false)
            List<MultipartFile> images,

            Authentication authentication) {

        User user = userRepository
                .findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"));

        Donor donor = donorRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    Donor newDonor = new Donor();
                    newDonor.setUserId(user.getId());
                    newDonor.setVerificationStatus(VerificationStatus.PENDING);
                    return donorRepository.save(newDonor);
                });

        if (donor.getVerificationStatus() != VerificationStatus.VERIFIED) {
            throw new IllegalStateException("Your donor profile must be approved by an admin before posting donations");
        }

        Donation savedDonation =
                donationService.createDonation(
                        donation,
                        donor.getId(),
                        images
                );

        return ResponseEntity.ok(savedDonation);
    }

    // =========================
    // GET MY DONATIONS
    // =========================

    @GetMapping("/my")
    public ResponseEntity<List<Donation>> getMyDonations(
            Authentication authentication) {

        User user = userRepository
                .findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"));

        Donor donor = donorRepository.findByUserId(user.getId()).orElse(null);
        Long donorId = donor != null ? donor.getId() : null;

        List<Donation> donations =
                donationService.getMyDonations(
                        donorId,
                        user.getId()
                );

        return ResponseEntity.ok(donations);
    }

    // =========================
    // GET DONATION BY ID
    // =========================

    @GetMapping("/{id}")
    public ResponseEntity<Donation> getDonationById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                donationService.getDonationById(id)
        );
    }

    // =========================
    // UPDATE DONATION
    // =========================

    @PutMapping(
            value = "/{id}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<Donation> updateDonation(

            @PathVariable Long id,

            @RequestPart("data")
            Donation donation,

            @RequestPart(value = "images", required = false)
            List<MultipartFile> images,

            Authentication authentication) {

        User user = userRepository
                .findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"));

        Donor donor = donorRepository.findByUserId(user.getId()).orElse(null);
        Long donorId = donor != null ? donor.getId() : null;

        Donation updatedDonation =
                donationService.updateDonation(
                        id,
                        donation,
                        donorId,
                        user.getId(),
                        images
                );

        return ResponseEntity.ok(updatedDonation);
    }

    // =========================
    // PERMANENTLY DELETE DONATION
    // =========================

    @DeleteMapping("/{id}")
    public ResponseEntity<Donation> cancelDonation(
            @PathVariable Long id,
            Authentication authentication) {

        User user = userRepository
                .findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"));

        Donor donor = donorRepository.findByUserId(user.getId()).orElse(null);
        Long donorId = donor != null ? donor.getId() : null;

        Donation deletedDonation =
                donationService.deleteDonation(
                        id,
                        donorId,
                        user.getId()
                );

        return ResponseEntity.ok(deletedDonation);
    }

    @GetMapping("/available")
    public ResponseEntity<List<Donation>> getAvailableDonations() {

        return ResponseEntity.ok(
                donationService.getAvailableDonations()
        );
    }

}
