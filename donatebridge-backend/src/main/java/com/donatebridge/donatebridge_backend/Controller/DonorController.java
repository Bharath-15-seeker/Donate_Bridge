package com.donatebridge.donatebridge_backend.Controller;

import com.donatebridge.donatebridge_backend.Model.Donor;
import com.donatebridge.donatebridge_backend.Model.User;
import com.donatebridge.donatebridge_backend.Repository.UserRepository;
import com.donatebridge.donatebridge_backend.Service.DonorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/donors")
@RequiredArgsConstructor
public class DonorController {

    private final DonorService donorService;
    private final UserRepository userRepository;

    @PostMapping("/profile")
    public ResponseEntity<Donor> createProfile(
            @RequestBody Donor donor,
            Authentication authentication
    ) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        Donor savedDonor = donorService.createDonor(
                donor,
                user.getId()
        );

        return ResponseEntity.ok(savedDonor);
    }

    @GetMapping("/profile")
    public ResponseEntity<Donor> getMyProfile(
            Authentication authentication
    ) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        Donor donor = donorService.getMyDonorProfile(
                user.getId()
        );

        return ResponseEntity.ok(donor);
    }

    @PutMapping("/profile")
    public ResponseEntity<Donor> updateProfile(
            @RequestBody Donor donor,
            Authentication authentication
    ) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        Donor updatedDonor = donorService.updateDonor(
                donor,
                user.getId()
        );

        return ResponseEntity.ok(updatedDonor);
    }
}