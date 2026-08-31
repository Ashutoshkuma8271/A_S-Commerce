import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { Lock, Mail, ShieldCheck, ArrowRight, Sparkles, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Logo } from '../../components/common/Logo';

export const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { login, isAdminAuthenticated, adminExists, checkAdminStatus } = useAdminAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    checkAdminStatus();
  }, []);

  useEffect(() => {
    if (adminExists === false) {
      navigate('/admin/signup', { replace: true });
    }
  }, [adminExists, navigate]);

  useEffect(() => {
    if (isAdminAuthenticated) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAdminAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/admin/dashboard');
    } else {
      setErrorMessage(result.message || 'Invalid administrator credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 text-white flex items-center justify-center p-4 selection:bg-gold-500/30">
      <div className="w-full max-w-md bg-navy-900 border border-gold-500/30 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6 animate-fadeIn relative overflow-hidden">
        
        {/* Header with Monogram */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-navy-800 border border-gold-500/40 mb-2 shadow-gold-sm">
            <ShieldCheck className="w-7 h-7 text-gold-400" />
          </div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-gold-400 bg-gold-500/10 px-3 py-1 rounded-full border border-gold-500/30 block w-max mx-auto">
            Authorized Personnel Only
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            A_S Admin Portal
          </h1>
          <p className="text-xs text-gray-400 leading-relaxed">
            Enter your credentials to access the secure administrative control center.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-900/30 border border-red-500/40 text-red-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span className="leading-tight">{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Administrator Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gold-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ashutoshkumaryadav933499@gmail.com"
                className="w-full pl-10 pr-4 py-3 bg-navy-850 text-white placeholder-gray-500 text-xs rounded-xl border border-navy-700 focus:outline-none focus:border-gold-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-300">
                Password
              </label>
              <Link
                to="/admin/forgot-password"
                className="text-[11px] text-gold-400 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-gold-400 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-gold-gradient text-navy-950 font-bold text-xs sm:text-sm rounded-xl shadow-gold-sm hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Authenticating...' : 'Login to Admin Portal'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer info & initial setup shortcut if no admin exists yet */}
        <div className="pt-4 text-center border-t border-navy-800 space-y-2">
          {adminExists === false && (
            <Link
              to="/admin/signup"
              className="inline-block text-xs text-gold-400 hover:underline font-semibold"
            >
              ⚡ No administrator configured yet. Create First Admin →
            </Link>
          )}

          <div>
            <Link
              to="/"
              className="text-xs text-gray-400 hover:text-gold-400 transition-colors"
            >
              Return to Customer Storefront
            </Link>
          </div>
        </div>

        <div className="absolute top-0 right-0 w-48 h-48 bg-gold-500/5 rounded-full blur-2xl pointer-events-none" />
      </div>
    </div>
  );
};
