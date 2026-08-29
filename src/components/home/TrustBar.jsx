import React from 'react';
import { Truck, RotateCcw, ShieldCheck, Headphones, Award } from 'lucide-react';

export const TrustBar = () => {
  const features = [
    {
      icon: Truck,
      title: 'Free Shipping',
      desc: 'On orders over ₹999',
    },
    {
      icon: RotateCcw,
      title: 'Easy Returns',
      desc: '30 day return policy',
    },
    {
      icon: ShieldCheck,
      title: 'Secure Payment',
      desc: '100% secure payment',
    },
    {
      icon: Headphones,
      title: '24/7 Support',
      desc: 'Dedicated support',
    },
    {
      icon: Award,
      title: 'Best Prices',
      desc: 'Guaranteed best prices',
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 select-none">
      <div className="bg-white dark:bg-navy-900 rounded-2xl sm:rounded-3xl border border-gray-200/80 dark:border-navy-750 shadow-sm p-4 sm:p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-6">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex items-center gap-2.5 sm:gap-3.5 p-2 sm:p-0 group rounded-xl hover:bg-cream-100/50 dark:hover:bg-navy-800/40 transition-colors"
              >
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-cream-100 dark:bg-navy-800 group-hover:bg-gold-500/20 text-navy-900 dark:text-gold-400 group-hover:text-gold-700 flex items-center justify-center border border-gold-500/20 transition-all duration-300 shrink-0">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.75]" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-navy-950 dark:text-white group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors truncate">
                    {item.title}
                  </h4>
                  <p className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 font-medium truncate">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
