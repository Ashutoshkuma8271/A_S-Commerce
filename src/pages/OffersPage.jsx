import React, { useState } from 'react';
import { useProducts } from '../context/ProductContext';
import { COUPONS } from '../data/coupons';
import { ProductCard } from '../components/common/ProductCard';
import { useCart } from '../context/CartContext';
import { Tag, Sparkles, Flame, Copy, Check } from 'lucide-react';

export const OffersPage = () => {
  const { products: PRODUCTS, specialOffers } = useProducts();
  const { applyCoupon } = useCart();
  const [copiedCode, setCopiedCode] = useState(null);

  const offerProducts = PRODUCTS.filter((p) => p.isSpecialOffer || p.discount >= 30);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    applyCoupon(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="rounded-[2.5rem] bg-navy-gradient text-white p-8 sm:p-12 mb-10 border border-gold-500/20 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs font-bold uppercase">
            <Flame className="w-3.5 h-3.5 text-gold-500" />
            <span>Grand Festive Privileges</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white">
            Exclusive Deals & Vouchers
          </h1>
          <p className="text-xs sm:text-sm text-gray-300">
            Enjoy up to 50% discount on select artisanal luxury essentials and redeem exclusive promotional vouchers.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-80 h-80 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Available Coupons Grid */}
      <div className="mb-12">
        <h3 className="font-serif text-xl font-bold text-navy-950 mb-4 flex items-center gap-2">
          <Tag className="w-5 h-5 text-gold-600" />
          <span>Active Promo Vouchers</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COUPONS.map((c) => (
            <div
              key={c.code}
              className="bg-white p-5 rounded-2xl border-2 border-dashed border-gold-500/40 shadow-sm flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-base text-gold-700 bg-gold-500/10 px-3 py-1 rounded-lg">
                    {c.code}
                  </span>
                  <span className="text-xs font-bold text-green-700">
                    {c.discountPercent ? `${c.discountPercent}% OFF` : `₹${c.discountAmount} OFF`}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-2">{c.description}</p>
              </div>

              <button
                onClick={() => handleCopy(c.code)}
                className="w-full py-2 bg-navy-900 text-gold-400 font-bold text-xs rounded-xl hover:bg-navy-850 transition-colors flex items-center justify-center gap-1.5"
              >
                {copiedCode === c.code ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode === c.code ? 'Applied to Cart!' : 'Copy & Apply'}</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Discounted Products Grid */}
      <div>
        <h3 className="font-serif text-xl font-bold text-navy-950 mb-6">
          Featured Promotional Pieces ({offerProducts.length})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {offerProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>

    </div>
  );
};
