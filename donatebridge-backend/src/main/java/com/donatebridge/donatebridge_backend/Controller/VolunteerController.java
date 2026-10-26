package com.donatebridge.donatebridge_backend.Controller;

import com.donatebridge.donatebridge_backend.Model.AvailabilityStatus;
import com.donatebridge.donatebridge_backend.Model.Volunteer;
import com.donatebridge.donatebridge_backend.Model.User;
import com.donatebridge.donatebridge_backend.Repository.UserRepository;
import com.donatebridge.donatebridge_backend.Service.VolunteerService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/volunteers")
public class VolunteerController {

    private final VolunteerService volunteerService;
    private final UserRepository userRepository;

    public VolunteerController(
            VolunteerService volunteerService,
            UserRepository userRepository) {

        this.volunteerService = volunteerService;
        this.userRepository = userRepository;
    }

    @PostMapping("/profile")
    public ResponseEntity<Volunteer> createProfile(
            @RequestBody Volunteer volunteer,
            Authentication authentication) {

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Volunteer savedVolunteer =
                volunteerService.createVolunteer(volunteer, user.getId());

        return ResponseEntity.ok(savedVolunteer);
    }

    @GetMapping("/profile")
    public ResponseEntity<Volunteer> getProfile(
            Authentication authentication) {

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Volunteer volunteer =
                volunteerService.getMyVolunteerProfile(user.getId());

        return ResponseEntity.ok(volunteer);
    }

    @PutMapping("/profile")
    public ResponseEntity<Volunteer> updateProfile(
            @RequestBody Volunteer volunteer,
            Authentication authentication) {

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Volunteer updatedVolunteer =
                volunteerService.updateVolunteer(
                        volunteer,
                        user.getId()
                );

        return ResponseEntity.ok(updatedVolunteer);
    }

    @PutMapping("/availability")
    public ResponseEntity<Volunteer> updateAvailability(
            @RequestParam AvailabilityStatus status,
            Authentication authentication) {

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Volunteer volunteer =
                volunteerService.updateAvailability(
                        user.getId(),
                        status
                );

        return ResponseEntity.ok(volunteer);
    }
}