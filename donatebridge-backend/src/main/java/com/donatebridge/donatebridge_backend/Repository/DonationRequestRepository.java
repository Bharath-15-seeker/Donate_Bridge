package com.donatebridge.donatebridge_backend.Repository;

import com.donatebridge.donatebridge_backend.Model.DonationRequest;
import com.donatebridge.donatebridge_backend.Model.DonationRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DonationRequestRepository
        extends JpaRepository<DonationRequest, Long> {

    List<DonationRequest> findByNgoId(Long ngoId);

    List<DonationRequest> findByDonationId(Long donationId);

    boolean existsByDonationIdAndNgoIdAndStatus(
            Long donationId,
            Long ngoId,
            DonationRequestStatus status
    );
    long countByStatus(DonationRequestStatus status);

    void deleteAllByDonationId(Long donationId);
}