import React, { useState, useMemo } from 'react';
import { useProducts } from '../context/ProductContext';
import { ProductCard } from '../components/common/ProductCard';
import { Pagination } from '../components/common/Pagination';
import { Zap, Sparkles } from 'lucide-react';

export const NewArrivalsPage = () => {
  const { newArrivals: newProducts } = useProducts();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const totalPages = Math.ceil(newProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return newProducts.slice(start, start + itemsPerPage);
  }, [newProducts, currentPage]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      
      {/* Banner */}
      <div className="rounded-[2.5rem] bg-navy-gradient text-white p-8 sm:p-12 mb-10 border border-gold-500/20 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs font-bold uppercase">
            <Zap className="w-3.5 h-3.5" />
            <span>Season 2026 Debuts</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white">
            Fresh Arrivals & Premier Editions
          </h1>
          <p className="text-xs sm:text-sm text-gray-300">
            Be the first to acquire our latest handcrafted collections, seasonal colorways, and horology innovations.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-80 h-80 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {paginatedProducts.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {/* Scalable Standardized Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={newProducts.length}
        itemsPerPage={itemsPerPage}
        onPageChange={(page) => setCurrentPage(page)}
      />

    </div>
  );
};


