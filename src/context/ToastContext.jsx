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

  const addToast = useCallback((message, type = 'success', duration = 2600, options = {}) => {
    const title = typeof message === 'string' ? message : (options.title || 'Notification');
    const description = options.description || options.desc || null;

    // Deduplication Key: prevent exact same toast flood, deduplicate across renders
    const dedupKey = options.id || `${type}:${title.toLowerCase().trim()}:${(description || '').toLowerCase().trim()}`;
    const now = Date.now();
    const lastTime = recentToastsRef.current.get(dedupKey) || 0;

    // Suppress rapid identical toasts within 1500ms
    if (now - lastTime < 1500) {
      return;
    }
    recentToastsRef.current.set(dedupKey, now);

    // Garbage collect dedup map
    if (recentToastsRef.current.size > 50) {
      for (const [key, timestamp] of recentToastsRef.current.entries()) {
        if (now - timestamp > 5000) {
          recentToastsRef.current.delete(key);
        }
      }
    }

    const toastDuration = type === 'error' ? Math.max(duration, 3800) : duration;

    toast.custom((t) => {
      // Configure luxury color themes for each notification type
      let icon = <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />;
      let beaconGradient = 'from-emerald-500 via-teal-400 to-emerald-600';
      let iconBadge = 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]';
      let outerBorder = 'border-emerald-500/30 dark:border-emerald-500/40';

      if (type === 'error') {
        icon = <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />;
        beaconGradient = 'from-rose-500 via-red-400 to-rose-600';
        iconBadge = 'bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.2)]';
        outerBorder = 'border-rose-500/30 dark:border-rose-500/40';
      } else if (type === 'warning') {
        icon = <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />;
        beaconGradient = 'from-amber-500 via-yellow-400 to-amber-600';
        iconBadge = 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.2)]';
        outerBorder = 'border-amber-500/30 dark:border-amber-500/40';
      } else if (type === 'info') {
        icon = <Info className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />;
        beaconGradient = 'from-sky-500 via-blue-400 to-sky-600';
        iconBadge = 'bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/30 shadow-[0_0_12px_rgba(14,165,233,0.2)]';
        outerBorder = 'border-sky-500/30 dark:border-sky-500/40';
      } else if (type === 'gold' || type === 'luxury' || type === 'copy') {
        icon = <Sparkles className="w-4 h-4 text-gold-600 dark:text-gold-400 shrink-0" />;
        beaconGradient = 'from-gold-400 via-gold-500 to-gold-600';
        iconBadge = 'bg-gold-500/15 dark:bg-gold-500/25 text-gold-700 dark:text-gold-300 border border-gold-500/40 shadow-[0_0_14px_rgba(245,184,61,0.25)]';
        outerBorder = 'border-gold-500/40 dark:border-gold-500/50';
      }

      return (
        <div
          className={`
            as-toast-box relative overflow-hidden pointer-events-auto transform-gpu flex items-start justify-between gap-3.5 px-4 sm:px-5 py-3.5
            rounded-2xl bg-white/98 dark:bg-[#061A27]/98 text-navy-950 dark:text-white backdrop-blur-2xl border ${outerBorder}
            transition-all duration-250 ease-[cubic-bezier(0.16,1,0.3,1)]
            ${t.visible ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-3 opacity-0 scale-95'}
            max-w-md w-auto min-w-[280px] sm:min-w-[360px] select-none cursor-default shadow-2xl
          `}
          role="status"
          aria-live="polite"
        >
          {/* Left Decorative Glowing Accent Beacon */}
          <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${beaconGradient}`} />

          <div className="flex items-start gap-3.5 min-w-0 flex-1 pl-1">
            <div className={`p-2 rounded-xl ${iconBadge} shrink-0 mt-0.5 transition-transform group-hover:scale-105`}>
              {icon}
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="as-toast-title text-[13.5px] font-bold text-navy-950 dark:text-white tracking-[-0.01em] leading-snug break-words">
                  {title}
                </p>
              </div>
              {description && (
                <p className="as-toast-desc text-[12px] text-gray-600 dark:text-gray-300 mt-1 leading-relaxed break-words font-medium">
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
              className="text-xs font-bold text-navy-950 bg-gold-gradient hover:brightness-110 px-3 py-1 rounded-xl shadow-gold-sm transition-all shrink-0 cursor-pointer self-center"
            >
              {options.actionLabel}
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              toast.dismiss(t.id);
            }}
            className="p-1 text-gray-400 hover:text-navy-950 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors shrink-0 cursor-pointer -mr-1"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      );
    }, {
      duration: toastDuration,
      id: dedupKey,
    });
  }, []);

  const success = useCallback((msg, desc, options = {}) => addToast(msg, 'success', 2600, { desc, ...options }), [addToast]);
  const error = useCallback((msg, desc, options = {}) => addToast(msg, 'error', 3800, { desc, ...options }), [addToast]);
  const warning = useCallback((msg, desc, options = {}) => addToast(msg, 'warning', 3000, { desc, ...options }), [addToast]);
  const info = useCallback((msg, desc, options = {}) => addToast(msg, 'info', 2400, { desc, ...options }), [addToast]);
  const gold = useCallback((msg, desc, options = {}) => addToast(msg, 'gold', 2600, { desc, ...options }), [addToast]);

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

