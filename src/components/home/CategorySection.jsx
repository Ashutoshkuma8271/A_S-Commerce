import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CATEGORIES } from '../../data/categories';

export const CategorySection = () => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollability = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  useEffect(() => {
    checkScrollability();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScrollability, { passive: true });
    }
    window.addEventListener('resize', checkScrollability);

    return () => {
      if (el) el.removeEventListener('scroll', checkScrollability);
      window.removeEventListener('resize', checkScrollability);
    };
  }, [checkScrollability]);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="w-full bg-white dark:bg-navy-950 py-10 sm:py-14 border-b border-gray-100 dark:border-navy-850 select-none transition-colors relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header with Luxury Typography & Navigation Buttons */}
        <div className="mb-6 sm:mb-10 flex items-end justify-between gap-4">
          <div className="text-left">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-gold-500 font-sans block mb-1">
              Curated Collections
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black tracking-tight text-navy-950 dark:text-white">
              Shop by Category
            </h2>
          </div>

          {/* Desktop & Tablet Header Quick Scroll Controls */}
          {(canScrollLeft || canScrollRight) && (
            <div className="hidden sm:flex items-center gap-2.5">
              <button
                onClick={() => handleScroll('left')}
                disabled={!canScrollLeft}
                aria-label="Previous categories"
                className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                  canScrollLeft
                    ? 'bg-white dark:bg-navy-900 border-gray-300 dark:border-navy-700 text-navy-950 dark:text-white hover:border-gold-500 hover:text-gold-500 shadow-md hover:scale-105 active:scale-95'
                    : 'bg-gray-100 dark:bg-navy-900/50 border-gray-200 dark:border-navy-800 text-gray-400 dark:text-gray-600 opacity-40 cursor-not-allowed'
                }`}
              >
                <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
              </button>

              <button
                onClick={() => handleScroll('right')}
                disabled={!canScrollRight}
                aria-label="Next categories"
                className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                  canScrollRight
                    ? 'bg-white dark:bg-navy-900 border-gray-300 dark:border-navy-700 text-navy-950 dark:text-white hover:border-gold-500 hover:text-gold-500 shadow-md hover:scale-105 active:scale-95'
                    : 'bg-gray-100 dark:bg-navy-900/50 border-gray-200 dark:border-navy-800 text-gray-400 dark:text-gray-600 opacity-40 cursor-not-allowed'
                }`}
              >
                <ChevronRight className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>
          )}
        </div>

        {/* Scalable Interactive Category Rail with Floating Edge Buttons */}
        <div className="relative group/rail">
          
          {/* Left Floating Arrow (Over Rail) */}
          {canScrollLeft && (
            <button
              onClick={() => handleScroll('left')}
              aria-label="Scroll left"
              className="absolute -left-3 sm:-left-5 top-[38%] -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/95 dark:bg-navy-900/95 border border-gray-300 dark:border-gold-500/40 text-navy-950 dark:text-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-90 hover:border-gold-500 hover:text-gold-500 transition-all backdrop-blur-md cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
            </button>
          )}

          {/* Right Floating Arrow (Over Rail) */}
          {canScrollRight && (
            <button
              onClick={() => handleScroll('right')}
              aria-label="Scroll right"
              className="absolute -right-3 sm:-right-5 top-[38%] -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/95 dark:bg-navy-900/95 border border-gray-300 dark:border-gold-500/40 text-navy-950 dark:text-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-90 hover:border-gold-500 hover:text-gold-500 transition-all backdrop-blur-md cursor-pointer"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
            </button>
          )}

          {/* Left Gradient Edge Fade */}
          {canScrollLeft && (
            <div className="absolute left-0 top-0 bottom-0 w-10 sm:w-16 bg-gradient-to-r from-white dark:from-navy-950 to-transparent pointer-events-none z-10" />
          )}

          {/* Right Gradient Edge Fade */}
          {canScrollRight && (
            <div className="absolute right-0 top-0 bottom-0 w-10 sm:w-16 bg-gradient-to-l from-white dark:from-navy-950 to-transparent pointer-events-none z-10" />
          )}

          {/* Horizontal Scrollable Circular Cards Track for Mobile & Laptop */}
          <div
            ref={scrollRef}
            className="flex flex-nowrap items-start gap-5 sm:gap-7 lg:gap-9 overflow-x-auto pb-6 pt-2 scrollbar-none snap-x snap-mandatory scroll-smooth px-2"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                to={`/shop?category=${cat.slug}`}
                className="snap-start shrink-0 w-28 sm:w-36 lg:w-44 group flex flex-col items-center text-center cursor-pointer transition-all duration-300 transform hover:-translate-y-2 active:scale-95"
              >
                {/* Guaranteed Perfect Circular Outer Ring with 3D Shadow & Gold Glow */}
                <div className="relative w-28 h-28 sm:w-36 sm:h-36 lg:w-44 lg:h-44 aspect-square rounded-full p-1.5 bg-gradient-to-b from-[#FAF7F0] to-[#E8DEC9] dark:from-navy-800 dark:to-navy-900 border-2 border-gray-200/90 dark:border-navy-700/80 shadow-lg group-hover:shadow-[0_12px_28px_rgba(245,184,61,0.4)] group-hover:border-gold-500 transition-all duration-500 flex items-center justify-center shrink-0">
                  
                  {/* Perfect Circular Inner Image Mask */}
                  <div className="w-full h-full aspect-square rounded-full overflow-hidden border border-white/80 dark:border-white/10 shadow-inner relative flex items-center justify-center bg-cream-100 dark:bg-navy-900">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full aspect-square object-cover object-center rounded-full group-hover:scale-115 transition-transform duration-700 ease-out"
                      loading="lazy"
                    />
                    {/* Subtle 3D Depth Overlay */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-t from-navy-950/35 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>

                </div>

                {/* Category Typography */}
                <h3 className="mt-3.5 text-xs sm:text-sm lg:text-base font-serif font-bold text-navy-950 dark:text-gray-100 group-hover:text-gold-500 transition-colors leading-snug tracking-tight text-center line-clamp-1 max-w-[140px]">
                  {cat.name}
                </h3>

                {/* Item Count */}
                <span className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wide mt-1">
                  {cat.itemCount}
                </span>
              </Link>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};






