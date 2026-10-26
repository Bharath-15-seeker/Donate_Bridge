package com.donatebridge.donatebridge_backend.Repository;

import com.donatebridge.donatebridge_backend.Model.Pickup;
import com.donatebridge.donatebridge_backend.Model.PickupStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PickupRepository extends JpaRepository<Pickup, Long> {

    List<Pickup> findByVolunteerId(Long volunteerId);

    List<Pickup> findByStatus(PickupStatus status);

    Optional<Pickup> findByDonationId(Long donationId);
    long countByStatus(PickupStatus status);

    void deleteAllByDonationId(Long donationId);
}