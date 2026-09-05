import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, ShieldCheck, CreditCard, Lock, Sparkles, CheckCircle2 } from 'lucide-react';
import { Logo } from '../common/Logo';
import { useToast } from '../../context/ToastContext';

export const Footer = () => {
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      addToast('Please enter a valid email address', 'error');
      return;
    }
    setIsSubscribed(true);
    addToast('Subscribed! 10% coupon sent to email.', 'success');
    setEmail('');
  };

  return (
    <footer className="bg-navy-950 text-white border-t border-navy-850 pt-12 sm:pt-16 pb-6 sm:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main 5-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-x-8 gap-y-9 sm:gap-y-10 pb-10 sm:pb-12 border-b border-navy-800/80">
          
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4 min-w-0">
            <Logo size="large" />
            <p className="text-sm text-gray-300 max-w-sm leading-relaxed">
              Curated luxury fashion, precision electronics, and bespoke living essentials designed for discerning tastemakers across the globe.
            </p>

            <div className="pt-2">
              <p className="text-xs text-gold-400 font-semibold uppercase tracking-wider mb-2">
                100% Certified Authentic & Secure
              </p>
              <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 sm:gap-3 text-xs text-gray-300">
                <div className="flex items-center gap-1.5 bg-navy-900 px-3 py-2 sm:py-1.5 rounded-lg border border-navy-800 min-w-0">
                  <ShieldCheck className="w-4 h-4 text-gold-400" />
                  <span className="truncate">Buyer Protection</span>
                </div>
                <div className="flex items-center gap-1.5 bg-navy-900 px-3 py-2 sm:py-1.5 rounded-lg border border-navy-800 min-w-0">
                  <Lock className="w-4 h-4 text-gold-400" />
                  <span className="truncate">256-Bit SSL Encrypted</span>
                </div>
              </div>
            </div>
          </div>

          {/* Col 2: Shop Links */}
          <div className="min-w-0">
            <h4 className="font-serif text-base font-bold text-white mb-4 relative inline-block">
              Shop Categories
              <span className="block h-0.5 w-6 bg-gold-500 mt-1 rounded-full"></span>
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-300">
              <li><Link to="/category/men" className="hover:text-gold-400 transition-colors">Men Fashion</Link></li>
              <li><Link to="/category/women" className="hover:text-gold-400 transition-colors">Women Fashion</Link></li>
              <li><Link to="/category/electronics" className="hover:text-gold-400 transition-colors">Electronics & Audio</Link></li>
              <li><Link to="/category/home-living" className="hover:text-gold-400 transition-colors">Home & Living</Link></li>
              <li><Link to="/category/beauty" className="hover:text-gold-400 transition-colors">Beauty & Fragrance</Link></li>
              <li><Link to="/category/accessories" className="hover:text-gold-400 transition-colors">Luxury Accessories</Link></li>
              <li><Link to="/category/footwear" className="hover:text-gold-400 transition-colors">Footwear Collection</Link></li>
            </ul>
          </div>

          {/* Col 3: Customer Service */}
          <div className="min-w-0">
            <h4 className="font-serif text-base font-bold text-white mb-4 relative inline-block">
              Customer Care
              <span className="block h-0.5 w-6 bg-gold-500 mt-1 rounded-full"></span>
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-300">
              <li><Link to="/track-order" className="hover:text-gold-400 transition-colors font-medium text-gold-400/90">Track Your Order</Link></li>
              <li><Link to="/help" className="hover:text-gold-400 transition-colors">Help Center & FAQ</Link></li>
              <li><Link to="/shipping" className="hover:text-gold-400 transition-colors">Shipping & Delivery</Link></li>
              <li><Link to="/returns" className="hover:text-gold-400 transition-colors">30-Day Easy Returns</Link></li>
              <li><Link to="/contact" className="hover:text-gold-400 transition-colors">Contact Concierge</Link></li>
              <li><Link to="/account" className="hover:text-gold-400 transition-colors">Member Privileges</Link></li>
              <li><Link to="/admin/login" className="text-gray-400 hover:text-gold-400 transition-colors text-[11px] flex items-center gap-1 mt-1 font-mono">🔒 Admin Panel</Link></li>
            </ul>
          </div>

          {/* Col 4: Newsletter */}
          <div className="space-y-3 min-w-0">
            <h4 className="font-serif text-base font-bold text-white mb-4 relative inline-block">
              Stay in the Loop
              <span className="block h-0.5 w-6 bg-gold-500 mt-1 rounded-full"></span>
            </h4>
            <p className="text-xs text-gray-300">
              Receive private sales invitations, season previews, and 10% off your premier order.
            </p>

            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address..."
                  className="w-full px-4 py-2.5 bg-navy-900 text-white placeholder-gray-500 text-xs rounded-xl border border-navy-750 focus:outline-none focus:border-gold-500 transition-all"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-gold-gradient text-navy-950 font-bold text-xs rounded-xl shadow-gold-sm hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>Subscribe</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            {isSubscribed && (
              <p className="text-xs text-green-400 flex items-center gap-1 mt-2">
                <CheckCircle2 className="w-3.5 h-3.5" /> Subscribed with coupon WELCOME10!
              </p>
            )}
          </div>

        </div>

        {/* Bottom Bar: Copyright & Payment Badges */}
        <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5 text-xs text-gray-400">
          <p className="text-center sm:text-left leading-relaxed max-w-xl">© {new Date().getFullYear()} A_S Commerce Inc. All rights reserved. Designed with luxury aesthetics.</p>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-4 w-full sm:w-auto">
            <span className="text-gray-400 text-[11px]">Accepted Payments:</span>
            <div className="flex flex-wrap justify-center sm:justify-end gap-2">
              <span className="px-2.5 py-1 bg-navy-900 border border-navy-800 rounded text-[10px] font-semibold text-white">Razorpay</span>
              <span className="px-2.5 py-1 bg-navy-900 border border-navy-800 rounded text-[10px] font-semibold text-white">UPI</span>
              <span className="px-2.5 py-1 bg-navy-900 border border-navy-800 rounded text-[10px] font-semibold text-white">Visa / MC</span>
              <span className="px-2.5 py-1 bg-navy-900 border border-navy-800 rounded text-[10px] font-semibold text-white">NetBanking</span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};
