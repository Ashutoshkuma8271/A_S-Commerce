import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { KeyRound, Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export const AdminForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { forgotPassword } = useAdminAuth();

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successInfo, setSuccessInfo] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    const result = await forgotPassword(email);
    setIsSubmitting(false);

    if (result.success) {
      setSuccessInfo(result);
    } else {
      setErrorMessage(result.message || 'Failed to process request.');
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 text-white flex items-center justify-center p-4 selection:bg-gold-500/30">
      <div className="w-full max-w-md bg-navy-900 border border-gold-500/30 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6 animate-fadeIn relative overflow-hidden">
        
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-navy-800 border border-gold-500/40 mb-2 shadow-gold-sm">
            <KeyRound className="w-7 h-7 text-gold-400" />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            Admin Password Recovery
          </h1>
          <p className="text-xs text-gray-400 leading-relaxed">
            Enter the registered administrator email to generate a single-use secure reset token.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-900/30 border border-red-500/40 text-red-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successInfo ? (
          <div className="p-6 rounded-2xl bg-gold-500/10 border border-gold-500/30 text-center space-y-4 animate-fadeIn">
            <div className="w-12 h-12 rounded-full bg-gold-500/20 border border-gold-500/40 text-gold-400 flex items-center justify-center mx-auto shadow-gold-sm">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Reset Link Dispatched</h3>
              <p className="text-xs text-gray-300 mt-1.5 leading-relaxed">
                A secure password reset link has been sent to <strong className="text-gold-400 font-mono">{email}</strong>. Please check your inbox and click the link to set your new password.
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSuccessInfo(null)}
                className="text-xs text-gold-400 hover:underline cursor-pointer"
              >
                Did not receive the email? Try again
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Administrator Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gold-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@ascommerce.luxury"
                  className="w-full pl-10 pr-4 py-3 bg-navy-850 text-white placeholder-gray-500 text-xs rounded-xl border border-navy-700 focus:outline-none focus:border-gold-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-gold-gradient text-navy-950 font-bold text-xs sm:text-sm rounded-xl shadow-gold-sm hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Sending Reset Link...' : 'Send Password Reset Link'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="pt-2 text-center border-t border-navy-800">
          <Link
            to="/admin/login"
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gold-400 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Admin Login</span>
          </Link>
        </div>

      </div>
    </div>
  );
};
