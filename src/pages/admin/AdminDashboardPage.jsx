import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { formatINR } from '../../utils/currency';
import {
  ShieldCheck,
  TrendingUp,
  ShoppingBag,
  Package,
  AlertTriangle,
  History,
  Tag,
  KeyRound,
  LogOut,
  ExternalLink,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  User,
  MapPin,
  Sparkles,
  RefreshCw,
  Truck,
  Layers,
  Settings,
  Sliders,
  X,
  UploadCloud,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Logo } from '../../components/common/Logo';

export const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { admin, token, logout, changePassword } = useAdminAuth();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'products' | 'orders' | 'settings' | 'coupons' | 'audit' | 'profile'
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [siteSettings, setSiteSettings] = useState({
    announcementText: '10% Off on First Order | Use Code: WELCOME10',
    freeShippingThreshold: 999,
    heroBadge: 'NEW SEASON COLLECTION 2026',
    heroHeadline: 'Elevate Your Style. Define Your Comfort.',
    heroSubheadline: 'Discover the latest trends in fashion, electronics, and lifestyle. Premium products, best prices at A_S Commerce.',
    heroDiscount: '50% OFF',
  });
  const [loading, setLoading] = useState(true);

  // Search & Filters in Products
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');

  // Product Modal State (Add / Edit)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    brand: 'A_S Signature',
    category: 'accessories',
    categoryName: 'Accessories',
    price: '',
    originalPrice: '',
    discount: '',
    stockCount: 15,
    inStock: true,
    badge: '',
    description: '',
    image: '',
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  // Order Delivery Edit Modal
  const [editingOrder, setEditingOrder] = useState(null);
  const [orderDeliveryForm, setOrderDeliveryForm] = useState({
    status: 'Shipped',
    carrier: 'Bluedart Express',
    trackingNumber: '',
  });

  // Coupon Form State
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState('');
  const [newCouponMinOrder, setNewCouponMinOrder] = useState('');
  const [newCouponDesc, setNewCouponDesc] = useState('');
  const [couponSubmitting, setCouponSubmitting] = useState(false);

  // Settings Form State
  const [settingsSubmitting, setSettingsSubmitting] = useState(false);

  // Change Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passSubmitting, setPassSubmitting] = useState(false);

  const handleImageFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('/api/admin/upload-image', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        setProductForm((prev) => ({ ...prev, image: data.url }));
      }
    } catch (err) {
      console.error('Image upload failed', err);
    } finally {
      setUploadingImage(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, prodRes, ordersRes, couponsRes, auditRes, settingsRes] = await Promise.all([
        fetch('/api/admin/stats', { headers }),
        fetch('/api/admin/products', { headers }),
        fetch('/api/admin/orders', { headers }),
        fetch('/api/admin/coupons', { headers }),
        fetch('/api/admin/audit-logs', { headers }),
        fetch('/api/admin/settings', { headers }),
      ]);

      if (statsRes.ok) {
        const d = await statsRes.json();
        setStats(d.stats);
      }
      if (prodRes.ok) {
        const d = await prodRes.json();
        setProducts(d.products || []);
      }
      if (ordersRes.ok) {
        const d = await ordersRes.json();
        setOrders(d.orders || []);
      }
      if (couponsRes.ok) {
        const d = await couponsRes.json();
        setCoupons(d.coupons || []);
      }
      if (auditRes.ok) {
        const d = await auditRes.json();
        setAuditLogs(d.logs || []);
      }
      if (settingsRes.ok) {
        const d = await settingsRes.json();
        if (d.settings) setSiteSettings(d.settings);
      }
    } catch (err) {
      console.warn('Backend server offline, loading local dashboard cache');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  // Product Actions
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      brand: 'A_S Signature',
      category: 'men',
      categoryName: 'Men Fashion',
      price: '',
      originalPrice: '',
      discount: '',
      stockCount: 15,
      inStock: true,
      badge: 'NEW',
      description: '',
      image: '',
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      brand: product.brand,
      category: product.category,
      categoryName: product.categoryName,
      price: product.price,
      originalPrice: product.originalPrice || '',
      discount: product.discount || '',
      stockCount: product.stockCount !== undefined ? product.stockCount : 10,
      inStock: product.inStock !== false,
      badge: product.badge || '',
      description: product.description || '',
      image: product.images ? product.images[0] : (product.image || ''),
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const url = editingProduct
        ? `/api/admin/products/${editingProduct.id}`
        : '/api/admin/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productForm),
      });

      if (res.ok) {
        setIsProductModalOpen(false);
        fetchDashboardData();
      }
    } catch (err) {
      console.error('Save product error', err);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product from the live catalog?')) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error('Delete product error', err);
    }
  };

  // Order Delivery Update
  const handleOpenDeliveryModal = (order) => {
    setEditingOrder(order);
    setOrderDeliveryForm({
      status: order.status,
      carrier: order.carrier || 'Bluedart Express',
      trackingNumber: order.trackingNumber || `BD-${Math.floor(100000000 + Math.random() * 900000000)}IN`,
    });
  };

  const handleSaveOrderDelivery = async (e) => {
    e.preventDefault();
    if (!editingOrder) return;
    try {
      const res = await fetch(`/api/admin/orders/${editingOrder.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderDeliveryForm),
      });

      if (res.ok) {
        setEditingOrder(null);
        fetchDashboardData();
      }
    } catch (err) {
      console.error('Save order delivery error', err);
    }
  };

  // Save Website Sections Settings
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSettingsSubmitting(true);
    try {
      await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(siteSettings),
      });
      fetchDashboardData();
    } catch (err) {
      console.error('Save settings error', err);
    } finally {
      setSettingsSubmitting(false);
    }
  };

  // Coupons
  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!newCouponCode || !newCouponDesc) return;

    setCouponSubmitting(true);
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: newCouponCode,
          discountPercent: newCouponDiscount ? Number(newCouponDiscount) : null,
          minOrder: newCouponMinOrder ? Number(newCouponMinOrder) : 0,
          description: newCouponDesc,
        }),
      });

      if (res.ok) {
        setNewCouponCode('');
        setNewCouponDiscount('');
        setNewCouponMinOrder('');
        setNewCouponDesc('');
        fetchDashboardData();
      }
    } catch (err) {
      console.error('Create coupon error', err);
    } finally {
      setCouponSubmitting(false);
    }
  };

  const handleDeleteCoupon = async (code) => {
    try {
      const res = await fetch(`/api/admin/coupons/${code}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error('Delete coupon error', err);
    }
  };

  // Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassSubmitting(true);
    const result = await changePassword(currentPassword, newPassword, confirmPassword);
    setPassSubmitting(false);
    if (result.success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  // Filtered products list
  const filteredProducts = products.filter((p) => {
    if (productCategoryFilter !== 'all' && p.category !== productCategoryFilter) return false;
    if (productSearch) {
      const matchName = p.name.toLowerCase().includes(productSearch.toLowerCase());
      const matchBrand = p.brand.toLowerCase().includes(productSearch.toLowerCase());
      return matchName || matchBrand;
    }
    return true;
  });

  const renderSkeletonContent = () => {
    if (activeTab === 'overview') {
      return (
        <div className="space-y-8 animate-fadeIn">
          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-6 rounded-3xl bg-navy-900 border border-gold-500/10 shadow-xl space-y-4 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="h-3 w-24 bg-navy-800 rounded" />
                  <div className="w-10 h-10 rounded-2xl bg-navy-800" />
                </div>
                <div className="h-8 w-32 bg-navy-800 rounded" />
                <div className="h-3.5 w-28 bg-navy-800 rounded" />
              </div>
            ))}
          </div>

          {/* Quick Actions & Recent Orders Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 p-6 rounded-3xl bg-navy-900 border border-gold-500/10 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-navy-800 pb-3">
                <div className="h-5 w-48 bg-navy-800 rounded animate-pulse" />
                <div className="h-3 w-20 bg-navy-800 rounded animate-pulse" />
              </div>
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-navy-850 border border-navy-800 flex items-center justify-between gap-4 animate-pulse">
                    <div className="space-y-2">
                      <div className="h-3.5 w-16 bg-navy-800 rounded" />
                      <div className="h-3 w-24 bg-navy-800 rounded" />
                      <div className="h-2.5 w-32 bg-navy-800 rounded" />
                    </div>
                    <div className="text-right space-y-2">
                      <div className="h-4 w-20 bg-navy-800 rounded ml-auto" />
                      <div className="h-5 w-16 bg-navy-800 rounded-full ml-auto" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 p-6 rounded-3xl bg-navy-900 border border-gold-500/10 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-navy-800 pb-3">
                <div className="h-5 w-36 bg-navy-800 rounded animate-pulse" />
                <div className="h-3 w-16 bg-navy-800 rounded animate-pulse" />
              </div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="p-3 rounded-xl bg-navy-850 border border-navy-800 space-y-2 animate-pulse">
                    <div className="flex items-center justify-between">
                      <div className="h-3.5 w-24 bg-navy-800 rounded" />
                      <div className="h-2.5 w-10 bg-navy-800 rounded" />
                    </div>
                    <div className="h-3 w-full bg-navy-800 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'products' || activeTab === 'orders' || activeTab === 'coupons' || activeTab === 'audit') {
      const tabTitles = {
        products: 'Catalog & Product Management',
        orders: 'Customer Consignments & Orders',
        coupons: 'Discount Vouchers & Promotions',
        audit: 'Security Audit & Compliance Feed'
      };
      const tabSubtitles = {
        products: 'Add new luxury pieces, adjust pricing, manage live inventory, and modify badges.',
        orders: 'Track order fulfillment, print invoices, dispatch shipments, and manage statuses.',
        coupons: 'Generate new promotional voucher codes, apply minimum ordering caps, and delete old campaigns.',
        audit: 'Trace administrative signups, security credentials updates, modifications, and login events.'
      };

      return (
        <div className="p-6 sm:p-8 rounded-3xl bg-navy-900 border border-gold-500/10 shadow-xl space-y-6 animate-fadeIn">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-navy-800 pb-4">
            <div className="space-y-2">
              <div className="h-6 w-56 bg-navy-800 rounded animate-pulse" />
              <div className="h-3.5 w-80 bg-navy-800 rounded animate-pulse" />
            </div>
            {activeTab === 'products' && (
              <div className="h-10 w-36 bg-navy-850 rounded-xl animate-pulse" />
            )}
          </div>

          {/* Search/Filters Skeleton */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="h-10 flex-1 bg-navy-850 rounded-xl border border-navy-700 animate-pulse" />
            <div className="h-10 w-40 bg-navy-850 rounded-xl border border-navy-700 animate-pulse" />
          </div>

          {/* Table List Skeleton */}
          <div className="overflow-x-auto space-y-3">
            <div className="h-10 bg-navy-950 rounded-t-xl animate-pulse flex items-center px-4 justify-between">
              <div className="h-3 w-16 bg-navy-800 rounded" />
              <div className="h-3 w-24 bg-navy-800 rounded" />
              <div className="h-3 w-16 bg-navy-800 rounded" />
              <div className="h-3 w-16 bg-navy-800 rounded" />
            </div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="p-4 bg-navy-850 border border-navy-800 rounded-xl flex items-center justify-between gap-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-navy-800 shrink-0" />
                  <div className="space-y-1.5">
                    <div className="h-3.5 w-40 bg-navy-800 rounded" />
                    <div className="h-2.5 w-20 bg-navy-800 rounded" />
                  </div>
                </div>
                <div className="h-3.5 w-24 bg-navy-800 rounded" />
                <div className="h-3.5 w-16 bg-navy-800 rounded" />
                <div className="h-8 w-16 bg-navy-850 rounded-lg border border-navy-800" />
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Fallback or simple section loader for Profile and Settings
    return (
      <div className="p-8 rounded-3xl bg-navy-900 border border-gold-500/10 shadow-xl flex flex-col items-center justify-center space-y-4 animate-pulse">
        <div className="w-12 h-12 rounded-full bg-navy-850 border border-navy-700 animate-spin border-t-gold-500" />
        <div className="h-4 w-32 bg-navy-850 rounded" />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-navy-950 text-white selection:bg-gold-500/30 flex flex-col font-sans">
      
      {/* Top Admin Header */}
      <header className="bg-navy-900 border-b border-gold-500/20 px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Logo size="small" />
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-gold-500/10 border border-gold-500/30 rounded-full text-gold-400 text-xs font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Master Control & Logistics Suite</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-gold-400 font-medium px-3 py-1.5 rounded-xl hover:bg-navy-800 transition-colors"
          >
            <span>Live Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <div className="h-4 w-px bg-navy-750 hidden sm:block" />

          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <p className="text-xs font-bold text-white leading-tight">{admin?.name || 'Alexander Sterling'}</p>
              <p className="text-[10px] font-mono text-gold-400">Master Administrator</p>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-navy-800 hover:bg-red-900/40 text-gray-300 hover:text-red-300 border border-navy-700 hover:border-red-500/40 transition-all flex items-center gap-1.5 text-xs cursor-pointer"
              title="Logout from Admin Portal"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-navy-800">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'products', label: `Catalog & Products (${products.length})`, icon: Package },
            { id: 'orders', label: `Orders & Delivery (${orders.length})`, icon: ShoppingBag },
            { id: 'settings', label: 'Website Sections', icon: Sliders },
            { id: 'coupons', label: `Vouchers (${coupons.length})`, icon: Tag },
            { id: 'audit', label: `Security Audit Trail (${auditLogs.length})`, icon: History },
            { id: 'profile', label: 'Admin Security', icon: KeyRound },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-gold-gradient text-navy-950 shadow-gold-sm'
                    : 'bg-navy-900 text-gray-300 hover:bg-navy-850 hover:text-white border border-navy-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}

          <button
            onClick={fetchDashboardData}
            className="ml-auto p-2.5 rounded-xl bg-navy-900 text-gray-400 hover:text-gold-400 border border-navy-800 transition-colors"
            title="Refresh Real-Time Telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loading && !stats ? (
          renderSkeletonContent()
        ) : (
          <>
            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="p-6 rounded-3xl bg-navy-900 border border-gold-500/20 shadow-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Gross Sales</span>
                  <div className="w-10 h-10 rounded-2xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="font-serif text-3xl font-bold text-white">
                  {formatINR(stats?.totalRevenue || 2249)}
                </h3>
                <span className="text-[11px] text-green-400 font-medium">✓ Razorpay Verified Revenue</span>
              </div>

              <div className="p-6 rounded-3xl bg-navy-900 border border-gold-500/20 shadow-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Total Consignments</span>
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="font-serif text-3xl font-bold text-white">
                  {orders.length} Orders
                </h3>
                <span className="text-[11px] text-gold-400 font-medium">● Live Carrier Integration</span>
              </div>

              <div className="p-6 rounded-3xl bg-navy-900 border border-gold-500/20 shadow-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Catalog Inventory</span>
                  <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <Package className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="font-serif text-3xl font-bold text-white">
                  {products.length} Products
                </h3>
                <span className="text-[11px] text-gray-400 font-medium">Across 7 Main Departments</span>
              </div>

              <div className="p-6 rounded-3xl bg-navy-900 border border-gold-500/20 shadow-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Security State</span>
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="font-serif text-xl font-bold text-emerald-400">
                  Protected (1/1 Lock)
                </h3>
                <span className="text-[11px] text-gray-400 font-medium">Single-Admin Enforced</span>
              </div>
            </div>

            {/* Quick Actions & Recent Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 p-6 rounded-3xl bg-navy-900 border border-gold-500/20 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-navy-800 pb-3">
                  <h4 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-gold-400" />
                    <span>Recent Customer Consignments</span>
                  </h4>
                  <button onClick={() => setActiveTab('orders')} className="text-xs text-gold-400 hover:underline font-semibold">
                    Manage Orders →
                  </button>
                </div>

                <div className="space-y-3">
                  {orders.slice(0, 4).map((order) => (
                    <div key={order.id} className="p-4 rounded-2xl bg-navy-850 border border-navy-800 flex items-center justify-between gap-4">
                      <div>
                        <span className="text-xs font-mono font-bold text-gold-400">#{order.id}</span>
                        <p className="text-xs text-white font-medium mt-0.5">{order.shippingAddress?.name}</p>
                        <span className="text-[10px] text-gray-400">{order.date} • {order.carrier}</span>
                      </div>
                      <div className="text-right space-y-1">
                        <span className="text-xs font-bold text-white block">{formatINR(order.total)}</span>
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gold-500/20 text-gold-400 border border-gold-500/30">
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5 p-6 rounded-3xl bg-navy-900 border border-gold-500/20 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-navy-800 pb-3">
                  <h4 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                    <History className="w-5 h-5 text-gold-400" />
                    <span>Security Audit Feed</span>
                  </h4>
                  <button onClick={() => setActiveTab('audit')} className="text-xs text-gold-400 hover:underline font-semibold">
                    Full Log →
                  </button>
                </div>

                <div className="space-y-2.5">
                  {auditLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="p-3 rounded-xl bg-navy-850 border border-navy-800 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gold-400">{log.action}</span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-300">{log.details || log.resource}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS CATALOG MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-navy-900 border border-gold-500/20 shadow-xl space-y-6 animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-navy-800 pb-4">
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
                  Catalog & Product Management
                </h3>
                <p className="text-xs text-gray-400">
                  Add new luxury pieces, adjust pricing, manage live inventory, and modify badges.
                </p>
              </div>

              <button
                onClick={handleOpenAddProduct}
                className="flex items-center gap-2 px-5 py-2.5 bg-gold-gradient text-navy-950 font-bold text-xs rounded-xl shadow-gold-sm hover:brightness-105 transition-all w-max cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Add New Product</span>
              </button>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search products by title or brand..."
                  className="w-full pl-10 pr-4 py-2.5 bg-navy-850 text-white placeholder-gray-500 text-xs rounded-xl border border-navy-700 focus:border-gold-500"
                />
              </div>

              <select
                value={productCategoryFilter}
                onChange={(e) => setProductCategoryFilter(e.target.value)}
                className="px-4 py-2.5 bg-navy-850 text-gold-400 rounded-xl border border-navy-700 text-xs font-semibold focus:border-gold-500 cursor-pointer"
              >
                <option value="all">All Departments</option>
                <option value="men">Men Fashion</option>
                <option value="women">Women Fashion</option>
                <option value="electronics">Electronics</option>
                <option value="home-living">Home & Living</option>
                <option value="beauty">Beauty & Fragrance</option>
                <option value="accessories">Accessories</option>
                <option value="footwear">Footwear</option>
              </select>
            </div>

            {/* Products Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-navy-950 text-gray-400 font-mono text-[11px] uppercase border-b border-navy-800">
                  <tr>
                    <th className="p-3.5">Item</th>
                    <th className="p-3.5">Department</th>
                    <th className="p-3.5">Price</th>
                    <th className="p-3.5">Stock</th>
                    <th className="p-3.5">Badge</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-800">
                  {filteredProducts.map((prod) => (
                    <tr key={prod.id} className="hover:bg-navy-850/50 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.images ? prod.images[0] : prod.image}
                            alt={prod.name}
                            className="w-10 h-10 rounded-xl object-cover border border-navy-700 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-white block">{prod.name}</span>
                            <span className="text-[10px] text-gray-400">{prod.brand}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 font-medium text-gray-300">{prod.categoryName}</td>
                      <td className="p-3.5 font-bold text-gold-400 font-mono">{formatINR(prod.price)}</td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${prod.stockCount <= 5 ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-green-500/20 text-green-400 border border-green-500/30'}`}>
                          {prod.stockCount} in Stock
                        </span>
                      </td>
                      <td className="p-3.5">
                        {prod.badge && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-gold-500/20 text-gold-400 border border-gold-500/30">
                            {prod.badge}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEditProduct(prod)}
                          className="p-1.5 text-gray-300 hover:text-gold-400 hover:bg-navy-800 rounded-lg transition-colors cursor-pointer"
                          title="Edit Product"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod.id)}
                          className="p-1.5 text-gray-300 hover:text-red-400 hover:bg-navy-800 rounded-lg transition-colors cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ORDERS & DELIVERY LOGISTICS */}
        {activeTab === 'orders' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-navy-900 border border-gold-500/20 shadow-xl space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-navy-800 pb-4">
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                  <Truck className="w-6 h-6 text-gold-400" />
                  <span>Order Fulfillment & Delivery Logistics</span>
                </h3>
                <p className="text-xs text-gray-400">
                  Update delivery stages, carrier tracking numbers, and address dossiers.
                </p>
              </div>
              <span className="text-xs font-mono text-gold-400 bg-gold-500/10 px-3 py-1 rounded-full border border-gold-500/30 w-max">
                {orders.length} Total Shipments
              </span>
            </div>

            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="p-5 rounded-2xl bg-navy-850 border border-navy-800 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-navy-800 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold font-mono text-gold-400">Order #{order.id}</span>
                        <span className="text-xs text-gray-400">• {order.date}</span>
                      </div>
                      <p className="text-xs text-gray-300 mt-0.5">
                        Client: <strong className="text-white">{order.shippingAddress?.name}</strong> ({order.shippingAddress?.phone})
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-serif font-bold text-white">{formatINR(order.total)}</span>
                      
                      <button
                        onClick={() => handleOpenDeliveryModal(order)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gold-gradient text-navy-950 font-bold text-xs shadow-gold-sm hover:brightness-105 cursor-pointer"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Update Delivery ({order.status})</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-300">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Destination Address</span>
                      <p className="leading-relaxed">
                        {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Carrier Details</span>
                      <p className="leading-relaxed">
                        Carrier: <strong className="text-white">{order.carrier}</strong> | Waybill Tracking: <span className="font-mono text-gold-400">{order.trackingNumber}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: WEBSITE SECTIONS & CONTENT CUSTOMIZER */}
        {activeTab === 'settings' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-navy-900 border border-gold-500/20 shadow-xl space-y-6 animate-fadeIn">
            <div className="border-b border-navy-800 pb-4">
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <Sliders className="w-6 h-6 text-gold-400" />
                <span>Website Sections & Content Customizer</span>
              </h3>
              <p className="text-xs text-gray-400">
                Change announcement promo bar, hero headlines, discount badges, and store contact info.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6 text-xs max-w-2xl">
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gold-400 uppercase tracking-widest border-b border-navy-800 pb-2">
                  1. Announcement Bar
                </h4>
                <div>
                  <label className="block font-semibold text-gray-300 mb-1">Top Promo Announcement Text</label>
                  <input
                    type="text"
                    value={siteSettings.announcementText}
                    onChange={(e) => setSiteSettings({ ...siteSettings, announcementText: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-navy-850 text-white rounded-xl border border-navy-700 focus:border-gold-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-300 mb-1">Free Shipping Order Threshold (₹)</label>
                  <input
                    type="number"
                    value={siteSettings.freeShippingThreshold}
                    onChange={(e) => setSiteSettings({ ...siteSettings, freeShippingThreshold: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-navy-850 text-white rounded-xl border border-navy-700 focus:border-gold-500"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gold-400 uppercase tracking-widest border-b border-navy-800 pb-2">
                  2. Hero Banner Section
                </h4>
                <div>
                  <label className="block font-semibold text-gray-300 mb-1">Hero Pill Badge</label>
                  <input
                    type="text"
                    value={siteSettings.heroBadge}
                    onChange={(e) => setSiteSettings({ ...siteSettings, heroBadge: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-navy-850 text-white rounded-xl border border-navy-700 focus:border-gold-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-300 mb-1">Main Hero Headline</label>
                  <input
                    type="text"
                    value={siteSettings.heroHeadline}
                    onChange={(e) => setSiteSettings({ ...siteSettings, heroHeadline: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-navy-850 text-white rounded-xl border border-navy-700 focus:border-gold-500 font-serif text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-300 mb-1">Hero Subheadline</label>
                  <textarea
                    rows={2}
                    value={siteSettings.heroSubheadline}
                    onChange={(e) => setSiteSettings({ ...siteSettings, heroSubheadline: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-navy-850 text-white rounded-xl border border-navy-700 focus:border-gold-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-300 mb-1">Circular Badge Discount Text</label>
                  <input
                    type="text"
                    value={siteSettings.heroDiscount}
                    onChange={(e) => setSiteSettings({ ...siteSettings, heroDiscount: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-navy-850 text-white rounded-xl border border-navy-700 focus:border-gold-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={settingsSubmitting}
                className="w-full py-3.5 bg-gold-gradient text-navy-950 font-bold rounded-xl shadow-gold-sm hover:brightness-105 transition-all cursor-pointer disabled:opacity-50"
              >
                <span>{settingsSubmitting ? 'Saving Website Changes...' : 'Save & Publish Live Changes'}</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 5: COUPONS & PROMOTIONS */}
        {activeTab === 'coupons' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
            <div className="lg:col-span-5 p-6 rounded-3xl bg-navy-900 border border-gold-500/20 shadow-xl space-y-5">
              <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-gold-400" />
                <span>Create New Promo Voucher</span>
              </h3>

              <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-gray-300 mb-1">Voucher Code</label>
                  <input
                    type="text"
                    required
                    value={newCouponCode}
                    onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                    placeholder="e.g. LUXURY25"
                    className="w-full px-3.5 py-2.5 bg-navy-850 text-white font-mono rounded-xl border border-navy-700 focus:border-gold-500 uppercase"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-300 mb-1">Discount (%)</label>
                    <input
                      type="number"
                      value={newCouponDiscount}
                      onChange={(e) => setNewCouponDiscount(e.target.value)}
                      placeholder="e.g. 25"
                      className="w-full px-3.5 py-2.5 bg-navy-850 text-white rounded-xl border border-navy-700 focus:border-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-300 mb-1">Min Order (₹)</label>
                    <input
                      type="number"
                      value={newCouponMinOrder}
                      onChange={(e) => setNewCouponMinOrder(e.target.value)}
                      placeholder="e.g. 2999"
                      className="w-full px-3.5 py-2.5 bg-navy-850 text-white rounded-xl border border-navy-700 focus:border-gold-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-300 mb-1">Promotion Description</label>
                  <input
                    type="text"
                    required
                    value={newCouponDesc}
                    onChange={(e) => setNewCouponDesc(e.target.value)}
                    placeholder="e.g. 25% Off on Summer Luxury Collection"
                    className="w-full px-3.5 py-2.5 bg-navy-850 text-white rounded-xl border border-navy-700 focus:border-gold-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={couponSubmitting}
                  className="w-full py-3 bg-gold-gradient text-navy-950 font-bold rounded-xl shadow-gold-sm hover:brightness-105 transition-all cursor-pointer disabled:opacity-50"
                >
                  <span>{couponSubmitting ? 'Issuing Voucher...' : 'Publish Voucher Code'}</span>
                </button>
              </form>
            </div>

            <div className="lg:col-span-7 p-6 rounded-3xl bg-navy-900 border border-gold-500/20 shadow-xl space-y-4">
              <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2 border-b border-navy-800 pb-3">
                <Tag className="w-5 h-5 text-gold-400" />
                <span>Active Store Coupons</span>
              </h3>

              <div className="space-y-3">
                {coupons.map((coupon) => (
                  <div key={coupon.code} className="p-4 rounded-2xl bg-navy-850 border border-navy-800 flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-gold-400 bg-navy-950 px-2.5 py-0.5 rounded-lg border border-gold-500/30">
                          {coupon.code}
                        </span>
                        <span className="text-xs font-bold text-green-400">
                          {coupon.discountPercent ? `${coupon.discountPercent}% OFF` : `₹${coupon.discountAmount} OFF`}
                        </span>
                      </div>
                      <p className="text-xs text-gray-300 mt-1">{coupon.description}</p>
                    </div>

                    <button
                      onClick={() => handleDeleteCoupon(coupon.code)}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-navy-800 rounded-xl transition-colors cursor-pointer"
                      title="Delete Coupon"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: SECURITY AUDIT LOG */}
        {activeTab === 'audit' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-navy-900 border border-gold-500/20 shadow-xl space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-navy-800 pb-4">
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-gold-400" />
                  <span>Immutable Security Audit Trail</span>
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Chronological record of all administrative logins, product edits, delivery status changes, and site updates.
                </p>
              </div>
              <span className="text-xs font-mono text-gold-400 bg-gold-500/10 px-3 py-1 rounded-full border border-gold-500/30 w-max">
                {auditLogs.length} Logged Events
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-navy-950 text-gray-400 font-mono text-[11px] uppercase border-b border-navy-800">
                  <tr>
                    <th className="p-3.5">Timestamp</th>
                    <th className="p-3.5">Security Action</th>
                    <th className="p-3.5">Actor / ID</th>
                    <th className="p-3.5">Event Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-800">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-navy-850/60 transition-colors">
                      <td className="p-3.5 font-mono text-[11px] text-gray-400 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="p-3.5 font-bold text-gold-400 whitespace-nowrap">
                        {log.action}
                      </td>
                      <td className="p-3.5 font-mono text-gray-300 whitespace-nowrap">
                        {log.adminEmail || log.adminId || 'System Auth'}
                      </td>
                      <td className="p-3.5 text-gray-300">
                        {log.details || log.resource || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 7: ADMIN PROFILE & MASTER PASSWORD */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-fadeIn">
            <div className="md:col-span-5 p-6 rounded-3xl bg-navy-900 border border-gold-500/20 shadow-xl space-y-6">
              <div className="text-center space-y-3">
                <div className="w-20 h-20 rounded-full bg-navy-800 border-2 border-gold-500/40 mx-auto flex items-center justify-center shadow-gold-sm">
                  <ShieldCheck className="w-10 h-10 text-gold-400" />
                </div>
                <div>
                  <h4 className="font-serif text-xl font-bold text-white">{admin?.name}</h4>
                  <p className="text-xs font-mono text-gold-400">{admin?.email}</p>
                </div>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-navy-800 text-xs">
                <div className="flex justify-between py-1.5 border-b border-navy-800/60">
                  <span className="text-gray-400">Assigned Role:</span>
                  <span className="font-bold text-gold-400 uppercase">Master Administrator</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-navy-800/60">
                  <span className="text-gray-400">Account Status:</span>
                  <span className="font-bold text-green-400">Active (1/1 Single-Admin Lock)</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-400">Authorization Level:</span>
                  <span className="font-mono text-gray-300">Root / Full Store Control</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-7 p-6 rounded-3xl bg-navy-900 border border-gold-500/20 shadow-xl space-y-5">
              <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2 border-b border-navy-800 pb-3">
                <KeyRound className="w-5 h-5 text-gold-400" />
                <span>Update Master Admin Password</span>
              </h3>

              <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-gray-300 mb-1">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPass ? 'text' : 'password'}
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-3.5 pr-10 py-2.5 bg-navy-850 text-white rounded-xl border border-navy-700 focus:border-gold-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gold-400 transition-colors cursor-pointer p-0.5"
                      title={showCurrentPass ? 'Hide password' : 'Show password'}
                    >
                      {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-300 mb-1">New Master Password (min 8 chars)</label>
                  <div className="relative">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-3.5 pr-10 py-2.5 bg-navy-850 text-white rounded-xl border border-navy-700 focus:border-gold-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gold-400 transition-colors cursor-pointer p-0.5"
                      title={showNewPass ? 'Hide password' : 'Show password'}
                    >
                      {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-300 mb-1">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPass ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-3.5 pr-10 py-2.5 bg-navy-850 text-white rounded-xl border border-navy-700 focus:border-gold-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gold-400 transition-colors cursor-pointer p-0.5"
                      title={showConfirmPass ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={passSubmitting}
                  className="w-full py-3 bg-gold-gradient text-navy-950 font-bold rounded-xl shadow-gold-sm hover:brightness-105 transition-all cursor-pointer disabled:opacity-50"
                >
                  <span>{passSubmitting ? 'Updating Master Password...' : 'Save New Password'}</span>
                </button>
              </form>
            </div>
          </div>
        )}
          </>
        )}

      </div>

      {/* PRODUCT ADD / EDIT MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none animate-fadeIn">
          <div onClick={() => setIsProductModalOpen(false)} className="fixed inset-0 bg-navy-950/80 backdrop-blur-md" />
          <div className="relative w-full max-w-2xl bg-navy-900 border border-gold-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <h3 className="font-serif text-lg font-bold text-white">
                {editingProduct ? 'Edit Catalog Product' : 'Add New Luxury Product'}
              </h3>
              <button onClick={() => setIsProductModalOpen(false)} className="p-1.5 text-gray-400 hover:text-white rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-300 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="e.g. Royal Chronograph Gold Wristwatch"
                  className="w-full px-3.5 py-2.5 bg-navy-850 text-white rounded-xl border border-navy-700 focus:border-gold-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-300 mb-1">Brand Name</label>
                  <input
                    type="text"
                    required
                    value={productForm.brand}
                    onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                    placeholder="e.g. A_S Signature"
                    className="w-full px-3.5 py-2.5 bg-navy-850 text-white rounded-xl border border-navy-700 focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-300 mb-1">Department / Category</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => {
                      const cat = e.target.value;
                      const catNames = { men: 'Men Fashion', women: 'Women Fashion', electronics: 'Electronics', 'home-living': 'Home & Living', beauty: 'Beauty', accessories: 'Accessories', footwear: 'Footwear' };
                      setProductForm({ ...productForm, category: cat, categoryName: catNames[cat] || cat });
                    }}
                    className="w-full px-3.5 py-2.5 bg-navy-850 text-white rounded-xl border border-navy-700 focus:border-gold-500"
                  >
                    <option value="men">Men Fashion</option>
                    <option value="women">Women Fashion</option>
                    <option value="electronics">Electronics</option>
                    <option value="home-living">Home & Living</option>
                    <option value="beauty">Beauty & Fragrance</option>
                    <option value="accessories">Accessories</option>
                    <option value="footwear">Footwear</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-300 mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    placeholder="2499"
                    className="w-full px-3.5 py-2.5 bg-navy-850 text-white rounded-xl border border-navy-700 focus:border-gold-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-300 mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    value={productForm.originalPrice}
                    onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value })}
                    placeholder="4999"
                    className="w-full px-3.5 py-2.5 bg-navy-850 text-white rounded-xl border border-navy-700 focus:border-gold-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-300 mb-1">Discount (%)</label>
                  <input
                    type="number"
                    value={productForm.discount}
                    onChange={(e) => setProductForm({ ...productForm, discount: e.target.value })}
                    placeholder="50"
                    className="w-full px-3.5 py-2.5 bg-navy-850 text-white rounded-xl border border-navy-700 focus:border-gold-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-300 mb-1">Inventory Quantity</label>
                  <input
                    type="number"
                    value={productForm.stockCount}
                    onChange={(e) => setProductForm({ ...productForm, stockCount: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-navy-850 text-white rounded-xl border border-navy-700 focus:border-gold-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-300 mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={productForm.badge}
                    onChange={(e) => setProductForm({ ...productForm, badge: e.target.value })}
                    placeholder="e.g. BESTSELLER / 50% OFF"
                    className="w-full px-3.5 py-2.5 bg-navy-850 text-white rounded-xl border border-navy-700 focus:border-gold-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-300 mb-1">
                  Product Image (Cloudinary CDN Upload or URL)
                </label>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-navy-800 hover:bg-navy-750 text-gold-400 border border-gold-500/30 text-xs font-semibold cursor-pointer transition-colors shrink-0">
                      <UploadCloud className={`w-4 h-4 ${uploadingImage ? 'animate-bounce' : ''}`} />
                      <span>{uploadingImage ? 'Uploading to Cloudinary...' : 'Upload File to Cloudinary'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingImage}
                        onChange={handleImageFileUpload}
                        className="hidden"
                      />
                    </label>
                    
                    <span className="text-[11px] text-gray-400">or paste URL:</span>
                  </div>

                  <input
                    type="url"
                    value={productForm.image}
                    onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                    placeholder="https://res.cloudinary.com/... or https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2.5 bg-navy-850 text-white rounded-xl border border-navy-700 focus:border-gold-500 text-xs"
                  />

                  {productForm.image && (
                    <div className="flex items-center gap-3 p-2 rounded-xl bg-navy-950/60 border border-navy-800">
                      <img
                        src={productForm.image}
                        alt="Preview"
                        className="w-12 h-12 rounded-lg object-cover border border-gold-500/30"
                      />
                      <div className="text-[11px] text-gray-300 truncate">
                        <span className="text-green-400 font-semibold block">✓ Image Ready</span>
                        <span className="text-gray-400 truncate block max-w-xs">{productForm.image}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-300 mb-1">Bespoke Product Description</label>
                <textarea
                  rows={3}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Write description with luxury materials, craftsmanship..."
                  className="w-full px-3.5 py-2.5 bg-navy-850 text-white rounded-xl border border-navy-700 focus:border-gold-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gold-gradient text-navy-950 font-bold rounded-xl shadow-gold-sm hover:brightness-105 transition-all cursor-pointer"
              >
                <span>{editingProduct ? 'Save Product Changes' : 'Create & Add to Catalog'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ORDER DELIVERY EDIT MODAL */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none animate-fadeIn">
          <div onClick={() => setEditingOrder(null)} className="fixed inset-0 bg-navy-950/80 backdrop-blur-md" />
          <div className="relative w-full max-w-md bg-navy-900 border border-gold-500/30 rounded-3xl p-6 shadow-2xl z-10 space-y-5">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <div>
                <h3 className="font-serif text-base font-bold text-white">
                  Update Logistics for Order #{editingOrder.id}
                </h3>
                <p className="text-xs text-gray-400">Recipient: {editingOrder.shippingAddress?.name}</p>
              </div>
              <button onClick={() => setEditingOrder(null)} className="p-1 text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOrderDelivery} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-300 mb-1">Delivery Stage Status</label>
                <select
                  value={orderDeliveryForm.status}
                  onChange={(e) => setOrderDeliveryForm({ ...orderDeliveryForm, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-navy-850 text-gold-400 font-bold rounded-xl border border-navy-700 focus:border-gold-500"
                >
                  <option value="Order Placed">1. Order Placed</option>
                  <option value="Payment Confirmed">2. Payment Confirmed</option>
                  <option value="Processing">3. Processing & Quality Check</option>
                  <option value="Shipped">4. Shipped (In Transit)</option>
                  <option value="Out for Delivery">5. Out for Delivery</option>
                  <option value="Delivered">6. Delivered</option>
                  <option value="Cancelled">Cancelled / Refunded</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-300 mb-1">Carrier Partner</label>
                <input
                  type="text"
                  required
                  value={orderDeliveryForm.carrier}
                  onChange={(e) => setOrderDeliveryForm({ ...orderDeliveryForm, carrier: e.target.value })}
                  placeholder="e.g. Bluedart Express / Delhivery"
                  className="w-full px-3.5 py-2.5 bg-navy-850 text-white rounded-xl border border-navy-700 focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-300 mb-1">Carrier Tracking / AWB Number</label>
                <input
                  type="text"
                  required
                  value={orderDeliveryForm.trackingNumber}
                  onChange={(e) => setOrderDeliveryForm({ ...orderDeliveryForm, trackingNumber: e.target.value })}
                  placeholder="e.g. BD-889021482IN"
                  className="w-full px-3.5 py-2.5 bg-navy-850 text-white font-mono rounded-xl border border-navy-700 focus:border-gold-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gold-gradient text-navy-950 font-bold rounded-xl shadow-gold-sm hover:brightness-105 transition-all cursor-pointer"
              >
                <span>Save & Update Logistics Milestone</span>
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
