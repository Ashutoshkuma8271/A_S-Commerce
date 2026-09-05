import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Heart, ShoppingBag, User, ChevronDown, X, Clock, Flame, ArrowRight, Menu, Sparkles } from 'lucide-react';
import { Logo } from '../common/Logo';
import { ThemeToggle } from '../common/ThemeToggle';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { useProducts } from '../../context/ProductContext';
import { formatINR } from '../../utils/currency';

export const MainHeader = ({ onOpenMobileMenu }) => {
  const navigate = useNavigate();
  const { products: PRODUCTS } = useProducts();
  const { totalItemsCount, setIsCartDrawerOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, isAuthenticated, setIsAuthModalOpen, setAuthMode, logout } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState(['Leather Handbag', 'Gold Watch', 'Sneakers']);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  const searchRef = useRef(null);
  const accountRef = useRef(null);

  // Filter matching products for live preview
  const searchResults = searchTerm.trim()
    ? PRODUCTS.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 4)
    : [];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setIsAccountOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    if (!searchTerm.trim()) return;
    
    // Add to recent
    if (!recentSearches.includes(searchTerm.trim())) {
      setRecentSearches((prev) => [searchTerm.trim(), ...prev.slice(0, 4)]);
    }
    
    setIsSearchOpen(false);
    navigate(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
  };

  const handleSelectSearchTag = (term) => {
    setSearchTerm(term);
    setIsSearchOpen(false);
    navigate(`/shop?search=${encodeURIComponent(term)}`);
  };

  return (
    <div className="bg-navy-900 text-white border-b border-navy-800 relative z-40">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-2.5 sm:py-3.5">
        <div className="premium-header-inner flex items-center justify-between gap-1 sm:gap-4 md:gap-6">
          
          {/* Left: Mobile menu toggle + Logo */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <button
              onClick={onOpenMobileMenu}
              aria-label="Open mobile menu"
              className="lg:hidden p-1.5 sm:p-2 text-gold-400 hover:text-white rounded-lg hover:bg-navy-800 transition-colors"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <Logo variant="light" />
          </div>

          {/* Center: Search Box (Desktop & Tablet) */}
          <div ref={searchRef} className="flex-1 max-w-2xl hidden md:block relative">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                placeholder="Search for products, brands and more..."
                className="w-full pl-5 pr-14 py-2 sm:py-2.5 bg-navy-850/90 text-white placeholder-gray-400 text-xs sm:text-sm rounded-full border border-navy-700/80 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all shadow-inner"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-12 text-gray-400 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              {/* Solid Golden Circle Search Button */}
              <button
                type="submit"
                aria-label="Submit search"
                className="absolute right-1 w-7 h-7 sm:w-8 sm:h-8 bg-[#F5B83D] hover:bg-[#E5A820] text-navy-950 rounded-full flex items-center justify-center transition-all shadow-gold-sm hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-navy-950 stroke-[2.5]" />
              </button>
            </form>

            {/* Live Autocomplete / Search Drawer */}
            {isSearchOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-navy-850/98 backdrop-blur-xl border border-gold-500/25 rounded-2xl shadow-2xl p-4 z-50 animate-fadeIn">
                {/* When typing, show live results */}
                {searchTerm.trim() ? (
                  <div>
                    <div className="flex items-center justify-between pb-2 mb-3 border-b border-navy-700 text-xs text-gray-400">
                      <span>Products matching "{searchTerm}"</span>
                      <span>{searchResults.length} found</span>
                    </div>

                    {searchResults.length > 0 ? (
                      <div className="space-y-2">
                        {searchResults.map((product) => (
                          <div
                            key={product.id}
                            onClick={() => {
                              setIsSearchOpen(false);
                              navigate(`/product/${product.id}`);
                            }}
                            className="flex items-center gap-3 p-2 rounded-xl hover:bg-navy-800/80 cursor-pointer group transition-colors"
                          >
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-12 h-12 rounded-lg object-cover border border-navy-700"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white group-hover:text-gold-400 truncate transition-colors">
                                {product.name}
                              </p>
                              <p className="text-xs text-gray-400">
                                {product.categoryName} • <span className="text-gold-400 font-semibold">{formatINR(product.price)}</span>
                              </p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-gold-400 -translate-x-1 group-hover:translate-x-0 transition-all" />
                          </div>
                        ))}

                        <button
                          onClick={handleSearchSubmit}
                          className="w-full text-center py-2 text-xs font-semibold text-gold-400 hover:text-gold-300 hover:underline pt-2 border-t border-navy-700/50"
                        >
                          View all results for "{searchTerm}" →
                        </button>
                      </div>
                    ) : (
                      <div className="py-6 text-center text-sm text-gray-400">
                        No products found matching "<span className="text-white">{searchTerm}</span>". Try searching for Handbag, Shoes or Watch.
                      </div>
                    )}
                  </div>
                ) : (
                  /* When not typing, show recent and trending tags */
                  <div className="space-y-4 text-xs">
                    {recentSearches.length > 0 && (
                      <div>
                        <div className="flex items-center gap-1.5 text-gray-400 mb-2 font-medium">
                          <Clock className="w-3.5 h-3.5 text-gold-400" />
                          <span>Recent Searches</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {recentSearches.map((term) => (
                            <button
                              key={term}
                              type="button"
                              onClick={() => handleSelectSearchTag(term)}
                              className="px-3 py-1.5 bg-navy-800 hover:bg-navy-750 text-gray-200 hover:text-gold-400 rounded-full border border-navy-700 text-xs transition-colors"
                            >
                              {term}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-1.5 text-gray-400 mb-2 font-medium">
                        <Flame className="w-3.5 h-3.5 text-gold-500" />
                        <span>Popular Searches</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {['Leather Handbag', 'Royal Wristwatch', 'Midnight Sneakers', 'ANC Headphones', 'Silk Evening Gown', 'Velvet Armchair'].map((term) => (
                          <button
                            key={term}
                            type="button"
                            onClick={() => handleSelectSearchTag(term)}
                            className="px-3 py-1.5 bg-navy-800/60 hover:bg-gold-500/10 text-gray-300 hover:text-gold-400 rounded-full border border-gold-500/20 text-xs transition-colors"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Wishlist, Cart, Account, Theme Toggle */}
          <div className="premium-header-actions flex items-center gap-0 sm:gap-2.5 md:gap-4 lg:gap-5 shrink-0">
            
            {/* Theme Toggle Button */}
            <ThemeToggle />

            {/* Wishlist Link */}
            <Link
              to="/wishlist"
              className="premium-header-action flex items-center gap-1.5 text-white/90 hover:text-gold-400 transition-colors group relative p-1 sm:p-2 rounded-lg hover:bg-navy-850"
              aria-label="Wishlist"
            >
              <div className="relative">
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-gold-gradient text-navy-950 font-bold text-[9px] sm:text-[10px] w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center shadow-gold-sm">
                    {wishlistCount}
                  </span>
                )}
              </div>
              <span className="hidden xl:inline text-xs font-medium">Wishlist</span>
            </Link>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartDrawerOpen(true)}
              className="premium-header-action flex items-center gap-1.5 text-white/90 hover:text-gold-400 transition-colors group relative cursor-pointer p-1 sm:p-2 rounded-lg hover:bg-navy-850"
              aria-label="Cart"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
                {totalItemsCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-gold-gradient text-navy-950 font-bold text-[9px] sm:text-[10px] w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center shadow-gold-sm animate-scaleIn">
                    {totalItemsCount}
                  </span>
                )}
              </div>
              <span className="hidden xl:inline text-xs font-medium">Cart</span>
            </button>

            {/* Account Button (Dropdown opens on click) */}
            <div ref={accountRef} className="relative">
              <button
                onClick={() => setIsAccountOpen(!isAccountOpen)}
                aria-label="Account Menu"
                className="flex items-center gap-1.5 text-white/90 hover:text-gold-400 transition-colors p-1 sm:p-1.5 rounded-full hover:bg-navy-800/80 cursor-pointer"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-navy-800 border border-gold-500/30 flex items-center justify-center text-gold-400 group-hover:border-gold-500/60 transition-colors">
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <span className="hidden xl:inline text-xs font-medium">
                  {isAuthenticated ? (user.name ? user.name.split(' ')[0] : 'Account') : 'Account'}
                </span>
              </button>

              {/* Account Dropdown Menu */}
              {isAccountOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-750 rounded-2xl shadow-xl py-3 z-50 animate-fadeIn text-left">
                  {isAuthenticated ? (
                    <>
                      {/* Header matching screenshot */}
                      <div className="px-4 pb-3 border-b border-gray-100 dark:border-navy-800">
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-normal leading-none">
                          Signed in as
                        </p>
                        <p className="text-base font-bold text-gray-900 dark:text-white truncate mt-1 tracking-tight">
                          {user.name || 'Valued Patron'}
                        </p>
                        <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#ebf7f0] text-[#1e5a38] border border-[#bce8cb] dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-700/50">
                          <Sparkles className="w-3.5 h-3.5 text-[#1e5a38] dark:text-emerald-400 shrink-0" />
                          <span>{user.membershipTier || 'Fresh VIP Member'}</span>
                        </div>
                      </div>

                      {/* Navigation links */}
                      <div className="py-2 text-[14px]">
                        <Link
                          to="/account"
                          onClick={() => setIsAccountOpen(false)}
                          className="block px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-navy-800 hover:text-emerald-700 dark:hover:text-gold-400 transition-colors font-medium"
                        >
                          My Dashboard
                        </Link>
                        <Link
                          to="/account/orders"
                          onClick={() => setIsAccountOpen(false)}
                          className="block px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-navy-800 hover:text-emerald-700 dark:hover:text-gold-400 transition-colors font-medium"
                        >
                          My Orders
                        </Link>
                        <Link
                          to="/track-order"
                          onClick={() => setIsAccountOpen(false)}
                          className="block px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-navy-800 hover:text-emerald-700 dark:hover:text-gold-400 transition-colors font-medium"
                        >
                          Track Live Order
                        </Link>
                      </div>

                      {/* Log Out link */}
                      <div className="border-t border-gray-100 dark:border-navy-800 pt-2">
                        <button
                          onClick={() => {
                            logout();
                            setIsAccountOpen(false);
                            navigate('/');
                          }}
                          className="w-full text-left px-4 py-2 text-[14px] font-medium text-[#f04438] hover:text-[#d92d20] dark:text-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 transition-colors cursor-pointer"
                        >
                          Log Out
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="p-4 text-center">
                      <p className="text-xs text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">
                        Sign in for exclusive member privileges & live order tracking
                      </p>
                      <button
                        onClick={() => {
                          setAuthMode('login');
                          setIsAuthModalOpen(true);
                          setIsAccountOpen(false);
                        }}
                        className="w-full py-2.5 bg-gold-gradient text-navy-950 font-bold rounded-xl text-xs shadow-gold-sm hover:brightness-110 mb-2 cursor-pointer transition-all"
                      >
                        Sign In
                      </button>
                      <button
                        onClick={() => {
                          setAuthMode('register');
                          setIsAuthModalOpen(true);
                          setIsAccountOpen(false);
                        }}
                        className="w-full py-2 bg-navy-900 text-gold-400 hover:text-white rounded-xl text-xs border border-gold-500/30 cursor-pointer transition-colors"
                      >
                        Create Account
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
