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
  const addToast = useCallback((message, type = 'success', duration = 2400, options = {}) => {
    // Truncate cleanly if too long
    const cleanMessage = typeof message === 'string' && message.length > 52
      ? message.slice(0, 50) + '...'
      : message;

    toast.custom((t) => {
      // Clean modern icons & subtle border accent like Shopify / Supabase / GitHub
      let icon = <Check className="w-4 h-4 text-emerald-400 shrink-0 stroke-[2.5]" />;
      let borderAccent = 'border-slate-700/60';

      if (type === 'error') {
        icon = <AlertCircle className="w-4 h-4 text-red-400 shrink-0 stroke-[2.5]" />;
        borderAccent = 'border-red-900/50';
      } else if (type === 'info') {
        icon = <Info className="w-4 h-4 text-sky-400 shrink-0 stroke-[2.5]" />;
        borderAccent = 'border-sky-900/50';
      } else if (type === 'gold' || type === 'copy') {
        icon = <Check className="w-4 h-4 text-gold-400 shrink-0 stroke-[2.5]" />;
        borderAccent = 'border-gold-500/30';
      }

      return (
        <div
          className={`
            pointer-events-auto flex items-center justify-between gap-3 px-3.5 py-2.5 
            rounded-lg bg-[#07131F]/95 backdrop-blur-md border ${borderAccent}
            shadow-xl shadow-black/60
            transition-all duration-200 ease-out transform
            ${t.visible ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-1.5 opacity-0 scale-98'}
            max-w-sm select-none
          `}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {icon}
            <span className="text-[12.5px] font-medium text-stone-100 tracking-normal truncate">
              {cleanMessage}
            </span>
          </div>

          <button
            onClick={() => toast.dismiss(t.id)}
            className="p-1 -mr-1 text-stone-400 hover:text-stone-100 transition-colors rounded"
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


