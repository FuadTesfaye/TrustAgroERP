import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { OTPVerification } from './OTPVerification';
import './AuthPages.css';

export const SignupPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      // Step 1: Send Signup OTP
      await authApi.sendSignupOTP(email);
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Email might already be in use.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (otpCode: string) => {
    setLoading(true);
    try {
      await authApi.verifySignupOTP(email, otpCode);
      // Success, redirect to login
      navigate('/login', { state: { message: 'Account verified successfully! Please log in.' } });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    await authApi.sendSignupOTP(email);
  };

  if (step === 2) {
    return (
      <div className="auth-container">
        <OTPVerification 
          email={email}
          onVerify={handleVerifyOTP}
          onResend={handleResendOTP}
          isLoading={loading}
        />
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">🌾 Trust Agro</div>
        <h2 className="auth-title">Create an Account</h2>
        <p className="auth-subtitle">Join us to manage your farm efficiently</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSignupSubmit} className="auth-form">
          <div className="auth-input-group">
            <label className="auth-label" htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              className="auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              disabled={loading}
            />
          </div>

          <div className="auth-input-group">
            <label className="auth-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="auth-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
              minLength={8}
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
        </div>
      </div>
    </div>
  );
};
