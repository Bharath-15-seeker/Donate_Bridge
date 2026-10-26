package com.donatebridge.donatebridge_backend.Repository;

import com.donatebridge.donatebridge_backend.Model.Requirement;
import com.donatebridge.donatebridge_backend.Model.RequirementStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RequirementRepository
        extends JpaRepository<Requirement, Long> {

    List<Requirement> findByNgoId(Long ngoId);

    List<Requirement> findByStatus(RequirementStatus status);

    long countByStatus(RequirementStatus status);
}