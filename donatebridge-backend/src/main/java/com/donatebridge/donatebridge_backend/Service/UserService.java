package com.donatebridge.donatebridge_backend.Service;

import com.donatebridge.donatebridge_backend.Model.User;
import com.donatebridge.donatebridge_backend.Repository.UserRepository;
import com.donatebridge.donatebridge_backend.dto.UserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public UserResponse getCurrentUser(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole(),
                user.getAccountStatus()
        );
    }
}