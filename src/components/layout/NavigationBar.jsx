import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, ChevronDown } from 'lucide-react';
import { MegaMenu } from './MegaMenu';

export const NavigationBar = () => {
  const location = useLocation();
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const navContainerRef = useRef(null);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Shop', path: '/shop' },
    { label: 'Men', path: '/category/men' },
    { label: 'Women', path: '/category/women' },
    { label: 'Electronics', path: '/category/electronics' },
    { label: 'Home & Living', path: '/category/home-living' },
    { label: 'Beauty', path: '/category/beauty' },
    { label: 'Offers', path: '/offers' },
    { label: 'New Arrivals', path: '/new-arrivals' },
  ];

  useEffect(() => {
    // Close menu on route transition
    setIsMegaMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div ref={navContainerRef} className="bg-navy-900 text-white border-b border-navy-800/80 relative select-none hidden lg:block">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8 h-12">
          
          {/* All Categories Button matching reference image */}
          <div>
            <button
              onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
              className="flex items-center gap-2.5 px-5 py-2 rounded-xl bg-gold-gradient text-navy-950 font-bold text-xs sm:text-sm tracking-wide shadow-gold-sm hover:brightness-105 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <Menu className="w-4 h-4 text-navy-950 stroke-[2.5]" />
              <span>All Categories</span>
              <ChevronDown className={`w-3.5 h-3.5 text-navy-950 transition-transform duration-200 ${isMegaMenuOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Nav Items */}
          <nav className="flex items-center gap-6 xl:gap-8 h-full">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative text-xs xl:text-sm font-medium tracking-normal transition-all duration-200 py-3 flex items-center ${
                    active
                      ? 'text-white font-semibold'
                      : 'text-gray-300 hover:text-gold-400'
                  }`}
                >
                  <span>{link.label}</span>
                  
                  {/* Golden Active Underline Bar */}
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-gradient rounded-full shadow-gold-glow animate-fadeIn" />
                  )}
                </Link>
              );
            })}
          </nav>

        </div>
      </div>

      {/* Mega Menu Dropdown */}
      <MegaMenu isOpen={isMegaMenuOpen} onClose={() => setIsMegaMenuOpen(false)} />
    </div>
  );
};
