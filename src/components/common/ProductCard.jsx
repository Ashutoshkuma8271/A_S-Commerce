import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Eye, Check } from 'lucide-react';
import { formatINR } from '../../utils/currency';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { RatingStars } from './RatingStars';

export const ProductCard = ({ product, onQuickView }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const isFavorite = isInWishlist(product.id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const success = addToCart(product, 1, null, null, false);
    if (success) {
      setIsAdding(true);
      setTimeout(() => setIsAdding(false), 800);
    }
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleQuickViewClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) onQuickView(product);
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-white dark:bg-navy-900 rounded-2xl border border-gray-100/90 dark:border-navy-750/70 shadow-xs hover:shadow-lg hover:border-gray-200 dark:hover:border-navy-650 transition-all duration-300 flex flex-col overflow-hidden"
    >
      {/* Image Container with Shimmer & Smooth Fade-in */}
      <div className="relative aspect-square w-full overflow-hidden bg-gray-50/60 dark:bg-navy-850">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-100 dark:bg-navy-800 animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-gold-400/30 border-t-gold-400 animate-spin" />
          </div>
        )}

        <Link to={`/product/${product.id}`} className="block w-full h-full">
          <img
            src={isHovered && product.images[1] ? product.images[1] : product.images[0]}
            alt={product.name}
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-cover object-center transition-all duration-500 ease-out group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            loading="lazy"
            decoding="async"
          />
        </Link>

        {/* Badges on Top Left */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10 pointer-events-none">
          {product.discount > 0 && (
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white rounded-md shadow-xs">
              {product.discount}% OFF
            </span>
          )}
          {product.badge && product.badge !== `${product.discount}% OFF` && (
            <span className="px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider bg-navy-950/80 text-gold-300 rounded-md backdrop-blur-xs border border-gold-500/20">
              {product.badge}
            </span>
          )}
        </div>

        {/* Wishlist Button on Top Right */}
        <button
          onClick={handleWishlist}
          aria-label={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-2.5 right-2.5 p-1.5 rounded-full backdrop-blur-md transition-all duration-200 z-10 cursor-pointer ${
            isFavorite
              ? 'bg-red-500 text-white shadow-xs'
              : 'bg-white/90 text-gray-700 hover:text-red-500 hover:bg-white shadow-xs dark:bg-navy-950/80 dark:text-gray-300'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* Quick View Floating Action */}
        <div
          className={`absolute inset-x-2.5 bottom-2.5 flex items-center transition-all duration-200 z-10 ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
          }`}
        >
          <button
            onClick={handleQuickViewClick}
            className="w-full py-1.5 px-3 bg-white/95 dark:bg-navy-900/95 text-navy-900 dark:text-gray-100 hover:text-emerald-700 dark:hover:text-gold-400 text-xs font-medium rounded-xl shadow-md border border-gray-100 dark:border-navy-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Product Details Info */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 mb-1">
            <span className="font-semibold text-gold-600 dark:text-gold-400 uppercase tracking-wider text-[9.5px]">
              {product.brand}
            </span>
            <span className="text-[10px] text-gray-400 dark:text-gray-500">{product.categoryName}</span>
          </div>

          {/* Product Title */}
          <Link
            to={`/product/${product.id}`}
            className="block font-semibold text-xs sm:text-sm text-gray-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-gold-400 line-clamp-1 transition-colors mb-1.5"
          >
            {product.name}
          </Link>

          {/* Rating */}
          <div className="mb-2.5">
            <RatingStars rating={product.rating} count={product.reviewsCount} />
          </div>
        </div>

        {/* Price & Add to Cart Row */}
        <div className="pt-2 border-t border-gray-100 dark:border-navy-800 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm sm:text-base font-bold text-gray-900 dark:text-white font-sans">
                {formatINR(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-[11px] text-gray-400 line-through">
                  {formatINR(product.originalPrice)}
                </span>
              )}
            </div>
            {product.discount > 0 && (
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                Save {formatINR(product.originalPrice - product.price)}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            aria-label="Add to cart"
            className="px-3 py-1.5 sm:px-3 sm:py-1.5 bg-[#0A1924] dark:bg-gold-500 text-white dark:text-navy-950 hover:bg-emerald-700 dark:hover:bg-gold-400 rounded-xl transition-all duration-200 shadow-xs flex items-center gap-1.5 active:scale-95 cursor-pointer font-semibold text-xs"
          >
            {isAdding ? (
              <Check className="w-3.5 h-3.5 text-emerald-400 sm:mr-0.5" />
            ) : (
              <ShoppingBag className="w-3.5 h-3.5" />
            )}
            <span className="text-[11px]">{isAdding ? 'Added' : 'Add'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

