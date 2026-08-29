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
      className={`group relative inline-flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-full border transition-all duration-300 cursor-pointer select-none ${
        isDark
          ? 'bg-navy-850/90 hover:bg-navy-800 border-gold-500/30 text-gold-400 shadow-gold-sm'
          : 'bg-navy-800/80 hover:bg-navy-800 border-gold-500/20 text-gold-400 hover:text-white shadow-sm'
      } ${className}`}
    >
      {/* Animated Icon Container */}
      <div className="relative w-5 h-5 flex items-center justify-center">
        {isDark ? (
          <div className="flex items-center justify-center animate-fadeIn">
            <Moon className="w-4 h-4 text-gold-400 transition-transform duration-300 group-hover:-rotate-12" />
            <Sparkles className="w-2.5 h-2.5 text-gold-300 absolute -top-1 -right-1 animate-pulse" />
          </div>
        ) : (
          <div className="flex items-center justify-center animate-fadeIn">
            <Sun className="w-4 h-4 text-gold-400 transition-transform duration-500 group-hover:rotate-90 group-hover:text-gold-300" />
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
