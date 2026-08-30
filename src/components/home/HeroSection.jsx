import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';

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
    primaryBtnText: 'Shop Couture',
    primaryBtnLink: '/category/women',
    secondaryBtnText: 'Explore Luxury',
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
      <div className="relative min-h-[500px] sm:min-h-[560px] lg:min-h-[620px] w-full flex items-center">
        {HERO_SLIDES.map((slide, index) => {
          const isActive = currentSlide === index;

          return (
            <div
              key={slide.id}
              className={`absolute inset-0 flex items-center transition-opacity duration-700 ease-in-out ${
                isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Cinematic Full-Bleed Background Image & Gradients */}
              <div className="absolute inset-0 z-0 overflow-hidden">
                <img
                  src={slide.image}
                  alt={slide.titleLine1}
                  fetchPriority={index === 0 ? "high" : "low"}
                  loading={index === 0 ? "eager" : "lazy"}
                  decoding="async"
                  className="w-full h-full object-cover object-center brightness-[0.78] contrast-[1.08] transform scale-100 group-hover:scale-105 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/65 to-black/30" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/40" />
              </div>

              {/* Foreground Left Content */}
              <div className="max-w-7xl mx-auto px-5 sm:px-10 lg:px-16 py-12 sm:py-16 relative z-10 w-full">
                <div className="max-w-xl lg:max-w-2xl space-y-4 sm:space-y-6 text-left">
                  
                  {/* Glowing Tagline Pill */}
                  <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-[#061A27]/90 border border-gold-500/60 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gold-400 backdrop-blur-md shadow-lg">
                    <Sparkles className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-gold-400 shrink-0" />
                    <span className="truncate">
                      {slide.badge} • {slide.tag}
                    </span>
                  </div>

                  {/* High-Impact Headline */}
                  <h1 className="font-serif text-3xl sm:text-5xl lg:text-[56px] xl:text-[62px] font-black tracking-tight text-white leading-[1.08] drop-shadow-md">
                    {slide.titleLine1}{' '}
                    <br />
                    <span className="text-gold-400 sm:text-gold-300 font-serif">
                      {slide.titleLine2}
                    </span>
                  </h1>

                  {/* Subtitle */}
                  <p className="text-xs sm:text-base lg:text-lg text-gray-200 leading-relaxed font-sans max-w-lg drop-shadow-sm font-medium">
                    {slide.subtitle}
                  </p>

                  {/* Action Buttons — Strictly Horizontal Side-by-Side on all screens */}
                  <div className="flex items-center gap-2.5 sm:gap-4 pt-2 flex-nowrap overflow-hidden">
                    <Link
                      to={slide.primaryBtnLink}
                      className="px-4 sm:px-8 py-2.5 sm:py-3.5 bg-gold-gradient hover:brightness-110 text-navy-950 font-black text-xs sm:text-sm rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer group/btn whitespace-nowrap shrink-0"
                    >
                      <span>{slide.primaryBtnText}</span>
                      <ArrowRight className="w-3.5 sm:w-4 h-3.5 sm:h-4 stroke-[2.5] group-hover/btn:translate-x-1 transition-transform" />
                    </Link>

                    <Link
                      to={slide.secondaryBtnLink}
                      className="px-3.5 sm:px-7 py-2.5 sm:py-3.5 bg-black/40 hover:bg-black/60 text-white font-bold text-xs sm:text-sm rounded-full border border-white/30 backdrop-blur-md hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <span>{slide.secondaryBtnText}</span>
                      <ArrowRight className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                    </Link>
                  </div>

                </div>
              </div>

            </div>
          );
        })}

        {/* Left Circular Navigation Chevron */}
        <button
          onClick={handlePrev}
          aria-label="Previous Slide"
          className="absolute left-2 sm:left-8 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-black/50 hover:bg-black/80 border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer shadow-xl hover:scale-110 active:scale-95 backdrop-blur-sm"
        >
          <ChevronLeft className="w-4 sm:w-6 h-4 sm:h-6 stroke-[2.5]" />
        </button>

        {/* Right Circular Navigation Chevron */}
        <button
          onClick={handleNext}
          aria-label="Next Slide"
          className="absolute right-2 sm:right-8 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-black/50 hover:bg-black/80 border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer shadow-xl hover:scale-110 active:scale-95 backdrop-blur-sm"
        >
          <ChevronRight className="w-4 sm:w-6 h-4 sm:h-6 stroke-[2.5]" />
        </button>

        {/* Bottom Slide Indicators */}
        <div className="absolute bottom-5 left-5 sm:left-16 z-30 flex items-center gap-2">
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
export default HeroSection;
