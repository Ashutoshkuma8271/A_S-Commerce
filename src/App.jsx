import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { OrderProvider } from './context/OrderContext';
import { Layout } from './components/layout/Layout';
import { ScrollToTop } from './components/common/ScrollToTop';
import { AdminProtectedRoute } from './components/admin/AdminProtectedRoute';

// Lazy Loaded Customer Storefront Pages for high-speed performance & code splitting
const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const ShopPage = lazy(() => import('./pages/ShopPage').then(m => ({ default: m.ShopPage })));
const CategoryPage = lazy(() => import('./pages/CategoryPage').then(m => ({ default: m.CategoryPage })));
const ProductDetailsPage = lazy(() => import('./pages/ProductDetailsPage').then(m => ({ default: m.ProductDetailsPage })));
const CartPage = lazy(() => import('./pages/CartPage').then(m => ({ default: m.CartPage })));
const WishlistPage = lazy(() => import('./pages/WishlistPage').then(m => ({ default: m.WishlistPage })));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage').then(m => ({ default: m.CheckoutPage })));
const OrderSuccessPage = lazy(() => import('./pages/OrderSuccessPage').then(m => ({ default: m.OrderSuccessPage })));
const TrackOrderPage = lazy(() => import('./pages/TrackOrderPage').then(m => ({ default: m.TrackOrderPage })));
const AccountPage = lazy(() => import('./pages/AccountPage').then(m => ({ default: m.AccountPage })));
const OffersPage = lazy(() => import('./pages/OffersPage').then(m => ({ default: m.OffersPage })));
const NewArrivalsPage = lazy(() => import('./pages/NewArrivalsPage').then(m => ({ default: m.NewArrivalsPage })));
const HelpPage = lazy(() => import('./pages/StaticPages').then(m => ({ default: m.HelpPage })));
const ContactPage = lazy(() => import('./pages/StaticPages').then(m => ({ default: m.ContactPage })));
const CustomerResetPasswordPage = lazy(() => import('./pages/CustomerResetPasswordPage').then(m => ({ default: m.CustomerResetPasswordPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

// Lazy Loaded Single-Admin Control Pages
const AdminSignupPage = lazy(() => import('./pages/admin/AdminSignupPage').then(m => ({ default: m.AdminSignupPage })));
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage').then(m => ({ default: m.AdminLoginPage })));
const AdminForgotPasswordPage = lazy(() => import('./pages/admin/AdminForgotPasswordPage').then(m => ({ default: m.AdminForgotPasswordPage })));
const AdminResetPasswordPage = lazy(() => import('./pages/admin/AdminResetPasswordPage').then(m => ({ default: m.AdminResetPasswordPage })));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));

// Luxury Page Loading Skeleton
const PageLoader = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 p-8">
    <div className="relative">
      <div className="w-12 h-12 rounded-full border-2 border-gold-500/20 border-t-gold-500 animate-spin" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-gold-400 animate-ping" />
      </div>
    </div>
    <p className="text-xs font-mono uppercase tracking-widest text-gold-400/80 animate-pulse">
      Loading Luxury Experience...
    </p>
  </div>
);

export function App() {
  return (
    <BrowserRouter>
      {/* React Hot Toast Notifications Container */}
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        containerStyle={{
          top: 20,
          zIndex: 999999,
        }}
        toastOptions={{
          duration: 2500,
        }}
      />

      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <AdminAuthProvider>
              <CartProvider>
                <WishlistProvider>
                  <OrderProvider>
                    <ScrollToTop />
                    
                    <Suspense fallback={<PageLoader />}>
                      <Routes>
                        {/* Dedicated Single-Admin Routes */}
                        <Route path="/admin/signup" element={<AdminSignupPage />} />
                        <Route path="/admin/login" element={<AdminLoginPage />} />
                        <Route path="/admin/forgot-password" element={<AdminForgotPasswordPage />} />
                        <Route path="/admin/reset-password" element={<AdminResetPasswordPage />} />
                        <Route
                          path="/admin/dashboard"
                          element={
                            <AdminProtectedRoute>
                              <AdminDashboardPage />
                            </AdminProtectedRoute>
                          }
                        />
                        <Route
                          path="/admin/profile"
                          element={
                            <AdminProtectedRoute>
                              <AdminDashboardPage />
                            </AdminProtectedRoute>
                          }
                        />
                        <Route
                          path="/admin"
                          element={
                            <AdminProtectedRoute>
                              <AdminDashboardPage />
                            </AdminProtectedRoute>
                          }
                        />

                        {/* Customer Storefront Routes (wrapped in Storefront Layout) */}
                        <Route
                          path="/*"
                          element={
                            <Layout>
                              <Suspense fallback={<PageLoader />}>
                                <Routes>
                                  <Route path="/" element={<HomePage />} />
                                  <Route path="/shop" element={<ShopPage />} />
                                  <Route path="/category/:slug" element={<CategoryPage />} />
                                  <Route path="/product/:id" element={<ProductDetailsPage />} />
                                  <Route path="/cart" element={<CartPage />} />
                                  <Route path="/wishlist" element={<WishlistPage />} />
                                  <Route path="/checkout" element={<CheckoutPage />} />
                                  <Route path="/order-success" element={<OrderSuccessPage />} />
                                  <Route path="/track-order" element={<TrackOrderPage />} />
                                  
                                  {/* Account & Password Recovery Routes */}
                                  <Route path="/reset-password" element={<CustomerResetPasswordPage />} />
                                  <Route path="/account" element={<AccountPage />} />
                                  <Route path="/account/orders" element={<AccountPage />} />
                                  <Route path="/account/addresses" element={<AccountPage />} />
                                  <Route path="/account/profile" element={<AccountPage />} />
                                  <Route path="/account/security" element={<AccountPage />} />
                                  <Route path="/account/wishlist" element={<WishlistPage />} />

                                  {/* Offers & New Arrivals */}
                                  <Route path="/offers" element={<OffersPage />} />
                                  <Route path="/new-arrivals" element={<NewArrivalsPage />} />

                                  {/* Static / Customer Care */}
                                  <Route path="/help" element={<HelpPage />} />
                                  <Route path="/shipping" element={<HelpPage />} />
                                  <Route path="/returns" element={<HelpPage />} />
                                  <Route path="/contact" element={<ContactPage />} />

                                  {/* Fallback */}
                                  <Route path="*" element={<NotFoundPage />} />
                                </Routes>
                              </Suspense>
                            </Layout>
                          }
                        />
                      </Routes>
                    </Suspense>

                  </OrderProvider>
                </WishlistProvider>
              </CartProvider>
            </AdminAuthProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
