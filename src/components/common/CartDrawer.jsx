import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Tag, Plus, Minus, Check, Heart } from 'lucide-react';
import { formatINR } from '../../utils/currency';
import { calculateFreeShippingProgress } from '../../utils/cartUtils';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';

export const CartDrawer = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    totalItemsCount,
    subtotal,
    couponDiscount,
    shippingFee,
    total,
    appliedCoupon,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    updateQuantity,
    removeFromCart,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const { user, isAuthenticated, requireAuth } = useAuth();
  const { toggleWishlist } = useWishlist();
  const [couponInput, setCouponInput] = useState('');

  if (!isCartDrawerOpen) return null;

  const { progressPercent: freeShippingProgress, amountNeeded: amountNeededForFreeShip } = calculateFreeShippingProgress(subtotal);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponInput) return;
    const success = applyCoupon(couponInput);
    if (success) setCouponInput('');
  };

  const handleGoToCheckout = () => {
    if (!isAuthenticated) {
      setIsCartDrawerOpen(false);
      requireAuth(() => navigate('/checkout'), 'Please sign in or register to complete your checkout.');
      return;
    }
    setIsCartDrawerOpen(false);
    navigate('/checkout');
  };

  const handleGoToCart = () => {
    setIsCartDrawerOpen(false);
    navigate('/cart');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none animate-fadeIn">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartDrawerOpen(false)}
        className="fixed inset-0 bg-navy-950/75 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white text-navy-950 shadow-2xl flex flex-col z-10 border-l border-gold-500/20 animate-slideLeft">
          
          {/* Drawer Header */}
          <div className="p-5 bg-navy-900 text-white flex items-center justify-between border-b border-navy-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-navy-800 border border-gold-500/30">
                <ShoppingBag className="w-5 h-5 text-gold-400" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-white">Your Shopping Bag</h3>
                <p className="text-xs text-gold-400">{totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'} selected</p>
              </div>
            </div>
            <button
              onClick={() => setIsCartDrawerOpen(false)}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-navy-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="bg-cream-100 p-3.5 border-b border-gold-500/20 text-xs">
            <div className="flex items-center justify-between mb-1.5 font-medium text-navy-900">
              {amountNeededForFreeShip > 0 ? (
                <span>Add <strong className="text-gold-600 font-bold">{formatINR(amountNeededForFreeShip)}</strong> more for <strong>FREE Shipping!</strong></span>
              ) : (
                <span className="text-green-700 font-bold flex items-center gap-1">
                  🎉 Congratulations! You have unlocked FREE Express Shipping!
                </span>
              )}
              <span className="text-gray-500 font-semibold">{freeShippingProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gold-gradient h-full transition-all duration-500 rounded-full shadow-gold-sm"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {cartItems.length > 0 ? (
              cartItems.map((item) => (
                <div
                  key={item.cartItemId}
                  className="flex gap-4 p-3 rounded-2xl bg-gray-50/80 border border-gray-100 hover:border-gold-500/30 transition-all"
                >
                  {/* Thumbnail */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 rounded-xl object-cover border border-gray-200 shrink-0 bg-white"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          to={`/product/${item.id}`}
                          onClick={() => setIsCartDrawerOpen(false)}
                          className="text-xs sm:text-sm font-bold text-navy-950 hover:text-gold-600 line-clamp-1 transition-colors"
                        >
                          {item.name}
                        </Link>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => {
                              toggleWishlist({
                                id: item.id,
                                name: item.name,
                                price: item.price,
                                originalPrice: item.originalPrice,
                                images: [item.image],
                                discount: item.discount,
                                categoryName: 'Cart Item',
                                rating: 5,
                              });
                              removeFromCart(item.cartItemId);
                            }}
                            className="text-red-500 hover:text-red-600 p-1.5 rounded-lg bg-red-50/80 hover:bg-red-100 border border-red-200/80 transition-all cursor-pointer shadow-2xs"
                            title="Save to Wishlist"
                            aria-label="Save to Wishlist"
                          >
                            <Heart className="w-3.5 h-3.5 fill-red-500/20" />
                          </button>
                          <button
                            onClick={() => removeFromCart(item.cartItemId)}
                            className="text-gray-400 hover:text-red-500 p-1.5 transition-colors cursor-pointer"
                            title="Remove item"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 text-[11px] text-gray-500 mt-1">
                        {item.selectedColor && (
                          <span className="bg-white px-2 py-0.5 rounded-md border border-gray-200">
                            {item.selectedColor}
                          </span>
                        )}
                        {item.selectedSize && (
                          <span className="bg-white px-2 py-0.5 rounded-md border border-gray-200">
                            {item.selectedSize}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity & Price */}
                    <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-200/60">
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                        <button
                          onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                          className="p-1 px-2 text-gray-600 hover:bg-gray-100"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-navy-950">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                          className="p-1 px-2 text-gray-600 hover:bg-gray-100"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-bold text-navy-950">
                          {formatINR(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-cream-100 flex items-center justify-center border border-gold-500/20">
                  <ShoppingBag className="w-8 h-8 text-gold-600" />
                </div>
                <div>
                  <h4 className="font-serif text-lg font-bold text-navy-950 mb-1">Your bag is empty</h4>
                  <p className="text-xs text-gray-500 max-w-xs">
                    Explore our premier collections and discover handcrafted luxury essentials.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsCartDrawerOpen(false);
                    navigate('/shop');
                  }}
                  className="px-6 py-2.5 bg-gold-gradient text-navy-950 font-bold text-xs rounded-xl shadow-gold-sm hover:brightness-105"
                >
                  Start Shopping
                </button>
              </div>
            )}
          </div>

          {/* Drawer Footer Summary */}
          {cartItems.length > 0 && (
            <div className="p-5 bg-gray-50 border-t border-gray-200 space-y-4">
              {/* Coupon Row */}
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 bg-gold-500/10 border border-gold-500/30 rounded-xl text-xs">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-gold-600" />
                    <span className="font-semibold text-navy-950">
                      Code <strong>{appliedCoupon.code}</strong> applied (-{appliedCoupon.discountPercent ? `${appliedCoupon.discountPercent}%` : formatINR(appliedCoupon.discountAmount)})
                    </span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs text-red-500 font-semibold hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="Coupon: WELCOME10"
                      className="w-full pl-3 pr-2 py-2 bg-white text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-gold-500 uppercase font-medium"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-navy-900 text-gold-400 hover:bg-navy-800 text-xs font-bold rounded-xl transition-colors"
                  >
                    Apply
                  </button>
                </form>
              )}

              {/* Subtotal & Breakdown */}
              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-navy-950">{formatINR(subtotal)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600 font-semibold">
                    <span>Discount</span>
                    <span>-{formatINR(couponDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Shipping</span>
                  <span className="font-semibold text-navy-950">
                    {shippingFee === 0 ? <span className="text-green-600 font-bold">FREE</span> : formatINR(shippingFee)}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-navy-950 pt-2 border-t border-gray-200">
                  <span>Estimated Total</span>
                  <span className="text-lg text-gold-700 font-serif">{formatINR(total)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  onClick={handleGoToCart}
                  className="py-3 px-4 bg-white hover:bg-gray-100 text-navy-950 font-bold text-xs rounded-xl border border-gray-300 text-center transition-colors shadow-sm"
                >
                  View Cart Page
                </button>
                <button
                  onClick={handleGoToCheckout}
                  className="py-3 px-4 bg-gold-gradient text-navy-950 font-bold text-xs rounded-xl shadow-gold-sm hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Checkout</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Trust Badge */}
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-gold-600" />
                <span>100% Encrypted & Secure Checkout</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
