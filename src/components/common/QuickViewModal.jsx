import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Heart, ShoppingBag, Check, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { formatINR } from '../../utils/currency';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { RatingStars } from './RatingStars';

export const QuickViewModal = ({ product, isOpen, onClose }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(
    (product?.colorNames && product.colorNames[0]) || 'Standard'
  );
  const [selectedSize, setSelectedSize] = useState(
    (product?.sizes && product.sizes[0]) || 'Standard'
  );
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  if (!isOpen || !product) return null;

  const isFavorite = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedColor, selectedSize, false);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none animate-fadeIn">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-navy-950/80 backdrop-blur-md transition-opacity"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col md:flex-row border border-gold-500/20">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-navy-900/10 hover:bg-navy-900/20 text-gray-700 hover:text-navy-900 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left: Product Images */}
        <div className="w-full md:w-1/2 p-6 bg-gray-50 flex flex-col justify-between">
          <div className="relative aspect-square rounded-2xl overflow-hidden border border-gray-200/80 bg-white mb-4">
            <img
              src={product.images[activeImageIndex] || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
            {product.discount > 0 && (
              <span className="absolute top-3 left-3 px-3 py-1 text-xs font-extrabold uppercase bg-gold-gradient text-navy-950 rounded-lg shadow-gold-sm">
                {product.discount}% OFF
              </span>
            )}
          </div>

          {/* Thumbnail strip */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                    activeImageIndex === idx
                      ? 'border-gold-500 shadow-md scale-105'
                      : 'border-gray-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 overflow-y-auto flex flex-col justify-between">
          <div>
            {/* Category & Brand */}
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span className="font-semibold text-gold-600 uppercase tracking-wider text-xs">
                {product.brand}
              </span>
              <span className="text-gray-500">{product.categoryName}</span>
            </div>

            {/* Product Title */}
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-navy-950 mb-2">
              {product.name}
            </h2>

            {/* Rating */}
            <div className="mb-4">
              <RatingStars rating={product.rating} count={product.reviewsCount} />
            </div>

            {/* Price Box */}
            <div className="p-3.5 bg-cream-100 rounded-2xl border border-gold-500/20 mb-5 flex items-center justify-between">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-navy-950 font-serif">
                    {formatINR(product.price)}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-sm text-gray-400 line-through">
                      {formatINR(product.originalPrice)}
                    </span>
                  )}
                </div>
                <span className="text-xs font-semibold text-green-700">
                  Inclusive of all taxes • In Stock ({product.stockCount} units available)
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-gray-600 mb-5 leading-relaxed">
              {product.description}
            </p>

            {/* Colors */}
            {product.colorNames && product.colorNames.length > 0 && (
              <div className="mb-4">
                <span className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                  Color: <span className="text-gold-600 font-normal">{selectedColor}</span>
                </span>
                <div className="flex gap-2">
                  {product.colorNames.map((colName, idx) => {
                    const colHex = (product.colors && product.colors[idx]) || '#061A27';
                    const active = selectedColor === colName;
                    return (
                      <button
                        key={colName}
                        onClick={() => setSelectedColor(colName)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                          active
                            ? 'border-gold-500 bg-gold-500/10 text-navy-950 font-semibold'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <span
                          className="w-3 h-3 rounded-full border border-black/10"
                          style={{ backgroundColor: colHex }}
                        />
                        <span>{colName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-5">
                <span className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                  Size: <span className="text-gold-600 font-normal">{selectedSize}</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                        selectedSize === sz
                          ? 'border-gold-500 bg-navy-900 text-gold-400 font-bold'
                          : 'border-gray-200 text-gray-700 hover:border-gray-300 bg-white'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Controls */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                Quantity:
              </span>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1 text-base font-bold text-gray-600 hover:bg-gray-200"
                >
                  -
                </button>
                <span className="px-4 py-1 text-sm font-bold text-navy-950">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1 text-base font-bold text-gray-600 hover:bg-gray-200"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4 border-t border-gray-100">
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={isAdded}
                className="flex-1 py-3.5 bg-gold-gradient text-navy-950 font-bold text-sm rounded-2xl shadow-gold-sm hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                {isAdded ? <Check className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
                <span>{isAdded ? 'Added to Cart' : `Add to Cart • ${formatINR(product.price * quantity)}`}</span>
              </button>

              <button
                onClick={() => toggleWishlist(product)}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isFavorite
                    ? 'bg-red-50 text-red-500 border-red-200'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:text-red-500'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>

            <Link
              to={`/product/${product.id}`}
              onClick={onClose}
              className="block text-center text-xs font-semibold text-navy-900 hover:text-gold-600 underline py-1"
            >
              View Full Product Page & Specifications →
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};
