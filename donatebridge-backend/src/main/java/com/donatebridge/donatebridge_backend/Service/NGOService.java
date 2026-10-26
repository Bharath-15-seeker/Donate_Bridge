package com.donatebridge.donatebridge_backend.Service;

import com.donatebridge.donatebridge_backend.Model.NGO;
import com.donatebridge.donatebridge_backend.Model.VerificationStatus;
import com.donatebridge.donatebridge_backend.Repository.NGORepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NGOService {

    private final NGORepository ngoRepository;

    public NGO createNGO(NGO ngo, Long userId) {

        if (ngoRepository.existsByUserId(userId)) {
            return updateNGO(ngo, userId);
        }

        ngo.setUserId(userId);
        if (ngo.getVerificationStatus() == null) {
            ngo.setVerificationStatus(VerificationStatus.PENDING);
        }

        return ngoRepository.save(ngo);
    }

    public NGO getMyNGOProfile(Long userId) {

        return ngoRepository.findByUserId(userId)
                .orElseGet(() -> {
                    NGO ngo = new NGO();
                    ngo.setUserId(userId);
                    ngo.setVerificationStatus(VerificationStatus.PENDING);
                    return ngoRepository.save(ngo);
                });
    }

    public NGO updateNGO(NGO updatedNGO, Long userId) {

        NGO existingNGO = ngoRepository.findByUserId(userId)
                .orElseGet(() -> {
                    NGO ngo = new NGO();
                    ngo.setUserId(userId);
                    ngo.setVerificationStatus(VerificationStatus.PENDING);
                    return ngoRepository.save(ngo);
                });

        if (updatedNGO.getOrganizationName() != null) {
            existingNGO.setOrganizationName(updatedNGO.getOrganizationName());
        }

        if (updatedNGO.getRegistrationNumber() != null) {
            existingNGO.setRegistrationNumber(updatedNGO.getRegistrationNumber());
        }

        if (updatedNGO.getAddress() != null) {
            existingNGO.setAddress(updatedNGO.getAddress());
        }

        if (updatedNGO.getLatitude() != null) {
            existingNGO.setLatitude(updatedNGO.getLatitude());
        }

        if (updatedNGO.getLongitude() != null) {
            existingNGO.setLongitude(updatedNGO.getLongitude());
        }

        return ngoRepository.save(existingNGO);
    }
}
