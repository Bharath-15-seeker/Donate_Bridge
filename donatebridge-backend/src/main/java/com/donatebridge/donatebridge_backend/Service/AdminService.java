package com.donatebridge.donatebridge_backend.Service;

import com.donatebridge.donatebridge_backend.Model.*;
import com.donatebridge.donatebridge_backend.Repository.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final DonorRepository donorRepository;
    private final NGORepository ngoRepository;
    private final VolunteerRepository volunteerRepository;
    private final DonationRepository donationRepository;
    private final RequirementRepository requirementRepository;
    private final DonationRequestRepository donationRequestRepository;
    private final PickupRepository pickupRepository;
    private final DonationService donationService;

    public AdminService(
            UserRepository userRepository,
            DonorRepository donorRepository,
            NGORepository ngoRepository,
            VolunteerRepository volunteerRepository,
            DonationRepository donationRepository,
            RequirementRepository requirementRepository,
            DonationRequestRepository donationRequestRepository,
            PickupRepository pickupRepository,
            DonationService donationService) {

        this.userRepository = userRepository;
        this.donorRepository = donorRepository;
        this.ngoRepository = ngoRepository;
        this.volunteerRepository = volunteerRepository;
        this.donationRepository = donationRepository;
        this.requirementRepository = requirementRepository;
        this.donationRequestRepository = donationRequestRepository;
        this.pickupRepository = pickupRepository;
        this.donationService = donationService;
    }

    // =========================
    // USERS
    // =========================

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {

        return userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));
    }

    public User updateUserStatus(
            Long id,
            AccountStatus status) {

        User user = getUserById(id);

        user.setAccountStatus(status);

        return userRepository.save(user);
    }

    // =========================
    // DONORS
    // =========================

    public List<Donor> getAllDonors() {
        return donorRepository.findAll();
    }

    public Donor verifyDonor(
            Long id,
            VerificationStatus status) {

        Donor donor = donorRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Donor not found"));

        donor.setVerificationStatus(status);

        return donorRepository.save(donor);
    }

    // =========================
    // NGOs
    // =========================

    public List<NGO> getAllNgos() {
        return ngoRepository.findAll();
    }

    public NGO verifyNgo(
            Long id,
            VerificationStatus status) {

        NGO ngo = ngoRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("NGO not found"));

        ngo.setVerificationStatus(status);

        return ngoRepository.save(ngo);
    }

    // =========================
    // VOLUNTEERS
    // =========================

    public List<Volunteer> getAllVolunteers() {
        return volunteerRepository.findAll();
    }

    public Volunteer verifyVolunteer(
            Long id,
            VerificationStatus status) {

        Volunteer volunteer = volunteerRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Volunteer not found"));

        volunteer.setVerificationStatus(status);

        return volunteerRepository.save(volunteer);
    }

    // =========================
    // DONATIONS
    // =========================

    public List<Donation> getAllDonations() {
        return donationRepository.findAll();
    }

    public Donation deleteDonation(Long id) {
        // Reuse the donation service's transactional cleanup logic for related requests and pickups.
        return donationService.adminDeleteDonation(id);
    }

    // =========================
    // REQUIREMENTS
    // =========================

    public List<Requirement> getAllRequirements() {
        return requirementRepository.findAll();
    }

    // =========================
    // REQUESTS
    // =========================

    public List<DonationRequest> getAllRequests() {
        return donationRequestRepository.findAll();
    }

    // =========================
    // PICKUPS
    // =========================

    public List<Pickup> getAllPickups() {
        return pickupRepository.findAll();
    }

    // =========================
    // DASHBOARD
    // =========================

    public AdminDashboardResponse getDashboard() {

        AdminDashboardResponse dashboard =
                new AdminDashboardResponse();

        // Users
        dashboard.setTotalUsers(
                userRepository.count()
        );

        dashboard.setTotalDonors(
                donorRepository.count()
        );

        dashboard.setTotalNgos(
                ngoRepository.count()
        );

        dashboard.setTotalVolunteers(
                volunteerRepository.count()
        );

        // Verification
        dashboard.setPendingDonors(
                donorRepository.countByVerificationStatus(
                        VerificationStatus.PENDING)
        );

        dashboard.setVerifiedDonors(
                donorRepository.countByVerificationStatus(
                        VerificationStatus.VERIFIED)
        );

        dashboard.setPendingNgos(
                ngoRepository.countByVerificationStatus(
                        VerificationStatus.PENDING)
        );

        dashboard.setVerifiedNgos(
                ngoRepository.countByVerificationStatus(
                        VerificationStatus.VERIFIED)
        );

        dashboard.setPendingVolunteers(
                volunteerRepository.countByVerificationStatus(
                        VerificationStatus.PENDING)
        );

        dashboard.setVerifiedVolunteers(
                volunteerRepository.countByVerificationStatus(
                        VerificationStatus.VERIFIED)
        );

        // Donations
        dashboard.setTotalDonations(
                donationRepository.count()
        );

        dashboard.setAvailableDonations(
                donationRepository.countByStatus(
                        DonationStatus.AVAILABLE)
        );

        dashboard.setAcceptedDonations(
                donationRepository.countByStatus(
                        DonationStatus.ACCEPTED)
        );

        dashboard.setCompletedDonations(
                donationRepository.countByStatus(
                        DonationStatus.COMPLETED)
        );

        dashboard.setCancelledDonations(
                donationRepository.countByStatus(
                        DonationStatus.CANCELLED)
        );

        // Requirements
        dashboard.setTotalRequirements(
                requirementRepository.count()
        );

        dashboard.setActiveRequirements(
                requirementRepository.countByStatus(
                        RequirementStatus.ACTIVE)
        );

        dashboard.setFulfilledRequirements(
                requirementRepository.countByStatus(
                        RequirementStatus.FULFILLED)
        );

        dashboard.setCancelledRequirements(
                requirementRepository.countByStatus(
                        RequirementStatus.CANCELLED)
        );

        // Donation Requests
        dashboard.setTotalRequests(
                donationRequestRepository.count()
        );

        dashboard.setPendingRequests(
                donationRequestRepository.countByStatus(
                        DonationRequestStatus.PENDING)
        );

        dashboard.setAcceptedRequests(
                donationRequestRepository.countByStatus(
                        DonationRequestStatus.ACCEPTED)
        );

        dashboard.setRejectedRequests(
                donationRequestRepository.countByStatus(
                        DonationRequestStatus.REJECTED)
        );

        // Pickups
        dashboard.setTotalPickups(
                pickupRepository.count()
        );

        dashboard.setAssignedPickups(
                pickupRepository.countByStatus(
                        PickupStatus.ASSIGNED)
        );

        dashboard.setStartedPickups(
                pickupRepository.countByStatus(
                        PickupStatus.STARTED)
        );

        dashboard.setPickedUpPickups(
                pickupRepository.countByStatus(
                        PickupStatus.PICKED_UP)
        );

        dashboard.setDeliveredPickups(
                pickupRepository.countByStatus(
                        PickupStatus.DELIVERED)
        );

        dashboard.setCompletedPickups(
                pickupRepository.countByStatus(
                        PickupStatus.COMPLETED)
        );

        dashboard.setCancelledPickups(
                pickupRepository.countByStatus(
                        PickupStatus.CANCELLED)
        );

        return dashboard;
    }
}