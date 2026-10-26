package com.donatebridge.donatebridge_backend.Model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "pickups")
public class Pickup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Donation associated with this pickup
    private Long donationId;

    // Volunteer assigned to this pickup
    private Long volunteerId;

    // Donor pickup location
    private String pickupAddress;

    // NGO delivery location
    private String deliveryAddress;

    // Pickup lifecycle timestamps
    private LocalDateTime assignedAt;

    private LocalDateTime startedAt;

    private LocalDateTime pickedUpAt;

    private LocalDateTime deliveredAt;

    private LocalDateTime completedAt;

    @Enumerated(EnumType.STRING)
    private PickupStatus status;

    @PrePersist
    protected void onCreate() {

        assignedAt = LocalDateTime.now();

        if (status == null) {
            status = PickupStatus.ASSIGNED;
        }
    }
}