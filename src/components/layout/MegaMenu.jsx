import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CATEGORIES } from '../../data/categories';
import { ArrowRight, Sparkles, Tag, Layers, ChevronRight, X } from 'lucide-react';

export const MegaMenu = ({ isOpen, onClose }) => {
  const [selectedCatId, setSelectedCatId] = useState(CATEGORIES[0].id);
  const menuRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const activeCategory = CATEGORIES.find((c) => c.id === selectedCatId) || CATEGORIES[0];

  return (
    <>
      {/* Click-away Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 top-[138px] bg-navy-950/70 backdrop-blur-sm z-40 transition-opacity duration-200"
        aria-hidden="true"
      />

      {/* Luxury Mega Menu Card */}
      <div
        ref={menuRef}
        className="absolute top-full left-0 w-full bg-navy-900/98 backdrop-blur-2xl border-b border-x border-gold-500/30 shadow-2xl z-50 animate-fadeIn text-white overflow-hidden rounded-b-3xl max-h-[82vh] overflow-y-auto"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          
          {/* Top Bar with Title & Prominent Close (Cross) Button */}
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-navy-800">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gold-500 animate-pulse" />
              <span className="text-xs sm:text-sm font-bold text-gold-400 uppercase tracking-widest font-serif">
                A_S Luxury Department Directory
              </span>
            </div>

            {/* Explicit Close Button (Cross) */}
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-navy-800/90 hover:bg-gold-500 text-gray-300 hover:text-navy-950 text-xs font-bold transition-all border border-navy-700 hover:border-gold-500 shadow-sm cursor-pointer"
              aria-label="Close categories menu"
              title="Close categories menu (Esc)"
            >
              <span>Close</span>
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">
            
            {/* Left Column: 7 Main Categories List */}
            <div className="md:col-span-4 lg:col-span-4 md:border-r border-navy-800 md:pr-6 space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-navy-800/60">
                <span className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-gold-400" />
                  <span>Select Category</span>
                </span>
                <span className="text-[10px] text-gold-400/80 font-mono">7 Departments</span>
              </div>

              <div className="space-y-1.5">
                {CATEGORIES.map((cat) => {
                  const isActive = cat.id === activeCategory.id;
                  return (
                    <div
                      key={cat.id}
                      onMouseEnter={() => setSelectedCatId(cat.id)}
                      onClick={() => setSelectedCatId(cat.id)}
                      className={`flex items-center justify-between p-2.5 sm:p-3 rounded-2xl cursor-pointer transition-all duration-200 ${
                        isActive
                          ? 'bg-gold-500/15 text-gold-400 border border-gold-500/40 shadow-gold-sm translate-x-1'
                          : 'text-gray-300 hover:bg-navy-850 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover border border-navy-700 shrink-0"
                        />
                        <div className="truncate">
                          <h4 className={`text-xs sm:text-sm font-bold truncate ${isActive ? 'text-gold-400' : 'text-white'}`}>
                            {cat.name}
                          </h4>
                          <span className="text-[10px] sm:text-[11px] text-gray-400 font-normal block">
                            {cat.itemCount}
                          </span>
                        </div>
                      </div>

                      <ChevronRight className={`w-4 h-4 transition-transform shrink-0 ${isActive ? 'text-gold-400 translate-x-0.5' : 'text-gray-500'}`} />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Middle Column: Active Category Drill-down Subcategories */}
            <div className="md:col-span-8 lg:col-span-5 space-y-5">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-gold-400 uppercase tracking-widest">
                    Drill-Down: {activeCategory.name}
                  </span>
                  <Link
                    to={`/category/${activeCategory.slug}`}
                    onClick={onClose}
                    className="text-xs text-gold-400 hover:underline font-bold flex items-center gap-1"
                  >
                    <span>View All {activeCategory.name}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {activeCategory.description}
                </p>
              </div>

              {/* Subcategories Grid */}
              <div>
                <h5 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">
                  Specialized Sub-Departments
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {activeCategory.subcategories.map((sub) => (
                    <Link
                      key={sub}
                      to={`/shop?category=${activeCategory.slug}&sub=${encodeURIComponent(sub)}`}
                      onClick={onClose}
                      className="p-3 rounded-xl bg-navy-850 hover:bg-navy-800 border border-navy-750 hover:border-gold-500/40 text-xs font-medium text-gray-200 hover:text-gold-400 transition-all flex items-center justify-between group"
                    >
                      <span className="truncate">{sub}</span>
                      <ArrowRight className="w-3 h-3 text-gray-500 group-hover:text-gold-400 group-hover:translate-x-1 transition-all shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Quick Tags */}
              <div className="pt-1">
                <span className="text-[11px] text-gray-400 font-semibold block mb-2">Popular In This Department:</span>
                <div className="flex flex-wrap gap-2">
                  {['New Arrivals', 'Bestsellers', 'Up to 50% Off', 'Certified Authentic'].map((tag) => (
                    <Link
                      key={tag}
                      to={`/shop?category=${activeCategory.slug}`}
                      onClick={onClose}
                      className="px-3 py-1 bg-navy-950/80 hover:bg-gold-500/10 rounded-full border border-gold-500/20 text-[11px] text-gray-300 hover:text-gold-400 transition-colors"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Featured Category Visual Spotlight (Desktop) */}
            <div className="hidden lg:block lg:col-span-3">
              <div className="relative h-full rounded-3xl overflow-hidden border border-gold-500/30 p-6 flex flex-col justify-between bg-gradient-to-br from-navy-800 via-navy-850 to-navy-900 shadow-xl">
                {/* Background image tint */}
                <div className="absolute inset-0 opacity-25 overflow-hidden">
                  <img
                    src={activeCategory.image}
                    alt={activeCategory.name}
                    className="w-full h-full object-cover scale-125"
                  />
                </div>

                <div className="relative z-10 space-y-2.5">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/20 border border-gold-500/40 text-gold-400 text-[10px] font-extrabold uppercase">
                    <Sparkles className="w-3 h-3" />
                    <span>Curated Selection</span>
                  </div>

                  <h4 className="font-serif text-lg font-bold text-white">
                    {activeCategory.name}
                  </h4>

                  <p className="text-xs text-gray-300 leading-relaxed">
                    Explore bespoke artisanal pieces crafted with luxury materials and timeless design.
                  </p>
                </div>

                <div className="relative z-10 pt-6">
                  <Link
                    to={`/category/${activeCategory.slug}`}
                    onClick={onClose}
                    className="w-full py-2.5 bg-gold-gradient text-navy-950 text-xs font-bold rounded-xl shadow-gold-sm hover:brightness-105 transition-all flex items-center justify-center gap-2"
                  >
                    <span>Shop {activeCategory.name}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </>
  );
};
