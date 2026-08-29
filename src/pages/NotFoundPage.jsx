import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowRight } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center animate-fadeIn">
      <div className="bg-white rounded-3xl p-10 sm:p-14 border border-gray-200/80 shadow-sm max-w-md mx-auto space-y-4">
        <div className="w-20 h-20 rounded-full bg-cream-100 mx-auto flex items-center justify-center border border-gold-500/20">
          <Compass className="w-10 h-10 text-gold-600 animate-spin" style={{ animationDuration: '10s' }} />
        </div>
        <h1 className="font-serif text-3xl font-bold text-navy-950">404 - Page Not Found</h1>
        <p className="text-xs sm:text-sm text-gray-500">
          The luxury collection or page you are looking for has moved or does not exist.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-8 py-3 bg-gold-gradient text-navy-950 font-bold text-xs rounded-xl shadow-gold-sm hover:brightness-105"
        >
          <span>Return to Homepage</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
