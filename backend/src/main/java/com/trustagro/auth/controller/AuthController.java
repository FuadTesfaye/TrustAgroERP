package com.trustagro.auth.controller;

import com.trustagro.auth.dto.LoginRequest;
import com.trustagro.auth.dto.LoginResponse;
import com.trustagro.auth.service.AuthService;
import com.trustagro.auth.dto.SendOTPRequest;
import com.trustagro.auth.dto.VerifyOTPRequest;
import com.trustagro.auth.service.EmailOTPService;
import com.trustagro.common.response.ApiResponse;
import com.trustagro.user.dto.UserResponse;
import com.trustagro.user.entity.User;
import com.trustagro.user.repository.UserRepository;
import com.trustagro.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final EmailOTPService emailOTPService;
    private final UserRepository userRepository;
    private final UserService userService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest req) {
        // Keeping legacy login just in case, or we can replace it.
        // Actually, requirement says 2-step login: 1. Send OTP, 2. Verify OTP
        return ResponseEntity.ok(ApiResponse.success(authService.login(req)));
    }

    @PostMapping("/signup/otp")
    public ResponseEntity<ApiResponse<Void>> sendSignupOTP(@Valid @RequestBody SendOTPRequest req) {
        emailOTPService.sendSignupOTP(req.getEmail());
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/signup/verify")
    public ResponseEntity<ApiResponse<Boolean>> verifySignupOTP(@Valid @RequestBody VerifyOTPRequest req) {
        boolean verified = emailOTPService.verifySignupOTP(req.getEmail(), req.getOtpCode());
        return ResponseEntity.ok(ApiResponse.success(verified));
    }

    @PostMapping("/login/otp")
    public ResponseEntity<ApiResponse<Void>> sendLoginOTP(@Valid @RequestBody SendOTPRequest req) {
        emailOTPService.sendLoginOTP(req.getEmail());
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/login/verify")
    public ResponseEntity<ApiResponse<LoginResponse>> verifyLoginOTP(@Valid @RequestBody VerifyOTPRequest req) {
        LoginResponse response = emailOTPService.verifyLoginOTP(req.getEmail(), req.getOtpCode());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UserResponse>> me(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(ApiResponse.success(userService.toResponse(user)));
    }
}
