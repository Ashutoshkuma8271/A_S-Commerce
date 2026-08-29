import React from 'react';
import { Link } from 'react-router-dom';

export const Logo = ({ size = 'normal', showTagline = true, className = '' }) => {
  return (
    <Link to="/" className={`inline-flex items-center gap-2.5 sm:gap-3 group select-none shrink-0 ${className}`}>
      {/* Monogram Icon */}
      <div className="relative flex items-center justify-center shrink-0">
        {/* Outer subtle glow */}
        <div className="absolute inset-0 bg-gold-500/20 rounded-full blur-md group-hover:bg-gold-500/40 transition-all duration-300 pointer-events-none"></div>
        
        <svg
          viewBox="0 0 54 54"
          className={size === 'large' ? 'w-12 h-12 sm:w-14 sm:h-14' : size === 'small' ? 'w-8 h-8 sm:w-9 sm:h-9' : 'w-9 h-9 sm:w-11 sm:h-11'}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Circular frame */}
          <circle cx="27" cy="27" r="25" stroke="url(#goldGrad)" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
          <circle cx="27" cy="27" r="23" stroke="url(#goldGrad)" strokeWidth="1.2" />

          {/* Mini Luxury Crown on Top */}
          <path
            d="M20 17 L23 21 L27 15 L31 21 L34 17 L33 23 L21 23 Z"
            fill="url(#goldGrad)"
          />
          <circle cx="20" cy="16" r="1" fill="#FFD36A" />
          <circle cx="27" cy="14" r="1.2" fill="#FFD36A" />
          <circle cx="34" cy="16" r="1" fill="#FFD36A" />

          {/* AS Interlinked Monogram */}
          <text
            x="27"
            y="37"
            fontFamily="'Playfair Display', 'Cinzel', serif"
            fontSize="19"
            fontWeight="800"
            fontStyle="italic"
            letterSpacing="-1"
            fill="url(#goldGrad)"
            textAnchor="middle"
          >
            AS
          </text>

          {/* Gradients */}
          <defs>
            <linearGradient id="goldGrad" x1="0" y1="0" x2="54" y2="54" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFE599" />
              <stop offset="50%" stopColor="#F5B83D" />
              <stop offset="100%" stopColor="#D99B26" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col text-left justify-center">
        <div className="flex items-center gap-1 leading-none whitespace-nowrap">
          <span className="font-serif text-lg sm:text-xl lg:text-2xl font-bold tracking-tight text-white group-hover:text-gold-400 transition-colors">
            A_S <span className="font-sans font-light tracking-wide text-white/95 text-base sm:text-lg lg:text-xl">Commerce</span>
          </span>
        </div>
        {showTagline && (
          <span className="text-[8px] sm:text-[9.5px] lg:text-[10.5px] font-semibold tracking-[0.18em] text-gold-400 uppercase mt-0.5 whitespace-nowrap">
            Shop Smart. Live Premium.
          </span>
        )}
      </div>
    </Link>
  );
};

