package com.trustagro.auth.service;

import com.trustagro.auth.dto.LoginResponse;
import com.trustagro.user.entity.User;
import com.trustagro.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class KeycloakAdminClient {

    @Value("${keycloak.server-url:http://localhost:8080}")
    private String serverUrl;

    @Value("${keycloak.realm:trust-agro}")
    private String realm;

    @Value("${keycloak.admin.client-id:admin-cli}")
    private String clientId;

    @Value("${keycloak.admin.client-secret:secret}")
    private String clientSecret;

    @Value("${keycloak.admin.username:admin}")
    private String username;

    @Value("${keycloak.admin.password:admin}")
    private String password;

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final CustomUserDetailsService customUserDetailsService;

    private Keycloak keycloak;

    @PostConstruct
    public void init() {
        try {
            keycloak = KeycloakBuilder.builder()
                .serverUrl(serverUrl)
                .realm("master") // Admin operations usually authenticate against master
                .clientId(clientId)
                .clientSecret(clientSecret)
                .username(username)
                .password(password)
                .build();
        } catch (Exception e) {
            log.warn("Failed to initialize Keycloak admin client: {}", e.getMessage());
        }
    }

    public boolean userExists(String email) {
        // Ideally checking in Keycloak: keycloak.realm(realm).users().search(email, true).isEmpty()
        // Here we can check both Keycloak and Local DB.
        try {
            if (keycloak != null) {
                var users = keycloak.realm(realm).users().searchByEmail(email, true);
                if (!users.isEmpty()) return true;
            }
        } catch (Exception e) {
            log.warn("Keycloak userExists check failed, falling back to local DB", e);
        }
        return userRepository.findByEmail(email).isPresent();
    }

    public LoginResponse generateTokens(String email) {
        // Since we already authenticated the user via OTP, we can issue our JWT token directly.
        // In a pure Keycloak setup, you would use Token Exchange or Direct Grant to get Keycloak tokens.
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found in local DB"));
                
        String token = jwtService.generateToken(user);
        Set<String> roles = customUserDetailsService.getRolesForUser(user);
        
        return new LoginResponse(token, "Bearer", jwtService.getExpiration(), user.getId(),
                user.getFullName(), user.getEmail(), user.getRole(), roles);
    }
}
