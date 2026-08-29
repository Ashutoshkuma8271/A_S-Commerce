import React from 'react';
import { HeroSection } from '../components/home/HeroSection';
import { TrustBar } from '../components/home/TrustBar';
import { CategorySection } from '../components/home/CategorySection';
import { FeaturedSection } from '../components/home/FeaturedSection';
import { DealsBanner } from '../components/home/DealsBanner';
import { TestimonialsSection } from '../components/home/TestimonialsSection';

export const HomePage = () => {
  return (
    <div className="space-y-4 animate-fadeIn pb-16">
      {/* Hero Section */}
      <HeroSection />

      {/* Trust & Service Bar */}
      <TrustBar />

      {/* Shop by Category */}
      <CategorySection />

      {/* Featured & Trending Collections */}
      <FeaturedSection />

      {/* Deals & Countdown Flash Banner */}
      <DealsBanner />

      {/* Customer Testimonials & Verified Stories */}
      <TestimonialsSection />
    </div>
  );
};
