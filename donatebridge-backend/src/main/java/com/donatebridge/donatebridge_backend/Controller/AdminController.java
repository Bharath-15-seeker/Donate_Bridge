package com.donatebridge.donatebridge_backend.Controller;

import com.donatebridge.donatebridge_backend.Model.*;
import com.donatebridge.donatebridge_backend.Service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    // =========================
    // DASHBOARD
    // =========================

    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardResponse> getDashboard() {

        return ResponseEntity.ok(
                adminService.getDashboard()
        );
    }

    // =========================
    // USERS
    // =========================

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {

        return ResponseEntity.ok(
                adminService.getAllUsers()
        );
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<User> getUserById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                adminService.getUserById(id)
        );
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<User> updateUserStatus(
            @PathVariable Long id,
            @RequestParam AccountStatus status) {

        return ResponseEntity.ok(
                adminService.updateUserStatus(id, status)
        );
    }

    // =========================
    // DONORS
    // =========================

    @GetMapping("/donors")
    public ResponseEntity<List<Donor>> getAllDonors() {

        return ResponseEntity.ok(
                adminService.getAllDonors()
        );
    }

    @PutMapping("/donors/{id}/verify")
    public ResponseEntity<Donor> verifyDonor(
            @PathVariable Long id,
            @RequestParam VerificationStatus status) {

        return ResponseEntity.ok(
                adminService.verifyDonor(id, status)
        );
    }

    // =========================
    // NGOs
    // =========================

    @GetMapping("/ngos")
    public ResponseEntity<List<NGO>> getAllNgos() {

        return ResponseEntity.ok(
                adminService.getAllNgos()
        );
    }

    @PutMapping("/ngos/{id}/verify")
    public ResponseEntity<NGO> verifyNgo(
            @PathVariable Long id,
            @RequestParam VerificationStatus status) {

        return ResponseEntity.ok(
                adminService.verifyNgo(id, status)
        );
    }

    // =========================
    // VOLUNTEERS
    // =========================

    @GetMapping("/volunteers")
    public ResponseEntity<List<Volunteer>> getAllVolunteers() {

        return ResponseEntity.ok(
                adminService.getAllVolunteers()
        );
    }

    @PutMapping("/volunteers/{id}/verify")
    public ResponseEntity<Volunteer> verifyVolunteer(
            @PathVariable Long id,
            @RequestParam VerificationStatus status) {

        return ResponseEntity.ok(
                adminService.verifyVolunteer(id, status)
        );
    }

    // =========================
    // DONATIONS
    // =========================

    @GetMapping("/donations")
    public ResponseEntity<List<Donation>> getAllDonations() {

        return ResponseEntity.ok(
                adminService.getAllDonations()
        );
    }

    @DeleteMapping("/donations/{id}")
    public ResponseEntity<Donation> deleteDonation(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.deleteDonation(id));
    }

    // =========================
    // REQUIREMENTS
    // =========================

    @GetMapping("/requirements")
    public ResponseEntity<List<Requirement>> getAllRequirements() {

        return ResponseEntity.ok(
                adminService.getAllRequirements()
        );
    }

    // =========================
    // DONATION REQUESTS
    // =========================

    @GetMapping("/requests")
    public ResponseEntity<List<DonationRequest>> getAllRequests() {

        return ResponseEntity.ok(
                adminService.getAllRequests()
        );
    }

    // =========================
    // PICKUPS
    // =========================

    @GetMapping("/pickups")
    public ResponseEntity<List<Pickup>> getAllPickups() {

        return ResponseEntity.ok(
                adminService.getAllPickups()
        );
    }
}