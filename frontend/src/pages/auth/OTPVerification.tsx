import React, { useState, useRef, useEffect, KeyboardEvent, ChangeEvent } from 'react';
import './AuthPages.css';

interface OTPVerificationProps {
  email: string;
  onVerify: (otp: string) => Promise<void>;
  onResend: () => Promise<void>;
  isLoading: boolean;
}

export const OTPVerification: React.FC<OTPVerificationProps> = ({ email, onVerify, onResend, isLoading }) => {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setInterval(() => setResendCooldown(c => c - 1), 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [resendCooldown]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    // Take only the last character if multiple are pasted
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Move to next input if filled
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
    const newOtp = [...otp];
    
    let currentInput = 0;
    pastedData.forEach((char) => {
      if (!isNaN(Number(char)) && currentInput < 6) {
        newOtp[currentInput] = char;
        currentInput++;
      }
    });
    setOtp(newOtp);
    if (currentInput < 6) {
      inputRefs.current[currentInput]?.focus();
    } else {
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }
    setError(null);
    try {
      await onVerify(otpCode);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      await onResend();
      setResendCooldown(60);
      setError(null);
      setOtp(Array(6).fill(''));
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend code.');
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-logo">🌾 Trust Agro</div>
      <h2 className="auth-title">Verify your email</h2>
      <p className="auth-subtitle">We've sent a 6-digit code to <strong>{email}</strong></p>

      {error && <div className="auth-error">{error}</div>}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="otp-input-container">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={el => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              className="otp-input"
              disabled={isLoading}
              required
            />
          ))}
        </div>

        <button type="submit" className="auth-button" disabled={isLoading || otp.join('').length !== 6}>
          {isLoading ? 'Verifying...' : 'Verify Code'}
        </button>

        <div className="resend-text">
          Didn't receive the code?{' '}
          {resendCooldown > 0 ? (
            <span style={{ color: '#94a3b8' }}>Resend in {resendCooldown}s</span>
          ) : (
            <button 
              type="button" 
              onClick={handleResend} 
              style={{ background: 'none', border: 'none', color: '#10B981', fontWeight: 600, cursor: 'pointer', padding: 0 }}
              disabled={isLoading}
            >
              Resend Code
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
