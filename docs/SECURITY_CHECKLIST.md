# Trust Agro - Email OTP Security Checklist

This document verifies that the Email OTP Auth Flow complies with the security requirements specified for Trust Agro ERP.

## OTP Generation
- [x] **Cryptographically Secure Random**: `java.security.SecureRandom` is used in `EmailOTPService.java`.
- [x] **6 digits**: The generated code is bounded between 100000 and 999999.
- [x] **No sequential patterns**: The `isSequentialOrRepeating(otp)` method filters out sequential (e.g., 123456) and repeating (e.g., 111111) numbers.
- [x] **Unique per request**: Old OTPs are actively invalidated using `otpRepository.invalidatePreviousOTPs(email, purpose)` before a new OTP is issued.

## Rate Limiting & Account Lockout
- [x] **Max 3 verification attempts per OTP**: Enforced in `EmailOTPService` logic (`max_attempts = 3`).
- [ ] **Max 3 OTP requests per email per hour**: This requires a Redis-based rate limiter or additional database tracking, which is considered a follow-up enhancement in Phase 2.
- [x] **Account lockout (30 minutes)**: Handled by Keycloak's native brute-force protection which monitors the initial password validation attempts.

## Email Security
- [x] **TLS 1.3 for SMTP**: Set via `spring.mail.properties.mail.smtp.ssl.protocols=TLSv1.3` in `application.properties`.
- [x] **No OTP in email subject line**: Subject lines are static (e.g., "Trust Agro - Email Verification Code").
- [x] **HTML Email**: The emails are rendered with custom branding and a responsive layout.

## Token Storage and Session Management
- [x] **Access Token**: Stored in memory by the React application context (`AuthContext.tsx`).
- [ ] **Refresh Token HttpOnly Cookie**: The current backend implementation issues JSON tokens. Setting a `Set-Cookie` header requires configuring a dedicated `/refresh` endpoint, which is a recommended follow-up adjustment.
- [x] **Concurrent Session Limit / Force Logout**: Managed entirely by Keycloak's session management configurations.
