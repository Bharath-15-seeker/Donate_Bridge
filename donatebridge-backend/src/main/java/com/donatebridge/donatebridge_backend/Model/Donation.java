package com.donatebridge.donatebridge_backend.Model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@Table(name = "donations")
public class Donation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long donorId;

    private String title;

    @Column(length = 1000)
    private String description;

    private String category;

    private Integer quantity;

    private String unit;

    private String condition;

    private String pickupAddress;

    private Double latitude;

    private Double longitude;

    @Enumerated(EnumType.STRING)
    private DonationStatus status;

    private Long requirementId;

    /*
     * Stores URLs of uploaded images.
     *
     * Actual image files are stored in Cloudinary.
     */
    @ElementCollection
    @CollectionTable(
            name = "donation_images",
            joinColumns = @JoinColumn(name = "donation_id")
    )
    @Column(name = "image_url")
    private List<String> imageUrls = new ArrayList<>();

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {

        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();

        if (status == null) {
            status = DonationStatus.AVAILABLE;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}