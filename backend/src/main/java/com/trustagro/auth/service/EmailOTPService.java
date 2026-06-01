package com.trustagro.auth.service;

import com.trustagro.auth.dto.LoginResponse;
import com.trustagro.auth.entity.EmailOTPEntity;
import com.trustagro.auth.repository.EmailOTPCodesRepository;
import com.trustagro.common.exception.BusinessException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailOTPService {

    private final EmailOTPCodesRepository otpRepository;
    private final JavaMailSender mailSender;
    private final KeycloakAdminClient keycloakAdmin;

    @Value("${app.otp.signup.expiry-minutes:10}")
    private int signupExpiryMinutes;

    @Value("${app.otp.login.expiry-minutes:5}")
    private int loginExpiryMinutes;

    @Value("${app.otp.length:6}")
    private int otpLength;

    @Transactional
    public void sendSignupOTP(String email) {
        if (keycloakAdmin.userExists(email)) {
            throw new BusinessException("Email already registered");
        }

        otpRepository.invalidatePreviousOTPs(email, "SIGNUP");

        String otp = generateOTP();

        EmailOTPEntity entity = new EmailOTPEntity();
        entity.setEmail(email);
        entity.setOtpCode(otp);
        entity.setPurpose("SIGNUP");
        entity.setExpiresAt(Instant.now().plus(signupExpiryMinutes, ChronoUnit.MINUTES));
        entity.setMaxAttempts(3);
        otpRepository.save(entity);

        sendOTPEmail(email, otp, "signup", signupExpiryMinutes);

        log.info("Signup OTP sent to: {}", email);
    }

    @Transactional
    public void sendLoginOTP(String email) {
        if (!keycloakAdmin.userExists(email)) {
            throw new BusinessException("User not found");
        }

        otpRepository.invalidatePreviousOTPs(email, "LOGIN");

        String otp = generateOTP();

        EmailOTPEntity entity = new EmailOTPEntity();
        entity.setEmail(email);
        entity.setOtpCode(otp);
        entity.setPurpose("LOGIN");
        entity.setExpiresAt(Instant.now().plus(loginExpiryMinutes, ChronoUnit.MINUTES));
        entity.setMaxAttempts(3);
        otpRepository.save(entity);

        sendOTPEmail(email, otp, "login", loginExpiryMinutes);

        log.info("Login OTP sent to: {}", email);
    }

    @Transactional
    public boolean verifySignupOTP(String email, String otpCode) {
        EmailOTPEntity entity = otpRepository.findValidOTP(email, "SIGNUP", otpCode)
            .orElseThrow(() -> new BusinessException("Invalid or expired OTP"));

        if (entity.getAttempts() >= entity.getMaxAttempts()) {
            throw new BusinessException("Maximum attempts exceeded. Request new OTP.");
        }

        entity.setAttempts(entity.getAttempts() + 1);
        otpRepository.save(entity);

        if (!entity.getOtpCode().equals(otpCode)) {
            int remaining = entity.getMaxAttempts() - entity.getAttempts();
            throw new BusinessException("Invalid OTP. " + remaining + " attempts remaining.");
        }

        entity.setUsedAt(Instant.now());
        otpRepository.save(entity);

        return true;
    }

    @Transactional
    public LoginResponse verifyLoginOTP(String email, String otpCode) {
        EmailOTPEntity entity = otpRepository.findValidOTP(email, "LOGIN", otpCode)
            .orElseThrow(() -> new BusinessException("Invalid or expired OTP"));

        if (entity.getAttempts() >= entity.getMaxAttempts()) {
            throw new BusinessException("Maximum attempts exceeded. Request new OTP.");
        }

        entity.setAttempts(entity.getAttempts() + 1);
        otpRepository.save(entity);

        if (!entity.getOtpCode().equals(otpCode)) {
            int remaining = entity.getMaxAttempts() - entity.getAttempts();
            throw new BusinessException("Invalid OTP. " + remaining + " attempts remaining.");
        }

        entity.setUsedAt(Instant.now());
        otpRepository.save(entity);

        return keycloakAdmin.generateTokens(email);
    }

    private String generateOTP() {
        SecureRandom random = new SecureRandom();
        int otp = 100000 + random.nextInt(900000); 
        return String.valueOf(otp);
    }

    private void sendOTPEmail(String to, String otp, String type, int expiryMinutes) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setFrom("noreply@trustagro.com", "Trust Agro");
            
            if ("signup".equals(type)) {
                helper.setSubject("Trust Agro - Email Verification Code");
                helper.setText(buildSignupEmailTemplate(otp, expiryMinutes), true);
            } else {
                helper.setSubject("Trust Agro - Login Verification Code");
                helper.setText(buildLoginEmailTemplate(otp, expiryMinutes), true);
            }

            mailSender.send(message);
            log.info("OTP email sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send OTP email to: {}", to, e);
            throw new BusinessException("Failed to send verification email. Please try again.");
        }
    }

    private String buildSignupEmailTemplate(String otp, int expiryMinutes) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; background: #f5f5f5; }
                    .container { max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; }
                    .logo { text-align: center; color: #10B981; font-size: 24px; font-weight: bold; margin-bottom: 30px; }
                    .code { font-size: 36px; font-weight: bold; color: #10B981; text-align: center; letter-spacing: 8px; margin: 30px 0; }
                    .footer { color: #64748B; font-size: 12px; text-align: center; margin-top: 30px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="logo">🌾 Trust Agro</div>
                    <h2>Verify Your Email</h2>
                    <p>Thank you for registering with Trust Agro. Use the code below to verify your email address:</p>
                    <div class="code">%s</div>
                    <p>This code will expire in %d minutes.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                    <div class="footer">© 2026 Trust Agro. All rights reserved.</div>
                </div>
            </body>
            </html>
            """.formatted(otp, expiryMinutes);
    }

    private String buildLoginEmailTemplate(String otp, int expiryMinutes) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; background: #f5f5f5; }
                    .container { max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; }
                    .logo { text-align: center; color: #10B981; font-size: 24px; font-weight: bold; margin-bottom: 30px; }
                    .code { font-size: 36px; font-weight: bold; color: #10B981; text-align: center; letter-spacing: 8px; margin: 30px 0; }
                    .alert { background: #FEF3C7; padding: 12px; border-radius: 6px; color: #92400E; font-size: 13px; }
                    .footer { color: #64748B; font-size: 12px; text-align: center; margin-top: 30px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="logo">🌾 Trust Agro</div>
                    <h2>Login Verification Code</h2>
                    <p>We received a login attempt for your account. Use the code below to complete sign-in:</p>
                    <div class="code">%s</div>
                    <p>This code will expire in %d minutes.</p>
                    <div class="alert">⚠️ Never share this code with anyone. Trust Agro staff will never ask for it.</div>
                    <div class="footer">© 2026 Trust Agro. All rights reserved.</div>
                </div>
            </body>
            </html>
            """.formatted(otp, expiryMinutes);
    }
}
