import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { CATEGORIES } from '../../data/categories';

export const CategorySection = () => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const checkScrollability = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 15);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 15);
      
      const itemWidth = 140; // Approximate card width + gap
      const index = Math.round(scrollLeft / itemWidth);
      setActiveIndex(Math.min(CATEGORIES.length - 1, Math.max(0, index)));
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

  // Automated Smooth Carousel Interval (Slides every 3.2 seconds)
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        const maxScroll = scrollWidth - clientWidth;
        
        // Scroll forward by one card step
        const step = clientWidth > 768 ? 280 : 180;
        
        if (scrollLeft >= maxScroll - 20) {
          // Reached the end: loop back smoothly to start
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollRef.current.scrollBy({ left: step, behavior: 'smooth' });
        }
      }
    }, 3200);

    return () => clearInterval(interval);
  }, [isPaused]);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = direction === 'left' ? -(clientWidth > 768 ? 320 : 220) : (clientWidth > 768 ? 320 : 220);
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleDotClick = (index) => {
    if (scrollRef.current) {
      const step = 140;
      scrollRef.current.scrollTo({ left: index * step, behavior: 'smooth' });
    }
  };

  return (
    <section className="w-full bg-white dark:bg-navy-950 py-10 sm:py-14 border-b border-gray-100 dark:border-navy-850 select-none transition-colors relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header with Luxury Typography & Navigation Controls */}
        <div className="mb-6 sm:mb-8 flex items-end justify-between gap-3">
          <div className="text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-600 dark:text-gold-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5 font-mono">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gold-500" />
              <span>Curated Departments</span>
            </div>
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-serif font-bold tracking-tight text-navy-950 dark:text-white">
              Shop by Category
            </h2>
          </div>

          {/* Action Area: Luxury View All Link */}
          <Link
            to="/shop"
            className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gold-600 dark:text-gold-400 hover:text-gold-500 transition-colors pb-1 cursor-pointer"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Interactive Sliding Category Rail with Floating Edge Controls */}
        <div
          className="relative group/rail"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {/* Left Floating Arrow (Over Rail - Visible on all screens) */}
          {canScrollLeft && (
            <button
              onClick={() => handleScroll('left')}
              aria-label="Scroll left"
              className="flex absolute -left-1 sm:-left-4 top-[40%] -translate-y-1/2 z-30 w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-white/95 dark:bg-navy-900/95 border border-gray-300 dark:border-gold-500/40 text-navy-950 dark:text-white shadow-xl items-center justify-center hover:scale-110 active:scale-90 hover:border-gold-500 hover:text-gold-500 transition-all backdrop-blur-md cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
            </button>
          )}

          {/* Right Floating Arrow (Over Rail - Visible on all screens) */}
          {canScrollRight && (
            <button
              onClick={() => handleScroll('right')}
              aria-label="Scroll right"
              className="flex absolute -right-1 sm:-right-4 top-[40%] -translate-y-1/2 z-30 w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-white/95 dark:bg-navy-900/95 border border-gray-300 dark:border-gold-500/40 text-navy-950 dark:text-white shadow-xl items-center justify-center hover:scale-110 active:scale-90 hover:border-gold-500 hover:text-gold-500 transition-all backdrop-blur-md cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
            </button>
          )}

          {/* Left Gradient Edge Fade */}
          {canScrollLeft && (
            <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-14 bg-gradient-to-r from-white dark:from-navy-950 to-transparent pointer-events-none z-10" />
          )}

          {/* Right Gradient Edge Fade */}
          {canScrollRight && (
            <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-14 bg-gradient-to-l from-white dark:from-navy-950 to-transparent pointer-events-none z-10" />
          )}

          {/* Scrollable Circular Cards Track */}
          <div
            ref={scrollRef}
            className="flex items-start gap-4 sm:gap-6 lg:gap-8 overflow-x-auto pb-6 pt-2 scrollbar-none snap-x snap-mandatory scroll-smooth px-2"
          >
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                to={`/shop?category=${cat.slug}`}
                className="snap-start shrink-0 w-24 sm:w-28 lg:w-32 group flex flex-col items-center text-center cursor-pointer transition-all duration-300 transform hover:-translate-y-2 active:scale-95"
              >
                {/* Guaranteed Perfect Circular Outer Ring with 3D Shadow & Gold Glow */}
                <div className="relative w-20 h-20 min-[380px]:w-24 min-[380px]:h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 aspect-square rounded-full p-1 bg-gradient-to-b from-[#FAF7F0] to-[#E8DEC9] dark:from-navy-800 dark:to-navy-900 border-2 border-gray-200/90 dark:border-navy-700/80 shadow-md group-hover:shadow-[0_10px_25px_rgba(245,184,61,0.35)] group-hover:border-gold-500 transition-all duration-500 flex items-center justify-center shrink-0">
                  
                  {/* Perfect Circular Inner Image Mask */}
                  <div className="w-full h-full aspect-square rounded-full overflow-hidden border border-white/80 dark:border-white/10 shadow-inner relative flex items-center justify-center bg-cream-100 dark:bg-navy-900">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full aspect-square object-cover object-center rounded-full group-hover:scale-115 transition-transform duration-700 ease-out"
                      loading="lazy"
                    />
                    {/* Subtle 3D Depth Overlay */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-t from-navy-950/40 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>

                </div>

                {/* Category Typography */}
                <h3 className="mt-3 text-xs sm:text-sm font-serif font-bold text-navy-950 dark:text-gray-100 group-hover:text-gold-500 transition-colors leading-snug tracking-tight text-center line-clamp-1 max-w-[120px]">
                  {cat.name}
                </h3>

                {/* Item Count */}
                <span className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 font-medium tracking-wide mt-0.5">
                  {cat.itemCount}
                </span>
              </Link>
            ))}
          </div>

          {/* Minimal Interactive Progress Bar */}
          <div className="flex items-center justify-center gap-1.5 pt-2">
            {CATEGORIES.slice(0, 6).map((_, idx) => (
              <button
                key={idx}
                onClick={() => handleDotClick(idx * 2)}
                aria-label={`Go to category slide ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  Math.floor(activeIndex / 2) === idx
                    ? 'w-6 bg-gold-500 shadow-sm'
                    : 'w-1.5 bg-gray-300 dark:bg-navy-800 hover:bg-gold-500/50'
                }`}
              />
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};
export default CategorySection;
