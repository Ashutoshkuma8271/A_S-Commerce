import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useToast } from '../../context/ToastContext';
import { supabase } from '../../lib/supabase';
import { formatINR } from '../../utils/currency';
import { Logo } from '../../components/common/Logo';
import { ThemeToggle } from '../../components/common/ThemeToggle';
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
  CheckCircle,
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
  Phone,
  Mail,
  MessageSquare,
  Printer,
  Download,
  ChevronRight,
  Copy,
  Check,
  FileText,
  ArrowRight,
  Calendar,
  DollarSign,
  CreditCard,
  Send,
  Navigation,
  Box,
  CircleDot,
} from 'lucide-react';
export const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { admin, token, logout, changePassword } = useAdminAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'products' | 'orders' | 'customers' | 'settings' | 'coupons' | 'audit' | 'profile'
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
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

  // Search & Filters in Orders
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderSortBy, setOrderSortBy] = useState('newest'); // 'newest' | 'oldest' | 'highest' | 'lowest'

  // Search & Filters in Customers
  const [customerSearch, setCustomerSearch] = useState('');

  // Selected Order Dossier (Full Details & Printable Invoice Modal)
  const [selectedOrderDossier, setSelectedOrderDossier] = useState(null);
  const [copiedText, setCopiedText] = useState('');

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
    note: '',
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
    addToast('Uploading product media to CDN...', 'info', 2000);
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
        addToast('Media uploaded successfully', 'success', 2500, { desc: 'Media asset synchronized securely.' });
      } else {
        addToast(data.message || 'Image upload failed', 'error');
      }
    } catch (err) {
      console.error('Image upload failed', err);
      addToast('Failed to upload image. Please retry.', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const dashboardFetchGenRef = React.useRef(0);
  const isFetchingDashboardRef = React.useRef(false);

  const fetchDashboardData = async (isManualRefresh = false) => {
    if (isFetchingDashboardRef.current && !isManualRefresh) return;
    isFetchingDashboardRef.current = true;
    const currentGen = ++dashboardFetchGenRef.current;

    try {
      if (isManualRefresh) setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, prodRes, ordersRes, custRes, couponsRes, auditRes, settingsRes] = await Promise.all([
        fetch('/api/admin/stats', { headers }),
        fetch('/api/admin/products', { headers }),
        fetch('/api/admin/orders', { headers }),
        fetch('/api/admin/customers', { headers }),
        fetch('/api/admin/coupons', { headers }),
        fetch('/api/admin/audit-logs', { headers }),
        fetch('/api/admin/settings', { headers }),
      ]);

      if (currentGen !== dashboardFetchGenRef.current) return;

      if (statsRes.ok) {
        const d = await statsRes.json();
        if (currentGen === dashboardFetchGenRef.current) setStats(d.stats);
      }
      if (prodRes.ok) {
        const d = await prodRes.json();
        if (currentGen === dashboardFetchGenRef.current) setProducts(d.products || []);
      }
      if (ordersRes.ok) {
        const d = await ordersRes.json();
        if (currentGen === dashboardFetchGenRef.current) setOrders(d.orders || []);
      }
      if (custRes.ok) {
        const d = await custRes.json();
        if (currentGen === dashboardFetchGenRef.current) setCustomers(d.customers || []);
      }
      if (couponsRes.ok) {
        const d = await couponsRes.json();
        if (currentGen === dashboardFetchGenRef.current) setCoupons(d.coupons || []);
      }
      if (auditRes.ok) {
        const d = await auditRes.json();
        if (currentGen === dashboardFetchGenRef.current) setAuditLogs(d.logs || []);
      }
      if (settingsRes.ok) {
        const d = await settingsRes.json();
        if (currentGen === dashboardFetchGenRef.current && d.settings) setSiteSettings(d.settings);
      }
      if (isManualRefresh) {
        addToast('Dashboard data refreshed', 'success', 2000, { desc: 'All live catalog & logistics metrics updated.' });
      }
    } catch (err) {
      console.warn('Backend server offline, loading local dashboard cache');
      if (isManualRefresh) {
        addToast('Offline mode active - showing cached metrics', 'warning');
      }
    } finally {
      isFetchingDashboardRef.current = false;
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(true);
  }, [token]);

  // Realtime Supabase Multi-Table Subscriptions & Polling for Admin Control Center
  useEffect(() => {
    if (!token) return;

    const pollInterval = window.setInterval(() => {
      fetchDashboardData();
    }, 10000);

    const channel = supabase
      .channel('admin:realtime:all')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchDashboardData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        fetchDashboardData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, () => {
        fetchDashboardData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'coupons' }, () => {
        fetchDashboardData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'audit_logs' }, () => {
        fetchDashboardData();
      })
      .subscribe();

    return () => {
      window.clearInterval(pollInterval);
      supabase.removeChannel(channel);
    };
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
      const isEditing = !!editingProduct;
      const url = isEditing
        ? `/api/admin/products/${editingProduct.id}`
        : '/api/admin/products';
      const method = isEditing ? 'PUT' : 'POST';

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
        addToast(
          isEditing ? 'Product updated successfully' : 'Product published to live catalog',
          'success',
          3000,
          { desc: `${productForm.name} is now live across the storefront.` }
        );
        fetchDashboardData();
      } else {
        const errData = await res.json().catch(() => ({}));
        addToast(errData.message || 'Failed to save product', 'error');
      }
    } catch (err) {
      console.error('Save product error', err);
      addToast('An error occurred while saving product', 'error');
    }
  };

  const handleDeleteProduct = async (id) => {
    const product = products.find(p => p.id === id);
    if (!window.confirm(`Are you sure you want to delete "${product?.name || 'this item'}" from the catalog?`)) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        addToast('Product removed from catalog', 'success', 2500, { desc: `${product?.name || 'Item'} was permanently archived.` });
        fetchDashboardData();
      } else {
        addToast('Failed to delete product', 'error');
      }
    } catch (err) {
      console.error('Delete product error', err);
      addToast('Failed to delete product', 'error');
    }
  };

  // Order Delivery & Progression Update
  const handleOpenDeliveryModal = (order) => {
    setEditingOrder(order);
    setOrderDeliveryForm({
      status: order.status || 'Shipped',
      carrier: order.carrier || 'Bluedart Express',
      trackingNumber: order.trackingNumber || `BD-${Math.floor(100000000 + Math.random() * 900000000)}IN`,
      note: order.adminNote || '',
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
        const orderId = editingOrder.id;
        setEditingOrder(null);
        if (selectedOrderDossier && selectedOrderDossier.id === orderId) {
          setSelectedOrderDossier(prev => ({
            ...prev,
            status: orderDeliveryForm.status,
            carrier: orderDeliveryForm.carrier,
            trackingNumber: orderDeliveryForm.trackingNumber,
            adminNote: orderDeliveryForm.note
          }));
        }
        setOrders(prev => prev.map(o => o.id === orderId ? {
          ...o,
          status: orderDeliveryForm.status,
          carrier: orderDeliveryForm.carrier,
          trackingNumber: orderDeliveryForm.trackingNumber,
          adminNote: orderDeliveryForm.note
        } : o));
        window.dispatchEvent(new CustomEvent('as_orders_updated', {
          detail: { id: orderId, status: orderDeliveryForm.status }
        }));
        addToast(`Logistics updated for Order #${orderId}`, 'success', 3000, {
          desc: `Status set to ${orderDeliveryForm.status} via ${orderDeliveryForm.carrier}.`
        });
        fetchDashboardData();
      } else {
        addToast('Failed to update consignment delivery', 'error');
      }
    } catch (err) {
      console.error('Save order delivery error', err);
      addToast('Failed to update consignment delivery', 'error');
    }
  };

  const handleQuickStatusUpdate = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        if (selectedOrderDossier && selectedOrderDossier.id === orderId) {
          setSelectedOrderDossier(prev => ({ ...prev, status: newStatus }));
        }
        window.dispatchEvent(new CustomEvent('as_orders_updated', {
          detail: { id: orderId, status: newStatus }
        }));
        addToast(`Order #${orderId} advanced to "${newStatus}"`, 'success', 3000, {
          desc: 'Live consignment status synchronized successfully.'
        });
        fetchDashboardData();
      } else {
        addToast('Failed to update order milestone', 'error');
      }
    } catch (err) {
      console.error('Quick status update error', err);
      addToast('Failed to update order milestone', 'error');
    }
  };

  const getNextStatusAction = (currentStatus) => {
    switch (currentStatus) {
      case 'Order Placed':
        return { next: 'Payment Confirmed', label: 'Verify Payment', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
      case 'Payment Confirmed':
        return { next: 'Processing', label: 'Start Fulfillment', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
      case 'Processing':
        return { next: 'Shipped', label: 'Dispatch & Ship', color: 'bg-sky-500/20 text-sky-400 border-sky-500/30' };
      case 'Shipped':
      case 'In Transit':
        return { next: 'Out for Delivery', label: 'Out for Delivery', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' };
      case 'Out for Delivery':
        return { next: 'Delivered', label: 'Mark Delivered', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
      default:
        return null;
    }
  };

  const handleCopyText = (text, id, label = 'Information') => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedText(id || text);
    addToast(`${label} copied to clipboard`, 'gold', 2200, { desc: text });
    setTimeout(() => setCopiedText(''), 2000);
  };

  const handleExportOrdersCSV = () => {
    if (!orders || orders.length === 0) {
      addToast('No consignments available to export', 'warning');
      return;
    }
    const headers = ['Order ID', 'Date', 'Customer Name', 'Customer Email', 'Customer Phone', 'Items Count', 'Total INR', 'Payment Method', 'Payment Status', 'Delivery Status', 'Carrier', 'Waybill Tracking', 'Destination Address'];
    const rows = orders.map(o => [
      `"${o.id}"`,
      `"${o.createdAt ? new Date(o.createdAt).toISOString().split('T')[0] : (o.date || '')}"`,
      `"${(o.customerName || o.shippingAddress?.name || 'Customer').replace(/"/g, '""')}"`,
      `"${(o.customerEmail || o.shippingAddress?.email || '').replace(/"/g, '""')}"`,
      `"${(o.customerPhone || o.shippingAddress?.phone || '').replace(/"/g, '""')}"`,
      o.items?.length || 0,
      o.total || o.total_amount || 0,
      `"${o.paymentMethod || 'Razorpay'}"`,
      `"${o.paymentStatus || 'Paid'}"`,
      `"${o.status || 'Processing'}"`,
      `"${(o.carrier || '').replace(/"/g, '""')}"`,
      `"${(o.trackingNumber || '').replace(/"/g, '""')}"`,
      `"${(`${o.shippingAddress?.street || ''}, ${o.shippingAddress?.city || ''}, PIN: ${o.shippingAddress?.pincode || ''}`).replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const fileName = `AS_Commerce_Consignments_${new Date().toISOString().split('T')[0]}.csv`;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Consignments exported to CSV', 'success', 3000, { desc: `Downloaded ${orders.length} order records.` });
  };

  const handlePrintInvoice = () => {
    addToast('Preparing printable GST invoice...', 'info', 1800);
    window.print();
  };

  // Save Website Sections Settings
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSettingsSubmitting(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(siteSettings),
      });
      if (res.ok) {
        addToast('Storefront configurations saved', 'success', 3000, { desc: 'Homepage banner, announcement, & thresholds published.' });
        fetchDashboardData();
      } else {
        addToast('Failed to save settings', 'error');
      }
    } catch (err) {
      console.error('Save settings error', err);
      addToast('Failed to save settings', 'error');
    } finally {
      setSettingsSubmitting(false);
    }
  };

  // Coupons
  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!newCouponCode || !newCouponDesc) {
      addToast('Please provide both a coupon code and description', 'warning');
      return;
    }

    setCouponSubmitting(true);
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: newCouponCode.trim().toUpperCase(),
          discountPercent: newCouponDiscount ? Number(newCouponDiscount) : null,
          minOrder: newCouponMinOrder ? Number(newCouponMinOrder) : 0,
          description: newCouponDesc,
        }),
      });

      if (res.ok) {
        const createdCode = newCouponCode.trim().toUpperCase();
        setNewCouponCode('');
        setNewCouponDiscount('');
        setNewCouponMinOrder('');
        setNewCouponDesc('');
        addToast(`Coupon voucher "${createdCode}" created`, 'success', 3000, { desc: 'Clients can now redeem this code during checkout.' });
        fetchDashboardData();
      } else {
        const errData = await res.json().catch(() => ({}));
        addToast(errData.message || 'Failed to create coupon', 'error');
      }
    } catch (err) {
      console.error('Create coupon error', err);
      addToast('Failed to create coupon voucher', 'error');
    } finally {
      setCouponSubmitting(false);
    }
  };

  const handleDeleteCoupon = async (code) => {
    if (!window.confirm(`Are you sure you want to deactivate voucher "${code}"?`)) return;
    try {
      const res = await fetch(`/api/admin/coupons/${code}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        addToast(`Coupon "${code}" deactivated`, 'success', 2500);
        fetchDashboardData();
      } else {
        addToast('Failed to delete coupon', 'error');
      }
    } catch (err) {
      console.error('Delete coupon error', err);
      addToast('Failed to delete coupon', 'error');
    }
  };

  // Delete Customer Account
  const handleDeleteCustomer = async (customer) => {
    if (!window.confirm(`Are you sure you want to permanently delete customer "${customer.name || customer.email}"? This customer account and address records will be permanently removed.`)) return;
    try {
      const res = await fetch(`/api/admin/customers/${customer.id}?email=${encodeURIComponent(customer.email)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        addToast('Customer account removed', 'success', 3000, { desc: `${customer.name || customer.email} data purged successfully.` });
        fetchDashboardData();
      } else {
        const errData = await res.json().catch(() => ({}));
        addToast(errData.message || 'Failed to delete customer', 'error');
      }
    } catch (err) {
      console.error('Delete customer error', err);
      addToast('Failed to delete customer', 'error');
    }
  };

  // Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      addToast('Please fill in all password fields', 'warning');
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast('New password and confirmation do not match', 'warning');
      return;
    }
    if (newPassword.length < 8) {
      addToast('New password must be at least 8 characters long', 'warning');
      return;
    }

    setPassSubmitting(true);
    const result = await changePassword(currentPassword, newPassword, confirmPassword);
    setPassSubmitting(false);
    if (result && result.success) {
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
              <div key={i} className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-gray-200 dark:border-gold-500/10 shadow-sm dark:shadow-xl space-y-4 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="h-3 w-24 bg-gray-200 dark:bg-navy-800 rounded" />
                  <div className="w-10 h-10 rounded-2xl bg-navy-800" />
                </div>
                <div className="h-8 w-32 bg-gray-200 dark:bg-navy-800 rounded" />
                <div className="h-3.5 w-28 bg-gray-200 dark:bg-navy-800 rounded" />
              </div>
            ))}
          </div>

          {/* Quick Actions & Recent Orders Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-navy-900 border border-gray-200 dark:border-gold-500/10 shadow-sm dark:shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-navy-800 pb-3">
                <div className="h-5 w-48 bg-gray-200 dark:bg-navy-800 rounded animate-pulse" />
                <div className="h-3 w-20 bg-gray-200 dark:bg-navy-800 rounded animate-pulse" />
              </div>
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-gray-50 dark:bg-navy-850 border border-gray-200/80 dark:border-navy-800 flex items-center justify-between gap-4 animate-pulse">
                    <div className="space-y-2">
                      <div className="h-3.5 w-16 bg-gray-200 dark:bg-navy-800 rounded" />
                      <div className="h-3 w-24 bg-gray-200 dark:bg-navy-800 rounded" />
                      <div className="h-2.5 w-32 bg-gray-200 dark:bg-navy-800 rounded" />
                    </div>
                    <div className="text-right space-y-2">
                      <div className="h-4 w-20 bg-gray-200 dark:bg-navy-800 rounded ml-auto" />
                      <div className="h-5 w-16 bg-gray-200 dark:bg-navy-800 rounded-full ml-auto" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-navy-900 border border-gray-200 dark:border-gold-500/10 shadow-sm dark:shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-navy-800 pb-3">
                <div className="h-5 w-36 bg-gray-200 dark:bg-navy-800 rounded animate-pulse" />
                <div className="h-3 w-16 bg-gray-200 dark:bg-navy-800 rounded animate-pulse" />
              </div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="p-3 rounded-xl bg-gray-50 dark:bg-navy-850 border border-gray-200/80 dark:border-navy-800 space-y-2 animate-pulse">
                    <div className="flex items-center justify-between">
                      <div className="h-3.5 w-24 bg-gray-200 dark:bg-navy-800 rounded" />
                      <div className="h-2.5 w-10 bg-gray-200 dark:bg-navy-800 rounded" />
                    </div>
                    <div className="h-3 w-full bg-gray-200 dark:bg-navy-800 rounded" />
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
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-navy-900 border border-gray-200 dark:border-gold-500/10 shadow-sm dark:shadow-xl space-y-6 animate-fadeIn">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-navy-800 pb-4">
            <div className="space-y-2">
              <div className="h-6 w-56 bg-gray-200 dark:bg-navy-800 rounded animate-pulse" />
              <div className="h-3.5 w-80 bg-gray-200 dark:bg-navy-800 rounded animate-pulse" />
            </div>
            {activeTab === 'products' && (
              <div className="h-10 w-36 bg-gray-100 dark:bg-navy-850 rounded-xl animate-pulse" />
            )}
          </div>

          {/* Search/Filters Skeleton */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="h-10 flex-1 bg-gray-100 dark:bg-navy-850 rounded-xl border border-navy-700 animate-pulse" />
            <div className="h-10 w-40 bg-gray-100 dark:bg-navy-850 rounded-xl border border-navy-700 animate-pulse" />
          </div>

          {/* Table List Skeleton */}
          <div className="overflow-x-auto space-y-3">
            <div className="h-10 bg-navy-950 rounded-t-xl animate-pulse flex items-center px-4 justify-between">
              <div className="h-3 w-16 bg-gray-200 dark:bg-navy-800 rounded" />
              <div className="h-3 w-24 bg-gray-200 dark:bg-navy-800 rounded" />
              <div className="h-3 w-16 bg-gray-200 dark:bg-navy-800 rounded" />
              <div className="h-3 w-16 bg-gray-200 dark:bg-navy-800 rounded" />
            </div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="p-4 bg-gray-100 dark:bg-navy-850 border border-navy-800 rounded-xl flex items-center justify-between gap-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-navy-800 shrink-0" />
                  <div className="space-y-1.5">
                    <div className="h-3.5 w-40 bg-gray-200 dark:bg-navy-800 rounded" />
                    <div className="h-2.5 w-20 bg-gray-200 dark:bg-navy-800 rounded" />
                  </div>
                </div>
                <div className="h-3.5 w-24 bg-gray-200 dark:bg-navy-800 rounded" />
                <div className="h-3.5 w-16 bg-gray-200 dark:bg-navy-800 rounded" />
                <div className="h-8 w-16 bg-gray-100 dark:bg-navy-850 rounded-lg border border-navy-800" />
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Fallback or simple section loader for Profile and Settings
    return (
      <div className="p-8 rounded-3xl bg-white dark:bg-navy-900 border border-gray-200 dark:border-gold-500/10 shadow-sm dark:shadow-xl flex flex-col items-center justify-center space-y-4 animate-pulse">
        <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-navy-850 border border-navy-700 animate-spin border-t-gold-500" />
        <div className="h-4 w-32 bg-gray-100 dark:bg-navy-850 rounded" />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-navy-950 text-navy-950 dark:text-white transition-colors selection:bg-gold-500/30 flex flex-col font-sans">
      
      {/* Top Admin Header */}
      <header className="bg-white/95 dark:bg-navy-900/95 border-b border-gray-200/80 dark:border-gold-500/20 px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-sm dark:shadow-xl backdrop-blur-md transition-colors">
        <div className="flex items-center gap-4">
          <Logo size="small" />
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-gold-500/10 border border-gold-500/30 rounded-full text-gold-400 text-xs font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="font-semibold text-gold-700 dark:text-gold-400">Master Control & Logistics Suite</span>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <ThemeToggle />

          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 hover:text-navy-950 dark:hover:text-gold-400 font-medium px-3 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-navy-800 transition-colors"
          >
            <span>Live Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <div className="h-4 w-px bg-gray-200 dark:bg-navy-750 hidden sm:block" />

          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <p className="text-xs font-bold text-navy-950 dark:text-white leading-tight">{admin?.name || 'Alexander Sterling'}</p>
              <p className="text-[10px] font-mono text-gold-400">Master Administrator</p>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-gray-100 dark:bg-navy-800 hover:bg-red-50 dark:hover:bg-red-900/40 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-300 border border-gray-200 dark:border-navy-700 hover:border-red-500/40 transition-all flex items-center gap-1.5 text-xs cursor-pointer"
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
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200 dark:border-navy-800">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'products', label: `Catalog & Products (${products.length})`, icon: Package },
            { id: 'orders', label: `Orders & Delivery (${orders.length})`, icon: ShoppingBag },
            { id: 'customers', label: `Customers (${customers.length})`, icon: User },
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
                    : 'bg-white dark:bg-navy-900 text-gray-800 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-navy-850 hover:text-navy-950 dark:hover:text-white border border-gray-200 dark:border-navy-800 shadow-xs'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}

          <button
            onClick={() => fetchDashboardData(true)}
            className="ml-auto p-2.5 rounded-xl bg-white dark:bg-navy-900 text-gray-600 dark:text-gray-400 hover:text-gold-600 dark:hover:text-gold-400 border border-gray-200 dark:border-navy-800 transition-colors cursor-pointer shadow-xs"
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
              <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-gray-200/80 dark:border-gold-500/20 shadow-sm dark:shadow-xl space-y-2 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">Gross Sales</span>
                  <div className="w-10 h-10 rounded-2xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="font-serif text-3xl font-bold text-navy-950 dark:text-white">
                  {formatINR(stats?.totalRevenue || 2249)}
                </h3>
                <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">✓ Razorpay Verified Revenue</span>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-gray-200/80 dark:border-gold-500/20 shadow-sm dark:shadow-xl space-y-2 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">Total Consignments</span>
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="font-serif text-3xl font-bold text-navy-950 dark:text-white">
                  {orders.length} Orders
                </h3>
                <span className="text-[11px] text-gold-700 dark:text-gold-400 font-bold">● Live Carrier Integration</span>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-gray-200/80 dark:border-gold-500/20 shadow-sm dark:shadow-xl space-y-2 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">Catalog Inventory</span>
                  <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <Package className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="font-serif text-3xl font-bold text-navy-950 dark:text-white">
                  {products.length} Products
                </h3>
                <span className="text-[11px] text-gray-600 dark:text-gray-400 font-medium">Across 7 Main Departments</span>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-gray-200/80 dark:border-gold-500/20 shadow-sm dark:shadow-xl space-y-2 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">Security State</span>
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="font-serif text-xl font-bold text-emerald-700 dark:text-emerald-400">
                  Protected (1/1 Lock)
                </h3>
                <span className="text-[11px] text-gray-600 dark:text-gray-400 font-medium">Single-Admin Enforced</span>
              </div>
            </div>

            {/* Quick Actions & Recent Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-navy-900 border border-gray-200/80 dark:border-gold-500/20 shadow-sm dark:shadow-xl space-y-4 transition-colors">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-navy-800 pb-3">
                  <h4 className="font-serif text-lg font-bold text-navy-950 dark:text-white flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-gold-400" />
                    <span>Recent Customer Consignments</span>
                  </h4>
                  <button onClick={() => setActiveTab('orders')} className="text-xs text-gold-400 hover:underline font-semibold">
                    Manage Orders →
                  </button>
                </div>

                <div className="space-y-3">
                  {orders.slice(0, 4).map((order) => (
                    <div key={order.id} className="p-4 rounded-2xl bg-gray-50 dark:bg-navy-850 border border-gray-200/80 dark:border-navy-800 flex items-center justify-between gap-4">
                      <div>
                        <span className="text-xs font-mono font-bold text-gold-700 dark:text-gold-400">#{order.id}</span>
                        <p className="text-xs text-navy-950 dark:text-white font-medium mt-0.5">{order.shippingAddress?.name}</p>
                        <span className="text-[10px] text-gray-600 dark:text-gray-400 font-medium">{order.date} • {order.carrier}</span>
                      </div>
                      <div className="text-right space-y-1">
                        <span className="text-xs font-bold text-navy-950 dark:text-white block">{formatINR(order.total)}</span>
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gold-500/20 text-gold-400 border border-gold-500/30">
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-navy-900 border border-gray-200/80 dark:border-gold-500/20 shadow-sm dark:shadow-xl space-y-4 transition-colors">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-navy-800 pb-3">
                  <h4 className="font-serif text-lg font-bold text-navy-950 dark:text-white flex items-center gap-2">
                    <History className="w-5 h-5 text-gold-400" />
                    <span>Security Audit Feed</span>
                  </h4>
                  <button onClick={() => setActiveTab('audit')} className="text-xs text-gold-400 hover:underline font-semibold">
                    Full Log →
                  </button>
                </div>

                <div className="space-y-2.5">
                  {auditLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="p-3 rounded-xl bg-gray-50 dark:bg-navy-850 border border-gray-200/80 dark:border-navy-800 text-xs space-y-1">
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
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-navy-900 border border-gray-200/80 dark:border-gold-500/20 shadow-sm dark:shadow-xl space-y-6 animate-fadeIn transition-colors">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-navy-800 pb-4">
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-navy-950 dark:text-white">
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
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-navy-850 text-navy-950 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-xs rounded-xl border border-gray-200 dark:border-navy-700 focus:border-gold-500"
                />
              </div>

              <select
                value={productCategoryFilter}
                onChange={(e) => setProductCategoryFilter(e.target.value)}
                className="px-4 py-2.5 bg-gray-50 dark:bg-navy-850 text-gold-600 dark:text-gold-400 rounded-xl border border-gray-200 dark:border-navy-700 text-xs font-semibold focus:border-gold-500 cursor-pointer"
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
              <table className="w-full text-left text-xs text-gray-700 dark:text-gray-300">
                <thead className="bg-gray-100 dark:bg-navy-950 text-gray-600 dark:text-gray-400 font-mono text-[11px] uppercase border-b border-gray-200 dark:border-navy-800">
                  <tr>
                    <th className="p-3.5">Item</th>
                    <th className="p-3.5">Department</th>
                    <th className="p-3.5">Price</th>
                    <th className="p-3.5">Stock</th>
                    <th className="p-3.5">Badge</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-navy-800">
                  {filteredProducts.map((prod) => (
                    <tr key={prod.id} className="hover:bg-gray-50 dark:hover:bg-navy-850/50 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.images ? prod.images[0] : prod.image}
                            alt={prod.name}
                            className="w-10 h-10 rounded-xl object-cover border border-navy-700 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-navy-950 dark:text-white block">{prod.name}</span>
                            <span className="text-[10px] text-gray-600 dark:text-gray-400 font-medium">{prod.brand}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 font-medium text-gray-300">{prod.categoryName}</td>
                      <td className="p-3.5 font-bold text-gold-700 dark:text-gold-400 font-mono">{formatINR(prod.price)}</td>
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
                          className="p-1.5 text-gray-300 hover:text-gold-400 hover:bg-gray-200 dark:bg-navy-800 rounded-lg transition-colors cursor-pointer"
                          title="Edit Product"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod.id)}
                          className="p-1.5 text-gray-300 hover:text-red-400 hover:bg-gray-200 dark:bg-navy-800 rounded-lg transition-colors cursor-pointer"
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
          <div className="space-y-6 animate-fadeIn">
            {/* Header & Controls */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-navy-900 border border-gray-200/80 dark:border-gold-500/20 shadow-sm dark:shadow-xl space-y-6 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-navy-800 pb-4">
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-navy-950 dark:text-white flex items-center gap-2">
                    <Truck className="w-6 h-6 text-gold-400" />
                    <span>Orders & Logistics Management</span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Real-time consignment pipeline, live tracking milestones, customer contacts, and printable luxury invoices.
                  </p>
                </div>
                <div className="flex items-center flex-wrap gap-2">
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Live Database Sync</span>
                  </span>
                  <button
                    onClick={handleExportOrdersCSV}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-navy-800 dark:hover:bg-navy-750 text-gold-700 dark:text-gold-400 hover:text-gold-800 dark:hover:text-gold-300 text-xs border border-gray-200 dark:border-gold-500/30 transition-colors cursor-pointer"
                    title="Export all orders to CSV"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                  <button
                    onClick={fetchDashboardData}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-navy-800 dark:hover:bg-navy-750 text-gray-700 dark:text-gray-300 hover:text-navy-950 dark:hover:text-white text-xs border border-gray-200 dark:border-navy-700 transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-gold-400 ${loading ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>

              {/* Order KPI Summary Ribbon */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-navy-850 border border-gray-200/80 dark:border-navy-800 space-y-1">
                  <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">Total Consignments</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xl sm:text-2xl font-bold font-serif text-navy-950 dark:text-white">{orders.length}</span>
                    <span className="text-xs font-mono text-gold-400 font-bold">
                      {formatINR(orders.reduce((acc, o) => acc + Number(o.total || o.total_amount || 0), 0))}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-gray-100 dark:bg-navy-850 border border-amber-500/20 space-y-1">
                  <span className="text-[10px] text-amber-400 uppercase font-semibold tracking-wider">Pending Fulfillment</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xl sm:text-2xl font-bold font-serif text-amber-400">
                      {orders.filter(o => ['Order Placed', 'Payment Confirmed', 'Processing'].includes(o.status || 'Processing')).length}
                    </span>
                    <span className="text-[10px] text-gray-600 dark:text-gray-400 font-medium">Requires Action</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-gray-100 dark:bg-navy-850 border border-sky-500/20 space-y-1">
                  <span className="text-[10px] text-sky-400 uppercase font-semibold tracking-wider">In Transit Logistics</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xl sm:text-2xl font-bold font-serif text-sky-400">
                      {orders.filter(o => ['Shipped', 'In Transit', 'Out for Delivery'].includes(o.status)).length}
                    </span>
                    <span className="text-[10px] text-sky-400/80">With Courier</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-gray-100 dark:bg-navy-850 border border-emerald-500/20 space-y-1">
                  <span className="text-[10px] text-emerald-400 uppercase font-semibold tracking-wider">Delivered & Complete</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xl sm:text-2xl font-bold font-serif text-emerald-400">
                      {orders.filter(o => o.status === 'Delivered').length}
                    </span>
                    <span className="text-[10px] text-emerald-400/80">Fulfilled</span>
                  </div>
                </div>
              </div>

              {/* Status Pipeline Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-navy-800 scrollbar-none">
                {[
                  { id: 'all', label: 'All Orders', count: orders.length },
                  { id: 'Order Placed', label: 'Placed', count: orders.filter(o => o.status === 'Order Placed').length },
                  { id: 'Payment Confirmed', label: 'Paid', count: orders.filter(o => o.status === 'Payment Confirmed').length },
                  { id: 'Processing', label: 'Processing', count: orders.filter(o => o.status === 'Processing' || (!o.status && o.status !== 'all')).length },
                  { id: 'Shipped', label: 'Shipped', count: orders.filter(o => ['Shipped', 'In Transit'].includes(o.status)).length },
                  { id: 'Out for Delivery', label: 'Out for Delivery', count: orders.filter(o => o.status === 'Out for Delivery').length },
                  { id: 'Delivered', label: 'Delivered', count: orders.filter(o => o.status === 'Delivered').length },
                  { id: 'Cancelled', label: 'Cancelled', count: orders.filter(o => o.status === 'Cancelled').length },
                ].map(tab => {
                  const isSelected = orderStatusFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setOrderStatusFilter(tab.id)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-gold-500/20 text-gold-400 border border-gold-500/40 shadow-sm'
                          : 'bg-gray-100 dark:bg-navy-850/60 text-gray-400 hover:text-white hover:bg-navy-800 border border-navy-800'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                        isSelected ? 'bg-gold-400 text-navy-950 font-bold' : 'bg-navy-800 text-gray-400'
                      }`}>
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Search, Filter & Sort Toolbar */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-6 relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by Order ID, customer, phone, email, tracking AWB..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-navy-850 text-navy-950 dark:text-white rounded-xl border border-gray-200 dark:border-navy-700 text-xs placeholder-gray-500 focus:border-gold-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-3">
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-navy-850 text-gray-800 dark:text-gray-200 rounded-xl border border-gray-200 dark:border-navy-700 text-xs focus:border-gold-500 focus:outline-none cursor-pointer"
                  >
                    <option value="all">All Delivery Statuses</option>
                    <option value="Order Placed">Order Placed</option>
                    <option value="Payment Confirmed">Payment Confirmed</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <select
                    value={orderSortBy}
                    onChange={(e) => setOrderSortBy(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-navy-850 text-gray-800 dark:text-gray-200 rounded-xl border border-gray-200 dark:border-navy-700 text-xs focus:border-gold-500 focus:outline-none cursor-pointer"
                  >
                    <option value="newest">Sort: Newest First</option>
                    <option value="oldest">Sort: Oldest First</option>
                    <option value="highest">Sort: Highest Value</option>
                    <option value="lowest">Sort: Lowest Value</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Orders Feed Cards */}
            <div className="space-y-5">
              {orders
                .filter((order) => {
                  const matchStatus =
                    orderStatusFilter === 'all' ||
                    (order.status || 'Processing').toLowerCase() === orderStatusFilter.toLowerCase() ||
                    (orderStatusFilter === 'Shipped' && order.status === 'In Transit');
                  const q = orderSearch.toLowerCase().trim();
                  const matchSearch =
                    !q ||
                    (order.id || '').toLowerCase().includes(q) ||
                    (order.customerName || order.shippingAddress?.name || '').toLowerCase().includes(q) ||
                    (order.customerEmail || order.shippingAddress?.email || '').toLowerCase().includes(q) ||
                    (order.customerPhone || order.shippingAddress?.phone || '').toLowerCase().includes(q) ||
                    (order.trackingNumber || '').toLowerCase().includes(q);
                  return matchStatus && matchSearch;
                })
                .sort((a, b) => {
                  if (orderSortBy === 'newest') return (new Date(b.createdAt || b.date || 0)) - (new Date(a.createdAt || a.date || 0));
                  if (orderSortBy === 'oldest') return (new Date(a.createdAt || a.date || 0)) - (new Date(b.createdAt || b.date || 0));
                  if (orderSortBy === 'highest') return (Number(b.total || b.total_amount || 0)) - (Number(a.total || a.total_amount || 0));
                  if (orderSortBy === 'lowest') return (Number(a.total || a.total_amount || 0)) - (Number(b.total || b.total_amount || 0));
                  return 0;
                })
                .map((order) => {
                  const currentStatus = order.status || 'Processing';
                  const nextAction = getNextStatusAction(currentStatus);

                  const statusColors = {
                    Delivered: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
                    'Out for Delivery': 'bg-purple-500/15 text-purple-400 border-purple-500/30',
                    Shipped: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
                    'In Transit': 'bg-sky-500/15 text-sky-400 border-sky-500/30',
                    Processing: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
                    'Payment Confirmed': 'bg-blue-500/15 text-blue-400 border-blue-500/30',
                    'Order Placed': 'bg-gold-500/20 text-gold-400 border-gold-500/40',
                    Cancelled: 'bg-red-500/15 text-red-400 border-red-500/30',
                  };
                  const badgeClass = statusColors[currentStatus] || 'bg-gold-500/15 text-gold-400 border-gold-500/30';

                  const cleanPhone = (order.customerPhone || order.shippingAddress?.phone || '').replace(/[^0-9]/g, '');
                  const customerName = order.customerName || order.shippingAddress?.name || 'Valued Patron';
                  const customerEmail = order.customerEmail || order.shippingAddress?.email || 'patron@ascommerce.luxury';

                  // Milestone stages calculation
                  const stages = ['Order Placed', 'Payment Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];
                  const currentStageIdx = stages.indexOf(currentStatus) !== -1 ? stages.indexOf(currentStatus) : 2;

                  return (
                    <div
                      key={order.id}
                      className="p-5 sm:p-7 rounded-3xl bg-white dark:bg-navy-900 border border-gray-200/80 dark:border-gold-500/20 hover:border-gold-500/40 transition-all space-y-5 shadow-sm dark:shadow-xl"
                    >
                      {/* Order Header & Identity */}
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-100 dark:border-navy-800 pb-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center flex-wrap gap-2.5">
                            <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-navy-850 px-3 py-1 rounded-xl border border-navy-750">
                              <span className="text-xs font-mono font-bold text-gold-700 dark:text-gold-400">#{order.id}</span>
                              <button
                                onClick={() => handleCopyText(order.id, `order-${order.id}`, 'Consignment ID')}
                                className="text-gray-400 hover:text-white p-0.5 transition-colors cursor-pointer"
                                title="Copy Order ID"
                              >
                                {copiedText === `order-${order.id}` ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>

                            <span className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1 font-medium">
                              <Calendar className="w-3.5 h-3.5 text-gray-500" />
                              {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : (order.date || '2026-08-31')}
                            </span>

                            <span className={`text-[11px] font-bold px-3 py-0.5 rounded-full border ${badgeClass}`}>
                              ● {currentStatus}
                            </span>

                            <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-navy-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-navy-700">
                              {order.paymentMethod || 'Razorpay Gateway'} ({order.paymentStatus || 'Paid'})
                            </span>
                          </div>

                          {/* Customer Contact Bar with Quick Action Links */}
                          <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-gray-300">
                            <span className="font-semibold text-navy-950 dark:text-white flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-gold-400" />
                              {customerName}
                            </span>
                            <span className="text-gray-600 dark:text-gray-400">{customerEmail}</span>
                            {cleanPhone && (
                              <span className="text-gray-700 dark:text-gray-300 font-mono flex items-center gap-1">
                                <Phone className="w-3 h-3 text-gold-400" />
                                +{cleanPhone}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Total & Quick Next Action */}
                        <div className="flex items-center flex-wrap justify-between lg:justify-end gap-3 pt-2 lg:pt-0">
                          <div className="text-left lg:text-right">
                            <span className="text-xl sm:text-2xl font-serif font-bold text-navy-950 dark:text-white block">
                              {formatINR(order.total || order.total_amount || 0)}
                            </span>
                            <span className="text-[10px] text-gray-600 dark:text-gray-400 font-medium">
                              {order.items?.length || 1} Item(s) • Tax Incl.
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Fast Action Stage Button */}
                            {nextAction && currentStatus !== 'Cancelled' && (
                              <button
                                onClick={() => handleQuickStatusUpdate(order.id, nextAction.next)}
                                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-sm hover:brightness-110 ${nextAction.color}`}
                                title={`Advance directly to ${nextAction.next}`}
                              >
                                <span>{nextAction.label}</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Quick Status Select */}
                            <select
                              value={currentStatus}
                              onChange={(e) => handleQuickStatusUpdate(order.id, e.target.value)}
                              className="px-2.5 py-2 bg-gray-100 dark:bg-navy-850 text-gold-400 border border-navy-700 rounded-xl text-xs font-semibold focus:border-gold-500 focus:outline-none cursor-pointer"
                            >
                              <option value="Order Placed">Order Placed</option>
                              <option value="Payment Confirmed">Payment Confirmed</option>
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Out for Delivery">Out for Delivery</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Interactive Logistics Stepper (Pipeline Tracker) */}
                      {currentStatus !== 'Cancelled' && (
                        <div className="bg-gray-50/80 dark:bg-navy-850/70 p-4 rounded-2xl border border-gray-200/80 dark:border-navy-800">
                          <div className="grid grid-cols-6 gap-1 sm:gap-2">
                            {stages.map((stage, sIdx) => {
                              const isCompleted = currentStageIdx >= sIdx;
                              const isCurrent = currentStageIdx === sIdx;
                              return (
                                <div key={stage} className="flex flex-col items-center text-center space-y-1.5">
                                  <div
                                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all border ${
                                      isCurrent
                                        ? 'bg-gold-500 text-navy-950 border-gold-400 ring-2 ring-gold-500/30 animate-pulse'
                                        : isCompleted
                                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                                        : 'bg-navy-900 text-gray-500 border-navy-800'
                                    }`}
                                  >
                                    {isCompleted && !isCurrent ? (
                                      <Check className="w-3.5 h-3.5" />
                                    ) : (
                                      <span>{sIdx + 1}</span>
                                    )}
                                  </div>
                                  <span
                                    className={`text-[9px] sm:text-[10px] font-medium leading-tight line-clamp-1 ${
                                      isCurrent
                                        ? 'text-gold-400 font-bold'
                                        : isCompleted
                                        ? 'text-gray-300'
                                        : 'text-gray-500'
                                    }`}
                                  >
                                    {stage}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Itemized Preview of Consignment */}
                      {Array.isArray(order.items) && order.items.length > 0 && (
                        <div className="bg-gray-50/60 dark:bg-navy-850/40 rounded-2xl p-4 border border-gray-200/80 dark:border-navy-800/80 space-y-2.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                            ORDERED LUXURY CONSIGNMENT ({order.items.length} ITEM{order.items.length > 1 ? 'S' : ''})
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {order.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-100 dark:bg-navy-850 border border-navy-800 text-xs"
                              >
                                <img
                                  src={item.image || item.images?.[0] || 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=100'}
                                  alt={item.name}
                                  className="w-12 h-12 object-cover rounded-lg border border-navy-750 shrink-0"
                                />
                                <div className="min-w-0 flex-1">
                                  <p className="font-semibold text-navy-950 dark:text-white truncate text-xs">{item.name}</p>
                                  <div className="flex items-center justify-between text-[11px] text-gray-400 mt-0.5">
                                    <span>Qty: <strong className="text-gold-400">{item.quantity || 1}</strong></span>
                                    <span className="font-mono text-gray-200">{formatINR(item.price || 0)}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Destination Address & Logistics Footer */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                        {/* Address Dossier */}
                        <div className="md:col-span-6 bg-gray-50/80 dark:bg-navy-850/50 p-4 rounded-2xl border border-gray-200/80 dark:border-navy-800 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-gold-400" />
                              DESTINATION ADDRESS
                            </span>
                            {order.shippingAddress?.city && (
                              <a
                                href={`https://maps.google.com/?q=${encodeURIComponent(`${order.shippingAddress?.street || ''} ${order.shippingAddress?.city || ''} ${order.shippingAddress?.pincode || ''}`)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] text-gold-400 hover:underline flex items-center gap-1"
                              >
                                <span>Open Pin Map</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </div>
                          <p className="text-gray-700 dark:text-gray-200 leading-relaxed text-xs">
                            {order.shippingAddress?.street ? (
                              <>
                                <strong className="text-navy-950 dark:text-white block">{order.shippingAddress.name || customerName}</strong>
                                {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state ? `${order.shippingAddress.state}, ` : ''}PIN: {order.shippingAddress.pincode}
                              </>
                            ) : (
                              <span className="text-gray-400 italic">Standard Client Delivery Address (Direct Courier)</span>
                            )}
                          </p>
                        </div>

                        {/* Carrier & Tracking */}
                        <div className="md:col-span-6 bg-gray-50/80 dark:bg-navy-850/50 p-4 rounded-2xl border border-gray-200/80 dark:border-navy-800 space-y-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                            <Truck className="w-3 h-3 text-gold-400" />
                            CARRIER LOGISTICS
                          </span>
                          <div className="text-gray-700 dark:text-gray-200 space-y-1">
                            <p>
                              Partner: <strong className="text-navy-950 dark:text-white">{order.carrier || 'Bluedart Express Luxury Courier'}</strong>
                            </p>
                            <div className="flex items-center gap-2">
                              <span>AWB Tracking:</span>
                              <span className="font-mono text-gold-400 font-bold bg-navy-900 px-2 py-0.5 rounded border border-navy-750 text-[11px]">
                                {order.trackingNumber || 'Pending AWB'}
                              </span>
                              {order.trackingNumber && (
                                <button
                                  onClick={() => handleCopyText(order.trackingNumber, `trk-${order.id}`, 'AWB Tracking Number')}
                                  className="text-gray-400 hover:text-white p-0.5 cursor-pointer"
                                  title="Copy Tracking Number"
                                >
                                  {copiedText === `trk-${order.id}` ? (
                                    <Check className="w-3 h-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Command Center Buttons */}
                      <div className="flex items-center flex-wrap justify-between gap-3 pt-2 border-t border-gray-100 dark:border-navy-800">
                        {/* Direct Customer Connect Links */}
                        <div className="flex items-center gap-2">
                          {cleanPhone && (
                            <a
                              href={`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(`Hello ${customerName}, regarding your A_S Commerce Order #${order.id}...`)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs border border-emerald-500/30 transition-colors"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>WhatsApp</span>
                            </a>
                          )}
                          {cleanPhone && (
                            <a
                              href={`tel:${cleanPhone}`}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-navy-800 hover:bg-navy-750 text-gray-300 hover:text-white text-xs border border-navy-700 transition-colors"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              <span>Call</span>
                            </a>
                          )}
                          {customerEmail && (
                            <a
                              href={`mailto:${customerEmail}?subject=${encodeURIComponent(`A_S Commerce Order Update #${order.id}`)}`}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-navy-800 hover:bg-navy-750 text-gray-300 hover:text-white text-xs border border-navy-700 transition-colors"
                            >
                              <Mail className="w-3.5 h-3.5" />
                              <span>Email</span>
                            </a>
                          )}
                        </div>

                        {/* Primary Dashboard Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenDeliveryModal(order)}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-navy-800 hover:bg-navy-750 text-gold-400 border border-gold-500/30 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>Update Logistics</span>
                          </button>

                          <button
                            onClick={() => setSelectedOrderDossier(order)}
                            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gold-gradient text-navy-950 font-bold text-xs shadow-gold-sm hover:brightness-105 transition-all cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Dossier & Invoice</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

              {orders.length === 0 && (
                <div className="text-center py-16 rounded-3xl bg-navy-900 border border-navy-800 space-y-3">
                  <Package className="w-12 h-12 text-gray-500 mx-auto" />
                  <h4 className="text-base font-serif font-bold text-gray-300">No Consignments in this View</h4>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    New orders placed by clients will stream here instantly with live real-time sync.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3.5: CUSTOMERS DIRECTORY */}
        {activeTab === 'customers' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-navy-900 border border-gray-200/80 dark:border-gold-500/20 shadow-sm dark:shadow-xl space-y-6 animate-fadeIn transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-navy-800 pb-4">
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-navy-950 dark:text-white flex items-center gap-2">
                  <User className="w-6 h-6 text-gold-400" />
                  <span>Registered Customer Directory</span>
                </h3>
                <p className="text-xs text-gray-400">
                  Customer profiles, verified contact details, purchasing frequency, and lifetime spend.
                </p>
              </div>
              <div className="flex items-center flex-wrap gap-2">
                <span className="text-xs font-mono text-gold-400 bg-gold-500/10 px-3 py-1.5 rounded-xl border border-gold-500/30 font-semibold">
                  {customers.length} Patrons Registered
                </span>
                <button
                  onClick={fetchDashboardData}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-navy-800 dark:hover:bg-navy-750 text-gray-700 dark:text-gray-300 hover:text-navy-950 dark:hover:text-white text-xs border border-gray-200 dark:border-navy-700 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-gold-400 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* Customer Search */}
            <div className="max-w-md relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search customers by name, email, phone..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-navy-850 text-navy-950 dark:text-white rounded-xl border border-gray-200 dark:border-navy-700 text-xs placeholder-gray-500 focus:border-gold-500 focus:outline-none"
              />
            </div>

            {/* Customers Table / Card List */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-700 dark:text-gray-300">
                <thead className="bg-gray-100 dark:bg-navy-950/80 text-gold-600 dark:text-gold-400 uppercase font-mono text-[10px] tracking-wider border-b border-gray-200 dark:border-navy-800">
                  <tr>
                    <th className="py-3.5 px-4 rounded-l-xl">Patron</th>
                    <th className="py-3.5 px-4">Contact Info</th>
                    <th className="py-3.5 px-4">Security Verification</th>
                    <th className="py-3.5 px-4">Consignments</th>
                    <th className="py-3.5 px-4">Lifetime Spend</th>
                    <th className="py-3.5 px-4">Joined</th>
                    <th className="py-3.5 px-4 rounded-r-xl text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-navy-800/60">
                  {customers
                    .filter((c) => {
                      const q = customerSearch.toLowerCase().trim();
                      if (!q) return true;
                      return (
                        (c.name || '').toLowerCase().includes(q) ||
                        (c.email || '').toLowerCase().includes(q) ||
                        (c.phone || '').toLowerCase().includes(q)
                      );
                    })
                    .map((customer) => (
                      <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-navy-850/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gold-500/10 border border-gold-500/30 flex items-center justify-center font-bold font-serif text-gold-400 text-xs">
                              {(customer.name || 'C').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-navy-950 dark:text-white text-xs">{customer.name}</p>
                              <p className="text-[10px] font-mono text-gray-400">{customer.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 space-y-0.5">
                          <p className="text-gray-200 font-medium">{customer.email}</p>
                          <p className="text-[11px] text-gray-400">{customer.phone || 'No phone'}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          {customer.isVerified ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold font-mono">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Verified OTP</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-bold font-mono">
                              <Clock className="w-3 h-3" />
                              <span>Pending OTP</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 rounded-lg bg-navy-800 text-gold-400 border border-navy-700 font-mono font-bold text-xs">
                            {customer.totalOrders || 0} Orders
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-serif font-bold text-navy-950 dark:text-white">
                          {formatINR(customer.totalSpend || 0)}
                        </td>
                        <td className="py-3.5 px-4 text-gray-400 text-[11px]">
                          {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : '2026-08-31'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleDeleteCustomer(customer)}
                            title="Delete patron record & reset data"
                            className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all hover:scale-105 cursor-pointer inline-flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-medium hidden sm:inline">Delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>

              {customers.length === 0 && (
                <div className="text-center py-12 rounded-2xl bg-gray-100 dark:bg-navy-850/50 border border-navy-800 space-y-2 mt-3">
                  <User className="w-10 h-10 text-gray-500 mx-auto" />
                  <p className="text-sm font-semibold text-gray-300">No registered patrons yet.</p>
                  <p className="text-xs text-gray-500">Registered users will appear here automatically.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: WEBSITE SECTIONS & CONTENT CUSTOMIZER */}
        {activeTab === 'settings' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-navy-900 border border-gray-200/80 dark:border-gold-500/20 shadow-sm dark:shadow-xl space-y-6 animate-fadeIn transition-colors">
            <div className="border-b border-gray-100 dark:border-navy-800 pb-4">
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-navy-950 dark:text-white flex items-center gap-2">
                <Sliders className="w-6 h-6 text-gold-400" />
                <span>Website Sections & Content Customizer</span>
              </h3>
              <p className="text-xs text-gray-400">
                Change announcement promo bar, hero headlines, discount badges, and store contact info.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6 text-xs max-w-2xl">
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gold-700 dark:text-gold-400 uppercase tracking-widest border-b border-navy-800 pb-2">
                  1. Announcement Bar
                </h4>
                <div>
                  <label className="block font-bold text-gray-800 dark:text-gray-300 mb-1">Top Promo Announcement Text</label>
                  <input
                    type="text"
                    value={siteSettings.announcementText}
                    onChange={(e) => setSiteSettings({ ...siteSettings, announcementText: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-navy-850 text-navy-950 dark:text-white rounded-xl border border-gray-200 dark:border-navy-700 focus:border-gold-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-800 dark:text-gray-300 mb-1">Free Shipping Order Threshold (₹)</label>
                  <input
                    type="number"
                    value={siteSettings.freeShippingThreshold}
                    onChange={(e) => setSiteSettings({ ...siteSettings, freeShippingThreshold: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-navy-850 text-navy-950 dark:text-white rounded-xl border border-gray-200 dark:border-navy-700 focus:border-gold-500"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gold-700 dark:text-gold-400 uppercase tracking-widest border-b border-navy-800 pb-2">
                  2. Hero Banner Section
                </h4>
                <div>
                  <label className="block font-bold text-gray-800 dark:text-gray-300 mb-1">Hero Pill Badge</label>
                  <input
                    type="text"
                    value={siteSettings.heroBadge}
                    onChange={(e) => setSiteSettings({ ...siteSettings, heroBadge: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-navy-850 text-navy-950 dark:text-white rounded-xl border border-gray-200 dark:border-navy-700 focus:border-gold-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-800 dark:text-gray-300 mb-1">Main Hero Headline</label>
                  <input
                    type="text"
                    value={siteSettings.heroHeadline}
                    onChange={(e) => setSiteSettings({ ...siteSettings, heroHeadline: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-navy-850 text-navy-950 dark:text-white rounded-xl border border-gray-200 dark:border-navy-700 focus:border-gold-500 font-serif text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-800 dark:text-gray-300 mb-1">Hero Subheadline</label>
                  <textarea
                    rows={2}
                    value={siteSettings.heroSubheadline}
                    onChange={(e) => setSiteSettings({ ...siteSettings, heroSubheadline: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-navy-850 text-navy-950 dark:text-white rounded-xl border border-gray-200 dark:border-navy-700 focus:border-gold-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-800 dark:text-gray-300 mb-1">Circular Badge Discount Text</label>
                  <input
                    type="text"
                    value={siteSettings.heroDiscount}
                    onChange={(e) => setSiteSettings({ ...siteSettings, heroDiscount: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-navy-850 text-navy-950 dark:text-white rounded-xl border border-gray-200 dark:border-navy-700 focus:border-gold-500"
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
            <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-navy-900 border border-gray-200/80 dark:border-gold-500/20 shadow-sm dark:shadow-xl space-y-5 transition-colors">
              <h3 className="font-serif text-lg font-bold text-navy-950 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-gold-400" />
                <span>Create New Promo Voucher</span>
              </h3>

              <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-gray-800 dark:text-gray-300 mb-1">Voucher Code</label>
                  <input
                    type="text"
                    required
                    value={newCouponCode}
                    onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                    placeholder="e.g. LUXURY25"
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-navy-850 text-navy-950 dark:text-white font-mono rounded-xl border border-gray-200 dark:border-navy-700 focus:border-gold-500 uppercase"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-800 dark:text-gray-300 mb-1">Discount (%)</label>
                    <input
                      type="number"
                      value={newCouponDiscount}
                      onChange={(e) => setNewCouponDiscount(e.target.value)}
                      placeholder="e.g. 25"
                      className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-navy-850 text-navy-950 dark:text-white rounded-xl border border-gray-200 dark:border-navy-700 focus:border-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-800 dark:text-gray-300 mb-1">Min Order (₹)</label>
                    <input
                      type="number"
                      value={newCouponMinOrder}
                      onChange={(e) => setNewCouponMinOrder(e.target.value)}
                      placeholder="e.g. 2999"
                      className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-navy-850 text-navy-950 dark:text-white rounded-xl border border-gray-200 dark:border-navy-700 focus:border-gold-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-800 dark:text-gray-300 mb-1">Promotion Description</label>
                  <input
                    type="text"
                    required
                    value={newCouponDesc}
                    onChange={(e) => setNewCouponDesc(e.target.value)}
                    placeholder="e.g. 25% Off on Summer Luxury Collection"
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-navy-850 text-navy-950 dark:text-white rounded-xl border border-gray-200 dark:border-navy-700 focus:border-gold-500"
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

            <div className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-navy-900 border border-gray-200/80 dark:border-gold-500/20 shadow-sm dark:shadow-xl space-y-4 transition-colors">
              <h3 className="font-serif text-lg font-bold text-navy-950 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-navy-800 pb-3">
                <Tag className="w-5 h-5 text-gold-400" />
                <span>Active Store Coupons</span>
              </h3>

              <div className="space-y-3">
                {coupons.map((coupon) => (
                  <div key={coupon.code} className="p-4 rounded-2xl bg-gray-50 dark:bg-navy-850 border border-gray-200/80 dark:border-navy-800 flex items-center justify-between gap-4">
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
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-200 dark:bg-navy-800 rounded-xl transition-colors cursor-pointer"
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
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-navy-900 border border-gray-200/80 dark:border-gold-500/20 shadow-sm dark:shadow-xl space-y-6 animate-fadeIn transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-navy-800 pb-4">
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-navy-950 dark:text-white flex items-center gap-2">
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
              <table className="w-full text-left text-xs text-gray-700 dark:text-gray-300">
                <thead className="bg-gray-100 dark:bg-navy-950 text-gray-600 dark:text-gray-400 font-mono text-[11px] uppercase border-b border-gray-200 dark:border-navy-800">
                  <tr>
                    <th className="p-3.5">Timestamp</th>
                    <th className="p-3.5">Security Action</th>
                    <th className="p-3.5">Actor / ID</th>
                    <th className="p-3.5">Event Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-navy-800">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-100 dark:hover:bg-navy-850/60 transition-colors">
                      <td className="p-3.5 font-mono text-[11px] text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="p-3.5 font-bold text-gold-700 dark:text-gold-400 whitespace-nowrap">
                        {log.action}
                      </td>
                      <td className="p-3.5 font-mono text-gray-700 dark:text-gray-300 whitespace-nowrap font-medium">
                        {log.adminEmail || log.adminId || 'System Auth'}
                      </td>
                      <td className="p-3.5 text-gray-700 dark:text-gray-300 font-medium">
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
            <div className="md:col-span-5 p-6 rounded-3xl bg-white dark:bg-navy-900 border border-gray-200/80 dark:border-gold-500/20 shadow-sm dark:shadow-xl space-y-6 transition-colors">
              <div className="text-center space-y-3">
                <div className="w-20 h-20 rounded-full bg-navy-800 border-2 border-gold-500/40 mx-auto flex items-center justify-center shadow-gold-sm">
                  <ShieldCheck className="w-10 h-10 text-gold-400" />
                </div>
                <div>
                  <h4 className="font-serif text-xl font-bold text-navy-950 dark:text-white">{admin?.name}</h4>
                  <p className="text-xs font-mono text-gold-400">{admin?.email}</p>
                </div>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-gray-100 dark:border-navy-800 text-xs">
                <div className="flex justify-between py-1.5 border-b border-navy-800/60">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Assigned Role:</span>
                  <span className="font-bold text-gold-400 uppercase">Master Administrator</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-navy-800/60">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Account Status:</span>
                  <span className="font-bold text-green-400">Active (1/1 Single-Admin Lock)</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Authorization Level:</span>
                  <span className="font-mono text-gray-700 dark:text-gray-300 font-bold">Root / Full Store Control</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-7 p-6 rounded-3xl bg-white dark:bg-navy-900 border border-gray-200/80 dark:border-gold-500/20 shadow-sm dark:shadow-xl space-y-5 transition-colors">
              <h3 className="font-serif text-lg font-bold text-navy-950 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-navy-800 pb-3">
                <KeyRound className="w-5 h-5 text-gold-400" />
                <span>Update Master Admin Password</span>
              </h3>

              <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-gray-800 dark:text-gray-300 mb-1">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPass ? 'text' : 'password'}
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-3.5 pr-10 py-2.5 bg-gray-50 dark:bg-navy-850 text-navy-950 dark:text-white rounded-xl border border-gray-200 dark:border-navy-700 focus:border-gold-500"
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
                  <label className="block font-bold text-gray-800 dark:text-gray-300 mb-1">New Master Password (min 8 chars)</label>
                  <div className="relative">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-3.5 pr-10 py-2.5 bg-gray-50 dark:bg-navy-850 text-navy-950 dark:text-white rounded-xl border border-gray-200 dark:border-navy-700 focus:border-gold-500"
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
                  <label className="block font-bold text-gray-800 dark:text-gray-300 mb-1">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPass ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-3.5 pr-10 py-2.5 bg-gray-50 dark:bg-navy-850 text-navy-950 dark:text-white rounded-xl border border-gray-200 dark:border-navy-700 focus:border-gold-500"
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
          <div className="relative w-full max-w-2xl bg-white dark:bg-navy-900 border border-gray-200 dark:border-gold-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto space-y-5 text-navy-950 dark:text-white">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-navy-800 pb-3">
              <h3 className="font-serif text-lg font-bold text-navy-950 dark:text-white">
                {editingProduct ? 'Edit Catalog Product' : 'Add New Luxury Product'}
              </h3>
              <button onClick={() => setIsProductModalOpen(false)} className="p-1.5 text-gray-400 hover:text-white rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-800 dark:text-gray-300 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="e.g. Royal Chronograph Gold Wristwatch"
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-navy-850 text-navy-950 dark:text-white rounded-xl border border-gray-200 dark:border-navy-700 focus:border-gold-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-800 dark:text-gray-300 mb-1">Brand Name</label>
                  <input
                    type="text"
                    required
                    value={productForm.brand}
                    onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                    placeholder="e.g. A_S Signature"
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-navy-850 text-navy-950 dark:text-white rounded-xl border border-gray-200 dark:border-navy-700 focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-800 dark:text-gray-300 mb-1">Department / Category</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => {
                      const cat = e.target.value;
                      const catNames = { men: 'Men Fashion', women: 'Women Fashion', electronics: 'Electronics', 'home-living': 'Home & Living', beauty: 'Beauty', accessories: 'Accessories', footwear: 'Footwear' };
                      setProductForm({ ...productForm, category: cat, categoryName: catNames[cat] || cat });
                    }}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-navy-850 text-navy-950 dark:text-white rounded-xl border border-gray-200 dark:border-navy-700 focus:border-gold-500"
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
                  <label className="block font-bold text-gray-800 dark:text-gray-300 mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    placeholder="2499"
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-navy-850 text-navy-950 dark:text-white rounded-xl border border-gray-200 dark:border-navy-700 focus:border-gold-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-800 dark:text-gray-300 mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    value={productForm.originalPrice}
                    onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value })}
                    placeholder="4999"
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-navy-850 text-navy-950 dark:text-white rounded-xl border border-gray-200 dark:border-navy-700 focus:border-gold-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-800 dark:text-gray-300 mb-1">Discount (%)</label>
                  <input
                    type="number"
                    value={productForm.discount}
                    onChange={(e) => setProductForm({ ...productForm, discount: e.target.value })}
                    placeholder="50"
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-navy-850 text-navy-950 dark:text-white rounded-xl border border-gray-200 dark:border-navy-700 focus:border-gold-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-800 dark:text-gray-300 mb-1">Inventory Quantity</label>
                  <input
                    type="number"
                    value={productForm.stockCount}
                    onChange={(e) => setProductForm({ ...productForm, stockCount: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-navy-850 text-navy-950 dark:text-white rounded-xl border border-gray-200 dark:border-navy-700 focus:border-gold-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-800 dark:text-gray-300 mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={productForm.badge}
                    onChange={(e) => setProductForm({ ...productForm, badge: e.target.value })}
                    placeholder="e.g. BESTSELLER / 50% OFF"
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-navy-850 text-navy-950 dark:text-white rounded-xl border border-gray-200 dark:border-navy-700 focus:border-gold-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-800 dark:text-gray-300 mb-1">
                  Product Image (Upload File or Image URL)
                </label>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-navy-800 hover:bg-navy-750 text-gold-400 border border-gold-500/30 text-xs font-semibold cursor-pointer transition-colors shrink-0">
                      <UploadCloud className={`w-4 h-4 ${uploadingImage ? 'animate-bounce' : ''}`} />
                      <span>{uploadingImage ? 'Uploading Image...' : 'Upload Image File'}</span>
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
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-navy-850 text-navy-950 dark:text-white rounded-xl border border-gray-200 dark:border-navy-700 focus:border-gold-500 text-xs"
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
                <label className="block font-bold text-gray-800 dark:text-gray-300 mb-1">Bespoke Product Description</label>
                <textarea
                  rows={3}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Write description with luxury materials, craftsmanship..."
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-navy-850 text-navy-950 dark:text-white rounded-xl border border-gray-200 dark:border-navy-700 focus:border-gold-500"
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
          <div className="relative w-full max-w-md bg-white dark:bg-navy-900 border border-gray-200 dark:border-gold-500/30 rounded-3xl p-6 shadow-2xl z-10 space-y-5 text-navy-950 dark:text-white">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-navy-800 pb-3">
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
                <label className="block font-bold text-gray-800 dark:text-gray-300 mb-1">Delivery Stage Status</label>
                <select
                  value={orderDeliveryForm.status}
                  onChange={(e) => setOrderDeliveryForm({ ...orderDeliveryForm, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-100 dark:bg-navy-850 text-gold-400 font-bold rounded-xl border border-navy-700 focus:border-gold-500"
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
                <label className="block font-bold text-gray-800 dark:text-gray-300 mb-1">Carrier Partner</label>
                <input
                  type="text"
                  required
                  value={orderDeliveryForm.carrier}
                  onChange={(e) => setOrderDeliveryForm({ ...orderDeliveryForm, carrier: e.target.value })}
                  placeholder="e.g. Bluedart Express / Delhivery"
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-navy-850 text-navy-950 dark:text-white rounded-xl border border-gray-200 dark:border-navy-700 focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-800 dark:text-gray-300 mb-1">Carrier Tracking / AWB Number</label>
                <input
                  type="text"
                  required
                  value={orderDeliveryForm.trackingNumber}
                  onChange={(e) => setOrderDeliveryForm({ ...orderDeliveryForm, trackingNumber: e.target.value })}
                  placeholder="e.g. BD-889021482IN"
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-navy-850 text-navy-950 dark:text-white font-mono rounded-xl border border-gray-200 dark:border-navy-700 focus:border-gold-500"
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

      {/* FULL ORDER DOSSIER & LUXURY INVOICE MODAL */}
      {selectedOrderDossier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <div
            onClick={() => setSelectedOrderDossier(null)}
            className="fixed inset-0 bg-navy-950/85 backdrop-blur-md"
          />
          <div className="relative w-full max-w-3xl bg-white dark:bg-navy-900 border border-gray-200 dark:border-gold-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto space-y-6 text-navy-950 dark:text-white">
            
            {/* Modal Controls Header */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-navy-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-white">
                    Consignment Dossier #{selectedOrderDossier.id}
                  </h3>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-gold-500/20 text-gold-400 border border-gold-500/40">
                    {selectedOrderDossier.status || 'Processing'}
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  Created {selectedOrderDossier.createdAt ? new Date(selectedOrderDossier.createdAt).toLocaleString() : selectedOrderDossier.date || '2026-08-31'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintInvoice}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-navy-800 hover:bg-navy-750 text-gold-400 border border-gold-500/30 text-xs font-semibold transition-colors cursor-pointer"
                  title="Print Official Invoice"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Invoice</span>
                </button>
                <button
                  onClick={() => setSelectedOrderDossier(null)}
                  className="p-1.5 text-gray-400 hover:text-white rounded-xl bg-navy-800 hover:bg-navy-750 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Luxury Bill / Invoice Body */}
            <div id="printable-order-invoice" className="space-y-6 text-xs text-gray-300">
              
              {/* Luxury Invoice Brand Header */}
              <div className="p-4 rounded-2xl bg-navy-950/60 border border-navy-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-serif text-base font-bold text-white tracking-wide">
                    A_S COMMERCE HAUTE COUTURE
                  </h4>
                  <p className="text-[11px] text-gold-400 font-mono">
                    Tax Invoice / Bill of Supply • Ref: INV-{selectedOrderDossier.id?.substring(0, 8)?.toUpperCase()}
                  </p>
                  <span className="text-[10px] text-gray-600 dark:text-gray-400 font-medium">Authorized Luxury Merchant • GST Registered</span>
                </div>
                <div className="text-right space-y-0.5">
                  <span className="text-xs font-bold text-navy-950 dark:text-white block">Payment: {selectedOrderDossier.paymentMethod || 'Razorpay'}</span>
                  <span className="text-emerald-400 font-semibold text-[11px]">Status: {selectedOrderDossier.paymentStatus || 'Verified Paid'}</span>
                  <span className="text-[10px] text-gray-400 block">Currency: INR (₹)</span>
                </div>
              </div>

              {/* 2-Column Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Client Profile */}
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-navy-850 border border-gray-200/80 dark:border-navy-800 space-y-2">
                  <span className="text-[10px] font-bold text-gold-400 uppercase tracking-wider block">
                    PATRON & CONTACT DOSSIER
                  </span>
                  <p className="font-bold text-white text-sm">
                    {selectedOrderDossier.customerName || selectedOrderDossier.shippingAddress?.name || 'Valued Patron'}
                  </p>
                  <div className="space-y-1 text-[11px] text-gray-300">
                    <p className="flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-gold-400" />
                      {selectedOrderDossier.customerEmail || selectedOrderDossier.shippingAddress?.email || 'patron@ascommerce.luxury'}
                    </p>
                    {(selectedOrderDossier.customerPhone || selectedOrderDossier.shippingAddress?.phone) && (
                      <p className="flex items-center gap-1.5 font-mono">
                        <Phone className="w-3 h-3 text-gold-400" />
                        +{selectedOrderDossier.customerPhone || selectedOrderDossier.shippingAddress?.phone}
                      </p>
                    )}
                  </div>

                  {/* Customer Quick Links */}
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-navy-800">
                    {(selectedOrderDossier.customerPhone || selectedOrderDossier.shippingAddress?.phone) && (
                      <a
                        href={`https://wa.me/91${(selectedOrderDossier.customerPhone || selectedOrderDossier.shippingAddress?.phone || '').replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold hover:bg-emerald-500/20 border border-emerald-500/30"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>WhatsApp</span>
                      </a>
                    )}
                    {(selectedOrderDossier.customerPhone || selectedOrderDossier.shippingAddress?.phone) && (
                      <a
                        href={`tel:${(selectedOrderDossier.customerPhone || selectedOrderDossier.shippingAddress?.phone || '').replace(/[^0-9]/g, '')}`}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-navy-800 text-gray-300 text-[10px] hover:text-white border border-navy-700"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Call</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Delivery Logistics */}
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-navy-850 border border-gray-200/80 dark:border-navy-800 space-y-2">
                  <span className="text-[10px] font-bold text-gold-400 uppercase tracking-wider block">
                    DESTINATION & CARRIER
                  </span>
                  <p className="text-white text-xs leading-relaxed">
                    {selectedOrderDossier.shippingAddress?.street ? (
                      <>
                        {selectedOrderDossier.shippingAddress.street}, {selectedOrderDossier.shippingAddress.city}, {selectedOrderDossier.shippingAddress.state ? `${selectedOrderDossier.shippingAddress.state}, ` : ''}PIN: {selectedOrderDossier.shippingAddress.pincode}
                      </>
                    ) : (
                      'Standard Direct Delivery'
                    )}
                  </p>
                  <div className="pt-1 text-[11px] space-y-1 text-gray-300">
                    <p>Carrier: <strong className="text-navy-950 dark:text-white">{selectedOrderDossier.carrier || 'Bluedart Express'}</strong></p>
                    <p>AWB: <span className="font-mono text-gold-400 font-bold">{selectedOrderDossier.trackingNumber || 'Pending Assignment'}</span></p>
                  </div>
                </div>
              </div>

              {/* Itemized Goods Table */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-gold-400 uppercase tracking-wider block">
                  ORDERED LINE ITEMS ({selectedOrderDossier.items?.length || 1})
                </span>
                <div className="overflow-x-auto rounded-2xl border border-navy-800 bg-gray-100 dark:bg-navy-850">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-navy-950/80 text-gray-400 font-mono text-[10px] uppercase border-b border-navy-800">
                      <tr>
                        <th className="py-2.5 px-3">Item</th>
                        <th className="py-2.5 px-3">Unit Price</th>
                        <th className="py-2.5 px-3 text-center">Qty</th>
                        <th className="py-2.5 px-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-navy-800/60 text-gray-200">
                      {Array.isArray(selectedOrderDossier.items) && selectedOrderDossier.items.length > 0 ? (
                        selectedOrderDossier.items.map((it, idx) => (
                          <tr key={idx}>
                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={it.image || it.images?.[0] || 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=100'}
                                  alt={it.name}
                                  className="w-8 h-8 rounded-lg object-cover border border-navy-750 shrink-0"
                                />
                                <span className="font-medium text-white text-xs">{it.name}</span>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 font-mono text-gray-300">{formatINR(it.price || 0)}</td>
                            <td className="py-2.5 px-3 text-center font-bold text-gold-400">{it.quantity || 1}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-white">
                              {formatINR((it.price || 0) * (it.quantity || 1))}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-3 text-center text-gray-400">
                            Custom Haute Consignment Package
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Calculation Summary */}
              <div className="p-4 rounded-2xl bg-gray-100 dark:bg-navy-850 border border-gold-500/20 space-y-2 max-w-xs ml-auto text-xs">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span className="font-mono text-gray-200">{formatINR(selectedOrderDossier.total || selectedOrderDossier.total_amount || 0)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Insured Express Courier</span>
                  <span className="text-emerald-400 font-semibold">FREE (Luxury Tier)</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>GST & Handling</span>
                  <span className="text-gray-300">Included</span>
                </div>
                <div className="flex justify-between text-white font-bold border-t border-gray-100 dark:border-navy-800 pt-2 text-sm">
                  <span>Grand Total</span>
                  <span className="font-mono text-gold-400 font-serif text-base">
                    {formatINR(selectedOrderDossier.total || selectedOrderDossier.total_amount || 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-between border-t border-gray-100 dark:border-navy-800 pt-4">
              <button
                onClick={() => {
                  handleOpenDeliveryModal(selectedOrderDossier);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-750 text-gold-400 border border-gold-500/30 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Update Carrier / AWB</span>
              </button>

              <button
                onClick={() => setSelectedOrderDossier(null)}
                className="px-5 py-2 rounded-xl bg-gold-gradient text-navy-950 font-bold text-xs shadow-gold-sm hover:brightness-105 transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
