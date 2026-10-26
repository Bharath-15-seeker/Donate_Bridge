package com.donatebridge.donatebridge_backend.dto;

import com.donatebridge.donatebridge_backend.Model.AccountStatus;
import com.donatebridge.donatebridge_backend.Model.Role;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserResponse {

    private Long id;
    private String name;
    private String email;
    private String phone;
    private Role role;
    private AccountStatus accountStatus;
}