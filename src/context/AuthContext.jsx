import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);
const STORAGE_KEY = 'as_commerce_user';

export const AuthProvider = ({ children }) => {
  const { addToast } = useToast();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [authNotice, setAuthNotice] = useState('');

  // Default to null (unauthenticated by default)
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.role === 'customer') {
          return parsed;
        }
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.error('Failed to load user auth', e);
    }
    return null;
  });

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.error('Failed to save user auth', e);
    }
  }, [user]);

  useEffect(() => {
    const token = localStorage.getItem('as_commerce_token');
    if (!token) {
      setUser(null);
      localStorage.removeItem(STORAGE_KEY);
      return;
    }

    const controller = new AbortController();

    fetch('/api/users/me', {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    })
      .then(async (res) => {
        if (res.status === 401 || res.status === 403) {
          setUser(null);
          localStorage.removeItem('as_commerce_token');
          localStorage.removeItem(STORAGE_KEY);
          return;
        }
        if (!res.ok) {
          // Transient server error: preserve cached session
          return;
        }
        const data = await res.json();
        if (data.success && data.user) {
          if (localStorage.getItem('as_commerce_token') === token) {
            setUser(data.user);
          }
        }
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        // Transient network/parsing error: preserve cached session
      });

    return () => {
      controller.abort();
    };
  }, []);

  const requireAuth = (callback, noticeText = 'Please sign in to proceed with this action') => {
    if (!user) {
      setAuthNotice(noticeText);
      setAuthMode('login');
      setIsAuthModalOpen(true);
      addToast(noticeText, 'info');
      return false;
    }
    if (callback) callback();
    return true;
  };

  const login = async (email, password) => {
    if (!email || !password) {
      addToast('Please enter both email and password', 'error');
      return { success: false };
    }
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!data.success) {
        if (data.requireOtp) {
          addToast('OTP sent to your email', 'info');
          return { success: false, requireOtp: true, email: data.email };
        }
        addToast(data.message || 'Invalid email or password', 'error');
        return { success: false, message: data.message };
      }

      setUser(data.user);
      if (data.token) {
        localStorage.setItem('as_commerce_token', data.token);
      }
      setIsAuthModalOpen(false);
      setAuthNotice('');
      addToast(`Welcome back, ${data.user.name}!`, 'success');
      return { success: true };
    } catch (e) {
      addToast('Connection error. Please try again.', 'error');
      return { success: false };
    }
  };

  const register = async (name, email, password, phone = '') => {
    if (!name || !email || !password) {
      addToast('Please fill all required fields', 'error');
      return { success: false };
    }
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password, phone: phone.trim() }),
      });
      const data = await res.json();
      if (!data.success) {
        addToast(data.message || 'Registration failed', 'error');
        return { success: false, message: data.message };
      }

      if (data.requireOtp) {
        addToast('OTP sent to your email', 'info');
        return { success: true, requireOtp: true, email: data.email };
      }

      setUser(data.user);
      setIsAuthModalOpen(false);
      setAuthNotice('');
      addToast('Account created successfully', 'success');
      return { success: true };
    } catch (e) {
      addToast('Failed to connect to authentication service', 'error');
      return { success: false };
    }
  };

  const verifySignupOtp = async (email, otp) => {
    if (!email || !otp) {
      addToast('Please enter the 6-digit OTP', 'error');
      return { success: false };
    }
    try {
      const res = await fetch('/api/auth/verify-signup-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp: otp.trim() }),
      });
      const data = await res.json();
      if (!data.success) {
        addToast(data.message || 'OTP verification failed', 'error');
        return { success: false, message: data.message };
      }

      setUser(data.user);
      if (data.token) {
        localStorage.setItem('as_commerce_token', data.token);
      }
      setIsAuthModalOpen(false);
      setAuthNotice('');
      addToast('Account verified successfully', 'success');
      return { success: true };
    } catch (e) {
      addToast('Failed to verify OTP', 'error');
      return { success: false };
    }
  };

  const resendSignupOtp = async (email) => {
    if (!email) {
      addToast('Email address is required', 'error');
      return { success: false };
    }
    try {
      const res = await fetch('/api/auth/resend-signup-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!data.success) {
        addToast(data.message || 'Failed to resend OTP', 'error');
        return { success: false };
      }
      addToast('OTP resent to your email', 'success');
      return { success: true };
    } catch (e) {
      addToast('Failed to connect to server', 'error');
      return { success: false };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('as_commerce_token');
    addToast('Logged out successfully', 'info');
  };

  const deleteAccount = async () => {
    if (!user) return { success: false, message: 'No active session' };
    const userEmail = user.email;
    const userId = user.id;

    try {
      const res = await fetch('/api/users/profile', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('as_commerce_token') || ''}`,
        },
      });
      const data = await res.json();
      if (!data.success) {
        addToast(data.message || 'Failed to delete account', 'error');
        return { success: false, message: data.message };
      }

      // Safely clear all user storage and reset session state
      setUser(null);
      localStorage.removeItem('as_commerce_token');
      localStorage.removeItem('as_commerce_user');
      localStorage.removeItem('as_commerce_cart');
      localStorage.removeItem('as_commerce_wishlist');
      setIsAuthModalOpen(false);

      addToast('Your account has been deleted. You can re-register anytime with this email.', 'success');
      return { success: true };
    } catch (e) {
      addToast('Error connecting to server to delete account', 'error');
      return { success: false };
    }
  };

  const syncUserToBackend = async (payload) => {
    try {
      if (!user?.email) return;
      await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('as_commerce_token') || ''}`,
        },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      console.warn('Backend user sync note:', e.message);
    }
  };

  const updateProfile = (data) => {
    setUser((prev) => {
      const updated = { ...prev, ...data };
      syncUserToBackend(data);
      return updated;
    });
    addToast('Profile updated successfully', 'success');
  };

  const addAddress = (address) => {
    const newAddr = {
      id: `addr-${Date.now()}`,
      ...address,
      isDefault: !user?.addresses || user?.addresses?.length === 0 ? true : address.isDefault || false,
    };
    setUser((prev) => {
      const updatedAddresses = [...(prev?.addresses || []), newAddr];
      syncUserToBackend({ addresses: updatedAddresses });
      return {
        ...prev,
        addresses: updatedAddresses,
      };
    });
    addToast('New address saved', 'success');
  };

  const deleteAddress = (addressId) => {
    setUser((prev) => {
      const updatedAddresses = (prev?.addresses || []).filter((a) => a.id !== addressId);
      syncUserToBackend({ addresses: updatedAddresses });
      return {
        ...prev,
        addresses: updatedAddresses,
      };
    });
    addToast('Address removed', 'info');
  };

  const setDefaultAddress = (addressId) => {
    setUser((prev) => {
      const updatedAddresses = (prev?.addresses || []).map((a) => ({
        ...a,
        isDefault: a.id === addressId,
      }));
      syncUserToBackend({ addresses: updatedAddresses });
      return {
        ...prev,
        addresses: updatedAddresses,
      };
    });
    addToast('Default address updated', 'success');
  };

  const requestPasswordReset = async (email) => {
    if (!email) {
      addToast('Please enter your registered email', 'error');
      return { success: false };
    }
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!data.success) {
        addToast(data.message || 'Password reset request failed', 'error');
        return { success: false, message: data.message };
      }
      addToast('Reset link sent to your email', 'success');
      return { success: true, message: data.message };
    } catch (err) {
      addToast('Failed to connect to authentication service', 'error');
      return { success: false };
    }
  };

  const resetPasswordWithToken = async (token, email, newPassword) => {
    if (!newPassword) {
      addToast('Please fill all required fields', 'error');
      return { success: false, message: 'Please fill all required fields' };
    }
    try {
      const res = await fetch('/api/auth/reset-password-with-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email: email ? email.trim() : undefined, newPassword }),
      });
      const data = await res.json();
      if (!data.success) {
        addToast(data.message || 'Password reset failed', 'error');
        return { success: false, message: data.message };
      }
      addToast('Password updated successfully', 'success');
      return { success: true };
    } catch (err) {
      addToast('Failed to reset password', 'error');
      return { success: false, message: 'Connection error' };
    }
  };

  const resetPasswordDirect = async (email, newPassword) => {
    return { success: false, message: 'A password reset link is required.' };
  };

  const resetPasswordWithOtp = async (email, otp, newPassword) => {
    return { success: false, message: 'A password reset link is required.' };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authMode,
        setAuthMode,
        authNotice,
        setAuthNotice,
        requireAuth,
        login,
        register,
        verifySignupOtp,
        resendSignupOtp,
        logout,
        deleteAccount,
        updateProfile,
        addAddress,
        deleteAddress,
        setDefaultAddress,
        requestPasswordReset,
        resetPasswordWithToken,
        resetPasswordDirect,
        resetPasswordWithOtp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
