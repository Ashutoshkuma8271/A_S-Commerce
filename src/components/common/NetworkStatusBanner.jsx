import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export const NetworkStatusBanner = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [showRestored, setShowRestored] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowRestored(true);
      const timer = setTimeout(() => {
        setShowRestored(false);
      }, 3500);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowRestored(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showRestored) {
    return null;
  }

  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[999999] max-w-[90vw] sm:max-w-md pointer-events-none animate-fadeIn"
    >
      {!isOnline ? (
        <div className="pointer-events-auto flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-slate-900/95 dark:bg-slate-950/95 text-white border border-amber-500/40 shadow-2xl backdrop-blur-md text-xs sm:text-sm font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
          <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
          <span>You are offline. Showing cached catalog data.</span>
        </div>
      ) : showRestored ? (
        <div className="pointer-events-auto flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-emerald-950/95 text-emerald-100 border border-emerald-500/40 shadow-2xl backdrop-blur-md text-xs sm:text-sm font-medium">
          <Wifi className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Back online! Connection restored.</span>
        </div>
      ) : null}
    </div>
  );
};
