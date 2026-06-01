package com.trustagro.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SendOTPRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;
    
    // For signup, we might optionally need a password.
    // However, the prompt says "User enters email + password on register page", 
    // "System creates unverified account in Keycloak", then "System sends OTP".
    // Wait, the prompt implies creating user FIRST in keycloak.
    // For simplicity, we just take email, or email+password. 
    // I'll add password as optional so the same DTO can be used.
    private String password;
}
