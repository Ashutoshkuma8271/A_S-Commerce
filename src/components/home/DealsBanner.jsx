import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Clock, ArrowRight, ShieldCheck, Tag } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const DealsBanner = () => {
  const { applyCoupon } = useCart();
  
  // Real ticking countdown
  const [timeLeft, setTimeLeft] = useState({
    hours: 18,
    minutes: 45,
    seconds: 22,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 select-none">
      <div className="relative rounded-[2.5rem] bg-gradient-to-r from-navy-950 via-navy-900 to-navy-850 p-8 sm:p-12 overflow-hidden border border-gold-500/30 shadow-2xl text-white">
        
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gold-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Text */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Limited Time Flash Event</span>
            </div>

            <h3 className="font-serif text-2xl sm:text-4xl font-bold text-white leading-tight">
              Exclusive Season Finale <br />
              <span className="text-gold-400 font-serif">Save Extra 20% on Luxury Horology</span>
            </h3>

            <p className="text-xs sm:text-sm text-gray-300 max-w-lg leading-relaxed">
              Use promo code <strong className="text-gold-400">ASGOLD20</strong> at checkout on all orders above ₹4,999. Includes bespoke gift packaging and complimentary express courier.
            </p>

            {/* Countdown Box */}
            <div className="pt-2 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-14 h-14 bg-navy-800/90 rounded-2xl border border-gold-500/30 flex flex-col items-center justify-center shadow-lg">
                  <span className="text-xl font-bold text-gold-400 font-serif leading-none">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] text-gray-400 font-bold uppercase mt-1">Hours</span>
                </div>
                <span className="text-xl font-bold text-gold-400">:</span>
                <div className="w-14 h-14 bg-navy-800/90 rounded-2xl border border-gold-500/30 flex flex-col items-center justify-center shadow-lg">
                  <span className="text-xl font-bold text-gold-400 font-serif leading-none">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] text-gray-400 font-bold uppercase mt-1">Mins</span>
                </div>
                <span className="text-xl font-bold text-gold-400">:</span>
                <div className="w-14 h-14 bg-navy-800/90 rounded-2xl border border-gold-500/30 flex flex-col items-center justify-center shadow-lg">
                  <span className="text-xl font-bold text-gold-400 font-serif leading-none">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] text-gray-400 font-bold uppercase mt-1">Secs</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Action */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-end justify-center space-y-4">
            <div className="p-6 bg-navy-800/80 rounded-3xl border border-gold-500/30 text-center max-w-xs w-full backdrop-blur-md">
              <span className="text-xs text-gray-400 block mb-1">Coupon Code</span>
              <div className="text-xl font-mono font-bold text-gold-400 tracking-widest bg-navy-900 py-2 px-4 rounded-xl border border-gold-500/40 mb-3">
                ASGOLD20
              </div>
              <button
                onClick={() => applyCoupon('ASGOLD20')}
                className="w-full py-3 bg-gold-gradient text-navy-950 font-bold text-xs rounded-xl shadow-gold-sm hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Apply Coupon Directly</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
