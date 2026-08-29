import React, { useState } from 'react';
import { MainHeader } from './MainHeader';
import { NavigationBar } from './NavigationBar';
import { MobileNav } from './MobileNav';
import { Footer } from './Footer';
import { CartDrawer } from '../common/CartDrawer';
import { AuthModal } from '../common/AuthModal';

export const Layout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-cream-100 selection:bg-gold-500 selection:text-navy-900">
      {/* Header Stack */}
      <header className="sticky top-0 z-40 shadow-xl">
        <MainHeader onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />
        <NavigationBar />
      </header>

      {/* Mobile Drawer */}
      <MobileNav isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      {/* Cart Drawer */}
      <CartDrawer />

      {/* Auth Modal */}
      <AuthModal />

      {/* Page Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};
