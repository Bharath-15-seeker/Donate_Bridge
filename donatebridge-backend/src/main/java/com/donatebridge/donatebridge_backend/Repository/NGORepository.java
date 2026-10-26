package com.donatebridge.donatebridge_backend.Repository;

import com.donatebridge.donatebridge_backend.Model.NGO;
import com.donatebridge.donatebridge_backend.Model.VerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface NGORepository extends JpaRepository<NGO, Long> {

    Optional<NGO> findByUserId(Long userId);

    boolean existsByUserId(Long userId);
    long countByVerificationStatus(VerificationStatus status);
}