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
      let beaconGradient = 'from-emerald-500 to-teal-400';
      let iconBadge = 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-500/30';
      let outerBorder = 'border-emerald-500/30 dark:border-emerald-500/35';

      if (type === 'error') {
        icon = <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />;
        beaconGradient = 'from-rose-500 to-red-400';
        iconBadge = 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-500/30';
        outerBorder = 'border-rose-500/30 dark:border-rose-500/35';
      } else if (type === 'warning') {
        icon = <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />;
        beaconGradient = 'from-amber-500 to-yellow-400';
        iconBadge = 'bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-500/30';
        outerBorder = 'border-amber-500/30 dark:border-amber-500/35';
      } else if (type === 'info') {
        icon = <Info className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />;
        beaconGradient = 'from-sky-500 to-blue-400';
        iconBadge = 'bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950/60 dark:text-sky-400 dark:border-sky-500/30';
        outerBorder = 'border-sky-500/30 dark:border-sky-500/35';
      } else if (type === 'gold' || type === 'luxury' || type === 'copy') {
        icon = <Sparkles className="w-4 h-4 text-gold-600 dark:text-gold-400 shrink-0" />;
        beaconGradient = 'from-gold-400 to-gold-600';
        iconBadge = 'bg-gold-50 text-gold-800 border border-gold-300 dark:bg-gold-500/20 dark:text-gold-300 dark:border-gold-500/35';
        outerBorder = 'border-gold-500/40 dark:border-gold-500/45';
      }

      const hasDesc = Boolean(description);

      return (
        <div
          className={`
            as-toast-box relative overflow-hidden pointer-events-auto transform-gpu flex ${hasDesc ? 'items-start' : 'items-center'} justify-between gap-3 px-3.5 py-2.5 sm:px-4 sm:py-3
            rounded-2xl bg-white/98 dark:bg-[#061A27]/96 text-navy-950 dark:text-white backdrop-blur-2xl border ${outerBorder}
            transition-all duration-200 ease-out
            ${t.visible ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-2 opacity-0 scale-95'}
            max-w-xs sm:max-w-sm min-w-[220px] sm:min-w-[260px] select-none cursor-default
          `}
          role="status"
          aria-live="polite"
        >
          {/* Subtle Left Accent Line */}
          <div className={`absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-gradient-to-b ${beaconGradient}`} />

          <div className={`flex ${hasDesc ? 'items-start' : 'items-center'} gap-2.5 min-w-0 flex-1 pl-1`}>
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${iconBadge} shrink-0 shadow-xs`}>
              {icon}
            </div>
            <div className="min-w-0 flex-1">
              <p className="as-toast-title text-[13px] font-semibold text-[#061A27] dark:text-white tracking-[-0.01em] leading-snug break-words">
                {title}
              </p>
              {hasDesc && (
                <p className="as-toast-desc text-[11.5px] text-[#64748B] dark:text-[#CBD5E1] mt-0.5 leading-tight break-words font-normal">
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
              className="text-[11px] font-bold text-navy-950 bg-gold-gradient hover:brightness-110 px-2.5 py-1 rounded-lg shadow-gold-sm transition-all shrink-0 cursor-pointer self-center"
            >
              {options.actionLabel}
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              toast.dismiss(t.id);
            }}
            className="p-1 text-gray-400 hover:text-navy-950 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors shrink-0 cursor-pointer ml-1"
            aria-label="Close notification"
          >
            <X className="w-3.5 h-3.5" />
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

