package com.donatebridge.donatebridge_backend.Repository;

import com.donatebridge.donatebridge_backend.Model.Donor;
import com.donatebridge.donatebridge_backend.Model.VerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DonorRepository extends JpaRepository<Donor, Long> {

    Optional<Donor> findByUserId(Long userId);

    boolean existsByUserId(Long userId);
    long countByVerificationStatus(VerificationStatus status);
}