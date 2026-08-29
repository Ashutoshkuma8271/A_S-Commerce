import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { Loader2 } from 'lucide-react';

export const AdminProtectedRoute = ({ children }) => {
  const { isAdminAuthenticated, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center text-white space-y-4">
        <Loader2 className="w-10 h-10 text-gold-400 animate-spin" />
        <p className="text-xs font-serif text-gold-300 uppercase tracking-widest">
          Verifying Administrator Identity...
        </p>
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};
