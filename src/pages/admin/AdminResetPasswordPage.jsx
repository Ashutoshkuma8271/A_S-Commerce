import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useToast } from '../../context/ToastContext';
import { Lock, Key, ShieldCheck, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Eye, EyeOff, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export const AdminResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToast } = useToast();
  const { resetPasswordWithToken } = useAdminAuth();

  const tokenFromUrl = searchParams.get('token') || '';
  const emailParam = searchParams.get('email') || '';

  const [token, setToken] = useState(tokenFromUrl);
  const [email, setEmail] = useState(emailParam);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
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

    if (!token.trim()) {
      const err = 'Recovery token is required. Please check the reset link or enter your token.';
      setErrorMessage(err);
      return;
    }

    if (!strength.isStrong) {
      const err = 'Password must be at least 8 characters with uppercase, lowercase, numbers, and special characters.';
      setErrorMessage(err);
      return;
    }

    if (newPassword !== confirmPassword) {
      const err = 'New passwords do not match. Please verify.';
      setErrorMessage(err);
      return;
    }

    setIsSubmitting(true);
    const result = await resetPasswordWithToken(token.trim(), newPassword);
    setIsSubmitting(false);

    if (result && result.success) {
      setIsSuccess(true);
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#F5B83D', '#061A27', '#FFD36A', '#ffffff'],
        });
      } catch (err) {}
    } else {
      setErrorMessage(result?.message || 'Invalid or expired recovery token.');
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 text-white flex items-center justify-center p-4 selection:bg-gold-500/30 animate-fadeIn">
      <div className="w-full max-w-md bg-navy-900 border border-gold-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Subtle Luxury Top Glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold-500/60 to-transparent" />

        {/* Header Icon */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-navy-800 border border-gold-500/40 text-gold-400 mb-1 shadow-gold-sm">
            {isSuccess ? <CheckCircle2 className="w-7 h-7 text-emerald-400" /> : <ShieldCheck className="w-7 h-7 text-gold-400" />}
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            {isSuccess ? 'Master Password Reset!' : 'Reset Master Password'}
          </h1>
          <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
            {isSuccess
              ? 'Your master administrator password has been updated securely with 12-round Bcrypt encryption.'
              : 'Choose a strong, new master password for your A_S Commerce administrative account.'}
          </p>
        </div>

        {isSuccess ? (
          <div className="space-y-4 text-center animate-fadeIn">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 leading-relaxed">
              Your master administrator credentials have been updated. You can now sign in to access the Admin Control Center.
            </div>

            <Link
              to="/admin/login"
              className="w-full py-3.5 bg-gold-gradient text-navy-950 font-bold text-xs sm:text-sm rounded-xl shadow-gold-sm hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Sign In to Admin Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {!tokenFromUrl && (
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wide mb-1">
                  Recovery Token *
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-gold-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Enter 64-character token"
                    className="w-full pl-10 pr-4 py-2.5 bg-navy-850 text-white text-xs rounded-xl border border-navy-700 focus:outline-none focus:border-gold-500 font-mono"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wide mb-1">
                New Master Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gold-500 absolute left-3.5 top-3" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="w-full pl-10 pr-10 py-2.5 bg-navy-850 text-white text-xs rounded-xl border border-navy-700 focus:outline-none focus:border-gold-500 placeholder-gray-500"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gold-400 cursor-pointer p-0.5"
                  title={showNewPassword ? 'Hide password' : 'Show password'}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                    {[1, 2, 3, 4].map((s) => (
                      <div
                        key={s}
                        className={`h-full rounded-full transition-all duration-300 ${
                          s <= strength.score ? strength.color.split(' ')[0] : 'bg-navy-750'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wide mb-1">
                Confirm Master Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gold-500 absolute left-3.5 top-3" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="w-full pl-10 pr-10 py-2.5 bg-navy-850 text-white text-xs rounded-xl border border-navy-700 focus:outline-none focus:border-gold-500 placeholder-gray-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gold-400 cursor-pointer p-0.5"
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !token}
              className="w-full py-3.5 bg-gold-gradient text-navy-950 font-bold text-xs sm:text-sm rounded-xl shadow-gold-sm hover:brightness-110 active:scale-98 transition-all cursor-pointer disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
                  <span>Updating Master Password...</span>
                </>
              ) : (
                <span>Save New Master Password</span>
              )}
            </button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-navy-800">
          <Link
            to="/admin/login"
            className="text-xs text-gray-400 hover:text-gold-400 inline-flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Admin Login</span>
          </Link>
        </div>

      </div>
    </div>
  );
};
export default AdminResetPasswordPage;
