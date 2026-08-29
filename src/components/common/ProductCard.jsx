import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Eye, Star, Check } from 'lucide-react';
import { formatINR } from '../../utils/currency';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { RatingStars } from './RatingStars';

export const ProductCard = ({ product, onQuickView }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const isFavorite = isInWishlist(product.id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    addToCart(product, 1, null, null, true);
    setTimeout(() => setIsAdding(false), 1200);
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
      className="card-3d-luxury group relative bg-white dark:bg-navy-900 rounded-3xl border border-gray-100/90 dark:border-navy-750/80 shadow-sm hover:shadow-2xl hover:border-gold-500/40 transition-all duration-500 flex flex-col overflow-hidden"
    >
      {/* Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-gray-50/50">
        <Link to={`/product/${product.id}`} className="block w-full h-full">
          <img
            src={isHovered && product.images[1] ? product.images[1] : product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            decoding="async"
          />
        </Link>

        {/* Badges on Top Left */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          {product.discount > 0 && (
            <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider bg-gold-gradient text-navy-950 rounded-lg shadow-gold-sm">
              {product.discount}% OFF
            </span>
          )}
          {product.badge && product.badge !== `${product.discount}% OFF` && (
            <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-navy-900/90 text-white rounded-lg backdrop-blur-sm border border-gold-500/30">
              {product.badge}
            </span>
          )}
        </div>

        {/* Wishlist Button on Top Right */}
        <button
          onClick={handleWishlist}
          aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-200 z-10 ${
            isFavorite
              ? 'bg-red-500 text-white shadow-md'
              : 'bg-white/85 text-navy-900 hover:text-red-500 hover:bg-white shadow-sm'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* Quick View Floating Action on Hover */}
        <div className={`absolute inset-x-3 bottom-3 flex items-center gap-2 transition-all duration-300 z-10 ${
          isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}>
          <button
            onClick={handleQuickViewClick}
            className="flex-1 py-2 px-3 bg-navy-900/95 text-white hover:text-gold-400 text-xs font-semibold rounded-xl backdrop-blur-md shadow-lg border border-gold-500/20 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Product Details Info */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span className="font-semibold text-gold-600 uppercase tracking-wider text-[10px]">
              {product.brand}
            </span>
            <span>{product.categoryName}</span>
          </div>

          {/* Product Title */}
          <Link
            to={`/product/${product.id}`}
            className="block font-medium text-sm sm:text-base text-navy-950 dark:text-white group-hover:text-gold-600 dark:group-hover:text-gold-400 line-clamp-1 transition-colors mb-2"
          >
            {product.name}
          </Link>

          {/* Rating */}
          <div className="mb-3">
            <RatingStars rating={product.rating} count={product.reviewsCount} />
          </div>
        </div>

        {/* Price & Add to Cart Row */}
        <div className="pt-2 border-t border-gray-100 dark:border-navy-800 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-bold text-navy-950 dark:text-white font-serif">
                {formatINR(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-gray-400 line-through">
                  {formatINR(product.originalPrice)}
                </span>
              )}
            </div>
            {product.discount > 0 && (
              <span className="text-[11px] font-semibold text-green-600">
                Save {formatINR(product.originalPrice - product.price)}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            aria-label="Add to cart"
            className="p-2.5 sm:px-3 sm:py-2 bg-navy-900 text-gold-400 hover:bg-gold-gradient hover:text-navy-950 rounded-xl transition-all duration-200 shadow-sm flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            {isAdding ? (
              <Check className="w-4 h-4 text-green-400 sm:mr-1" />
            ) : (
              <ShoppingBag className="w-4 h-4" />
            )}
            <span className="hidden sm:inline text-xs font-bold">
              {isAdding ? 'Added' : 'Add'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
