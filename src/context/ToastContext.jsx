import React, { createContext, useContext, useCallback } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle2, AlertCircle, Info, Sparkles } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const addToast = useCallback((message, type = 'success', duration = 3000) => {
    const toastStyle = {
      background: '#061A27',
      color: '#FAF7F0',
      border: '1px solid rgba(245, 184, 61, 0.4)',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 15px rgba(245, 184, 61, 0.2)',
      borderRadius: '16px',
      padding: '12px 18px',
      fontSize: '13px',
      fontWeight: '500',
    };

    if (type === 'success') {
      toast.success(message, {
        duration,
        style: toastStyle,
        iconTheme: {
          primary: '#F5B83D',
          secondary: '#061A27',
        },
      });
    } else if (type === 'error') {
      toast.error(message, {
        duration,
        style: {
          ...toastStyle,
          border: '1px solid rgba(239, 68, 68, 0.4)',
        },
        iconTheme: {
          primary: '#EF4444',
          secondary: '#061A27',
        },
      });
    } else {
      toast(message, {
        duration,
        style: toastStyle,
        icon: <Sparkles className="w-4 h-4 text-gold-400 shrink-0" />,
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
