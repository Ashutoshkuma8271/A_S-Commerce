import React from 'react';
import { Star } from 'lucide-react';

export const RatingStars = ({ rating = 5.0, count, showNumber = true, size = 'w-3.5 h-3.5' }) => {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.4;

  return (
    <div className="flex items-center gap-1.5 text-xs select-none">
      <div className="flex items-center text-gold-500">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`${size} ${
              i < fullStars
                ? 'fill-gold-500 text-gold-500'
                : i === fullStars && hasHalf
                ? 'fill-gold-500/50 text-gold-500'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
      {showNumber && (
        <span className="font-bold text-gray-800 text-xs">
          {rating.toFixed(1)}
        </span>
      )}
      {count !== undefined && (
        <span className="text-gray-400 text-[11px]">
          ({count})
        </span>
      )}
    </div>
  );
};
