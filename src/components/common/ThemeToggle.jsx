import React from 'react';
import { Sun, Moon, Sparkles } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggle = ({ className = '', showLabel = false }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to Bright Mode' : 'Switch to Dark Mode'}
      title={isDark ? 'Switch to Bright Mode (Daylight)' : 'Switch to Dark Mode (Midnight Luxury)'}
      className={`group relative inline-flex items-center justify-center ${
        showLabel
          ? 'gap-2 px-3 py-1.5 rounded-full'
          : 'w-9 h-9 sm:w-10 sm:h-10 rounded-full shrink-0'
      } border transition-all duration-300 cursor-pointer select-none ${
        isDark
          ? 'bg-navy-850/90 hover:bg-navy-800 border-navy-700/80 hover:border-gold-500/40 text-gold-400 shadow-sm hover:scale-105 active:scale-95'
          : 'bg-navy-850/90 hover:bg-navy-800 border-navy-700/80 hover:border-gold-500/40 text-gold-400 hover:text-white shadow-sm hover:scale-105 active:scale-95'
      } ${className}`}
    >
      {/* Animated Icon Container */}
      <div className="relative w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
        {isDark ? (
          <div className="flex items-center justify-center animate-fadeIn">
            <Moon className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-gold-400 transition-transform duration-300 group-hover:-rotate-12" />
            <Sparkles className="w-2.5 h-2.5 text-gold-300 absolute -top-1 -right-1 animate-pulse" />
          </div>
        ) : (
          <div className="flex items-center justify-center animate-fadeIn">
            <Sun className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-gold-400 transition-transform duration-500 group-hover:rotate-90 group-hover:text-gold-300" />
          </div>
        )}
      </div>

      {showLabel && (
        <span className="text-xs font-semibold tracking-wide">
          {isDark ? 'Dark Mode' : 'Bright Mode'}
        </span>
      )}
    </button>
  );
};
