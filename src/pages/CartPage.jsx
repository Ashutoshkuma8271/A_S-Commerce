import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { formatINR } from '../utils/currency';
import { calculateFreeShippingProgress } from '../utils/cartUtils';
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck, Tag, Heart, Plus, Minus, Check, Truck } from 'lucide-react';

export const CartPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, requireAuth } = useAuth();
  const {
    cartItems,
    totalItemsCount,
    subtotal,
    originalSubtotal,
    couponDiscount,
    shippingFee,
    total,
    totalSavings,
    appliedCoupon,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const { toggleWishlist } = useWishlist();
  const [couponCode, setCouponCode] = useState('');

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      requireAuth(() => navigate('/checkout'), 'Please sign in or register to complete your order checkout.');
      return;
    }
    navigate('/checkout');
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponCode) return;
    const success = applyCoupon(couponCode);
    if (success) setCouponCode('');
  };

  const handleSaveForLater = (item) => {
    toggleWishlist({
      id: item.id,
      name: item.name,
      price: item.price,
      originalPrice: item.originalPrice,
      images: [item.image],
      discount: item.discount,
      categoryName: 'Saved Item',
      rating: 5,
    });
    removeFromCart(item.cartItemId);
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center animate-fadeIn">
        <div className="max-w-md mx-auto bg-white rounded-3xl p-10 border border-gray-200 shadow-sm space-y-4">
          <div className="w-20 h-20 rounded-full bg-cream-100 mx-auto flex items-center justify-center border border-gold-500/20">
            <ShoppingBag className="w-10 h-10 text-gold-600" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-navy-950">Your Shopping Bag is Empty</h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Looks like you haven't added any luxury pieces yet. Explore our premier collections and discover handcrafted essentials.
          </p>
          <Link
            to="/shop"
            className="inline-block px-8 py-3 bg-gold-gradient text-navy-950 font-bold text-xs sm:text-sm rounded-2xl shadow-gold-sm hover:brightness-105 transition-all"
          >
            Start Exploring
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      
      {/* Title */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
        <div>
          <h1 className="font-serif text-2xl sm:text-4xl font-bold text-navy-950">
            Shopping Bag
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Review your selected pieces and apply member discount codes
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-red-500 font-semibold hover:underline flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear Bag
        </button>
      </div>

      {/* Grid: Cart Items (Col 8) + Summary (Col 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Items List */}
        <div className="lg:col-span-8 space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.cartItemId}
              className="bg-white rounded-3xl p-4 sm:p-6 border border-gray-200/80 shadow-sm flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between transition-all hover:border-gold-500/30"
            >
              {/* Product Info */}
              <div className="flex gap-4 items-center">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-gray-200 bg-gray-50 shrink-0"
                />
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gold-600 uppercase tracking-wider">
                    {item.brand || 'A_S Signature'}
                  </span>
                  <Link
                    to={`/product/${item.id}`}
                    className="block font-bold text-sm sm:text-base text-navy-950 hover:text-gold-600 transition-colors"
                  >
                    {item.name}
                  </Link>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                    {item.selectedColor && (
                      <span className="bg-gray-100 px-2.5 py-0.5 rounded-lg border border-gray-200 text-[11px]">
                        Color: <strong>{item.selectedColor}</strong>
                      </span>
                    )}
                    {item.selectedSize && (
                      <span className="bg-gray-100 px-2.5 py-0.5 rounded-lg border border-gray-200 text-[11px]">
                        Size: <strong>{item.selectedSize}</strong>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Price & Controls */}
              <div className="flex items-center justify-between w-full sm:w-auto gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                {/* Quantity */}
                <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden bg-gray-50">
                  <button
                    onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                    className="px-3 py-1 text-base font-bold text-gray-600 hover:bg-gray-200"
                  >
                    -
                  </button>
                  <span className="px-3 text-xs font-bold text-navy-950">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                    className="px-3 py-1 text-base font-bold text-gray-600 hover:bg-gray-200"
                  >
                    +
                  </button>
                </div>

                {/* Price */}
                <div className="text-right min-w-[90px]">
                  <div className="text-base font-bold text-navy-950 font-serif">
                    {formatINR(item.price * item.quantity)}
                  </div>
                  {item.originalPrice && (
                    <div className="text-xs text-gray-400 line-through">
                      {formatINR(item.originalPrice * item.quantity)}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSaveForLater(item)}
                    className="px-3 py-2 rounded-xl text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 bg-red-50 dark:bg-red-950/40 border border-red-200/80 dark:border-red-900/50 hover:scale-105 active:scale-95 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer font-medium text-xs"
                    title="Move to Wishlist"
                    aria-label="Save to Wishlist"
                  >
                    <Heart className="w-4 h-4 fill-red-500/20 dark:fill-red-400/30" />
                    <span className="hidden sm:inline">Save</span>
                  </button>
                  <button
                    onClick={() => removeFromCart(item.cartItemId)}
                    className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                    title="Remove item"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          ))}

          {/* Free Shipping Alert */}
          {(() => {
            const { isEligible, amountNeeded } = calculateFreeShippingProgress(subtotal);
            return (
              <div className="p-4 bg-cream-100 rounded-2xl border border-gold-500/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-navy-900 font-medium">
                  <Truck className="w-4 h-4 text-gold-600" />
                  <span>
                    {isEligible
                      ? 'Your order qualifies for FREE Express Shipping!'
                      : `Add ${formatINR(amountNeeded)} more to qualify for Free Shipping.`}
                  </span>
                </div>
                <Link to="/shop" className="text-gold-700 font-bold hover:underline">
                  Add More Items →
                </Link>
              </div>
            );
          })()}
        </div>

        {/* Right: Order Summary Box (Col 4) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-sm space-y-5">
            <h3 className="font-serif text-lg font-bold text-navy-950 pb-3 border-b border-gray-100">
              Order Summary
            </h3>

            {/* Coupon Code Applicator */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                Have a Promo Code?
              </label>
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 bg-gold-500/10 border border-gold-500/30 rounded-xl text-xs">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-gold-600" />
                    <span className="font-bold text-navy-950">{appliedCoupon.code} applied</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs text-red-500 font-bold hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Try: WELCOME10"
                    className="flex-1 pl-3 pr-2 py-2.5 bg-gray-50 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-gold-500 uppercase font-semibold"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-navy-900 text-gold-400 font-bold text-xs rounded-xl hover:bg-navy-850 transition-colors"
                  >
                    Apply
                  </button>
                </form>
              )}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2.5 text-xs text-gray-600 pt-2 border-t border-gray-100">
              <div className="flex justify-between">
                <span>Original Price</span>
                <span className="text-gray-500 line-through">{formatINR(originalSubtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Cart Subtotal</span>
                <span className="font-semibold text-navy-950">{formatINR(subtotal)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-green-700 font-bold">
                  <span>Coupon Discount ({appliedCoupon?.code})</span>
                  <span>-{formatINR(couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Estimated Shipping</span>
                <span className="font-semibold text-navy-950">
                  {shippingFee === 0 ? <span className="text-green-700 font-bold">FREE</span> : formatINR(shippingFee)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated GST & Taxes</span>
                <span className="text-gray-500">Included in prices</span>
              </div>

              {/* Total Row */}
              <div className="flex justify-between items-baseline pt-4 border-t border-gray-200 text-base font-bold text-navy-950">
                <span>Total Amount</span>
                <span className="text-2xl text-gold-700 font-serif">{formatINR(total)}</span>
              </div>

              {totalSavings > 0 && (
                <p className="text-center text-xs font-bold text-green-700 bg-green-50 py-2 rounded-xl border border-green-200 mt-2">
                  🎉 You are saving a total of {formatINR(totalSavings)} on this order!
                </p>
              )}
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleProceedToCheckout}
              className="w-full py-4 bg-gold-gradient text-navy-950 font-bold text-sm rounded-2xl shadow-gold-sm hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Trust Badges */}
            <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400 pt-2">
              <ShieldCheck className="w-4 h-4 text-gold-600" />
              <span>Razorpay Secured 256-Bit Encryption</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
