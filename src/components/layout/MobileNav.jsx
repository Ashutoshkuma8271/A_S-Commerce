import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, Heart, ShoppingBag, User, ChevronRight, Sparkles, Tag, Truck, HelpCircle, Phone, Home, Grid } from 'lucide-react';
import { Logo } from '../common/Logo';
import { ThemeToggle } from '../common/ThemeToggle';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';

export const MobileNav = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { totalItemsCount, setIsCartDrawerOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, isAuthenticated, setIsAuthModalOpen, setAuthMode, logout } = useAuth();

  if (!isOpen) return null;

  const mainLinks = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Shop All Catalog', path: '/shop', icon: Grid },
    { label: 'Men\'s Collection', path: '/category/mens-wear' },
    { label: 'Women\'s Luxury', path: '/category/womens-wear' },
    { label: 'High-Tech Electronics', path: '/category/electronics' },
    { label: 'Home & Living', path: '/category/home-living' },
    { label: 'Exclusive Offers & Deals', path: '/offers', icon: Tag, badge: '50% OFF' },
    { label: 'New Season 2026', path: '/new-arrivals', icon: Sparkles, badge: 'NEW' },
    { label: 'Track Consignment', path: '/track-order', icon: Truck },
    { label: 'Customer Concierge & Help', path: '/help', icon: HelpCircle },
  ];

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div className="relative w-4/5 max-w-sm bg-navy-900 text-white h-full shadow-2xl flex flex-col z-10 border-r border-gold-500/20 animate-slideRight">
        
        {/* Header with Logo & Theme Toggle & Close Button */}
        <div className="p-4 border-b border-navy-800 flex items-center justify-between bg-navy-950">
          <Logo size="small" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-navy-800 transition-all border border-navy-800 cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* User Card / Quick Sign-In Banner */}
        <div className="p-4 bg-navy-850 border-b border-navy-800">
          {isAuthenticated ? (
            <Link
              to="/account"
              onClick={onClose}
              className="flex items-center gap-3 p-1 rounded-xl hover:bg-navy-800 transition-colors group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-navy-800 border border-gold-500/40 overflow-hidden shrink-0 flex items-center justify-center text-gold-400 font-bold">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white group-hover:text-gold-400 transition-colors truncate">{user.name}</p>
                <p className="text-[11px] text-gold-400">{user.membershipTier || 'Patron Member'}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-gold-400 transition-colors" />
            </Link>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setAuthMode('login');
                  setIsAuthModalOpen(true);
                  onClose();
                }}
                className="flex-1 py-2.5 bg-gold-gradient text-navy-950 font-bold text-xs rounded-xl shadow-gold-sm hover:brightness-110 active:scale-98 transition-all cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setAuthMode('register');
                  setIsAuthModalOpen(true);
                  onClose();
                }}
                className="flex-1 py-2.5 bg-navy-800 text-gold-400 text-xs font-bold rounded-xl border border-gold-500/30 hover:bg-navy-750 active:scale-98 transition-all cursor-pointer"
              >
                Create Account
              </button>
            </div>
          )}
        </div>

        {/* Clean Luxury Navigation Links */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1.5 scrollbar-none">
          {mainLinks.map((link) => {
            const isActive = location.pathname === link.path;
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={onClose}
                className={`flex items-center justify-between py-2.5 px-3.5 rounded-2xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-gold-500/15 text-gold-400 font-bold border border-gold-500/30 shadow-sm'
                    : 'text-gray-300 hover:text-white hover:bg-navy-800/80'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {Icon && <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-gold-400' : 'text-gray-400'}`} />}
                  <span className="truncate">{link.label}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {link.badge && (
                    <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-gold-500/20 text-gold-400 border border-gold-500/30">
                      {link.badge}
                    </span>
                  )}
                  <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Footer Quick Actions */}
        <div className="p-4 border-t border-navy-800 space-y-2 bg-navy-950">
          <button
            onClick={() => {
              setIsCartDrawerOpen(true);
              onClose();
            }}
            className="w-full flex items-center justify-between py-2.5 px-3.5 bg-navy-850 hover:bg-navy-800 rounded-xl text-xs text-white border border-navy-750 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-4 h-4 text-gold-400" />
              <span className="font-semibold">Shopping Bag</span>
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
            className="w-full flex items-center justify-between py-2.5 px-3.5 bg-navy-850 hover:bg-navy-800 rounded-xl text-xs text-white border border-navy-750 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Heart className="w-4 h-4 text-gold-400" />
              <span className="font-semibold">Saved Wishlist</span>
            </div>
            {wishlistCount > 0 && (
              <span className="text-gold-400 font-mono text-[11px] font-bold">{wishlistCount}</span>
            )}
          </Link>

          {isAuthenticated && (
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="w-full py-2 text-xs text-red-400 hover:text-red-300 text-center font-semibold cursor-pointer pt-1"
            >
              Sign Out
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
