package com.donatebridge.donatebridge_backend.Controller;

import com.donatebridge.donatebridge_backend.Model.NGO;
import com.donatebridge.donatebridge_backend.Model.Requirement;
import com.donatebridge.donatebridge_backend.Model.User;
import com.donatebridge.donatebridge_backend.Model.VerificationStatus;
import com.donatebridge.donatebridge_backend.Repository.NGORepository;
import com.donatebridge.donatebridge_backend.Repository.UserRepository;
import com.donatebridge.donatebridge_backend.Service.RequirementService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/requirements")
public class RequirementController {

    private final RequirementService requirementService;
    private final UserRepository userRepository;
    private final NGORepository ngoRepository;

    public RequirementController(
            RequirementService requirementService,
            UserRepository userRepository,
            NGORepository ngoRepository) {

        this.requirementService = requirementService;
        this.userRepository = userRepository;
        this.ngoRepository = ngoRepository;
    }

    // =========================
    // CREATE REQUIREMENT
    // =========================

    @PostMapping
    public ResponseEntity<Requirement> createRequirement(
            @RequestBody Requirement requirement,
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

        Requirement savedRequirement =
                requirementService.createRequirement(
                        requirement,
                        ngo.getId()
                );

        return ResponseEntity.ok(
                savedRequirement
        );
    }

    // =========================
    // GET MY REQUIREMENTS
    // =========================

    @GetMapping("/my")
    public ResponseEntity<List<Requirement>> getMyRequirements(
            Authentication authentication) {

        User user = userRepository
                .findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"));

        NGO ngo = ngoRepository
                .findByUserId(user.getId())
                .orElse(null);

        if (ngo == null) {
            return ResponseEntity.ok(List.of());
        }

        return ResponseEntity.ok(
                requirementService.getMyRequirements(
                        ngo.getId()
                )
        );
    }

    // =========================
    // GET REQUIREMENT BY ID
    // =========================

    @GetMapping("/{id}")
    public ResponseEntity<Requirement> getRequirementById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                requirementService.getRequirementById(id)
        );
    }

    // =========================
    // UPDATE REQUIREMENT
    // =========================

    @PutMapping("/{id}")
    public ResponseEntity<Requirement> updateRequirement(
            @PathVariable Long id,
            @RequestBody Requirement requirement,
            Authentication authentication) {

        User user = userRepository
                .findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"));

        NGO ngo = ngoRepository
                .findByUserId(user.getId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "NGO profile not found"));

        Requirement updatedRequirement =
                requirementService.updateRequirement(
                        id,
                        requirement,
                        ngo.getId()
                );

        return ResponseEntity.ok(
                updatedRequirement
        );
    }

    // =========================
    // CANCEL REQUIREMENT
    // =========================

    @DeleteMapping("/{id}")
    public ResponseEntity<Requirement> cancelRequirement(
            @PathVariable Long id,
            Authentication authentication) {

        User user = userRepository
                .findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"));

        NGO ngo = ngoRepository
                .findByUserId(user.getId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "NGO profile not found"));

        Requirement cancelledRequirement =
                requirementService.cancelRequirement(
                        id,
                        ngo.getId()
                );

        return ResponseEntity.ok(
                cancelledRequirement
        );
    }

    @GetMapping("/available")
    public ResponseEntity<List<Requirement>> getAvailableRequirements() {

        return ResponseEntity.ok(
                requirementService.getAvailableRequirements()
        );
    }
}
