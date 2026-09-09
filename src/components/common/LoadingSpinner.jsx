import React from 'react';

/**
 * Modern, stylish, and professional luxury loading spinner
 * Perfectly tuned for both Bright (Light) and Dark modes
 */
export const LoadingSpinner = ({ size = 'md', text = 'Loading...', fullScreen = false }) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-10 h-10 border-2',
    lg: 'w-14 h-14 border-[3px]',
    xl: 'w-20 h-20 border-4',
  };

  const spinnerContent = (
    <div className="flex flex-col items-center justify-center space-y-3.5 p-6 animate-fadeIn">
      <div className="relative flex items-center justify-center">
        {/* Outer subtle track */}
        <div
          className={`${sizeClasses[size] || sizeClasses.md} rounded-full border-gold-500/20 dark:border-gold-400/15 border-t-gold-500 dark:border-t-gold-400 animate-spin`}
          style={{ animationDuration: '0.85s' }}
        />
        {/* Inner pulsing luxury core */}
        <div className="absolute w-2 h-2 rounded-full bg-gold-500 dark:bg-gold-400 animate-ping opacity-75" />
      </div>

      {text && (
        <p className="text-[11px] sm:text-xs font-sans font-semibold tracking-wider uppercase text-navy-950/70 dark:text-gold-400/80 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-navy-950/80 backdrop-blur-sm">
        {spinnerContent}
      </div>
    );
  }

  return spinnerContent;
};
