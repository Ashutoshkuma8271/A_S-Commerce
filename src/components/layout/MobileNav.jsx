import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, Heart, ShoppingBag, User, ChevronRight, ChevronDown, Layers, ArrowRight } from 'lucide-react';
import { Logo } from '../common/Logo';
import { ThemeToggle } from '../common/ThemeToggle';
import { CATEGORIES } from '../../data/categories';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';

export const MobileNav = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { totalItemsCount, setIsCartDrawerOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, isAuthenticated, setIsAuthModalOpen, setAuthMode, logout } = useAuth();
  
  // State for expanded category accordion in mobile drawer
  const [expandedCat, setExpandedCat] = useState(null);

  if (!isOpen) return null;

  const links = [
    { label: 'Home', path: '/' },
    { label: 'Shop All Products', path: '/shop' },
    { label: 'Offers & Promo Deals', path: '/offers' },
    { label: 'New Arrivals 2026', path: '/new-arrivals' },
    { label: 'Track Consignment', path: '/track-order' },
    { label: 'Help Center & FAQ', path: '/help' },
    { label: 'Contact Concierge', path: '/contact' },
  ];

  const toggleCategoryAccordion = (slug) => {
    setExpandedCat((prev) => (prev === slug ? null : slug));
  };

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="relative w-4/5 max-w-sm bg-navy-900 text-white h-full shadow-2xl flex flex-col z-10 border-r border-gold-500/30 animate-slideRight">
        
        {/* Header with Logo & Theme Toggle & Close Button */}
        <div className="p-4 border-b border-navy-800 flex items-center justify-between bg-navy-950">
          <Logo size="small" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-navy-950 hover:bg-gold-500 transition-all border border-navy-800 hover:border-gold-500 cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* User preview / Quick Sign-In */}
        <div className="p-4 bg-navy-850 border-b border-navy-800">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-navy-800 border border-gold-500/40 overflow-hidden shrink-0">
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{user.name}</p>
                <p className="text-xs text-gold-400">{user.membershipTier || 'Gold VIP Member'}</p>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setAuthMode('login');
                  setIsAuthModalOpen(true);
                  onClose();
                }}
                className="flex-1 py-2 bg-gold-gradient text-navy-950 font-bold text-xs rounded-xl shadow-gold-sm"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setAuthMode('register');
                  setIsAuthModalOpen(true);
                  onClose();
                }}
                className="flex-1 py-2 bg-navy-800 text-gold-400 text-xs font-semibold rounded-xl border border-navy-700"
              >
                Register
              </button>
            </div>
          )}
        </div>

        {/* Navigation Content with Drilldown Accordions */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          
          {/* Categories Drill-down Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-1 mb-1 border-b border-navy-800/80">
              <span className="text-[11px] font-bold text-gold-400 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>Shop by Category</span>
              </span>
              <span className="text-[10px] text-gray-400">Tap to expand</span>
            </div>

            <div className="space-y-1">
              {CATEGORIES.map((cat) => {
                const isExpanded = expandedCat === cat.slug;
                return (
                  <div
                    key={cat.id}
                    className="rounded-2xl border border-navy-800 overflow-hidden bg-navy-850/50"
                  >
                    {/* Category Header */}
                    <div className="flex items-center justify-between p-2.5">
                      <Link
                        to={`/category/${cat.slug}`}
                        onClick={onClose}
                        className="flex items-center gap-2.5 flex-1 min-w-0"
                      >
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="w-8 h-8 rounded-lg object-cover border border-navy-700 shrink-0"
                        />
                        <span className="text-xs font-bold text-white truncate hover:text-gold-400">
                          {cat.name}
                        </span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => toggleCategoryAccordion(cat.slug)}
                        className="p-1 text-gray-400 hover:text-gold-400 rounded-lg hover:bg-navy-800 transition-colors"
                        aria-label="Toggle subcategories"
                      >
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-gold-400' : ''}`} />
                      </button>
                    </div>

                    {/* Subcategories Accordion Drill-down */}
                    {isExpanded && (
                      <div className="p-3 pt-1 bg-navy-900 border-t border-navy-800 space-y-1 text-xs animate-fadeIn">
                        <Link
                          to={`/category/${cat.slug}`}
                          onClick={onClose}
                          className="flex items-center justify-between py-1.5 px-2 rounded-lg text-gold-400 font-bold hover:bg-navy-800 text-[11px]"
                        >
                          <span>View All {cat.name}</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                        {cat.subcategories.map((sub) => (
                          <Link
                            key={sub}
                            to={`/shop?category=${cat.slug}&sub=${encodeURIComponent(sub)}`}
                            onClick={onClose}
                            className="block py-1.5 px-2 rounded-lg text-gray-300 hover:text-gold-400 hover:bg-navy-800 text-[11px] transition-colors"
                          >
                            • {sub}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Main Links */}
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Quick Navigation</p>
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={onClose}
                className={`flex items-center justify-between py-2 px-3 rounded-xl text-xs font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'bg-gold-500/15 text-gold-400 font-bold'
                    : 'text-gray-300 hover:bg-navy-800'
                }`}
              >
                <span>{link.label}</span>
                <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
              </Link>
            ))}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-navy-800 space-y-2 bg-navy-950">
          <button
            onClick={() => {
              setIsCartDrawerOpen(true);
              onClose();
            }}
            className="w-full flex items-center justify-between py-2.5 px-3.5 bg-navy-850 rounded-xl text-xs text-white"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-gold-400" />
              <span className="font-semibold">My Shopping Bag</span>
            </div>
            {totalItemsCount > 0 && (
              <span className="bg-gold-gradient text-navy-950 font-bold px-2 py-0.5 rounded-full text-[10px]">
                {totalItemsCount}
              </span>
            )}
          </button>

          <Link
            to="/wishlist"
            onClick={onClose}
            className="w-full flex items-center justify-between py-2.5 px-3.5 bg-navy-850 rounded-xl text-xs text-white"
          >
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-gold-400" />
              <span className="font-semibold">Saved Wishlist</span>
            </div>
            <span className="text-gray-400 text-[10px]">{wishlistCount} items</span>
          </Link>

          {isAuthenticated && (
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="w-full py-2 text-xs text-red-400 hover:text-red-300 text-center font-semibold"
            >
              Sign Out
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
