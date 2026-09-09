import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Standardized, scalable Luxury Pagination Component
 * Supports intelligent windowing with ellipsis, item summaries, and smooth auto-scroll.
 */
export const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 12,
  onPageChange,
  scrollToTop = true,
  className = '',
}) => {
  if (totalPages <= 1) return null;

  const handlePageClick = (page) => {
    if (page === currentPage || page < 1 || page > totalPages) return;
    if (onPageChange) {
      onPageChange(page);
    }
    if (scrollToTop) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Generate page numbers with smart ellipsis windowing
  const getPageNumbers = () => {
    const delta = 1; // number of pages to show around current page
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    // Remove duplicates if totalPages is small
    return Array.from(new Set(rangeWithDots));
  };

  const pages = getPageNumbers();
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems || currentPage * itemsPerPage);

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 mt-6 border-t border-gray-100 dark:border-navy-800 ${className}`}
    >
      {/* Items Range Summary */}
      {totalItems > 0 && (
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium order-2 sm:order-1">
          Showing <strong className="text-navy-950 dark:text-white font-semibold">{startItem}–{endItem}</strong> of{' '}
          <strong className="text-navy-950 dark:text-white font-semibold">{totalItems}</strong> items
        </span>
      )}

      {/* Pagination Action Controls */}
      <nav
        aria-label="Pagination Navigation"
        className="flex items-center gap-1.5 order-1 sm:order-2 ml-auto"
      >
        {/* Previous Button */}
        <button
          type="button"
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Go to previous page"
          className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold border border-gray-200 dark:border-navy-700 text-navy-950 dark:text-white bg-white dark:bg-navy-900 hover:border-gold-500/80 hover:text-gold-600 dark:hover:text-gold-400 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-xs cursor-pointer select-none"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Prev</span>
        </button>

        {/* Page Buttons with Ellipsis */}
        <div className="flex items-center gap-1">
          {pages.map((page, index) => {
            if (page === '...') {
              return (
                <span
                  key={`dots-${index}`}
                  className="w-8 h-8 flex items-center justify-center text-xs font-bold text-gray-400 dark:text-gray-500 select-none"
                >
                  •••
                </span>
              );
            }

            const isCurrent = currentPage === page;
            return (
              <button
                key={page}
                type="button"
                onClick={() => handlePageClick(page)}
                aria-current={isCurrent ? 'page' : undefined}
                className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer select-none ${
                  isCurrent
                    ? 'bg-navy-900 dark:bg-gold-500 text-gold-400 dark:text-navy-950 border border-gold-500 shadow-sm font-extrabold'
                    : 'bg-white dark:bg-navy-900 border border-gray-200 dark:border-navy-700 text-navy-950 dark:text-gray-200 hover:border-gold-500/80 hover:text-gold-600 dark:hover:text-gold-400'
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          type="button"
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Go to next page"
          className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold border border-gray-200 dark:border-navy-700 text-navy-950 dark:text-white bg-white dark:bg-navy-900 hover:border-gold-500/80 hover:text-gold-600 dark:hover:text-gold-400 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-xs cursor-pointer select-none"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </nav>
    </div>
  );
};
