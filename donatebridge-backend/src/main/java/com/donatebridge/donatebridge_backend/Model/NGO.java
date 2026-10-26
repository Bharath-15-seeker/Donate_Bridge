package com.donatebridge.donatebridge_backend.Model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "ngos")
public class NGO {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private String organizationName;

    private String registrationNumber;

    private String address;

    private Double latitude;

    private Double longitude;

    @Enumerated(EnumType.STRING)
    private VerificationStatus verificationStatus;

    @PrePersist
    protected void onCreate() {
        if (verificationStatus == null) {
            verificationStatus = VerificationStatus.PENDING;
        }
    }
}