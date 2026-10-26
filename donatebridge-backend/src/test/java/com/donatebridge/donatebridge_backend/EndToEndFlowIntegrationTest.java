package com.donatebridge.donatebridge_backend;

import com.donatebridge.donatebridge_backend.Model.*;
import com.donatebridge.donatebridge_backend.Repository.*;
import com.donatebridge.donatebridge_backend.Service.*;
import com.donatebridge.donatebridge_backend.dto.AuthResponse;
import com.donatebridge.donatebridge_backend.dto.RegisterRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class EndToEndFlowIntegrationTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DonorRepository donorRepository;

    @Autowired
    private NGORepository ngoRepository;

    @Autowired
    private VolunteerRepository volunteerRepository;

    @Autowired
    private DonationRepository donationRepository;

    @Autowired
    private RequirementRepository requirementRepository;

    @Autowired
    private DonationRequestRepository donationRequestRepository;

    @Autowired
    private PickupRepository pickupRepository;

    @Autowired
    private DonationService donationService;

    @Autowired
    private RequirementService requirementService;

    @Autowired
    private DonationRequestService donationRequestService;

    @Autowired
    private PickupService pickupService;

    @Autowired
    private AdminService adminService;

    @Test
    public void testCompleteDonationLifecycleFlow() {
        long timestamp = System.currentTimeMillis();

        // 1. Register Donor
        RegisterRequest donorReq = new RegisterRequest();
        donorReq.setName("Test Donor");
        donorReq.setEmail("donor_" + timestamp + "@test.com");
        donorReq.setPassword("Password123!");
        donorReq.setRole(Role.DONOR);
        AuthResponse donorAuth = authService.register(donorReq);
        assertNotNull(donorAuth.getAccessToken());

        // Verify donor profile auto-created
        Donor donor = donorRepository.findByUserId(donorAuth.getUserId()).orElse(null);
        assertNotNull(donor, "Donor profile should be auto-created on registration");
        donor.setAddress("123 Maple St");
        donor = donorRepository.save(donor);

        // 2. Register NGO
        RegisterRequest ngoReq = new RegisterRequest();
        ngoReq.setName("Test NGO");
        ngoReq.setEmail("ngo_" + timestamp + "@test.com");
        ngoReq.setPassword("Password123!");
        ngoReq.setRole(Role.NGO);
        AuthResponse ngoAuth = authService.register(ngoReq);
        assertNotNull(ngoAuth.getAccessToken());

        // Verify NGO profile auto-created
        NGO ngo = ngoRepository.findByUserId(ngoAuth.getUserId()).orElse(null);
        assertNotNull(ngo, "NGO profile should be auto-created on registration");
        ngo.setAddress("789 Community Blvd");
        ngo = ngoRepository.save(ngo);

        // 3. Register Volunteer
        RegisterRequest volReq = new RegisterRequest();
        volReq.setName("Test Volunteer");
        volReq.setEmail("volunteer_" + timestamp + "@test.com");
        volReq.setPassword("Password123!");
        volReq.setRole(Role.VOLUNTEER);
        AuthResponse volAuth = authService.register(volReq);
        assertNotNull(volAuth.getAccessToken());

        // Verify Volunteer profile auto-created
        Volunteer volunteer = volunteerRepository.findByUserId(volAuth.getUserId()).orElse(null);
        assertNotNull(volunteer, "Volunteer profile should be auto-created on registration");

        // 4. NGO creates a Requirement
        Requirement req = new Requirement();
        req.setTitle("Winter Jackets");
        req.setDescription("Needed for shelter residents");
        req.setCategory("Clothing");
        req.setQuantity(50);
        req.setUnit("Pieces");
        req.setUrgency("HIGH");
        Requirement savedReq = requirementService.createRequirement(req, ngo.getId());
        assertEquals(RequirementStatus.ACTIVE, savedReq.getStatus());

        // 5. Donor creates a Donation linked to the Requirement
        Donation donation = new Donation();
        donation.setTitle("50 Winter Jackets");
        donation.setDescription("Clean, warm jackets");
        donation.setCategory("Clothing");
        donation.setQuantity(50);
        donation.setUnit("Pieces");
        donation.setCondition("Like New");
        donation.setPickupAddress(donor.getAddress());
        donation.setRequirementId(savedReq.getId());
        Donation savedDonation = donationService.createDonation(donation, donor.getId(), null);
        assertEquals(DonationStatus.AVAILABLE, savedDonation.getStatus());

        // Verify Donor can list own donations
        List<Donation> myDonations = donationService.getMyDonations(donor.getId(), donor.getUserId());
        assertTrue(myDonations.stream().anyMatch(d -> d.getId().equals(savedDonation.getId())));

        // 6. NGO creates a DonationRequest for the donation
        DonationRequest request = new DonationRequest();
        request.setDonationId(savedDonation.getId());
        request.setMessage("We would love to distribute these jackets!");
        DonationRequest savedRequest = donationRequestService.createRequest(request, ngo.getId());
        assertEquals(DonationRequestStatus.PENDING, savedRequest.getStatus());

        // Verify Donor sees the request
        List<DonationRequest> donorRequests = donationRequestService.getDonorRequests(donor.getId(), donor.getUserId());
        assertTrue(donorRequests.stream().anyMatch(r -> r.getId().equals(savedRequest.getId())));

        // 7. Donor accepts the request -> automated pickup created
        DonationRequest acceptedReq = donationRequestService.acceptRequest(savedRequest.getId(), donor.getId(), donor.getUserId());
        assertEquals(DonationRequestStatus.ACCEPTED, acceptedReq.getStatus());

        // Verify donation is now ACCEPTED
        Donation acceptedDonation = donationRepository.findById(savedDonation.getId()).orElseThrow();
        assertEquals(DonationStatus.ACCEPTED, acceptedDonation.getStatus());

        // Verify pickup was created
        Pickup pickup = pickupRepository.findByDonationId(savedDonation.getId()).orElse(null);
        assertNotNull(pickup, "Pickup should be automatically created when request is accepted");
        assertEquals(PickupStatus.ASSIGNED, pickup.getStatus());
        assertEquals(donor.getAddress(), pickup.getPickupAddress());
        assertEquals(ngo.getAddress(), pickup.getDeliveryAddress());

        // 8. Volunteer accepts the pickup
        Pickup acceptedPickup = pickupService.acceptPickup(pickup.getId(), volunteer.getId());
        assertEquals(volunteer.getId(), acceptedPickup.getVolunteerId());

        Donation inTransit1 = donationRepository.findById(savedDonation.getId()).orElseThrow();
        assertEquals(DonationStatus.PICKUP_ASSIGNED, inTransit1.getStatus());

        // 9. Volunteer starts the pickup
        Pickup startedPickup = pickupService.startPickup(pickup.getId(), volunteer.getId());
        assertEquals(PickupStatus.STARTED, startedPickup.getStatus());

        Donation inTransit2 = donationRepository.findById(savedDonation.getId()).orElseThrow();
        assertEquals(DonationStatus.PICKUP_STARTED, inTransit2.getStatus());

        // 10. Volunteer marks picked up
        Pickup pickedUp = pickupService.markPickedUp(pickup.getId(), volunteer.getId());
        assertEquals(PickupStatus.PICKED_UP, pickedUp.getStatus());

        Donation inTransit3 = donationRepository.findById(savedDonation.getId()).orElseThrow();
        assertEquals(DonationStatus.PICKED_UP, inTransit3.getStatus());

        // 11. Volunteer marks delivered
        Pickup delivered = pickupService.markDelivered(pickup.getId(), volunteer.getId());
        assertEquals(PickupStatus.DELIVERED, delivered.getStatus());

        Donation inTransit4 = donationRepository.findById(savedDonation.getId()).orElseThrow();
        assertEquals(DonationStatus.DELIVERED, inTransit4.getStatus());

        // 12. Volunteer completes the pickup
        Pickup completed = pickupService.completePickup(pickup.getId(), volunteer.getId());
        assertEquals(PickupStatus.COMPLETED, completed.getStatus());

        Donation finishedDonation = donationRepository.findById(savedDonation.getId()).orElseThrow();
        assertEquals(DonationStatus.COMPLETED, finishedDonation.getStatus());

        // Verify requirement was marked FULFILLED
        Requirement fulfilledReq = requirementRepository.findById(savedReq.getId()).orElseThrow();
        assertEquals(RequirementStatus.FULFILLED, fulfilledReq.getStatus());

        // 13. Verify admin dashboard metrics
        AdminDashboardResponse dashboard = adminService.getDashboard();
        assertTrue(dashboard.getTotalUsers() >= 3);
        assertTrue(dashboard.getCompletedDonations() >= 1);
        assertTrue(dashboard.getCompletedPickups() >= 1);
        assertTrue(dashboard.getFulfilledRequirements() >= 1);
    }
}
