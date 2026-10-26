package com.donatebridge.donatebridge_backend.Repository;

import com.donatebridge.donatebridge_backend.Model.VerificationStatus;
import com.donatebridge.donatebridge_backend.Model.Volunteer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VolunteerRepository extends JpaRepository<Volunteer, Long> {

    Optional<Volunteer> findByUserId(Long userId);

    boolean existsByUserId(Long userId);
    List<Volunteer> findAllByVerificationStatus(VerificationStatus status);

    long countByVerificationStatus(VerificationStatus status);
}