package com.donatebridge.donatebridge_backend.Service;

import com.donatebridge.donatebridge_backend.Model.Donor;
import com.donatebridge.donatebridge_backend.Model.VerificationStatus;
import com.donatebridge.donatebridge_backend.Repository.DonorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DonorService {

    private final DonorRepository donorRepository;

    public Donor createDonor(Donor donor, Long userId) {

        if (donorRepository.existsByUserId(userId)) {
            return updateDonor(donor, userId);
        }

        donor.setUserId(userId);
        if (donor.getVerificationStatus() == null) {
            donor.setVerificationStatus(VerificationStatus.PENDING);
        }

        return donorRepository.save(donor);
    }

    public Donor getMyDonorProfile(Long userId) {

        return donorRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Donor donor = new Donor();
                    donor.setUserId(userId);
                    donor.setVerificationStatus(VerificationStatus.PENDING);
                    return donorRepository.save(donor);
                });
    }

    public Donor updateDonor(Donor updatedDonor, Long userId) {

        Donor existingDonor = donorRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Donor donor = new Donor();
                    donor.setUserId(userId);
                    donor.setVerificationStatus(VerificationStatus.PENDING);
                    return donorRepository.save(donor);
                });

        if (updatedDonor.getOrganizationName() != null) {
            existingDonor.setOrganizationName(updatedDonor.getOrganizationName());
        }

        if (updatedDonor.getAddress() != null) {
            existingDonor.setAddress(updatedDonor.getAddress());
        }

        if (updatedDonor.getLatitude() != null) {
            existingDonor.setLatitude(updatedDonor.getLatitude());
        }

        if (updatedDonor.getLongitude() != null) {
            existingDonor.setLongitude(updatedDonor.getLongitude());
        }

        return donorRepository.save(existingDonor);
    }
}
