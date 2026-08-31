import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';

const AdminAuthContext = createContext(null);
const ADMIN_TOKEN_KEY = 'as_admin_auth_token';

export const AdminAuthProvider = ({ children }) => {
  const { addToast } = useToast();
  const [token, setToken] = useState(() => localStorage.getItem(ADMIN_TOKEN_KEY));
  const [admin, setAdmin] = useState(() => {
    try {
      const saved = localStorage.getItem('as_admin_profile');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [adminExists, setAdminExists] = useState(null); // null = checking, true/false
  const [loading, setLoading] = useState(true);

  // 1. Check if an admin exists in database on mount
  const checkAdminStatus = async () => {
    try {
      const res = await fetch('/api/admin/auth/status');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setAdminExists(data.exists);
          return data.exists;
        }
      }
    } catch (err) {
      console.warn('Backend status check note:', err);
    }
  };

  // 2. Verify existing session if token exists
  useEffect(() => {
    const verifySession = async () => {
      try {
        await checkAdminStatus();
      } catch (e) {}

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/admin/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.admin) {
            setAdmin(data.admin);
            localStorage.setItem('as_admin_profile', JSON.stringify(data.admin));
          } else if (res.status === 401 || res.status === 403) {
            logout(true);
          }
        } else if (res.status === 401 || res.status === 403) {
          logout(true);
        }
      } catch (err) {
        console.warn('Session verification fallback note:', err);
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, [token]);

  // 3. Signup first admin
  const signup = async (name, email, password, confirmPassword) => {
    try {
      const res = await fetch('/api/admin/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, confirmPassword })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        addToast(data.message || 'Failed to create administrator account.', 'error');
        await checkAdminStatus();
        return { success: false, message: data.message };
      }

      setToken(data.token);
      setAdmin(data.admin);
      localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
      localStorage.setItem('as_admin_registered', 'true');
      localStorage.setItem('as_admin_profile', JSON.stringify(data.admin));
      await checkAdminStatus();
      addToast('Administrator account created', 'success', 3500, { desc: 'Master credentials initialized.' });
      return { success: true };
    } catch (err) {
      addToast('Failed to connect to authentication server.', 'error');
      return { success: false, message: 'Server connection failed' };
    }
  };

  // 4. Admin Login
  const login = async (email, password) => {
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        addToast(data.message || 'Invalid administrator credentials.', 'error');
        return { success: false, message: data.message };
      }

      setToken(data.token);
      setAdmin(data.admin);
      localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
      localStorage.setItem('as_admin_profile', JSON.stringify(data.admin));
      addToast(`Welcome, Administrator ${data.admin.name}`, 'success', 3000, { desc: 'Master Command Center authorized.' });
      return { success: true };
    } catch (err) {
      addToast('Cannot connect to authentication server.', 'error');
      return { success: false, message: 'Authentication server unreachable' };
    }
  };

  // 5. Admin Logout
  const logout = async (silent = false) => {
    try {
      if (token) {
        await fetch('/api/admin/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (e) {
      // ignore
    } finally {
      setToken(null);
      setAdmin(null);
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      localStorage.removeItem('as_admin_profile');
      if (!silent) {
        addToast('Logged out of Admin Portal', 'info', 2500, { desc: 'Administrative session ended securely.' });
      }
    }
  };

  // 6. Forgot Password
  const forgotPassword = async (email) => {
    try {
      const res = await fetch('/api/admin/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });
      const data = await res.json();
      if (!data.success) {
        addToast(data.message || 'Password reset request failed.', 'error');
        return { success: false, message: data.message };
      }
      addToast('Reset link sent to your email.', 'success');
      return data;
    } catch (err) {
      addToast('Cannot connect to server. Please try again.', 'error');
      return { success: false, message: 'Connection error' };
    }
  };

  // 7. Reset Password
  const resetPassword = async (resetToken, newPassword) => {
    try {
      const res = await fetch('/api/admin/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken.trim(), newPassword })
      });
      const data = await res.json();
      if (!data.success) {
        addToast(data.message || 'Password reset failed.', 'error');
        return { success: false, message: data.message };
      }
      addToast('Master password updated successfully.', 'success');
      return { success: true, message: data.message };
    } catch (err) {
      addToast('Failed to connect to authentication server.', 'error');
      return { success: false, message: 'Connection error' };
    }
  };

  // 8. Change Password (Authenticated)
  const changePassword = async (currentPassword, newPassword, confirmPassword) => {
    try {
      const res = await fetch('/api/admin/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
      });
      const data = await res.json();
      if (!data.success) {
        addToast(data.message || 'Failed to update password.', 'error');
        return { success: false, message: data.message };
      }
      addToast('Master Admin password updated', 'success', 3500, { desc: 'Credentials synchronized securely.' });
      return { success: true, message: data.message };
    } catch (err) {
      addToast('Cannot connect to server.', 'error');
      return { success: false, message: 'Connection error' };
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        token,
        isAdminAuthenticated: !!admin,
        adminExists,
        loading,
        checkAdminStatus,
        signup,
        login,
        logout,
        forgotPassword,
        resetPassword,
        resetPasswordWithToken: resetPassword,
        changePassword,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return context;
};
