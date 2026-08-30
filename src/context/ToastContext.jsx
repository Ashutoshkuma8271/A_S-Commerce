import React, { createContext, useContext, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Sparkles, Info } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const addToast = useCallback((message, type = 'success', duration = 3000) => {
    const baseStyle = {
      background: 'rgba(6, 26, 39, 0.94)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      color: '#FAF7F0',
      borderRadius: '12px',
      padding: '7px 14px',
      fontSize: '12px',
      fontWeight: '500',
      lineHeight: '1.4',
      letterSpacing: '0.01em',
      maxWidth: '380px',
    };

    if (type === 'success') {
      toast.success(message, {
        duration,
        style: {
          ...baseStyle,
          border: '1px solid rgba(16, 185, 129, 0.35)',
          boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.5), 0 0 12px rgba(16, 185, 129, 0.15)',
        },
        iconTheme: {
          primary: '#10B981',
          secondary: '#061A27',
        },
      });
    } else if (type === 'error') {
      toast.error(message, {
        duration: Math.max(duration, 3500),
        style: {
          ...baseStyle,
          border: '1px solid rgba(239, 68, 68, 0.4)',
          boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.5), 0 0 12px rgba(239, 68, 68, 0.15)',
        },
        iconTheme: {
          primary: '#EF4444',
          secondary: '#061A27',
        },
      });
    } else if (type === 'info') {
      toast(message, {
        duration,
        style: {
          ...baseStyle,
          border: '1px solid rgba(59, 130, 246, 0.35)',
          boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.5), 0 0 12px rgba(59, 130, 246, 0.15)',
        },
        icon: <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />,
      });
    } else {
      toast(message, {
        duration,
        style: {
          ...baseStyle,
          border: '1px solid rgba(245, 184, 61, 0.35)',
          boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.5), 0 0 12px rgba(245, 184, 61, 0.15)',
        },
        icon: <Sparkles className="w-3.5 h-3.5 text-gold-400 shrink-0" />,
      });
    }
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, toast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
