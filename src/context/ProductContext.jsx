import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { PRODUCTS as FALLBACK_PRODUCTS } from '../data/products';

const ProductContext = createContext(null);

export const normalizeProduct = (p) => {
  if (!p) return null;
  const images = Array.isArray(p.images) && p.images.length > 0
    ? p.images
    : (p.image_url ? [p.image_url] : (p.image ? [p.image] : ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800']));

  return {
    id: p.id,
    name: p.name || 'Luxury Product',
    brand: p.brand || 'A_S Luxury',
    category: p.category || 'accessories',
    categoryName: p.category_name || p.categoryName || (p.category ? p.category.toUpperCase() : 'Accessories'),
    price: Number(p.price) || 0,
    originalPrice: p.original_price ? Number(p.original_price) : (p.originalPrice ? Number(p.originalPrice) : null),
    discount: p.discount ? Number(p.discount) : 0,
    rating: Number(p.rating) || 5.0,
    reviewCount: Number(p.review_count || p.reviews_count || p.reviewCount) || 0,
    reviewsCount: Number(p.review_count || p.reviews_count || p.reviewCount) || 0,
    stockCount: p.stock_count !== undefined ? Number(p.stock_count) : (p.stockCount !== undefined ? Number(p.stockCount) : 10),
    inStock: p.in_stock !== false && (p.inStock !== false) && (p.stock_count === undefined || Number(p.stock_count) > 0),
    badge: p.badge || (p.discount ? `${p.discount}% OFF` : ''),
    description: p.description || '',
    images,
    image: images[0],
    isFeatured: p.is_featured !== undefined ? Boolean(p.is_featured) : (p.isFeatured !== undefined ? Boolean(p.isFeatured) : true),
    isTrending: p.is_trending !== undefined ? Boolean(p.is_trending) : Boolean(p.isTrending),
    isNewArrival: p.is_new_arrival !== undefined ? Boolean(p.is_new_arrival) : (p.isNewArrival !== undefined ? Boolean(p.isNewArrival) : true),
    isSpecialOffer: p.is_special_offer !== undefined ? Boolean(p.is_special_offer) : Boolean(p.isSpecialOffer),
    colors: p.colors || ['#061A27', '#1A1A1A'],
    colorNames: p.color_names || p.colorNames || ['Midnight Navy', 'Obsidian Black'],
    sizes: p.sizes || ['Standard', 'Luxury Edition'],
    specs: p.specs || {
      'Craftsmanship': 'Handcrafted Luxury',
      'Authenticity': '100% Verified Genuine',
      'Warranty': '1 Year International Warranty'
    },
    createdAt: p.created_at || p.createdAt,
    updatedAt: p.updated_at || p.updatedAt,
  };
};

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState(() => {
    return FALLBACK_PRODUCTS.map(normalizeProduct);
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch initial product list from API / Supabase
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Try public backend API
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.products) && data.products.length > 0) {
          const normalized = data.products.map(normalizeProduct);
          setProducts(normalized);
          setLoading(false);
          return;
        }
      }

      // 2. Direct Supabase Client fallback
      const { data: supaData, error: supaErr } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (!supaErr && supaData && supaData.length > 0) {
        const normalized = supaData.map(normalizeProduct);
        setProducts(normalized);
      }
    } catch (err) {
      console.warn('Live products initial fetch note:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Subscribe to Realtime Supabase changes on 'products' table
  useEffect(() => {
    const channel = supabase
      .channel('realtime:public:products')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          console.log('⚡ [Realtime Products Update received]:', payload.eventType, payload.new || payload.old);
          
          if (payload.eventType === 'INSERT' && payload.new) {
            const newItem = normalizeProduct(payload.new);
            setProducts((prev) => [newItem, ...prev.filter(p => p.id !== newItem.id)]);
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            const updatedItem = normalizeProduct(payload.new);
            setProducts((prev) => prev.map(p => (p.id === updatedItem.id ? { ...p, ...updatedItem } : p)));
          } else if (payload.eventType === 'DELETE' && payload.old) {
            setProducts((prev) => prev.filter(p => p.id !== payload.old.id));
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('⚡ Subscribed to Supabase Realtime Products channel');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getProductById = useCallback((id) => {
    if (!id) return null;
    const clean = id.toString().trim();
    return products.find(p => p.id === clean || p.id?.toLowerCase() === clean.toLowerCase());
  }, [products]);

  const featuredProducts = products.filter(p => p.isFeatured);
  const trendingProducts = products.filter(p => p.isTrending);
  const newArrivals = products.filter(p => p.isNewArrival);
  const specialOffers = products.filter(p => p.isSpecialOffer);

  return (
    <ProductContext.Provider
      value={{
        products,
        loading,
        error,
        refreshProducts: fetchProducts,
        getProductById,
        featuredProducts,
        trendingProducts,
        newArrivals,
        specialOffers,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};

export default ProductContext;
