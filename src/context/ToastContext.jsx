import React, { createContext, useContext, useCallback } from 'react';
import toast from 'react-hot-toast';
import { 
  ShoppingBag, 
  Heart, 
  Check, 
  AlertCircle, 
  Info, 
  Copy, 
  Sparkles,
  X 
} from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const addToast = useCallback((message, type = 'success', duration = 2600, options = {}) => {
    // Trim message cleanly if excessively long to keep toast neat and compact
    const cleanMessage = typeof message === 'string' && message.length > 55
      ? message.slice(0, 52) + '...'
      : message;

    toast.custom((t) => {
      // Configure semantic icons, colors, and subtle glow
      let icon = <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />;
      let badgeStyle = 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400';
      let borderGlow = 'border-emerald-500/35 shadow-[0_8px_25px_-5px_rgba(0,0,0,0.7),0_0_15px_rgba(16,185,129,0.18)]';

      if (type === 'cart') {
        icon = <ShoppingBag className="w-3.5 h-3.5 text-gold-400 stroke-[2.5]" />;
        badgeStyle = 'bg-gold-500/15 border-gold-500/35 text-gold-400';
        borderGlow = 'border-gold-500/40 shadow-[0_8px_25px_-5px_rgba(0,0,0,0.7),0_0_15px_rgba(245,184,61,0.22)]';
      } else if (type === 'wishlist') {
        icon = <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/40 stroke-[2.5]" />;
        badgeStyle = 'bg-rose-500/15 border-rose-500/35 text-rose-400';
        borderGlow = 'border-rose-500/40 shadow-[0_8px_25px_-5px_rgba(0,0,0,0.7),0_0_15px_rgba(244,63,94,0.22)]';
      } else if (type === 'error') {
        icon = <AlertCircle className="w-3.5 h-3.5 text-red-400 stroke-[2.5]" />;
        badgeStyle = 'bg-red-500/15 border-red-500/35 text-red-400';
        borderGlow = 'border-red-500/40 shadow-[0_8px_25px_-5px_rgba(0,0,0,0.7),0_0_15px_rgba(239,68,68,0.22)]';
      } else if (type === 'copy') {
        icon = <Copy className="w-3.5 h-3.5 text-gold-400 stroke-[2.5]" />;
        badgeStyle = 'bg-gold-500/15 border-gold-500/35 text-gold-400';
        borderGlow = 'border-gold-500/40 shadow-[0_8px_25px_-5px_rgba(0,0,0,0.7),0_0_15px_rgba(245,184,61,0.22)]';
      } else if (type === 'info') {
        icon = <Info className="w-3.5 h-3.5 text-sky-400 stroke-[2.5]" />;
        badgeStyle = 'bg-sky-500/15 border-sky-500/35 text-sky-400';
        borderGlow = 'border-sky-500/40 shadow-[0_8px_25px_-5px_rgba(0,0,0,0.7),0_0_15px_rgba(56,189,248,0.2)]';
      } else if (type === 'sparkle' || type === 'gold') {
        icon = <Sparkles className="w-3.5 h-3.5 text-gold-400 stroke-[2.5]" />;
        badgeStyle = 'bg-gold-500/15 border-gold-500/35 text-gold-400';
        borderGlow = 'border-gold-500/40 shadow-[0_8px_25px_-5px_rgba(0,0,0,0.7),0_0_15px_rgba(245,184,61,0.22)]';
      }

      return (
        <div
          className={`
            pointer-events-auto flex items-center gap-2.5 px-3.5 py-1.5 
            rounded-full bg-[#061A27]/95 backdrop-blur-xl border ${borderGlow}
            transition-all duration-300 transform
            ${t.visible ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-2 opacity-0 scale-95'}
            max-w-sm sm:max-w-md select-none
          `}
        >
          {/* Micro Icon Badge */}
          <div className={`flex items-center justify-center w-5.5 h-5.5 rounded-full border shrink-0 ${badgeStyle}`}>
            {icon}
          </div>

          {/* Toast Message Text */}
          <span className="text-[12px] font-medium text-[#FAF7F0] tracking-wide whitespace-nowrap">
            {cleanMessage}
          </span>

          {/* Micro Dismiss Button */}
          <button
            onClick={() => toast.dismiss(t.id)}
            className="ml-0.5 p-0.5 text-stone-400 hover:text-white transition-colors rounded-full"
            aria-label="Close"
          >
            <X className="w-3 h-3 opacity-60 hover:opacity-100" />
          </button>
        </div>
      );
    }, {
      duration: type === 'error' ? Math.max(duration, 3500) : duration,
      id: options.id || undefined,
    });
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

