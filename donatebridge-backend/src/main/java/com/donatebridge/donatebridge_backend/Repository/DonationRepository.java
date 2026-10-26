package com.donatebridge.donatebridge_backend.Repository;

import com.donatebridge.donatebridge_backend.Model.Donation;
import com.donatebridge.donatebridge_backend.Model.DonationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DonationRepository
        extends JpaRepository<Donation, Long> {

    List<Donation> findByDonorId(Long donorId);
    List<Donation> findByDonorIdIn(List<Long> donorIds);
    List<Donation> findByStatus(DonationStatus status);
    Optional<Donation> findByIdAndDonorId(
            Long id,
            Long donorId
    );
    long countByStatus(DonationStatus status);
}
