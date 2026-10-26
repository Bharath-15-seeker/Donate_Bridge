package com.donatebridge.donatebridge_backend.Repository;

import com.donatebridge.donatebridge_backend.Model.Role;
import com.donatebridge.donatebridge_backend.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
    long countByRole(Role role);
}