import React from 'react';
import { Star, CheckCircle2, Quote } from 'lucide-react';

export const TestimonialsSection = () => {
  const reviews = [
    {
      name: 'Eleanor Vance',
      role: 'Fashion Director, Mumbai',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      rating: 5,
      title: 'Flawless Craftsmanship & Presentation',
      comment: 'The navy leather handbag surpassed every expectation. The leather quality, gold hardware weight, and packaging are indistinguishable from flagship Parisian houses.',
    },
    {
      name: 'Rohan Mehra',
      role: 'Tech Executive, Bangalore',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      rating: 5,
      title: 'Fast Bluedart Delivery & Precision Horology',
      comment: 'Ordered the Royal Chronograph Gold watch on Monday and received it impeccably packaged on Wednesday. The automatic movement is buttery smooth.',
    },
    {
      name: 'Sophia Chen',
      role: 'Interior Architect, Delhi',
      image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      rating: 5,
      title: 'Exceptional Velvet Armchair & Aesthetic',
      comment: 'A_S Commerce is now my premier source for luxury curated lifestyle essentials. Responsive concierge and effortless 30-day return policy.',
    }
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 select-none">
      <div className="text-center mb-10">
        <span className="text-xs font-bold uppercase tracking-widest text-gold-600 dark:text-gold-400 font-sans">
          Customer Stories
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-navy-950 dark:text-white mt-1">
          Loved by Over 15,000+ Patrons
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.map((rev, idx) => (
          <div
            key={idx}
            className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-750 shadow-sm hover:shadow-xl hover:border-gold-500/30 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex text-gold-500">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-gold-500 text-gold-500" />
                  ))}
                </div>
                <Quote className="w-6 h-6 text-gold-500/20" />
              </div>

              <h4 className="font-bold text-navy-950 dark:text-white text-sm sm:text-base mb-2">
                "{rev.title}"
              </h4>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                {rev.comment}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-navy-800">
              <img
                src={rev.image}
                alt={rev.name}
                className="w-10 h-10 rounded-full object-cover border border-gold-500/30"
              />
              <div>
                <div className="flex items-center gap-1">
                  <h5 className="font-bold text-xs text-navy-950 dark:text-white">{rev.name}</h5>
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                </div>
                <p className="text-[11px] text-gray-400 dark:text-gray-400">{rev.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
