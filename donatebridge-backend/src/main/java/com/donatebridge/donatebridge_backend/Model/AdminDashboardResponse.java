package com.donatebridge.donatebridge_backend.Model;

import lombok.Data;

@Data
public class AdminDashboardResponse {

    private long totalUsers;

    private long totalDonors;
    private long totalNgos;
    private long totalVolunteers;

    private long pendingDonors;
    private long pendingNgos;
    private long pendingVolunteers;

    private long verifiedDonors;
    private long verifiedNgos;
    private long verifiedVolunteers;

    private long totalDonations;
    private long availableDonations;
    private long acceptedDonations;
    private long completedDonations;
    private long cancelledDonations;

    private long totalRequirements;
    private long activeRequirements;
    private long fulfilledRequirements;
    private long cancelledRequirements;

    private long totalRequests;
    private long pendingRequests;
    private long acceptedRequests;
    private long rejectedRequests;

    private long totalPickups;
    private long assignedPickups;
    private long startedPickups;
    private long pickedUpPickups;
    private long deliveredPickups;
    private long completedPickups;
    private long cancelledPickups;
}