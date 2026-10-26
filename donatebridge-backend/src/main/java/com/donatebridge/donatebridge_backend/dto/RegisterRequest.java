package com.donatebridge.donatebridge_backend.dto;



import com.donatebridge.donatebridge_backend.Model.Role;
import lombok.Data;

@Data
public class RegisterRequest {

    private String name;
    private String email;
    private String password;
    private String phone;
    private Role role;
}
