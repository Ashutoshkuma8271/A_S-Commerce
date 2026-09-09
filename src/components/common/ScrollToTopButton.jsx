import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

export const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 280) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    toggleVisibility();

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-40 transition-all duration-300 ease-out ${
        isVisible
          ? 'opacity-100 translate-y-0 pointer-events-auto scale-100'
          : 'opacity-0 translate-y-4 pointer-events-none scale-90'
      }`}
    >
      <button
        onClick={scrollToTop}
        aria-label="Back to top"
        title="Back to Top"
        className="group relative w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white dark:bg-navy-900 border-2 border-gold-500/50 hover:border-gold-500 text-navy-950 dark:text-white shadow-xl hover:shadow-[0_0_20px_rgba(245,184,61,0.4)] flex items-center justify-center transition-all duration-300 hover:-translate-y-1 active:scale-95 cursor-pointer backdrop-blur-md"
      >
        {/* Subtle Gold Aura Ring */}
        <span className="absolute inset-0 rounded-full bg-gold-500/10 dark:bg-gold-500/20 group-hover:scale-125 group-hover:opacity-0 transition-all duration-500 pointer-events-none" />

        {/* Upward Chevron with micro-animation on hover */}
        <ChevronUp className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-navy-950 dark:text-gold-400 group-hover:text-gold-600 dark:group-hover:text-gold-300 transition-all duration-200 stroke-[2.5] group-hover:-translate-y-0.5" />
      </button>
    </div>
  );
};

export default ScrollToTopButton;
