import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Flame, Zap, ArrowRight, Award } from 'lucide-react';
import { PRODUCTS } from '../../data/products';
import { ProductCard } from '../common/ProductCard';
import { QuickViewModal } from '../common/QuickViewModal';

export const FeaturedSection = () => {
  const [activeTab, setActiveTab] = useState('featured');
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const filteredProducts = PRODUCTS.filter((p) => {
    if (activeTab === 'featured') return p.isFeatured;
    if (activeTab === 'trending') return p.isTrending;
    if (activeTab === 'new') return p.isNewArrival;
    if (activeTab === 'offers') return p.isSpecialOffer;
    return true;
  });

  const tabs = [
    { id: 'featured', label: 'Featured Products', icon: Sparkles },
    { id: 'trending', label: 'Trending Now', icon: Flame },
    { id: 'new', label: 'New Arrivals', icon: Zap },
    { id: 'offers', label: 'Special Offers', icon: Award },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Section Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-gold-500 font-sans">
            Handpicked Curations
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-navy-950 dark:text-white mt-1">
            Signature Collections
          </h2>
        </div>

        {/* Tab Pills */}
        <div className="flex flex-wrap gap-2 bg-gray-100/90 dark:bg-navy-900/90 p-1.5 rounded-2xl border border-gray-200/80 dark:border-gold-500/25 self-start md:self-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  active
                    ? 'bg-navy-900 dark:bg-gold-gradient text-gold-400 dark:text-navy-950 shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:text-navy-950 dark:hover:text-white hover:bg-white/60 dark:hover:bg-navy-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-gold-400 dark:text-navy-950' : 'text-gray-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredProducts.slice(0, 8).map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onQuickView={(p) => setQuickViewProduct(p)}
          />
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="mt-12 text-center">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-navy-900 text-gold-400 hover:bg-gold-gradient hover:text-navy-950 text-xs sm:text-sm font-bold rounded-full transition-all duration-300 shadow-md hover:shadow-xl group"
        >
          <span>Explore Full Catalog ({PRODUCTS.length} Products)</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />

    </section>
  );
};
