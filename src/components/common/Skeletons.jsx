import React from 'react';

// Product Card Skeleton Loader
export const ProductCardSkeleton = () => (
  <div className="bg-white dark:bg-navy-900 rounded-2xl border border-gray-100 dark:border-navy-800 p-3 sm:p-4 flex flex-col justify-between animate-pulse overflow-hidden shadow-xs">
    {/* Image placeholder */}
    <div className="aspect-square w-full rounded-xl bg-gray-200 dark:bg-navy-800 relative overflow-hidden">
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-linear-to-r from-transparent via-white/20 dark:via-white/5 to-transparent" />
    </div>

    {/* Details placeholder */}
    <div className="mt-3.5 space-y-2 flex-1 flex flex-col justify-between">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="h-3 w-16 bg-gray-200 dark:bg-navy-800 rounded-md" />
          <div className="h-3 w-10 bg-gray-200 dark:bg-navy-800 rounded-md" />
        </div>
        <div className="h-4 w-4/5 bg-gray-200 dark:bg-navy-800 rounded-md" />
        <div className="h-3 w-20 bg-gray-200 dark:bg-navy-800 rounded-md" />
      </div>

      <div className="pt-3 border-t border-gray-100 dark:border-navy-800/80 flex items-center justify-between">
        <div className="h-5 w-20 bg-gray-200 dark:bg-navy-800 rounded-md" />
        <div className="h-8 w-16 bg-gray-200 dark:bg-navy-800 rounded-xl" />
      </div>
    </div>
  </div>
);

// Product Grid Skeleton
export const ProductGridSkeleton = ({ count = 8 }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);

// Account Profile Overview Skeleton
export const AccountProfileSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    {/* Profile Header Card Skeleton */}
    <div className="bg-white dark:bg-navy-900 rounded-2xl p-6 border border-gray-100 dark:border-navy-800 shadow-xs flex flex-col sm:flex-row items-center gap-5">
      <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-navy-800 shrink-0" />
      <div className="flex-1 space-y-2 text-center sm:text-left">
        <div className="h-5 w-40 bg-gray-200 dark:bg-navy-800 rounded-md mx-auto sm:mx-0" />
        <div className="h-3.5 w-56 bg-gray-200 dark:bg-navy-800 rounded-md mx-auto sm:mx-0" />
        <div className="h-5 w-28 bg-gray-200 dark:bg-navy-800 rounded-full mx-auto sm:mx-0" />
      </div>
      <div className="flex gap-3 w-full sm:w-auto">
        <div className="h-10 w-28 bg-gray-200 dark:bg-navy-800 rounded-xl flex-1 sm:flex-none" />
      </div>
    </div>

    {/* Metric Stat Cards Skeleton */}
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-navy-900 rounded-2xl p-4 border border-gray-100 dark:border-navy-800 space-y-2">
          <div className="h-3 w-16 bg-gray-200 dark:bg-navy-800 rounded-md" />
          <div className="h-6 w-12 bg-gray-200 dark:bg-navy-800 rounded-md" />
        </div>
      ))}
    </div>

    {/* Content Area Skeleton */}
    <div className="bg-white dark:bg-navy-900 rounded-2xl p-6 border border-gray-100 dark:border-navy-800 space-y-4">
      <div className="h-5 w-32 bg-gray-200 dark:bg-navy-800 rounded-md" />
      <div className="h-24 w-full bg-gray-200 dark:bg-navy-800 rounded-xl" />
      <div className="h-24 w-full bg-gray-200 dark:bg-navy-800 rounded-xl" />
    </div>
  </div>
);

// Order List Card Skeleton
export const OrderCardSkeleton = () => (
  <div className="bg-white dark:bg-navy-900 rounded-2xl p-5 border border-gray-100 dark:border-navy-800 space-y-4 animate-pulse">
    <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-navy-800">
      <div className="h-4 w-32 bg-gray-200 dark:bg-navy-800 rounded-md" />
      <div className="h-5 w-20 bg-gray-200 dark:bg-navy-800 rounded-full" />
    </div>
    <div className="flex items-center gap-4">
      <div className="w-16 h-16 rounded-xl bg-gray-200 dark:bg-navy-800 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-3/4 bg-gray-200 dark:bg-navy-800 rounded-md" />
        <div className="h-3 w-1/3 bg-gray-200 dark:bg-navy-800 rounded-md" />
      </div>
      <div className="h-5 w-16 bg-gray-200 dark:bg-navy-800 rounded-md" />
    </div>
  </div>
);
