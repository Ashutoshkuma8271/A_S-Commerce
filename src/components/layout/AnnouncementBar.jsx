import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Truck, Gem, MapPin, Headphones, ChevronDown, Check } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

export const AnnouncementBar = () => {
  const { applyCoupon } = useCart();
  const { addToast } = useToast();
  const [copied, setCopied] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText('WELCOME10');
    setCopied(true);
    applyCoupon('WELCOME10');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-navy-950 text-white text-[11px] sm:text-xs border-b border-navy-800/80 select-none py-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-2">
        
        {/* Left: Free Shipping on Orders Over ₹999 */}
        <div className="flex items-center gap-2 text-white/90">
          <Truck className="w-3.5 h-3.5 text-gold-400 shrink-0" />
          <span>
            Free Shipping on Orders Over <strong className="text-white font-semibold">₹999</strong>
          </span>
        </div>

        {/* Center: 10% Off on First Order | Use Code: WELCOME10 */}
        <div className="flex items-center">
          <div className="inline-flex items-center gap-1.5 text-white/90">
            <Gem className="w-3.5 h-3.5 text-gold-400 shrink-0" />
            <span>10% Off on First Order | Use Code:</span>
            <button
              onClick={handleCopyCode}
              title="Click to copy & apply code"
              className="font-bold text-gold-400 hover:text-gold-300 transition-colors cursor-pointer inline-flex items-center gap-1 tracking-wide"
            >
              <span>WELCOME10</span>
              {copied && <Check className="w-3 h-3 text-green-400 inline" />}
            </button>
          </div>
        </div>

        {/* Right: Track Order | Help Center | English ⌄ */}
        <div className="flex items-center gap-4 text-white/90">
          <Link
            to="/track-order"
            className="flex items-center gap-1.5 hover:text-gold-400 transition-colors"
          >
            <MapPin className="w-3.5 h-3.5 text-gold-400" />
            <span>Track Order</span>
          </Link>
          
          <Link
            to="/help"
            className="flex items-center gap-1.5 hover:text-gold-400 transition-colors"
          >
            <Headphones className="w-3.5 h-3.5 text-gold-400" />
            <span>Help Center</span>
          </Link>
          
          <div className="relative">
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-1 hover:text-gold-400 transition-colors cursor-pointer font-medium"
            >
              <span>English</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>
            {isLangOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-navy-900 border border-gold-500/30 rounded-xl shadow-2xl z-50 py-1 text-xs text-white">
                <button
                  onClick={() => setIsLangOpen(false)}
                  className="w-full text-left px-3 py-1.5 hover:bg-navy-800 text-gold-400 flex items-center justify-between"
                >
                  <span>English (INR)</span>
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    setIsLangOpen(false);
                    addToast('Currency set to INR (₹)', 'info');
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-navy-800 text-gray-400"
                >
                  <span>Hindi (INR)</span>
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
