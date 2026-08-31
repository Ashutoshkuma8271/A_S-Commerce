import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { PRODUCTS } from '../data/products';
import { COUPONS } from '../data/coupons';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);
const STORAGE_KEY = 'as_commerce_cart';
const COUPON_KEY = 'as_commerce_coupon';

export const CartProvider = ({ children }) => {
  const { addToast } = useToast();
  const { isAuthenticated, requireAuth } = useAuth();
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  
  // Clean cart by default without mock items
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load cart from storage', e);
    }
    return [];
  });

  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    try {
      const saved = localStorage.getItem(COUPON_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load coupon from storage', e);
    }
    return null;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to save cart', e);
    }
  }, [cartItems]);

  useEffect(() => {
    try {
      if (appliedCoupon) {
        localStorage.setItem(COUPON_KEY, JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem(COUPON_KEY);
      }
    } catch (e) {
      console.error('Failed to save coupon', e);
    }
  }, [appliedCoupon]);

  const totalItemsCount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [cartItems]);

  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cartItems]);

  const originalSubtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + (item.originalPrice || item.price) * item.quantity, 0);
  }, [cartItems]);

  const couponDiscount = useMemo(() => {
    if (!appliedCoupon || cartItems.length === 0) return 0;
    if (appliedCoupon.discountPercent) {
      return Math.round((subtotal * appliedCoupon.discountPercent) / 100);
    }
    if (appliedCoupon.discountAmount) {
      return Math.min(subtotal, appliedCoupon.discountAmount);
    }
    return 0;
  }, [appliedCoupon, subtotal, cartItems]);

  // Free shipping on orders over ₹999
  const shippingFee = useMemo(() => {
    if (cartItems.length === 0) return 0;
    return subtotal >= 999 ? 0 : 99;
  }, [subtotal, cartItems]);

  const total = useMemo(() => {
    if (cartItems.length === 0) return 0;
    return Math.max(0, subtotal - couponDiscount + shippingFee);
  }, [subtotal, couponDiscount, shippingFee, cartItems]);

  const totalSavings = useMemo(() => {
    return (originalSubtotal - subtotal) + couponDiscount;
  }, [originalSubtotal, subtotal, couponDiscount]);

  // Enforce Login before Adding to Cart
  const addToCart = (product, quantity = 1, color = null, size = null, openDrawer = false, showToast = true) => {
    if (!isAuthenticated) {
      requireAuth(null, 'Please sign in to add items to your cart.');
      return false;
    }

    const chosenColor = color || (product.colorNames && product.colorNames[0]) || 'Standard';
    const chosenSize = size || (product.sizes && product.sizes[0]) || 'Standard';
    const cartItemId = `${product.id}-${chosenColor}-${chosenSize}`;

    setCartItems((prev) => {
      const existing = prev.find((item) => item.cartItemId === cartItemId);
      if (existing) {
        return prev.map((item) =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          cartItemId,
          id: product.id,
          name: product.name,
          brand: product.brand,
          price: product.price,
          originalPrice: product.originalPrice,
          discount: product.discount,
          image: (product.images && product.images[0]) || product.image,
          selectedColor: chosenColor,
          selectedSize: chosenSize,
          quantity,
        },
      ];
    });

    if (showToast) {
      addToast('Added to bag', 'success', 2400, {
        id: 'cart-add-toast',
        desc: `${product.name} (${chosenSize !== 'Standard' ? chosenSize : ''} ${chosenColor !== 'Standard' ? chosenColor : ''})`.trim()
      });
    }
    if (openDrawer) {
      setIsCartDrawerOpen(true);
    }
    return true;
  };

  const updateQuantity = (cartItemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.cartItemId === cartItemId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (cartItemId) => {
    const removed = cartItems.find((i) => i.cartItemId === cartItemId);
    setCartItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
    if (removed) {
      addToast('Item removed from bag', 'info', 2200, { desc: removed.name });
    }
  };

  const clearCart = (silent = false) => {
    if (!silent && cartItems.length > 0) {
      addToast('Shopping bag cleared', 'info', 2200);
    }
    setCartItems([]);
    setAppliedCoupon(null);
  };

  const applyCoupon = (couponCode) => {
    const cleanCode = couponCode.trim().toUpperCase();
    const found = COUPONS.find((c) => c.code === cleanCode);
    if (!found) {
      addToast('Invalid promotional code', 'error', 3500, { desc: 'Try code WELCOME10 or LUXURY20 for special savings.' });
      return false;
    }
    if (found.minOrder && subtotal < found.minOrder) {
      addToast(`Minimum bag order required`, 'warning', 3500, { desc: `A minimum cart value of ₹${found.minOrder} is required for ${cleanCode}.` });
      return false;
    }
    setAppliedCoupon(found);
    addToast(`Promotional voucher "${found.code}" applied!`, 'gold', 3200, {
      desc: found.discountPercent ? `${found.discountPercent}% instant discount activated.` : `₹${found.discountAmount} privilege deduction applied.`
    });
    return true;
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    addToast('Promotional voucher removed', 'info', 2500);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalItemsCount,
        subtotal,
        originalSubtotal,
        couponDiscount,
        shippingFee,
        total,
        totalSavings,
        appliedCoupon,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
