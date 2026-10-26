package com.donatebridge.donatebridge_backend.Security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;
import java.util.List;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration
    ) throws Exception {

        return configuration.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .authorizeHttpRequests(auth -> auth

                        // Authentication endpoints
                        .requestMatchers(
                                "/api/auth/register",
                                "/api/auth/login"
                        ).permitAll()

                        // Donor profile and donation write actions
                        .requestMatchers("/api/donors/**")
                        .hasRole("DONOR")
                        .requestMatchers(HttpMethod.POST, "/api/donations")
                        .hasRole("DONOR")
                        .requestMatchers(HttpMethod.PUT, "/api/donations/**")
                        .hasRole("DONOR")
                        .requestMatchers(HttpMethod.DELETE, "/api/donations/**")
                        .hasRole("DONOR")
                        .requestMatchers(HttpMethod.POST, "/api/requests")
                        .hasRole("NGO")
                        .requestMatchers(HttpMethod.PUT, "/api/requests/*/accept", "/api/requests/*/reject")
                        .hasRole("DONOR")

                        // Requirements
                        .requestMatchers(HttpMethod.GET, "/api/requirements/available", "/api/requirements/*")
                        .authenticated()

                        .requestMatchers("/api/requirements/**")
                        .hasRole("NGO")

                        // NGO
                        .requestMatchers("/api/ngos/**")
                        .hasRole("NGO")

                        // Volunteer
                        .requestMatchers("/api/volunteers/**")
                        .hasRole("VOLUNTEER")

                        // Pickup
                        .requestMatchers(HttpMethod.GET, "/api/pickups/donation/*", "/api/pickups/*")
                        .authenticated()

                        .requestMatchers("/api/pickups/**")
                        .hasAnyRole("VOLUNTEER", "ADMIN")

                        // Donation Requests
                        .requestMatchers("/api/requests/**")
                        .authenticated()

                        // Workflow-scoped contact profiles (controller performs relationship authorization)
                        .requestMatchers("/api/profiles/**").authenticated()

                        // Notifications
                        .requestMatchers("/api/notifications/**")
                        .authenticated()

                        // Admin
                        .requestMatchers("/api/admin/**")
                        .hasRole("ADMIN")

                        // Must ALWAYS be last
                        .anyRequest().authenticated()
                )

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }
}
