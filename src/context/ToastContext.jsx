import React, { createContext, useContext, useCallback, useRef } from 'react';
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
  const recentToastsRef = useRef(new Map());

  const addToast = useCallback((message, type = 'success', duration = 2400, options = {}) => {
    const title = typeof message === 'string' ? message : (options.title || 'Notification');
    const description = options.description || options.desc || null;

    // Deduplication Key: prevent exact same toast flood within 800ms, but refresh if different
    const dedupKey = options.id || `${type}:${title}:${description || ''}`;
    const now = Date.now();
    const lastTime = recentToastsRef.current.get(dedupKey) || 0;

    if (now - lastTime < 800) {
      return; // Fast debounce identical rapid triggers
    }
    recentToastsRef.current.set(dedupKey, now);

    // Garbage collect dedup map
    if (recentToastsRef.current.size > 30) {
      for (const [key, timestamp] of recentToastsRef.current.entries()) {
        if (now - timestamp > 4000) {
          recentToastsRef.current.delete(key);
        }
      }
    }

    const toastDuration = type === 'error' ? Math.max(duration, 3500) : duration;

    toast.custom((t) => {
      let icon = <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
      let borderAccent = 'border-emerald-500/40 shadow-[0_8px_24px_-4px_rgba(16,185,129,0.25)]';
      let iconBg = 'bg-emerald-500/15 text-emerald-400';

      if (type === 'error') {
        icon = <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />;
        borderAccent = 'border-rose-500/40 shadow-[0_8px_24px_-4px_rgba(244,63,94,0.25)]';
        iconBg = 'bg-rose-500/15 text-rose-400';
      } else if (type === 'warning') {
        icon = <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
        borderAccent = 'border-amber-500/40 shadow-[0_8px_24px_-4px_rgba(245,158,11,0.25)]';
        iconBg = 'bg-amber-500/15 text-amber-400';
      } else if (type === 'info') {
        icon = <Info className="w-4 h-4 text-sky-400 shrink-0" />;
        borderAccent = 'border-sky-500/40 shadow-[0_8px_24px_-4px_rgba(14,165,233,0.25)]';
        iconBg = 'bg-sky-500/15 text-sky-400';
      } else if (type === 'gold' || type === 'luxury' || type === 'copy') {
        icon = <Sparkles className="w-4 h-4 text-gold-400 shrink-0" />;
        borderAccent = 'border-gold-500/50 shadow-[0_8px_24px_-4px_rgba(245,184,61,0.3)]';
        iconBg = 'bg-gold-500/15 text-gold-400';
      }

      return (
        <div
          className={`
            pointer-events-auto transform-gpu flex items-center justify-between gap-3 px-4 py-2.5 sm:py-3
            rounded-2xl bg-[#061A27]/98 backdrop-blur-xl border ${borderAccent}
            transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
            ${t.visible ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-3 opacity-0 scale-95'}
            max-w-md w-auto min-w-[280px] sm:min-w-[320px] select-none cursor-default
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
                <p className="text-[11px] text-gray-300 mt-0.5 leading-tight line-clamp-1">
                  {description}
                </p>
              )}
            </div>
          </div>

          {options.actionLabel && options.onAction && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                options.onAction();
                toast.dismiss(t.id);
              }}
              className="text-xs font-bold text-gold-400 hover:text-gold-300 px-2 py-1 rounded-lg bg-gold-500/10 hover:bg-gold-500/20 border border-gold-500/20 transition-all shrink-0 cursor-pointer"
            >
              {options.actionLabel}
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              toast.dismiss(t.id);
            }}
            className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
            aria-label="Close notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      );
    }, {
      duration: toastDuration,
      id: options.id || undefined,
    });
  }, []);

  const success = useCallback((msg, desc, options = {}) => addToast(msg, 'success', 2400, { desc, ...options }), [addToast]);
  const error = useCallback((msg, desc, options = {}) => addToast(msg, 'error', 3500, { desc, ...options }), [addToast]);
  const warning = useCallback((msg, desc, options = {}) => addToast(msg, 'warning', 3000, { desc, ...options }), [addToast]);
  const info = useCallback((msg, desc, options = {}) => addToast(msg, 'info', 2200, { desc, ...options }), [addToast]);
  const gold = useCallback((msg, desc, options = {}) => addToast(msg, 'gold', 2500, { desc, ...options }), [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, success, error, warning, info, gold, toast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};




