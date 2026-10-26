package com.donatebridge.donatebridge_backend.Model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "donors")
public class Donor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private String organizationName;

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