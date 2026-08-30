import React, { createContext, useContext, useCallback } from 'react';
import toast from 'react-hot-toast';
import { 
  Check, 
  AlertCircle, 
  Info, 
  X 
} from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const addToast = useCallback((message, type = 'success', duration = 2200, options = {}) => {
    // Truncate cleanly if message is over 45 chars for modern compact aesthetics
    const cleanMessage = typeof message === 'string' && message.length > 45
      ? message.slice(0, 42) + '...'
      : message;

    toast.custom((t) => {
      let icon = <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 stroke-[2.5]" />;
      let borderAccent = 'border-emerald-500/30';

      if (type === 'error') {
        icon = <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 stroke-[2.5]" />;
        borderAccent = 'border-rose-500/40';
      } else if (type === 'info') {
        icon = <Info className="w-3.5 h-3.5 text-sky-400 shrink-0 stroke-[2.5]" />;
        borderAccent = 'border-sky-500/40';
      } else if (type === 'gold' || type === 'copy') {
        icon = <Check className="w-3.5 h-3.5 text-gold-400 shrink-0 stroke-[2.5]" />;
        borderAccent = 'border-gold-500/40';
      }

      return (
        <div
          className={`
            pointer-events-auto flex items-center justify-between gap-2.5 px-3 py-2 
            rounded-full bg-[#061A27]/95 backdrop-blur-md border ${borderAccent}
            shadow-lg shadow-black/70
            transition-all duration-200 ease-out transform
            ${t.visible ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-2 opacity-0 scale-95'}
            max-w-xs select-none cursor-pointer
          `}
          onClick={() => toast.dismiss(t.id)}
        >
          <div className="flex items-center gap-2 min-w-0">
            {icon}
            <span className="text-xs font-semibold text-white tracking-tight truncate">
              {cleanMessage}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toast.dismiss(t.id);
            }}
            className="p-0.5 text-gray-400 hover:text-white transition-colors rounded-full"
            aria-label="Close"
          >
            <X className="w-3 h-3 opacity-60 hover:opacity-100" />
          </button>
        </div>
      );
    }, {
      duration: type === 'error' ? Math.max(duration, 3000) : duration,
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
export default ToastContext;
