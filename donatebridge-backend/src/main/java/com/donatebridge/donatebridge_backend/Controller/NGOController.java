package com.donatebridge.donatebridge_backend.Controller;

import com.donatebridge.donatebridge_backend.Model.NGO;
import com.donatebridge.donatebridge_backend.Model.User;
import com.donatebridge.donatebridge_backend.Repository.UserRepository;
import com.donatebridge.donatebridge_backend.Service.NGOService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ngos")
@RequiredArgsConstructor
public class NGOController {

    private final NGOService ngoService;
    private final UserRepository userRepository;

    @PostMapping("/profile")
    public ResponseEntity<NGO> createProfile(
            @RequestBody NGO ngo,
            Authentication authentication
    ) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        NGO savedNGO = ngoService.createNGO(
                ngo,
                user.getId()
        );

        return ResponseEntity.ok(savedNGO);
    }

    @GetMapping("/profile")
    public ResponseEntity<NGO> getMyProfile(
            Authentication authentication
    ) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        NGO ngo = ngoService.getMyNGOProfile(
                user.getId()
        );

        return ResponseEntity.ok(ngo);
    }

    @PutMapping("/profile")
    public ResponseEntity<NGO> updateProfile(
            @RequestBody NGO ngo,
            Authentication authentication
    ) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        NGO updatedNGO = ngoService.updateNGO(
                ngo,
                user.getId()
        );

        return ResponseEntity.ok(updatedNGO);
    }
}