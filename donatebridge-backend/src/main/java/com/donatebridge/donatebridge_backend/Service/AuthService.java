package com.donatebridge.donatebridge_backend.Service;

import com.donatebridge.donatebridge_backend.Model.*;
import com.donatebridge.donatebridge_backend.Repository.DonorRepository;
import com.donatebridge.donatebridge_backend.Repository.NGORepository;
import com.donatebridge.donatebridge_backend.Repository.UserRepository;
import com.donatebridge.donatebridge_backend.Repository.VolunteerRepository;
import com.donatebridge.donatebridge_backend.dto.AuthResponse;
import com.donatebridge.donatebridge_backend.dto.LoginRequest;
import com.donatebridge.donatebridge_backend.dto.RegisterRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final DonorRepository donorRepository;
    private final NGORepository ngoRepository;
    private final VolunteerRepository volunteerRepository;

    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());

        // For security, don't allow users to register themselves as ADMIN
        Role role = request.getRole();

        if (role == null) {
            role = Role.DONOR;
        }

        user.setRole(role);
        user.setAccountStatus(AccountStatus.ACTIVE);

        User savedUser = userRepository.save(user);

        // Auto-provision initial role profile
        if (role == Role.DONOR) {
            Donor donor = new Donor();
            donor.setUserId(savedUser.getId());
            donor.setVerificationStatus(VerificationStatus.PENDING);
            donorRepository.save(donor);
        } else if (role == Role.NGO) {
            NGO ngo = new NGO();
            ngo.setUserId(savedUser.getId());
            ngo.setVerificationStatus(VerificationStatus.PENDING);
            ngoRepository.save(ngo);
        } else if (role == Role.VOLUNTEER) {
            Volunteer volunteer = new Volunteer();
            volunteer.setUserId(savedUser.getId());
            volunteer.setAvailabilityStatus(AvailabilityStatus.OFFLINE);
            volunteer.setVerificationStatus(VerificationStatus.PENDING);
            volunteerRepository.save(volunteer);
        }

        String token = jwtService.generateToken(savedUser);

        return new AuthResponse(
                token,
                "Bearer",
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getRole()
        );
    }

    public AuthResponse login(LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getAccountStatus() != AccountStatus.ACTIVE) {
            throw new RuntimeException("Account is not active");
        }

        String token = jwtService.generateToken(user);

        return new AuthResponse(
                token,
                "Bearer",
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole()
        );
    }
}
