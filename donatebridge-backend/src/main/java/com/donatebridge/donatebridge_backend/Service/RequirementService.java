package com.donatebridge.donatebridge_backend.Service;

import com.donatebridge.donatebridge_backend.Model.Requirement;
import com.donatebridge.donatebridge_backend.Model.RequirementStatus;
import com.donatebridge.donatebridge_backend.Repository.RequirementRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RequirementService {

    private final RequirementRepository requirementRepository;

    public RequirementService(
            RequirementRepository requirementRepository) {

        this.requirementRepository = requirementRepository;
    }

    // =========================
    // CREATE REQUIREMENT
    // =========================

    public Requirement createRequirement(
            Requirement requirement,
            Long ngoId) {

        requirement.setNgoId(ngoId);

        requirement.setStatus(
                RequirementStatus.ACTIVE
        );

        return requirementRepository.save(requirement);
    }

    // =========================
    // GET MY REQUIREMENTS
    // =========================

    public List<Requirement> getMyRequirements(
            Long ngoId) {

        return requirementRepository.findByNgoId(ngoId);
    }

    // =========================
    // GET REQUIREMENT BY ID
    // =========================

    public Requirement getRequirementById(Long id) {

        return requirementRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Requirement not found"));
    }

    // =========================
    // UPDATE REQUIREMENT
    // =========================

    public Requirement updateRequirement(
            Long id,
            Requirement updatedRequirement,
            Long ngoId) {

        Requirement existingRequirement =
                requirementRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Requirement not found"));

        // Check ownership
        if (!existingRequirement
                .getNgoId()
                .equals(ngoId)) {

            throw new RuntimeException(
                    "You are not allowed to update this requirement");
        }

        // Only ACTIVE requirements can be updated
        if (existingRequirement.getStatus()
                != RequirementStatus.ACTIVE) {

            throw new RuntimeException(
                    "Only active requirements can be updated");
        }

        existingRequirement.setTitle(
                updatedRequirement.getTitle());

        existingRequirement.setDescription(
                updatedRequirement.getDescription());

        existingRequirement.setCategory(
                updatedRequirement.getCategory());

        existingRequirement.setQuantity(
                updatedRequirement.getQuantity());

        existingRequirement.setUnit(
                updatedRequirement.getUnit());

        existingRequirement.setUrgency(
                updatedRequirement.getUrgency());

        return requirementRepository.save(
                existingRequirement
        );
    }

    // =========================
    // CANCEL REQUIREMENT
    // =========================

    public Requirement cancelRequirement(
            Long id,
            Long ngoId) {

        Requirement requirement =
                requirementRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Requirement not found"));

        if (!requirement
                .getNgoId()
                .equals(ngoId)) {

            throw new RuntimeException(
                    "You are not allowed to cancel this requirement");
        }

        if (requirement.getStatus()
                != RequirementStatus.ACTIVE) {

            throw new RuntimeException(
                    "Only active requirements can be cancelled");
        }

        requirement.setStatus(
                RequirementStatus.CANCELLED
        );

        return requirementRepository.save(
                requirement
        );
    }

    public List<Requirement> getAvailableRequirements() {
        return requirementRepository.findByStatus(RequirementStatus.ACTIVE);
    }
}