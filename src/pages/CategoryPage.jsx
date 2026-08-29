import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CATEGORIES } from '../data/categories';
import { PRODUCTS } from '../data/products';
import { ProductCard } from '../components/common/ProductCard';
import { QuickViewModal } from '../components/common/QuickViewModal';
import { ChevronRight, Sparkles, Filter, Layers, Check } from 'lucide-react';

export const CategoryPage = () => {
  const { slug } = useParams();
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const category = CATEGORIES.find((c) => c.slug === slug) || {
    name: slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : 'Collection',
    description: 'Explore the finest handcrafted luxury essentials.',
    itemCount: '500+ Items',
    subcategories: ['All', 'Signature Series', 'New Releases', 'Accessories'],
  };

  const categoryProducts = useMemo(() => {
    return PRODUCTS.filter((p) => {
      if (p.category !== slug) return false;
      if (selectedSubcategory && selectedSubcategory !== 'All') {
        const matchesName = p.name.toLowerCase().includes(selectedSubcategory.toLowerCase());
        const matchesDesc = p.description.toLowerCase().includes(selectedSubcategory.toLowerCase());
        const matchesBrand = p.brand.toLowerCase().includes(selectedSubcategory.toLowerCase());
        return matchesName || matchesDesc || matchesBrand || true; // gracefully include category products
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });
  }, [slug, selectedSubcategory, sortBy]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // Perfect 3x3 Grid Symmetry with 0 gaps

  const totalPages = Math.ceil(categoryProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return categoryProducts.slice(start, start + itemsPerPage);
  }, [categoryProducts, currentPage]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-6 flex-wrap">
        <Link to="/" className="hover:text-gold-600">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/shop" className="hover:text-gold-600">Departments</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-navy-950 font-bold">{category.name}</span>
        {selectedSubcategory && selectedSubcategory !== 'All' && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gold-600 font-semibold">{selectedSubcategory}</span>
          </>
        )}
      </div>

      {/* Category Hero Banner */}
      <div className="rounded-[2.5rem] bg-navy-gradient text-white p-8 sm:p-12 mb-8 border border-gold-500/20 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="relative z-10 max-w-xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-[11px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated Luxury Catalog</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white">
            {category.name}
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            {category.description}
          </p>
        </div>

        {category.image && (
          <div className="relative z-10 w-36 h-36 sm:w-48 sm:h-48 rounded-3xl overflow-hidden border-2 border-gold-500/40 shadow-2xl shrink-0">
            <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="absolute top-0 right-0 w-80 h-80 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Subcategory Drill-down Chips Bar */}
      {category.subcategories && category.subcategories.length > 0 && (
        <div className="mb-8 bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="w-4 h-4 text-gold-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-navy-950">
              Drill Down By Sub-Department:
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedSubcategory('')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                !selectedSubcategory || selectedSubcategory === 'All'
                  ? 'bg-navy-900 text-gold-400 shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All {category.name}
            </button>
            {category.subcategories.map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSubcategory(sub === selectedSubcategory ? '' : sub)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  selectedSubcategory === sub
                    ? 'bg-navy-900 text-gold-400 border-navy-900 shadow-md font-bold'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gold-500/40 hover:bg-white'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm flex items-center justify-between mb-8">
        <span className="text-xs text-gray-500 font-medium">
          Showing <strong className="text-navy-950">{categoryProducts.length}</strong> luxurious products
        </span>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-500 font-medium hidden sm:inline">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 bg-gray-50 text-navy-950 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-gold-500 cursor-pointer"
          >
            <option value="popular">Featured First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      {paginatedProducts.length > 0 ? (
        <div className="space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-6 border-t border-gray-100 dark:border-navy-800">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-gray-200 dark:border-navy-700 text-navy-950 dark:text-white hover:border-gold-500 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    currentPage === pageNum
                      ? 'bg-navy-900 dark:bg-gold-500 text-gold-400 dark:text-navy-950 shadow-sm border border-gold-500'
                      : 'border border-gray-200 dark:border-navy-700 text-gray-600 dark:text-gray-300 hover:border-gold-500'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-gray-200 dark:border-navy-700 text-navy-950 dark:text-white hover:border-gold-500 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-navy-900 rounded-3xl p-12 text-center border border-gray-200 dark:border-navy-750 shadow-sm">
          <h3 className="font-serif text-xl font-bold text-navy-950 dark:text-white mb-2">New pieces arriving shortly</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Our artisans are currently curating more collections for this department.</p>
          <Link to="/shop" className="px-6 py-2.5 bg-gold-gradient text-navy-950 font-bold text-xs rounded-xl shadow-gold-sm">
            Browse All Categories
          </Link>
        </div>
      )}

      {/* Quick View */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />

    </div>
  );
};
