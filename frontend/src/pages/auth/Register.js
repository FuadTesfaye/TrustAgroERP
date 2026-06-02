import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Leaf,
  Loader2,
  Lock,
  Mail,
  Package,
  ShieldCheck,
  Sprout,
  Stethoscope,
  Tractor,
  WalletCards,
  Wheat,
} from 'lucide-react';

import { authApi } from '../../api/authApi';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';

const features = [
  { label: 'Farm Management', icon: Tractor },
  { label: 'Veterinary Tracking', icon: Stethoscope },
  { label: 'Inventory & Pharmacy', icon: Package },
  { label: 'Finance & CRM', icon: WalletCards },
];

const operationalMetrics = [
  { label: 'Active modules', value: '12' },
  { label: 'Audit-ready workflows', value: '24/7' },
  { label: 'Secure staff access', value: 'RBAC' },
];

const getAuthErrorMessage = (err) => {
  if (err.code === 'ECONNABORTED' || !err.response) {
    return 'Cannot reach the Trust Agro server. Please check the backend connection.';
  }

  return err.response?.data?.message || 'Invalid email or password. Please try again.';
};

const validateForm = ({ email, password }) => {
  const nextErrors = {};
  const trimmedEmail = email.trim();

  if (!trimmedEmail) {
    nextErrors.email = 'Email address is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    nextErrors.email = 'Enter a valid business email address.';
  }

  if (!password) {
    nextErrors.password = 'Password is required.';
  }

  return nextErrors;
};

const BrandMark = ({ className = '' }) => (
  <div className={`inline-flex items-center gap-3 ${className}`}>
    <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-white/20 bg-white/[0.15] shadow-sm shadow-emerald-950/20 backdrop-blur-md">
      <Leaf className="h-6 w-6 text-emerald-100" aria-hidden="true" />
    </div>
    <div>
      <p className="text-lg font-semibold tracking-tight text-white">Trust Agro</p>
      <p className="text-xs font-medium uppercase tracking-[0.22em] text-emerald-100/75">Management System</p>
    </div>
  </div>
);

const FeatureHighlight = ({ icon: Icon, label }) => (
  <div className="group flex items-center gap-3 rounded-lg border border-white/[0.12] bg-white/[0.09] px-4 py-3 text-sm font-medium text-emerald-50 shadow-sm shadow-emerald-950/10 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.14]">
    <span className="flex h-9 w-9 items-center justify-center rounded-md bg-white/[0.12] text-emerald-100 transition-colors duration-300 group-hover:bg-white/20">
      <Icon className="h-4 w-4" aria-hidden="true" />
    </span>
    <span>{label}</span>
  </div>
);

const Metric = ({ label, value }) => (
  <div>
    <p className="text-2xl font-semibold tracking-tight text-white">{value}</p>
    <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-emerald-100/[0.65]">{label}</p>
  </div>
);

