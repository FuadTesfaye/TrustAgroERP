package com.trustagro.auth.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.Instant;

@Entity
@Table(name = "email_otp_codes", indexes = {
    @Index(name = "idx_email_otp_email", columnList = "email, purpose, expires_at"),
    @Index(name = "idx_email_otp_code", columnList = "otp_code, expires_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmailOTPEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String email;

    @Column(name = "otp_code", nullable = false, length = 6)
    private String otpCode;

    @Column(nullable = false, length = 20)
    private String purpose;

    @Column(columnDefinition = "integer default 0")
    private Integer attempts = 0;

    @Column(name = "max_attempts", columnDefinition = "integer default 3")
    private Integer maxAttempts = 3;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "used_at")
    private Instant usedAt;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();
    
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
