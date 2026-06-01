package com.trustagro.auth.repository;

import com.trustagro.auth.entity.EmailOTPEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmailOTPCodesRepository extends JpaRepository<EmailOTPEntity, Long> {

    @Modifying
    @Query("UPDATE EmailOTPEntity e SET e.usedAt = CURRENT_TIMESTAMP WHERE e.email = :email AND e.purpose = :purpose AND e.usedAt IS NULL AND e.expiresAt > CURRENT_TIMESTAMP")
    void invalidatePreviousOTPs(@Param("email") String email, @Param("purpose") String purpose);

    @Query("SELECT e FROM EmailOTPEntity e WHERE e.email = :email AND e.purpose = :purpose AND e.otpCode = :otpCode AND e.usedAt IS NULL AND e.expiresAt > CURRENT_TIMESTAMP")
    Optional<EmailOTPEntity> findValidOTP(@Param("email") String email, @Param("purpose") String purpose, @Param("otpCode") String otpCode);
}
