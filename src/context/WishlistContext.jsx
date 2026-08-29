import React, { createContext, useContext, useState, useEffect } from 'react';
import { PRODUCTS } from '../data/products';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);
const STORAGE_KEY = 'as_commerce_wishlist';

export const WishlistProvider = ({ children }) => {
  const { addToast } = useToast();
  const { user, isAuthenticated, requireAuth } = useAuth();
  
  // Empty by default without mock items
  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load wishlist', e);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlistItems));
      if (user?.email) {
        fetch('/api/users/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email, wishlist: wishlistItems }),
        }).catch(() => {});
      }
    } catch (e) {
      console.error('Failed to save wishlist', e);
    }
  }, [wishlistItems, user?.email]);

  const isInWishlist = (productId) => {
    return wishlistItems.some((item) => item.id === productId);
  };

  // Enforce Login before saving to Wishlist
  const toggleWishlist = (product) => {
    if (!isAuthenticated) {
      requireAuth(null, 'Please sign in or register to save items to your wishlist.');
      return false;
    }

    const exists = wishlistItems.some((item) => item.id === product.id);
    if (exists) {
      setWishlistItems((prev) => prev.filter((item) => item.id !== product.id));
      addToast(`Removed "${product.name}" from wishlist`, 'info');
    } else {
      setWishlistItems((prev) => [...prev, product]);
      addToast(`Added "${product.name}" to wishlist!`, 'success');
    }
    return true;
  };

  const removeFromWishlist = (productId) => {
    const found = wishlistItems.find((item) => item.id === productId);
    if (found) {
      setWishlistItems((prev) => prev.filter((item) => item.id !== productId));
      addToast(`Removed "${found.name}" from wishlist`, 'info');
    }
  };

  const clearWishlist = () => {
    setWishlistItems([]);
    addToast('Wishlist cleared', 'info');
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistCount: wishlistItems.length,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
};
