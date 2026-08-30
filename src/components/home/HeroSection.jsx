import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import heroGown from '../../assets/hero/hero_gown.jpg';
import heroSkincare from '../../assets/hero/hero_skincare.jpg';
import heroLiving from '../../assets/hero/hero_living.jpg';
import heroTextiles from '../../assets/hero/hero_textiles.jpg';

const HERO_SLIDES = [
  {
    id: 1,
    badge: 'HAUTE COUTURE 2026',
    tag: 'Royal Atelier Collection',
    titleLine1: 'Midnight Silk Grandeur.',
    titleLine2: 'Tailored Prestige.',
    subtitle: 'Hand-embroidered midnight gala gowns, bespoke evening wear, and Italian velvets crafted for timeless majesty.',
    primaryBtnText: 'Shop Couture Collection',
    primaryBtnLink: '/category/women',
    secondaryBtnText: 'Explore All Luxury',
    secondaryBtnLink: '/shop',
    image: heroGown,
  },
  {
    id: 2,
    badge: 'BOTANICAL SCIENCE',
    tag: 'Cellular Vitality Elixir',
    titleLine1: 'Lumière Botanical Elixir.',
    titleLine2: 'Pure Golden Radiance.',
    subtitle: 'Infused with 24K bioactive gold flakes, rare botanical stem cells, and moisture complexes for luminous skin rejuvenation.',
    primaryBtnText: 'Discover Beauty',
    primaryBtnLink: '/category/beauty',
    secondaryBtnText: 'New Arrivals',
    secondaryBtnLink: '/new-arrivals',
    image: heroSkincare,
  },
  {
    id: 3,
    badge: 'ARCHITECTURAL LIVING',
    tag: 'Contemporary Sanctuary',
    titleLine1: 'Coastal Sunset Haven.',
    titleLine2: 'Bespoke Sanctuary.',
    subtitle: 'Architectural walnut furnishings, sculptural marble tables, and panoramic silhouettes engineered for modern estates.',
    primaryBtnText: 'Explore Living',
    primaryBtnLink: '/category/home-living',
    secondaryBtnText: 'View Curations',
    secondaryBtnLink: '/shop',
    image: heroLiving,
  },
  {
    id: 4,
    badge: 'HERITAGE TEXTILES',
    tag: 'Grade-A Cashmere & Damask',
    titleLine1: 'Sumptuous Cashmere.',
    titleLine2: 'Artisanal Jacquard.',
    subtitle: 'Spun from Grade-A Himalayan cashmere and hand-loomed mulberry damask silks delivering featherlight warmth and elegance.',
    primaryBtnText: 'Explore Textiles',
    primaryBtnLink: '/category/men',
    secondaryBtnText: 'Special Offers',
    secondaryBtnLink: '/offers',
    image: heroTextiles,
  },
];

const SLIDE_DURATION = 6000; // 6.0s interval

export const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Touch swipe refs
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Automatic slide interval
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, SLIDE_DURATION);

    return () => clearInterval(interval);
  }, [isPaused, currentSlide]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 45) {
      handleNext();
    } else if (diff < -45) {
      handlePrev();
    }
  };

  return (
    <div
      className="w-full relative select-none overflow-hidden bg-black text-white"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Smooth Sliding Carousel Track */}
      <div className="relative min-h-[480px] sm:min-h-[540px] lg:min-h-[600px] w-full overflow-hidden flex items-center">
        <div
          className="flex w-full h-full transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
          style={{ transform: `translate3d(-${currentSlide * 100}%, 0, 0)` }}
        >
          {HERO_SLIDES.map((slide, index) => (
            <div
              key={slide.id}
              className="min-w-full w-full h-full relative flex items-center shrink-0 min-h-[480px] sm:min-h-[540px] lg:min-h-[600px]"
            >
              {/* Cinematic Full-Bleed Background Image & Gradients */}
              <div className="absolute inset-0 z-0 overflow-hidden">
                <img
                  src={slide.image}
                  alt={slide.titleLine1}
                  fetchPriority={index === 0 ? "high" : "low"}
                  loading={index === 0 ? "eager" : "lazy"}
                  decoding="async"
                  className="w-full h-full object-cover object-center brightness-[0.78] contrast-[1.08] transition-transform duration-1000 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/60 to-black/25" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/35" />
              </div>

              {/* Foreground Left Content */}
              <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-12 sm:py-16 relative z-10 w-full">
                <div className="max-w-xl lg:max-w-2xl space-y-3 sm:space-y-5 text-left">
                  {/* High-Impact Headline */}
                  <h1 className="font-serif text-3xl sm:text-5xl lg:text-[56px] xl:text-[62px] font-black tracking-tight text-white leading-[1.08] drop-shadow-md">
                    {slide.titleLine1}{' '}
                    <br />
                    <span className="text-gold-400 sm:text-gold-300 font-serif">
                      {slide.titleLine2}
                    </span>
                  </h1>

                  {/* Subtitle */}
                  <p className="text-sm sm:text-base lg:text-lg text-gray-200 leading-relaxed font-sans max-w-lg drop-shadow-sm font-medium">
                    {slide.subtitle}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Left Circular Navigation Chevron */}
        <button
          onClick={handlePrev}
          aria-label="Previous Slide"
          className="absolute left-3 sm:left-8 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/50 hover:bg-black/80 border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer shadow-xl hover:scale-110 active:scale-95 backdrop-blur-sm"
        >
          <ChevronLeft className="w-5 sm:w-6 h-5 sm:h-6 stroke-[2.5]" />
        </button>

        {/* Right Circular Navigation Chevron */}
        <button
          onClick={handleNext}
          aria-label="Next Slide"
          className="absolute right-3 sm:right-8 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/50 hover:bg-black/80 border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer shadow-xl hover:scale-110 active:scale-95 backdrop-blur-sm"
        >
          <ChevronRight className="w-5 sm:w-6 h-5 sm:h-6 stroke-[2.5]" />
        </button>

        {/* Bottom Slide Indicators */}
        <div className="absolute bottom-5 left-6 sm:left-16 z-30 flex items-center gap-2">
          {HERO_SLIDES.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                currentSlide === idx ? 'w-10 bg-gold-400' : 'w-6 bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};



