import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  Phone,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  Check,
  AlertTriangle,
  KeyRound,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const AuthModal = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authMode,
    setAuthMode,
    authNotice,
    login,
    register,
    verifySignupOtp,
    resendSignupOtp,
    requestPasswordReset,
  } = useAuth();
  const { addToast } = useToast();

  // Login / Register Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // OTP Verification State
  const [verificationEmail, setVerificationEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Forgot / Reset Password Link Flow State
  const [resetEmail, setResetEmail] = useState('');
  const [resetLinkSent, setResetLinkSent] = useState(false);
  const [resetToken, setResetToken] = useState('');

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  if (!isAuthModalOpen) return null;

  // Password Security Strength Calculation
  const checkPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: 'bg-gray-700', isStrong: false };
    let score = 0;
    const hasMinLength = pwd.length >= 8;
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);

    if (hasMinLength) score++;
    if (hasUpper && hasLower) score++;
    if (hasNumber) score++;
    if (hasSpecial) score++;

    const isStrong = hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial;

    if (score <= 1) return { score: 1, label: 'Very Weak', color: 'bg-red-500 text-red-400', isStrong };
    if (score === 2) return { score: 2, label: 'Weak (add numbers & symbols)', color: 'bg-amber-500 text-amber-400', isStrong };
    if (score === 3) return { score: 3, label: 'Good (add special characters)', color: 'bg-blue-400 text-blue-300', isStrong };
    return { score: 4, label: 'Strong & Secure', color: 'bg-emerald-500 text-emerald-400', isStrong: true };
  };

  const registerStrength = checkPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (authMode === 'register') {
      if (!registerStrength.isStrong) {
        addToast('Please use a strong password (min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character).', 'error');
        return;
      }
    }

    setSubmitting(true);
    if (authMode === 'login') {
      const res = await login(email, password);
      if (res && res.requireOtp) {
        setVerificationEmail(res.email || email);
        setOtpCode('');
        setResendCooldown(60);
        setAuthMode('verifyOtp');
      }
    } else {
      const res = await register(name, email, password, phone);
      if (res && res.requireOtp) {
        setVerificationEmail(res.email || email);
        setOtpCode('');
        setResendCooldown(60);
        setAuthMode('verifyOtp');
      }
    }
    setSubmitting(false);
  };

  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      addToast('Please enter the full 6-digit verification OTP', 'error');
      return;
    }

    setSubmitting(true);
    await verifySignupOtp(verificationEmail, otpCode);
    setSubmitting(false);
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setSubmitting(true);
    const res = await resendSignupOtp(verificationEmail);
    if (res && res.success) {
      setResendCooldown(60);
    }
    setSubmitting(false);
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!resetEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(resetEmail.trim())) {
      addToast('Please enter a valid registered email address', 'error');
      return;
    }

    setSubmitting(true);
    const res = await requestPasswordReset(resetEmail.trim());
    setSubmitting(false);

    if (res && res.success) {
      setResetLinkSent(true);
      if (res.resetToken) {
        setResetToken(res.resetToken);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none animate-fadeIn">
      {/* Backdrop */}
      <div
        onClick={() => setIsAuthModalOpen(false)}
        className="fixed inset-0 bg-navy-950/80 backdrop-blur-md transition-opacity"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-navy-900 text-white rounded-3xl shadow-2xl overflow-hidden z-10 border border-gold-500/30">
        {/* Close Button */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-white hover:bg-navy-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="p-6 pb-2 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-navy-800 border border-gold-500/40 mb-3 shadow-gold-sm">
            {authMode === 'forgot' ? (
              <KeyRound className="w-6 h-6 text-gold-400" />
            ) : (
              <Sparkles className="w-6 h-6 text-gold-400" />
            )}
          </div>
          <h3 className="font-serif text-2xl font-bold text-white mb-1">
            {authMode === 'login'
              ? 'Sign In to Your Account'
              : authMode === 'register'
              ? 'Create Customer Account'
              : 'Reset Your Password'}
          </h3>
          <p className="text-xs text-gray-400">
            {authMode === 'login'
              ? 'Enter your credentials to access your cart, orders & wishlist'
              : authMode === 'register'
              ? 'Create your account to start shopping luxury collections'
              : 'Verify your identity and update your password securely'}
          </p>
        </div>

        {/* Action Notice Alert */}
        {authNotice && authMode !== 'forgot' && (
          <div className="mx-6 my-2 p-3 rounded-2xl bg-gold-500/15 border border-gold-500/40 text-gold-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-gold-400 shrink-0" />
            <span className="font-medium leading-tight">{authNotice}</span>
          </div>
        )}

        {/* VERIFY SIGNUP OTP WORKFLOW */}
        {authMode === 'verifyOtp' ? (
          <div className="p-6 pt-2 space-y-4">
            <div className="p-3.5 bg-gold-500/10 rounded-2xl border border-gold-500/30 text-xs text-gold-300">
              <p className="font-semibold text-center">Enter 6-Digit OTP</p>
              <p className="text-[11px] text-gray-400 mt-1 text-center leading-relaxed">
                We sent a 6-digit verification code to <strong>{verificationEmail}</strong>
              </p>
            </div>

            <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="••••••"
                  autoComplete="one-time-code"
                  className="w-full text-center tracking-[8px] font-mono text-xl py-3 bg-navy-850 text-gold-400 font-bold rounded-2xl border border-navy-700 focus:outline-none focus:border-gold-500 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={submitting || otpCode.length < 6}
                className="w-full py-3 bg-gold-gradient text-navy-950 font-bold text-xs rounded-xl shadow-gold-sm hover:brightness-110 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Verifying...' : 'Verify OTP & Sign In'}
              </button>
            </form>

            <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-navy-800">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0 || submitting}
                className="hover:text-gold-400 underline disabled:no-underline disabled:text-gray-600 cursor-pointer"
              >
                {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
              </button>

              <button
                type="button"
                onClick={() => setAuthMode('register')}
                className="hover:text-gold-400 cursor-pointer"
              >
                Back to Sign Up
              </button>
            </div>
          </div>
        ) : authMode === 'forgot' ? (
          /* FORGOT PASSWORD VIA EMAIL LINK */
          <div className="p-6 pt-2">
            {resetLinkSent ? (
              <div className="space-y-4 animate-fadeIn">
                <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/30 text-xs text-emerald-300 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-sm text-white">Reset Link Sent!</p>
                    <p className="text-gray-300 leading-relaxed">
                      A password recovery link has been sent to <strong>{resetEmail}</strong>. Please check your email to create a new password.
                    </p>
                  </div>
                </div>

                <div className="pt-2 text-center">
                  <button
                    onClick={() => {
                      setResetLinkSent(false);
                      setAuthMode('login');
                    }}
                    className="w-full py-3 bg-navy-800 text-white hover:text-gold-400 font-bold text-xs rounded-xl border border-navy-700 cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3.5 animate-fadeIn">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gold-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      autoComplete="email"
                      className="w-full pl-10 pr-4 py-2.5 bg-navy-850 text-white placeholder-gray-500 text-xs rounded-xl border border-navy-700 focus:outline-none focus:border-gold-500 transition-colors"
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1.5 leading-relaxed">
                    Enter your registered email and we'll send you a password reset link.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-gold-gradient text-navy-950 font-bold text-xs rounded-xl shadow-gold-sm hover:brightness-110 active:scale-98 transition-all cursor-pointer disabled:opacity-50 mt-2"
                >
                  {submitting ? 'Sending Link...' : 'Send Reset Link'}
                </button>

                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className="text-xs text-gray-400 hover:text-gold-400 flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Sign In</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          /* LOGIN & REGISTER WORKFLOW */
          <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-3.5">
            {authMode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gold-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Full Name"
                    className="w-full pl-10 pr-4 py-2.5 bg-navy-850 text-white placeholder-gray-500 text-xs rounded-xl border border-navy-700 focus:outline-none focus:border-gold-500 transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gold-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-navy-850 text-white placeholder-gray-500 text-xs rounded-xl border border-navy-700 focus:outline-none focus:border-gold-500 transition-colors"
                />
              </div>
            </div>

            {authMode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gold-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-4 py-2.5 bg-navy-850 text-white placeholder-gray-500 text-xs rounded-xl border border-navy-700 focus:outline-none focus:border-gold-500 transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-gray-300">Password</label>
                {authMode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(email);
                      setAuthMode('forgot');
                    }}
                    className="text-[11px] text-gold-400 hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gold-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-navy-850 text-white placeholder-gray-500 text-xs rounded-xl border border-navy-700 focus:outline-none focus:border-gold-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gold-400 transition-colors cursor-pointer p-0.5"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Real-time Password Strength Meter on Registration */}
              {authMode === 'register' && password && (
                <div className="mt-2 space-y-1.5 animate-fadeIn">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-gray-400">Password Strength:</span>
                    <span className={`font-semibold ${registerStrength.color.split(' ')[1]}`}>{registerStrength.label}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 h-1.5">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-full rounded-full transition-all duration-300 ${
                          step <= registerStrength.score ? registerStrength.color.split(' ')[0] : 'bg-navy-700'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-400 leading-tight">
                    Must be at least 8 characters with uppercase, lowercase, number, and special character.
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-gold-gradient text-navy-950 font-bold text-xs rounded-xl shadow-gold-sm hover:brightness-110 active:scale-98 transition-all mt-2 cursor-pointer disabled:opacity-50"
            >
              {submitting
                ? 'Authenticating...'
                : authMode === 'login'
                ? 'Sign In to Account'
                : 'Create Account'}
            </button>
          </form>
        )}

        {/* Footer Toggle */}
        <div className="p-4 bg-navy-950 text-center border-t border-navy-800 text-xs text-gray-400">
          {authMode === 'login' ? (
            <p>
              Don't have an account yet?{' '}
              <button
                onClick={() => setAuthMode('register')}
                className="text-gold-400 font-bold hover:underline cursor-pointer"
              >
                Register Here
              </button>
            </p>
          ) : authMode === 'register' ? (
            <p>
              Already have an account?{' '}
              <button
                onClick={() => setAuthMode('login')}
                className="text-gold-400 font-bold hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </p>
          ) : (
            <p>
              Remember your password?{' '}
              <button
                onClick={() => setAuthMode('login')}
                className="text-gold-400 font-bold hover:underline cursor-pointer"
              >
                Back to Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
