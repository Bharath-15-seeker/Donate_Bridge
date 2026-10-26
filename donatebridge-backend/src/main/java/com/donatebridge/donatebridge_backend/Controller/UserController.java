package com.donatebridge.donatebridge_backend.Controller;

import com.donatebridge.donatebridge_backend.Service.UserService;
import com.donatebridge.donatebridge_backend.dto.UserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(
            Authentication authentication
    ) {

        String email = authentication.getName();

        UserResponse response = userService.getCurrentUser(email);

        return ResponseEntity.ok(response);
    }
}