const TextField = ({ icon: Icon, label, className = '', action, error, ...props }) => (
  <div className={className}>
    <label className="mb-1.5 block text-sm font-semibold text-gray-700">
      {label}
    </label>
    <div className="relative">
      <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
      <Input
        className={`h-12 rounded-lg bg-white/90 pl-10 ${action ? 'pr-12' : 'pr-4'} text-[15px] shadow-sm shadow-gray-900/5 focus:ring-brand-600 ${
          error ? '!border-red-300 text-red-900 placeholder:text-red-300 focus:!ring-red-500' : 'border-gray-200'
        }`}
        aria-invalid={Boolean(error)}
        {...props}
      />
      {action && <div className="absolute right-2 top-2">{action}</div>}
    </div>
    {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
  </div>
);

const Register = () => {
  const navigate = useNavigate();
  const { setAuthData } = useAuth();
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [otpCode, setOtpCode] = useState('');

  const passwordInputType = useMemo(() => (showPassword ? 'text' : 'password'), [showPassword]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (step === 2) {
      if (!otpCode || otpCode.length !== 6) {
        setErrors({ form: 'Please enter a valid 6-digit OTP code.' });
        return;
      }
      setLoading(true);
      try {
        const response = await authApi.verifySignupOTP(form.email.trim(), otpCode);
        const { token, ...userData } = response.data.data;
        setAuthData(userData, token);
        toast.success('Registration successful! Welcome to Trust Agro.');
        window.location.href = '/dashboard';
      } catch (err) {
        const message = getAuthErrorMessage(err);
        setErrors({ form: message });
        toast.error(message);
      } finally {
        setLoading(false);
      }
      return;
    }

    const nextErrors = validateForm(form);
    if (!form.fullName.trim()) {
      nextErrors.fullName = 'Full Name is required.';
    }
    
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      toast.error('Please review the highlighted details.');
      return;
    }

    setLoading(true);
    try {
      await authApi.sendSignupOTP(form.email.trim(), form.password, form.fullName.trim());
      setStep(2);
      toast.success('OTP sent to your email!');
    } catch (err) {
      const message = getAuthErrorMessage(err);
      setErrors({ form: message });
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-gray-900">
      <div className="grid min-h-screen lg:grid-cols-[1.07fr_0.93fr]">
        <section className="relative isolate overflow-hidden bg-gradient-to-br from-slate-950 via-emerald-950 to-teal-900 px-6 py-8 text-white sm:px-10 lg:flex lg:flex-col lg:justify-between lg:px-14 lg:py-12">
          <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_18%_12%,rgba(134,239,172,0.20),transparent_32%),radial-gradient(circle_at_86%_18%,rgba(20,184,166,0.16),transparent_28%),linear-gradient(135deg,rgba(15,23,42,0.55),rgba(6,78,59,0.15))]" />
          <div className="absolute inset-x-0 bottom-0 -z-10 h-72 bg-gradient-to-t from-slate-950/70 to-transparent" />
          <div className="absolute left-10 top-28 -z-10 h-40 w-40 rounded-full border border-white/10" />
          <div className="absolute right-10 top-20 -z-10 h-28 w-28 rounded-lg border border-white/10 rotate-12" />
          <div className="absolute bottom-20 left-1/2 -z-10 h-48 w-[38rem] -translate-x-1/2 rounded-[50%] bg-emerald-300/10 blur-3xl" />

          <BrandMark />

          <div className="mt-14 max-w-2xl animate-slide-up lg:mt-0">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/[0.15] bg-white/10 px-3 py-1.5 text-xs font-medium text-emerald-50 shadow-sm shadow-emerald-950/20 backdrop-blur-md">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Enterprise-grade operations workspace
            </div>
            <h1 className="max-w-xl text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
              Trust Agro Management System
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-emerald-50/80 sm:text-lg">
              Integrated Farm, Veterinary & Business Management Platform
            </p>

            <div className="mt-9 grid max-w-xl gap-3 sm:grid-cols-2">
              {features.map((feature) => (
                <FeatureHighlight key={feature.label} {...feature} />
              ))}
            </div>
          </div>

          <div className="mt-12 grid max-w-2xl gap-6 border-t border-white/[0.12] pt-8 sm:grid-cols-3 lg:mt-0">
            {operationalMetrics.map((metric) => (
              <Metric key={metric.label} {...metric} />
            ))}
          </div>

          <div className="pointer-events-none absolute bottom-12 right-8 hidden w-[25rem] opacity-80 lg:block" aria-hidden="true">
            <div className="relative h-56">
              <div className="absolute bottom-0 left-0 h-20 w-full rounded-t-[70%] border border-emerald-100/10 bg-emerald-100/[0.08] backdrop-blur-sm" />
              <div className="absolute bottom-16 left-8 h-20 w-28 rounded-lg border border-white/10 bg-white/[0.09] shadow-2xl shadow-slate-950/20" />
              <div className="absolute bottom-16 left-44 h-28 w-32 rounded-lg border border-white/10 bg-white/[0.09] shadow-2xl shadow-slate-950/20" />
              <div className="absolute bottom-24 left-[4.5rem] flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100/[0.16]">
                <Wheat className="h-6 w-6 text-emerald-100" />
              </div>
              <div className="absolute bottom-[8.5rem] left-[13.5rem] flex h-14 w-14 items-center justify-center rounded-lg bg-emerald-100/[0.16]">
                <Sprout className="h-7 w-7 text-emerald-100" />
              </div>
              <div className="absolute bottom-10 right-3 h-24 w-24 rounded-full border border-emerald-100/10 bg-white/[0.07]" />
            </div>
          </div>
        </section>

        <section className="flex min-h-[640px] items-center justify-center px-5 py-10 sm:px-8 lg:min-h-screen lg:px-12">
          <div className="w-full max-w-md animate-scale-in">
            <div className="mb-8 text-center lg:text-left">
              <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-lg border border-emerald-100 bg-emerald-50 text-brand-700 shadow-sm lg:mx-0">
                <Leaf className="h-6 w-6" aria-hidden="true" />
              </div>
              <p className="text-sm font-medium text-brand-700">Authorized access</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-gray-950">Join Trust Agro</h2>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                Register for a new account to manage Trust Agro operations.
              </p>
            </div>

            <Card className="border-gray-200/80 bg-white/[0.92] shadow-xl shadow-slate-900/[0.08] backdrop-blur" padding="none">
              <CardHeader className="mb-0 !flex-col !items-start border-b border-gray-100 px-6 py-5">
                <CardTitle className="text-lg">Staff Registration</CardTitle>
                <CardDescription>Create a new account to access the ERP workspace.</CardDescription>
              </CardHeader>
              <CardContent className="px-6 py-6">
                {errors.form && (
                  <div className="mb-5 flex gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{errors.form}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  {step === 1 ? (
                    <>
                      <TextField
                        icon={ShieldCheck}
                        label="Full Name"
                        type="text"
                        autoComplete="name"
                        placeholder="John Doe"
                        value={form.fullName}
                        onChange={(e) => updateField('fullName', e.target.value)}
                        error={errors.fullName}
                        disabled={loading}
                      />

                      <TextField
                        icon={Mail}
                        label="Email address"
                        type="email"
                        autoComplete="email"
                        placeholder="name@trustagro.com"
                        value={form.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        error={errors.email}
                        disabled={loading}
                      />

                      <TextField
                        icon={Lock}
                        label="Password"
                        type={passwordInputType}
                        autoComplete="new-password"
                        placeholder="Create a password"
                        value={form.password}
                        onChange={(e) => updateField('password', e.target.value)}
                        error={errors.password}
                        disabled={loading}
                        action={
                          <button
                            type="button"
                            className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                            onClick={() => setShowPassword((current) => !current)}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        }
                      />
                    </>
                  ) : (
                    <>
                      <div className="mb-2 text-sm text-gray-600">
                        Please enter the 6-digit OTP sent to {form.email}
                      </div>
                      <TextField
                        icon={ShieldCheck}
                        label="OTP Code"
                        type="text"
                        placeholder="123456"
                        value={otpCode}
                        onChange={(e) => {
                          setOtpCode(e.target.value);
                          setErrors({});
                        }}
                        maxLength={6}
                        disabled={loading}
                      />
                      <div className="text-right">
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="text-sm font-semibold text-brand-700 hover:text-brand-800"
                        >
                          Back to Registration
                        </button>
                      </div>
                    </>
                  )}

                  <Button type="submit" size="lg" className="h-12 w-full rounded-lg text-[15px]" disabled={loading}>
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        {step === 1 ? 'Sending OTP...' : 'Verifying...'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        {step === 1 ? 'Register securely' : 'Verify OTP'}
                        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                      </span>
                    )}
                  </Button>
                  
                  {step === 1 && (
                    <div className="text-center text-sm text-gray-600 mt-2">
                      Already have an account?{' '}
                      <Link to="/login" className="font-semibold text-brand-700 transition-colors hover:text-brand-800">
                        Login here
                      </Link>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>

            <p className="mt-6 text-center text-sm text-gray-500">
              Secure access for authorized Trust Agro staff
            </p>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Register;
