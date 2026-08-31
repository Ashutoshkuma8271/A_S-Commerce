import React, { createContext, useContext, useCallback } from 'react';
import toast from 'react-hot-toast';
import { 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  AlertTriangle,
  X,
  Sparkles
} from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const addToast = useCallback((message, type = 'success', duration = 3000, options = {}) => {
    // Shopify Polaris / Modern luxury toast style with optional subtitle or description
    const title = typeof message === 'string' ? message : (options.title || 'Notification');
    const description = options.description || options.desc || null;

    toast.custom((t) => {
      let icon = <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
      let borderAccent = 'border-emerald-500/30';
      let iconBg = 'bg-emerald-500/15 text-emerald-400';

      if (type === 'error') {
        icon = <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />;
        borderAccent = 'border-rose-500/30';
        iconBg = 'bg-rose-500/15 text-rose-400';
      } else if (type === 'warning') {
        icon = <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
        borderAccent = 'border-amber-500/30';
        iconBg = 'bg-amber-500/15 text-amber-400';
      } else if (type === 'info') {
        icon = <Info className="w-4 h-4 text-sky-400 shrink-0" />;
        borderAccent = 'border-sky-500/30';
        iconBg = 'bg-sky-500/15 text-sky-400';
      } else if (type === 'gold' || type === 'luxury' || type === 'copy') {
        icon = <Sparkles className="w-4 h-4 text-gold-400 shrink-0" />;
        borderAccent = 'border-gold-500/40';
        iconBg = 'bg-gold-500/15 text-gold-400';
      }

      return (
        <div
          className={`
            pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 
            rounded-2xl bg-[#091B29]/95 backdrop-blur-xl border ${borderAccent}
            shadow-[0_12px_32px_-4px_rgba(0,0,0,0.6),0_0_1px_1px_rgba(255,255,255,0.08)]
            transition-all duration-300 ease-out transform
            ${t.visible ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-2 opacity-0 scale-95'}
            max-w-md w-auto min-w-[280px] sm:min-w-[320px] select-none z-[9999]
          `}
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className={`p-1.5 rounded-xl ${iconBg} shrink-0`}>
              {icon}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-[13px] font-semibold text-white tracking-tight leading-snug truncate">
                {title}
              </p>
              {description && (
                <p className="text-[11px] text-gray-400 mt-0.5 leading-tight line-clamp-1">
                  {description}
                </p>
              )}
            </div>
          </div>

          {options.actionLabel && options.onAction && (
            <button
              onClick={() => {
                options.onAction();
                toast.dismiss(t.id);
              }}
              className="text-xs font-bold text-gold-400 hover:text-gold-300 px-2 py-1 rounded-lg bg-gold-500/10 hover:bg-gold-500/20 border border-gold-500/20 transition-all shrink-0 cursor-pointer"
            >
              {options.actionLabel}
            </button>
          )}

          <button
            onClick={() => toast.dismiss(t.id)}
            className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
            aria-label="Close notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      );
    }, {
      duration: type === 'error' ? Math.max(duration, 4000) : duration,
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



