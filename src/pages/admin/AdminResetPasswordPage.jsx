import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { Lock, Key, ShieldCheck, ArrowRight, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Logo } from '../../components/common/Logo';

export const AdminResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token') || '';

  const { resetPasswordWithToken } = useAdminAuth();

  const [token, setToken] = useState(tokenFromUrl);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

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

  const strength = checkPasswordStrength(newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!strength.isStrong) {
      setErrorMessage('New password must be at least 8 characters long and include uppercase, lowercase, number, and special character.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    const result = await resetPasswordWithToken(token.trim(), newPassword);
    setIsSubmitting(false);

    if (result.success) {
      setIsSuccess(true);
    } else {
      setErrorMessage(result.message || 'Invalid or expired recovery token.');
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 text-white flex items-center justify-center p-4 selection:bg-gold-500/30">
      <div className="w-full max-w-md bg-navy-900 border border-gold-500/30 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6 animate-fadeIn relative overflow-hidden">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-navy-800 border border-gold-500/40 mb-2 shadow-gold-sm">
            <Key className="w-7 h-7 text-gold-400" />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            Reset Master Password
          </h1>
          <p className="text-xs text-gray-400 leading-relaxed">
            Enter the recovery token and specify your new master administrator password.
          </p>
        </div>

        {/* Success Alert */}
        {isSuccess ? (
          <div className="space-y-4 text-center">
            <div className="p-4 rounded-2xl bg-green-900/30 border border-green-500/40 text-green-300 text-xs flex flex-col items-center gap-2">
              <CheckCircle2 className="w-8 h-8 text-green-400" />
              <span className="font-bold text-sm">Password Reset Successful!</span>
              <p className="text-[11px] text-gray-300">
                Your master administrator password has been updated. You can now login with your new credentials.
              </p>
            </div>
            <Link
              to="/admin/login"
              className="w-full py-3.5 bg-gold-gradient text-navy-950 font-bold text-xs sm:text-sm rounded-xl shadow-gold-sm hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Proceed to Admin Login</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <>
            {/* Error Alert */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-900/30 border border-red-500/40 text-red-300 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span className="leading-tight">{errorMessage}</span>
              </div>
            )}

            {/* Reset Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {tokenFromUrl ? (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span className="font-semibold">Recovery Link Authenticated</span>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Recovery Token
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-gold-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="Paste 32-byte recovery token"
                      className="w-full pl-10 pr-4 py-3 bg-navy-850 text-white placeholder-gray-500 text-xs font-mono rounded-xl border border-navy-700 focus:outline-none focus:border-gold-500 transition-colors"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  New Master Password (min 8 chars)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gold-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 bg-navy-850 text-white placeholder-gray-500 text-xs rounded-xl border border-navy-700 focus:outline-none focus:border-gold-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gold-400 transition-colors cursor-pointer p-0.5"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Meter */}
                {newPassword && (
                  <div className="mt-2 space-y-1.5 animate-fadeIn">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-gray-400">Security Strength:</span>
                      <span className={`font-semibold ${strength.color.split(' ')[1]}`}>{strength.label}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1 h-1.5">
                      {[1, 2, 3, 4].map((step) => (
                        <div
                          key={step}
                          className={`h-full rounded-full transition-all duration-300 ${
                            step <= strength.score ? strength.color.split(' ')[0] : 'bg-navy-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gold-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 bg-navy-850 text-white placeholder-gray-500 text-xs rounded-xl border border-navy-700 focus:outline-none focus:border-gold-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gold-400 transition-colors cursor-pointer p-0.5"
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-gold-gradient text-navy-950 font-bold text-xs sm:text-sm rounded-xl shadow-gold-sm hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Resetting Password...' : 'Save & Update Password'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </>
        )}

        <div className="pt-2 text-center border-t border-navy-800">
          <Link
            to="/admin/login"
            className="text-xs text-gold-400 hover:underline"
          >
            Back to Admin Login
          </Link>
        </div>

      </div>
    </div>
  );
};
