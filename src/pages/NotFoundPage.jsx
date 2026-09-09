import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowRight, ShoppingBag, Home } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24 text-center animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 border border-slate-200 dark:border-slate-800 shadow-xl max-w-lg mx-auto space-y-6">
        <div className="w-20 h-20 rounded-2xl bg-amber-50 dark:bg-amber-950/40 mx-auto flex items-center justify-center border border-amber-200 dark:border-amber-800/60 shadow-inner">
          <Compass className="w-10 h-10 text-amber-600 dark:text-amber-400 animate-spin" style={{ animationDuration: '12s' }} />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">Error 404</span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Page Not Found</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            The collection or luxury item you are looking for may have been moved, renamed, or is temporarily unavailable.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Storefront Home</span>
          </Link>
          <Link
            to="/shop"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 active:scale-95 transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Browse Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

