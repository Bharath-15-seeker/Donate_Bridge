package com.donatebridge.donatebridge_backend.Controller;

import com.donatebridge.donatebridge_backend.dto.AuthResponse;
import com.donatebridge.donatebridge_backend.dto.LoginRequest;
import com.donatebridge.donatebridge_backend.dto.RegisterRequest;
import com.donatebridge.donatebridge_backend.Service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @RequestBody RegisterRequest request) {

        return ResponseEntity.ok(
                authService.register(request)
        );
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @RequestBody LoginRequest request) {

        return ResponseEntity.ok(
                authService.login(request)
        );
    }
}