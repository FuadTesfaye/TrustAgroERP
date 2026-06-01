-- OTP Store (temporary codes) 
CREATE TABLE IF NOT EXISTS email_otp_codes (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    purpose VARCHAR(20) NOT NULL, -- 'SIGNUP', 'LOGIN', 'PASSWORD_RESET'
    attempts INT DEFAULT 0,
    max_attempts INT DEFAULT 3,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_purpose CHECK (purpose IN ('SIGNUP', 'LOGIN', 'PASSWORD_RESET'))
);

CREATE INDEX IF NOT EXISTS idx_email_otp_email ON email_otp_codes(email, purpose, expires_at);
CREATE INDEX IF NOT EXISTS idx_email_otp_code ON email_otp_codes(otp_code, expires_at);

-- Cleanup: Note - you can run this query as a scheduled job to remove expired OTPs.
-- DELETE FROM email_otp_codes WHERE expires_at < NOW();
