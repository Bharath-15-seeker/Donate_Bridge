package com.donatebridge.donatebridge_backend.Controller;

import com.donatebridge.donatebridge_backend.Model.*;
import com.donatebridge.donatebridge_backend.Repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

/** Returns only the contact details needed by people involved in a donation workflow. */
@RestController
@RequestMapping("/api/profiles")
public class ProfileContactsController {
    private final UserRepository userRepository;
    private final DonationRepository donationRepository;
    private final DonationRequestRepository requestRepository;
    private final PickupRepository pickupRepository;
    private final DonorRepository donorRepository;
    private final NGORepository ngoRepository;
    private final VolunteerRepository volunteerRepository;

    public ProfileContactsController(UserRepository userRepository,
                                     DonationRepository donationRepository,
                                     DonationRequestRepository requestRepository,
                                     PickupRepository pickupRepository,
                                     DonorRepository donorRepository,
                                     NGORepository ngoRepository,
                                     VolunteerRepository volunteerRepository) {
        this.userRepository = userRepository;
        this.donationRepository = donationRepository;
        this.requestRepository = requestRepository;
        this.pickupRepository = pickupRepository;
        this.donorRepository = donorRepository;
        this.ngoRepository = ngoRepository;
        this.volunteerRepository = volunteerRepository;
    }

    @GetMapping("/donation/{donationId}/contacts")
    public ResponseEntity<Map<String, Object>> getDonationContacts(@PathVariable Long donationId,
                                                                   Authentication authentication) {
        User current = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        Donation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Donation not found"));

        Donor donor = donorRepository.findById(donation.getDonorId())
                .or(() -> donorRepository.findByUserId(donation.getDonorId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Donor profile not found"));
        List<DonationRequest> requests = requestRepository.findByDonationId(donationId);
        Pickup pickup = pickupRepository.findByDonationId(donationId).orElse(null);
        NGO acceptedNgo = requests.stream()
                .filter(r -> r.getStatus() == DonationRequestStatus.ACCEPTED)
                .map(r -> ngoRepository.findById(r.getNgoId()).orElse(null))
                .filter(Objects::nonNull).findFirst().orElse(null);

        boolean authorized = false;
        Map<String, Object> result = new LinkedHashMap<>();
        if (current.getRole() == Role.ADMIN) {
            authorized = true;
        } else if (current.getRole() == Role.DONOR) {
            authorized = Objects.equals(donor.getUserId(), current.getId());
            if (authorized) {
                List<Map<String, Object>> ngoContacts = new ArrayList<>();
                for (DonationRequest request : requests) {
                    ngoRepository.findById(request.getNgoId()).ifPresent(ngo -> ngoContacts.add(profile(ngo, request.getStatus())));
                }
                result.put("ngos", ngoContacts);
                result.put("donor", profile(donor, null));
            }
        } else if (current.getRole() == Role.NGO) {
            NGO currentNgo = ngoRepository.findByUserId(current.getId()).orElse(null);
            authorized = currentNgo != null && requests.stream().anyMatch(r -> Objects.equals(r.getNgoId(), currentNgo.getId()));
            if (authorized) {
                result.put("donor", profile(donor, null));
                if (pickup != null && pickup.getVolunteerId() != null) {
                    volunteerRepository.findById(pickup.getVolunteerId()).ifPresent(v -> result.put("volunteer", profile(v, null)));
                }
                if (acceptedNgo != null) result.put("ngo", profile(acceptedNgo, null));
            }
        } else if (current.getRole() == Role.VOLUNTEER) {
            Volunteer currentVolunteer = volunteerRepository.findByUserId(current.getId()).orElse(null);
            authorized = currentVolunteer != null && pickup != null && Objects.equals(pickup.getVolunteerId(), currentVolunteer.getId());
            if (authorized) {
                result.put("donor", profile(donor, null));
                if (acceptedNgo != null) result.put("ngo", profile(acceptedNgo, null));
                result.put("volunteer", profile(currentVolunteer, null));
            }
        }
        if (!authorized) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not involved in this donation workflow");
        result.put("donationId", donationId);
        return ResponseEntity.ok(result);
    }

    private Map<String, Object> profile(Object profile, Object workflowStatus) {
        Long userId;
        Map<String, Object> result = new LinkedHashMap<>();
        if (profile instanceof Donor donor) {
            userId = donor.getUserId();
            result.put("profileId", donor.getId());
            result.put("role", "DONOR");
            result.put("organizationName", donor.getOrganizationName());
            result.put("address", donor.getAddress());
            result.put("verificationStatus", donor.getVerificationStatus());
        } else if (profile instanceof NGO ngo) {
            userId = ngo.getUserId();
            result.put("profileId", ngo.getId());
            result.put("role", "NGO");
            result.put("organizationName", ngo.getOrganizationName());
            result.put("registrationNumber", ngo.getRegistrationNumber());
            result.put("address", ngo.getAddress());
            result.put("verificationStatus", ngo.getVerificationStatus());
        } else if (profile instanceof Volunteer volunteer) {
            userId = volunteer.getUserId();
            result.put("profileId", volunteer.getId());
            result.put("role", "VOLUNTEER");
            result.put("vehicleType", volunteer.getVehicleType());
            result.put("vehicleNumber", volunteer.getVehicleNumber());
            result.put("verificationStatus", volunteer.getVerificationStatus());
            result.put("availabilityStatus", volunteer.getAvailabilityStatus());
        } else {
            throw new IllegalArgumentException("Unsupported profile type");
        }
        User user = userRepository.findById(userId).orElse(null);
        if (user != null) {
            result.put("name", user.getName());
            result.put("email", user.getEmail());
            result.put("phone", user.getPhone());
        }
        if (workflowStatus != null) result.put("requestStatus", workflowStatus);
        return result;
    }
}
