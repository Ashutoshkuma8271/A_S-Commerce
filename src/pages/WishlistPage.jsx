import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { ProductCard } from '../components/common/ProductCard';
import { Heart, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

export const WishlistPage = () => {
  const { wishlistItems, wishlistCount, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { addToast } = useToast();

  const handleAddAllToCart = () => {
    let addedCount = 0;
    wishlistItems.forEach((product) => {
      const added = addToCart(product, 1, null, null, false, false);
      if (added) addedCount++;
    });
    if (addedCount > 0) {
      addToast(`Moved ${addedCount} items to shopping bag`, 'success', 2400);
    }
  };

  if (wishlistCount === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center animate-fadeIn">
        <div className="max-w-md mx-auto bg-white rounded-3xl p-10 border border-gray-200 shadow-sm space-y-4">
          <div className="w-20 h-20 rounded-full bg-cream-100 mx-auto flex items-center justify-center border border-gold-500/20">
            <Heart className="w-10 h-10 text-gold-600" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-navy-950">Your Wishlist is Empty</h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Keep track of all your favorite luxury pieces by tapping the heart icon on any product.
          </p>
          <Link
            to="/shop"
            className="inline-block px-8 py-3 bg-gold-gradient text-navy-950 font-bold text-xs sm:text-sm rounded-2xl shadow-gold-sm hover:brightness-105 transition-all"
          >
            Discover Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-gray-200">
        <div>
          <h1 className="font-serif text-2xl sm:text-4xl font-bold text-navy-950">
            My Saved Wishlist
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            You have <strong className="text-navy-950">{wishlistCount}</strong> handcrafted luxury {wishlistCount === 1 ? 'item' : 'items'} saved
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleAddAllToCart}
            className="px-4 py-2.5 bg-gold-gradient text-navy-950 font-bold text-xs rounded-xl shadow-gold-sm hover:brightness-105 flex items-center gap-1.5"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Add All to Bag</span>
          </button>
          <button
            onClick={clearWishlist}
            className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 hover:text-red-500 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Grid of Wishlisted Products */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlistItems.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

    </div>
  );
};
