import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, ArrowUpDown, X, Check, Star, RefreshCw } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { CATEGORIES } from '../data/categories';
import { ProductCard } from '../components/common/ProductCard';
import { QuickViewModal } from '../components/common/QuickViewModal';
import { ProductGridSkeleton } from '../components/common/Skeletons';
import { formatINR } from '../utils/currency';

export const ShopPage = () => {
  const { products: PRODUCTS, loading } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || '';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedSub, setSelectedSub] = useState(searchParams.get('sub') || '');
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [priceRange, setPriceRange] = useState(30000);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [minDiscount, setMinDiscount] = useState(0);
  const [sortBy, setSortBy] = useState('popular');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // Perfect 3x3 Grid Symmetry with 0 trailing gaps

  // Sync params on URL change
  useEffect(() => {
    const urlCat = searchParams.get('category') || '';
    const urlSearch = searchParams.get('search') || '';
    const urlSub = searchParams.get('sub') || '';
    setSelectedCategory(urlCat);
    setSearchQuery(urlSearch);
    setSelectedSub(urlSub);
  }, [searchParams]);

  // Extract unique brands
  const brandsList = useMemo(() => {
    return Array.from(new Set(PRODUCTS.map((p) => p.brand).filter(Boolean)));
  }, [PRODUCTS]);

  const handleCategorySelect = (slug) => {
    setSelectedCategory((prev) => (prev === slug ? '' : slug));
    setSelectedSub('');
    setCurrentPage(1);
  };

  const handleBrandToggle = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSelectedCategory('');
    setSelectedSub('');
    setSearchQuery('');
    setPriceRange(30000);
    setSelectedBrands([]);
    setMinRating(0);
    setInStockOnly(false);
    setMinDiscount(0);
    setSortBy('popular');
    setCurrentPage(1);
    setSearchParams({});
  };

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      if (selectedCategory && product.category !== selectedCategory) return false;
      if (selectedSub) {
        const matchesName = product.name.toLowerCase().includes(selectedSub.toLowerCase());
        const matchesCategory = product.categoryName.toLowerCase().includes(selectedSub.toLowerCase());
        const matchesDesc = product.description.toLowerCase().includes(selectedSub.toLowerCase());
        if (!matchesName && !matchesCategory && !matchesDesc) {
          // If strict match doesn't hit, allow category products
        }
      }
      if (
        searchQuery &&
        !product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !product.brand.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !product.categoryName.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      if (product.price > priceRange) return false;
      if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) return false;
      if (minRating > 0 && product.rating < minRating) return false;
      if (inStockOnly && !product.inStock) return false;
      if (minDiscount > 0 && product.discount < minDiscount) return false;
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'newest') return (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0);
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });
  }, [selectedCategory, selectedSub, searchQuery, priceRange, selectedBrands, minRating, inStockOnly, minDiscount, sortBy]);

  // Paginated
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      
      {/* Page Header */}
      <div className="bg-navy-950 text-white rounded-3xl p-6 sm:p-10 mb-8 border border-gold-500/20 shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <span className="text-xs font-bold uppercase tracking-widest text-gold-400 font-sans">
            Curated Catalog
          </span>
          <h1 className="font-serif text-2xl sm:text-4xl font-bold text-white mt-1">
            {selectedCategory
              ? CATEGORIES.find((c) => c.slug === selectedCategory)?.name || 'Collection'
              : searchQuery
              ? `Search Results for "${searchQuery}"`
              : 'All Luxury Products'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-2 max-w-xl">
            Explore authentic handcrafted luxury pieces, timepieces, couture fashion, and smart acoustics.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-80 h-80 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Main Layout: Sidebar Filters + Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Desktop Sidebar Filters */}
        <div className="hidden lg:block space-y-6 bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm h-fit sticky top-28">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2 font-serif font-bold text-base text-navy-950">
              <SlidersHorizontal className="w-4 h-4 text-gold-600" />
              <span>Filters</span>
            </div>
            <button
              onClick={resetFilters}
              className="text-xs text-gold-700 font-semibold hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Reset
            </button>
          </div>

          {/* Categories Filter */}
          <div>
            <h4 className="text-xs font-bold text-navy-950 uppercase tracking-wider mb-3">Categories</h4>
            <div className="space-y-1.5">
              <button
                onClick={() => handleCategorySelect('')}
                className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
                  selectedCategory === ''
                    ? 'bg-navy-900 text-gold-400 font-bold'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>All Categories</span>
                <span>{PRODUCTS.length}</span>
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.slug)}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
                    selectedCategory === cat.slug
                      ? 'bg-navy-900 text-gold-400 font-bold'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className="text-gray-400 text-[10px]">
                    {PRODUCTS.filter((p) => p.category === cat.slug).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs font-bold text-navy-950 mb-2">
              <span className="uppercase tracking-wider">Max Price</span>
              <span className="text-gold-700 font-serif font-bold text-sm">{formatINR(priceRange)}</span>
            </div>
            <input
              type="range"
              min="1000"
              max="30000"
              step="500"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full accent-gold-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>₹1,000</span>
              <span>₹30,000+</span>
            </div>
          </div>

          {/* Brands */}
          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-xs font-bold text-navy-950 uppercase tracking-wider mb-3">Brands</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {brandsList.map((brand) => (
                <label
                  key={brand}
                  className="flex items-center gap-2.5 text-xs text-gray-700 cursor-pointer hover:text-navy-950"
                >
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(brand)}
                    onChange={() => handleBrandToggle(brand)}
                    className="rounded text-navy-900 focus:ring-gold-500 accent-navy-900"
                  />
                  <span>{brand}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Minimum Rating */}
          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-xs font-bold text-navy-950 uppercase tracking-wider mb-3">Minimum Rating</h4>
            <div className="space-y-1.5">
              {[4.8, 4.5, 4.0].map((rate) => (
                <button
                  key={rate}
                  onClick={() => setMinRating(minRating === rate ? 0 : rate)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition-colors ${
                    minRating === rate
                      ? 'bg-gold-500/15 text-navy-950 font-bold border border-gold-500/40'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-gold-500 text-gold-500" />
                    <span>{rate}+ Stars</span>
                  </span>
                  {minRating === rate && <Check className="w-3.5 h-3.5 text-gold-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* Discounts */}
          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-xs font-bold text-navy-950 uppercase tracking-wider mb-3">Discounts</h4>
            <div className="flex flex-wrap gap-2">
              {[20, 30, 40, 50].map((disc) => (
                <button
                  key={disc}
                  onClick={() => setMinDiscount(minDiscount === disc ? 0 : disc)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                    minDiscount === disc
                      ? 'bg-navy-900 text-gold-400 border-navy-900 shadow-sm'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {disc}% & Above
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Products Column */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Top Sort & Count Bar */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-gray-500 font-medium">
              Showing <strong className="text-navy-950">{filteredProducts.length}</strong> luxurious products
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-navy-900 text-gold-400 rounded-xl text-xs font-bold"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Filters</span>
              </button>

              {/* Sort Selector */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-500 font-medium hidden sm:inline">Sort By:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 bg-gray-50 text-navy-950 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-gold-500 cursor-pointer"
                >
                  <option value="popular">Most Popular</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">New Arrivals First</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Filter Chips */}
          {(selectedCategory || selectedBrands.length > 0 || minRating > 0 || minDiscount > 0 || searchQuery) && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-400 font-medium">Active filters:</span>
              {searchQuery && (
                <span className="inline-flex items-center gap-1 bg-cream-200 text-navy-900 text-xs px-2.5 py-1 rounded-full border border-gold-500/30">
                  Search: "{searchQuery}"
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchQuery('')} />
                </span>
              )}
              {selectedCategory && (
                <span className="inline-flex items-center gap-1 bg-cream-200 text-navy-900 text-xs px-2.5 py-1 rounded-full border border-gold-500/30">
                  Category: {CATEGORIES.find((c) => c.slug === selectedCategory)?.name}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedCategory('')} />
                </span>
              )}
              {selectedBrands.map((b) => (
                <span key={b} className="inline-flex items-center gap-1 bg-cream-200 text-navy-900 text-xs px-2.5 py-1 rounded-full border border-gold-500/30">
                  Brand: {b}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => handleBrandToggle(b)} />
                </span>
              ))}
              <button onClick={resetFilters} className="text-xs text-red-500 font-bold hover:underline ml-2">
                Clear All
              </button>
            </div>
          )}

          {/* Products Grid / Skeleton */}
          {loading ? (
            <ProductGridSkeleton count={9} />
          ) : paginatedProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {paginatedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-200/80 shadow-sm space-y-4">
              <div className="w-16 h-16 rounded-full bg-cream-100 mx-auto flex items-center justify-center border border-gold-500/20">
                <SlidersHorizontal className="w-8 h-8 text-gold-600" />
              </div>
              <h3 className="font-serif text-xl font-bold text-navy-950">No matching products found</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                We couldn't find products matching your selected criteria. Try adjusting your filters or price range.
              </p>
              <button
                onClick={resetFilters}
                className="px-6 py-2.5 bg-navy-900 text-gold-400 font-bold text-xs rounded-xl shadow-md"
              >
                Reset All Filters
              </button>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              {[...Array(totalPages)].map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                    currentPage === idx + 1
                      ? 'bg-gold-gradient text-navy-950 shadow-gold-sm'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          )}

        </div>

      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />

    </div>
  );
};
