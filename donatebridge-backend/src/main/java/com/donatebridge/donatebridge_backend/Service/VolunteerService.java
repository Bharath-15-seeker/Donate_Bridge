package com.donatebridge.donatebridge_backend.Service;

import com.donatebridge.donatebridge_backend.Model.AvailabilityStatus;
import com.donatebridge.donatebridge_backend.Model.VerificationStatus;
import com.donatebridge.donatebridge_backend.Model.Volunteer;
import com.donatebridge.donatebridge_backend.Repository.VolunteerRepository;
import org.springframework.stereotype.Service;

@Service
public class VolunteerService {

    private final VolunteerRepository volunteerRepository;

    public VolunteerService(VolunteerRepository volunteerRepository) {
        this.volunteerRepository = volunteerRepository;
    }

    public Volunteer createVolunteer(Volunteer volunteer, Long userId) {

        if (volunteerRepository.existsByUserId(userId)) {
            return updateVolunteer(volunteer, userId);
        }

        volunteer.setUserId(userId);
        if (volunteer.getAvailabilityStatus() == null) {
            volunteer.setAvailabilityStatus(AvailabilityStatus.OFFLINE);
        }
        if (volunteer.getVerificationStatus() == null) {
            volunteer.setVerificationStatus(VerificationStatus.PENDING);
        }

        return volunteerRepository.save(volunteer);
    }

    public Volunteer getMyVolunteerProfile(Long userId) {

        return volunteerRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Volunteer volunteer = new Volunteer();
                    volunteer.setUserId(userId);
                    volunteer.setAvailabilityStatus(AvailabilityStatus.OFFLINE);
                    volunteer.setVerificationStatus(VerificationStatus.PENDING);
                    return volunteerRepository.save(volunteer);
                });
    }

    public Volunteer updateVolunteer(Volunteer updatedVolunteer, Long userId) {

        Volunteer existingVolunteer = volunteerRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Volunteer volunteer = new Volunteer();
                    volunteer.setUserId(userId);
                    volunteer.setAvailabilityStatus(AvailabilityStatus.OFFLINE);
                    volunteer.setVerificationStatus(VerificationStatus.PENDING);
                    return volunteerRepository.save(volunteer);
                });

        if (updatedVolunteer.getVehicleType() != null) {
            existingVolunteer.setVehicleType(updatedVolunteer.getVehicleType());
        }
        if (updatedVolunteer.getVehicleNumber() != null) {
            existingVolunteer.setVehicleNumber(updatedVolunteer.getVehicleNumber());
        }

        return volunteerRepository.save(existingVolunteer);
    }

    public Volunteer updateAvailability(
            Long userId,
            AvailabilityStatus status) {

        Volunteer volunteer = volunteerRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Volunteer v = new Volunteer();
                    v.setUserId(userId);
                    v.setAvailabilityStatus(AvailabilityStatus.OFFLINE);
                    v.setVerificationStatus(VerificationStatus.PENDING);
                    return volunteerRepository.save(v);
                });

        volunteer.setAvailabilityStatus(status);

        return volunteerRepository.save(volunteer);
    }
}
