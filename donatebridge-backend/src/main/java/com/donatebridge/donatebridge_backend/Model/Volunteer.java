package com.donatebridge.donatebridge_backend.Model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "volunteers")
public class Volunteer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private String vehicleType;

    private String vehicleNumber;

    @Enumerated(EnumType.STRING)
    private AvailabilityStatus availabilityStatus;

    @Enumerated(EnumType.STRING)
    private VerificationStatus verificationStatus;

    @PrePersist
    protected void onCreate() {
        if (availabilityStatus == null) {
            availabilityStatus = AvailabilityStatus.OFFLINE;
        }

        if (verificationStatus == null) {
            verificationStatus = VerificationStatus.PENDING;
        }
    }
}