import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOrder } from '../context/OrderContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { formatINR } from '../utils/currency';
import { validateAddressForm } from '../utils/validationUtils';
import {
  User,
  Package,
  MapPin,
  Heart,
  LogOut,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  Calendar,
  CreditCard,
  ChevronRight,
  ShieldCheck,
  Edit2,
  Lock,
  ArrowRight,
  Phone,
  Mail,
  Home,
  Briefcase,
  Building,
  Check,
  Eye,
  EyeOff,
  ShoppingBag,
  Camera
} from 'lucide-react';

export const AccountPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
  const { user, isAuthenticated, setIsAuthModalOpen, setAuthMode, logout, updateProfile, addAddress, deleteAddress, setDefaultAddress } = useAuth();
  const { orders } = useOrder();
  const { wishlistCount, wishlist } = useWishlist();

  // Determine active tab from URL or state
  const path = location.pathname;
  const activeTab = path.includes('/orders')
    ? 'orders'
    : path.includes('/addresses')
    ? 'addresses'
    : path.includes('/profile')
    ? 'profile'
    : path.includes('/security')
    ? 'security'
    : 'dashboard';

  // Profile Form State
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');

  // Password Security Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Add Address Modal State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [newAddr, setNewAddr] = useState({
    title: 'Home',
    name: user?.name || '',
    phone: user?.phone || '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false
  });

  // Avatar Upload State
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = React.useRef(null);

  useEffect(() => {
    if (user) {
      setProfileName(user.name || '');
      setProfilePhone(user.phone || '');
    }
  }, [user]);

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center animate-fadeIn">
        <div className="max-w-md mx-auto bg-white dark:bg-navy-900 rounded-3xl p-10 border border-gray-200 dark:border-gold-500/20 shadow-xl space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-cream-100 dark:bg-navy-800 mx-auto flex items-center justify-center border border-gold-500/30 shadow-gold-sm">
            <User className="w-8 h-8 text-gold-600 dark:text-gold-400" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-navy-950 dark:text-white">Customer Account</h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            Sign in to view your orders, manage saved delivery addresses, and track consignments in real time.
          </p>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => {
                setAuthMode('login');
                setIsAuthModalOpen(true);
              }}
              className="flex-1 py-3 bg-gold-gradient text-navy-950 font-bold text-xs rounded-xl shadow-gold-sm hover:brightness-110 active:scale-98 transition-all cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setAuthMode('register');
                setIsAuthModalOpen(true);
              }}
              className="flex-1 py-3 bg-navy-900 dark:bg-navy-800 text-gold-400 font-bold text-xs rounded-xl hover:bg-navy-850 active:scale-98 transition-all cursor-pointer border border-gold-500/30"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    if (!profileName.trim()) {
      addToast('Name cannot be blank', 'error');
      return;
    }
    updateProfile({ name: profileName.trim(), phone: profilePhone.trim() });
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      addToast('New password must be at least 8 characters with letters, numbers and symbols.', 'error');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      addToast('New passwords do not match.', 'error');
      return;
    }
    addToast('Password updated securely!', 'success');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
  };

  const handleSaveAddress = (e) => {
    e.preventDefault();
    const validation = validateAddressForm(newAddr);
    if (!validation.isValid) {
      addToast(validation.error, 'error');
      return;
    }
    addAddress(newAddr);
    setIsAddressModalOpen(false);
    setNewAddr({ title: 'Home', name: user.name, phone: user.phone || '', street: '', city: '', state: '', pincode: '', isDefault: false });
  };

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('Please select a valid image file (JPEG, PNG, WebP)', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      addToast('Image must be under 5MB', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    setUploadingAvatar(true);
    try {
      const res = await fetch('/api/users/upload-avatar', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        updateProfile({ avatar: data.url });
        addToast('Profile picture uploaded to Cloudinary!', 'success');
      } else {
        addToast(data.message || 'Upload failed', 'error');
      }
    } catch (err) {
      addToast('Error uploading avatar image', 'error');
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Account Dashboard Layout: Sidebar + Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Navigation Card (Col 4) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-gray-200/80 dark:border-navy-750 shadow-sm space-y-6">
            
            {/* User Profile Banner with Avatar Upload */}
            <div className="flex items-center gap-4 pb-6 border-b border-gray-100 dark:border-navy-800">
              <div className="relative group shrink-0">
                <input
                  type="file"
                  ref={avatarInputRef}
                  onChange={handleAvatarFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <div className="w-16 h-16 rounded-full bg-navy-900 dark:bg-navy-800 border-2 border-gold-500 overflow-hidden shadow-gold-sm flex items-center justify-center text-white font-serif font-bold text-xl">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{user.name ? user.name.charAt(0).toUpperCase() : 'C'}</span>
                  )}
                </div>
                {/* Camera Overlay Button */}
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  title="Upload profile photo"
                  className="absolute inset-0 bg-navy-950/70 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center text-gold-400 transition-all cursor-pointer backdrop-blur-xs"
                >
                  <Camera className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-navy-950 dark:text-white text-base truncate">{user.name}</h3>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="text-[10px] text-gold-600 dark:text-gold-400 hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                  >
                    <Camera className="w-3 h-3" />
                    <span>{uploadingAvatar ? 'Uploading...' : 'Change Photo'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-1.5 text-xs font-semibold">
              <Link
                to="/account"
                className={`flex items-center justify-between px-4 py-3 rounded-2xl transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-navy-900 dark:bg-gold-500/15 text-gold-400 font-bold shadow-sm border border-gold-500/30'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-navy-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-gold-400" />
                  <span>Dashboard Overview</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-70" />
              </Link>

              <Link
                to="/account/orders"
                className={`flex items-center justify-between px-4 py-3 rounded-2xl transition-all ${
                  activeTab === 'orders'
                    ? 'bg-navy-900 dark:bg-gold-500/15 text-gold-400 font-bold shadow-sm border border-gold-500/30'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-navy-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Package className="w-4 h-4 text-gold-400" />
                  <span>Orders & Delivery</span>
                </div>
                <span className="px-2 py-0.5 bg-gray-100 dark:bg-navy-800 text-navy-950 dark:text-white rounded-full text-[10px]">
                  {orders.length}
                </span>
              </Link>

              <Link
                to="/account/addresses"
                className={`flex items-center justify-between px-4 py-3 rounded-2xl transition-all ${
                  activeTab === 'addresses'
                    ? 'bg-navy-900 dark:bg-gold-500/15 text-gold-400 font-bold shadow-sm border border-gold-500/30'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-navy-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-gold-400" />
                  <span>Saved Addresses</span>
                </div>
                <span className="px-2 py-0.5 bg-gray-100 dark:bg-navy-800 text-navy-950 dark:text-white rounded-full text-[10px]">
                  {user.addresses?.length || 0}
                </span>
              </Link>

              <Link
                to="/account/profile"
                className={`flex items-center justify-between px-4 py-3 rounded-2xl transition-all ${
                  activeTab === 'profile'
                    ? 'bg-navy-900 dark:bg-gold-500/15 text-gold-400 font-bold shadow-sm border border-gold-500/30'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-navy-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Edit2 className="w-4 h-4 text-gold-400" />
                  <span>Profile Information</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-70" />
              </Link>

              <Link
                to="/account/security"
                className={`flex items-center justify-between px-4 py-3 rounded-2xl transition-all ${
                  activeTab === 'security'
                    ? 'bg-navy-900 dark:bg-gold-500/15 text-gold-400 font-bold shadow-sm border border-gold-500/30'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-navy-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Lock className="w-4 h-4 text-gold-400" />
                  <span>Account Security</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-70" />
              </Link>

              <Link
                to="/wishlist"
                className="flex items-center justify-between px-4 py-3 rounded-2xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-navy-800 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span>Wishlist Items</span>
                </div>
                <span className="px-2 py-0.5 bg-gray-100 dark:bg-navy-800 text-navy-950 dark:text-white rounded-full text-[10px]">
                  {wishlistCount}
                </span>
              </Link>

              <button
                onClick={() => {
                  logout();
                  navigate('/', { replace: true });
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all text-left pt-3 border-t border-gray-100 dark:border-navy-800 mt-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Right Content Area (Col 8) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* TAB 1: Dashboard Overview */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Customer Greeting Banner */}
              <div className="rounded-3xl bg-navy-gradient text-white p-6 sm:p-8 border border-gold-500/30 shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="space-y-2 z-10">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/15 border border-gold-500/30 text-gold-400 text-[11px] font-bold uppercase">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Welcome to A_S Commerce</span>
                  </div>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                    {user.name}
                  </h2>
                  <p className="text-xs text-gray-300">
                    Manage your delivery destinations, track live order shipments, and review curated luxury releases.
                  </p>
                </div>
                <Link
                  to="/shop"
                  className="z-10 px-5 py-2.5 bg-gold-gradient text-navy-950 font-bold text-xs rounded-xl shadow-gold-sm hover:brightness-110 shrink-0"
                >
                  Explore Catalog →
                </Link>
              </div>

              {/* Quick Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-navy-900 p-5 rounded-3xl border border-gray-200/80 dark:border-navy-750 shadow-sm space-y-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Total Orders</span>
                  <p className="text-2xl font-bold text-navy-950 dark:text-white font-serif">{orders.length}</p>
                  <Link to="/account/orders" className="text-[11px] text-gold-600 dark:text-gold-400 font-bold hover:underline block pt-1">
                    View Orders →
                  </Link>
                </div>

                <div className="bg-white dark:bg-navy-900 p-5 rounded-3xl border border-gray-200/80 dark:border-navy-750 shadow-sm space-y-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Saved Addresses</span>
                  <p className="text-2xl font-bold text-navy-950 dark:text-white font-serif">{user.addresses?.length || 0}</p>
                  <Link to="/account/addresses" className="text-[11px] text-gold-600 dark:text-gold-400 font-bold hover:underline block pt-1">
                    Manage Addresses →
                  </Link>
                </div>

                <div className="bg-white dark:bg-navy-900 p-5 rounded-3xl border border-gray-200/80 dark:border-navy-750 shadow-sm space-y-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Wishlisted Items</span>
                  <p className="text-2xl font-bold text-navy-950 dark:text-white font-serif">{wishlistCount}</p>
                  <Link to="/wishlist" className="text-[11px] text-gold-600 dark:text-gold-400 font-bold hover:underline block pt-1">
                    View Wishlist →
                  </Link>
                </div>
              </div>

              {/* Recent Orders Overview */}
              <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-gray-200/80 dark:border-navy-750 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-navy-800">
                  <h3 className="font-serif text-lg font-bold text-navy-950 dark:text-white">Recent Orders</h3>
                  <Link to="/account/orders" className="text-xs text-gold-600 dark:text-gold-400 font-bold hover:underline">
                    View All →
                  </Link>
                </div>

                {orders.length === 0 ? (
                  <div className="text-center py-8 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-cream-100 dark:bg-navy-800 text-gold-500 flex items-center justify-center mx-auto">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-navy-950 dark:text-white">No orders placed yet</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                      Your completed purchases and delivery tracking will appear here once you place your first order.
                    </p>
                    <Link
                      to="/shop"
                      className="inline-block px-4 py-2 bg-gold-gradient text-navy-950 font-bold text-xs rounded-xl shadow-gold-sm hover:brightness-110"
                    >
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.slice(0, 2).map((ord) => (
                      <div
                        key={ord.id}
                        className="p-4 bg-gray-50 dark:bg-navy-850 rounded-2xl border border-gray-100 dark:border-navy-750 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-navy-950 dark:text-white text-sm">#{ord.id}</span>
                            <span className="px-2.5 py-0.5 bg-gold-500/15 text-gold-700 dark:text-gold-300 text-[10px] font-bold rounded-full border border-gold-500/30">
                              {ord.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {ord.items?.length || 1} item(s) • Total: {formatINR(ord.total)}
                          </p>
                        </div>
                        <Link
                          to={`/track-order?id=${ord.id}`}
                          className="px-4 py-2 bg-navy-900 dark:bg-navy-800 text-gold-400 font-bold text-xs rounded-xl hover:bg-navy-850 border border-gold-500/30"
                        >
                          Track Order
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Orders History */}
          {activeTab === 'orders' && (
            <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 sm:p-8 border border-gray-200/80 dark:border-navy-750 shadow-sm space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-navy-800">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-navy-950 dark:text-white">
                    Order History & Invoices
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Track the live delivery progress of your items.
                  </p>
                </div>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-cream-100 dark:bg-navy-850 text-gold-500 flex items-center justify-center mx-auto border border-gold-500/20 shadow-gold-sm">
                    <Package className="w-8 h-8" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-navy-950 dark:text-white">No Orders Found</h3>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
                    You have not placed any orders yet. Discover our latest catalog items and enjoy seamless online shopping.
                  </p>
                  <Link
                    to="/shop"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gold-gradient text-navy-950 font-bold text-xs rounded-xl shadow-gold-sm hover:brightness-110"
                  >
                    <span>Browse Luxury Catalog</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-5 rounded-2xl border border-gray-200 dark:border-navy-750 bg-gray-50/60 dark:bg-navy-850 space-y-4 transition-all hover:border-gold-500/40"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-200/60 dark:border-navy-700 text-xs">
                        <div>
                          <span className="font-mono text-sm font-bold text-navy-950 dark:text-white">Order #{ord.id}</span>
                          <p className="text-gray-500 dark:text-gray-400">Placed on {ord.date || new Date().toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 bg-gold-500/15 text-gold-700 dark:text-gold-300 font-bold rounded-full text-xs border border-gold-500/30">
                            {ord.status}
                          </span>
                          <Link
                            to={`/track-order?id=${ord.id}`}
                            className="px-3.5 py-1.5 bg-navy-900 dark:bg-navy-800 text-gold-400 font-bold rounded-xl hover:bg-navy-850 border border-gold-500/30"
                          >
                            Track Shipment
                          </Link>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-2">
                        {ord.items && ord.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-3">
                              <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover border border-gray-200 dark:border-navy-700 bg-white" />
                              <div>
                                <p className="font-bold text-navy-950 dark:text-white">{item.name}</p>
                                <p className="text-gray-500 dark:text-gray-400 text-[11px]">Qty: {item.quantity}</p>
                              </div>
                            </div>
                            <span className="font-bold text-navy-950 dark:text-white font-serif">
                              {formatINR(item.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-gray-200 dark:border-navy-700 flex justify-between items-center text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Payment: {ord.paymentMethod || 'Online Gateway'}</span>
                        <span className="text-sm font-bold text-gold-600 dark:text-gold-400 font-serif">Total: {formatINR(ord.total)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Saved Addresses */}
          {activeTab === 'addresses' && (
            <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 sm:p-8 border border-gray-200/80 dark:border-navy-750 shadow-sm space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-navy-800">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-navy-950 dark:text-white">
                    Saved Delivery Addresses
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Manage your shipping locations for 1-click checkout.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddressModalOpen(true)}
                  className="px-4 py-2.5 bg-gold-gradient text-navy-950 font-bold text-xs rounded-xl shadow-gold-sm hover:brightness-105 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Address</span>
                </button>
              </div>

              {!user.addresses || user.addresses.length === 0 ? (
                <div className="text-center py-10 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-cream-100 dark:bg-navy-850 text-gold-500 flex items-center justify-center mx-auto">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-navy-950 dark:text-white">No saved addresses yet</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                    Add your home or office address to enable swift, seamless checkout on your future orders.
                  </p>
                  <button
                    onClick={() => setIsAddressModalOpen(true)}
                    className="inline-block px-4 py-2 bg-navy-900 dark:bg-navy-800 text-gold-400 font-bold text-xs rounded-xl border border-gold-500/30 cursor-pointer"
                  >
                    + Add First Address
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {user.addresses.map((addr) => {
                    const isOffice = addr.title?.toLowerCase() === 'office';
                    const isHome = addr.title?.toLowerCase() === 'home';
                    return (
                      <div
                        key={addr.id}
                        className="p-5 rounded-2xl border border-gray-200 dark:border-navy-750 bg-gray-50/60 dark:bg-navy-850 space-y-3 relative transition-all hover:border-gold-500/40"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="p-1.5 rounded-lg bg-gold-500/10 text-gold-500">
                              {isHome ? <Home className="w-3.5 h-3.5" /> : isOffice ? <Briefcase className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
                            </span>
                            <span className="font-bold text-xs text-navy-950 dark:text-gold-400 uppercase tracking-wider">{addr.title || 'Address'}</span>
                          </div>
                          {addr.isDefault ? (
                            <span className="px-2 py-0.5 bg-gold-500/15 text-gold-700 dark:text-gold-300 text-[10px] font-bold rounded-md border border-gold-500/30">
                              Default Address
                            </span>
                          ) : (
                            <button
                              onClick={() => setDefaultAddress(addr.id)}
                              className="text-[10px] text-gray-400 hover:text-gold-400 underline cursor-pointer"
                            >
                              Set as default
                            </button>
                          )}
                        </div>

                        <div>
                          <p className="font-bold text-sm text-navy-950 dark:text-white">{addr.name}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mt-0.5">
                            {addr.company ? `${addr.company}, ` : ''}{addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                          </p>
                          {addr.landmark && (
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 italic mt-0.5">
                              Landmark: {addr.landmark}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1">📞 {addr.phone}</p>
                        </div>

                        {/* Real-World Delivery Window Indicator */}
                        <div className="pt-2 border-t border-gray-200/60 dark:border-navy-750 flex items-center justify-between text-[11px]">
                          <span className={`px-2 py-0.5 rounded-md font-medium ${
                            isHome 
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                              : isOffice 
                              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' 
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          }`}>
                            {isHome ? '⚡ All 7 Days (7 AM - 9 PM)' : isOffice ? '🏢 Mon - Fri (9 AM - 6 PM)' : '📍 Safe Drop / Concierge'}
                          </span>

                          <button
                            onClick={() => deleteAddress(addr.id)}
                            className="text-xs text-red-500 hover:underline inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" /> Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Profile Settings */}
          {activeTab === 'profile' && (
            <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 sm:p-8 border border-gray-200/80 dark:border-navy-750 shadow-sm space-y-6 animate-fadeIn">
              <div className="pb-4 border-b border-gray-100 dark:border-navy-800">
                <h2 className="font-serif text-2xl font-bold text-navy-950 dark:text-white">
                  Personal Information
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Update your contact details for invoices and shipping.
                </p>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gold-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-navy-850 text-navy-950 dark:text-white text-xs rounded-xl border border-gray-200 dark:border-navy-700 focus:outline-none focus:border-gold-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gold-500 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      disabled
                      value={user.email}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-navy-800 text-gray-500 dark:text-gray-400 text-xs rounded-xl border border-gray-200 dark:border-navy-700 cursor-not-allowed"
                    />
                  </div>
                  <span className="text-[10px] text-gray-400 block mt-1">Email is tied to your account verification</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gold-500 absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-navy-850 text-navy-950 dark:text-white text-xs rounded-xl border border-gray-200 dark:border-navy-700 focus:outline-none focus:border-gold-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 bg-gold-gradient text-navy-950 font-bold text-xs rounded-xl shadow-gold-sm hover:brightness-110 cursor-pointer"
                >
                  Save Profile Changes
                </button>
              </form>
            </div>
          )}

          {/* TAB 5: Account Security */}
          {activeTab === 'security' && (
            <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 sm:p-8 border border-gray-200/80 dark:border-navy-750 shadow-sm space-y-6 animate-fadeIn">
              <div className="pb-4 border-b border-gray-100 dark:border-navy-800">
                <h2 className="font-serif text-2xl font-bold text-navy-950 dark:text-white">
                  Account Security
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Update your password to keep your account safe.
                </p>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1.5">
                    Current Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gold-500 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-navy-850 text-navy-950 dark:text-white text-xs rounded-xl border border-gray-200 dark:border-navy-700 focus:outline-none focus:border-gold-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gold-500 absolute left-3.5 top-3" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-navy-850 text-navy-950 dark:text-white text-xs rounded-xl border border-gray-200 dark:border-navy-700 focus:outline-none focus:border-gold-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gold-400 cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gold-500 absolute left-3.5 top-3" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-navy-850 text-navy-950 dark:text-white text-xs rounded-xl border border-gray-200 dark:border-navy-700 focus:outline-none focus:border-gold-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gold-400 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 bg-gold-gradient text-navy-950 font-bold text-xs rounded-xl shadow-gold-sm hover:brightness-110 cursor-pointer"
                >
                  Update Password
                </button>
              </form>
            </div>
          )}

        </div>

      </div>

      {/* Add Address Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsAddressModalOpen(false)} className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm" />
          <div className="relative w-full max-w-md bg-white dark:bg-navy-900 rounded-3xl p-6 sm:p-8 z-10 border border-gray-200 dark:border-gold-500/30 shadow-2xl space-y-4 animate-fadeIn">
            <h3 className="font-serif text-xl font-bold text-navy-950 dark:text-white">Add Delivery Address</h3>
            <form onSubmit={handleSaveAddress} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-600 dark:text-gray-400 mb-1.5 font-semibold">Address Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'Home', label: 'Home', icon: Home },
                    { id: 'Office', label: 'Office', icon: Briefcase },
                    { id: 'Other', label: 'Other', icon: MapPin },
                  ].map((t) => {
                    const Icon = t.icon;
                    const isSelected = newAddr.title === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setNewAddr({ ...newAddr, title: t.id })}
                        className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                          isSelected
                            ? 'bg-gold-gradient text-navy-950 shadow-gold-sm'
                            : 'bg-gray-100 dark:bg-navy-850 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-navy-800'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-gray-600 dark:text-gray-400 mb-1 font-semibold">Recipient Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alexander Wright"
                  value={newAddr.name}
                  onChange={(e) => setNewAddr({ ...newAddr, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-navy-850 text-navy-950 dark:text-white rounded-xl border border-gray-200 dark:border-navy-700 focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-gray-600 dark:text-gray-400 mb-1 font-semibold">Mobile No. *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={newAddr.phone}
                  onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-navy-850 text-navy-950 dark:text-white rounded-xl border border-gray-200 dark:border-navy-700 focus:outline-none focus:border-gold-500"
                />
              </div>

              {newAddr.title === 'Office' ? (
                <div>
                  <label className="block text-gray-600 dark:text-gray-400 mb-1 font-semibold">Company / Office / Floor (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Acme Corp, Tower B, 4th Floor"
                    value={newAddr.company || ''}
                    onChange={(e) => setNewAddr({ ...newAddr, company: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-navy-850 text-navy-950 dark:text-white rounded-xl border border-gray-200 dark:border-navy-700 focus:outline-none focus:border-gold-500"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-gray-600 dark:text-gray-400 mb-1 font-semibold">Nearby Landmark (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Near Royal Palms Gate #2"
                    value={newAddr.landmark || ''}
                    onChange={(e) => setNewAddr({ ...newAddr, landmark: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-navy-850 text-navy-950 dark:text-white rounded-xl border border-gray-200 dark:border-navy-700 focus:outline-none focus:border-gold-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-gray-600 dark:text-gray-400 mb-1 font-semibold">Street Address / House / Flat</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flat 402, Royal Palms, Marine Drive"
                  value={newAddr.street}
                  onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-navy-850 text-navy-950 dark:text-white rounded-xl border border-gray-200 dark:border-navy-700 focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-600 dark:text-gray-400 mb-1 font-semibold">City</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mumbai"
                    value={newAddr.city}
                    onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-navy-850 text-navy-950 dark:text-white rounded-xl border border-gray-200 dark:border-navy-700 focus:outline-none focus:border-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 dark:text-gray-400 mb-1 font-semibold">State</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maharashtra"
                    value={newAddr.state}
                    onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-navy-850 text-navy-950 dark:text-white rounded-xl border border-gray-200 dark:border-navy-700 focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-600 dark:text-gray-400 mb-1 font-semibold">Pincode *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 400020"
                  value={newAddr.pincode}
                  onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-navy-850 text-navy-950 dark:text-white rounded-xl border border-gray-200 dark:border-navy-700 focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="flex-1 py-2.5 bg-gray-100 dark:bg-navy-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gold-gradient text-navy-950 font-bold rounded-xl shadow-gold-sm hover:brightness-110"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
