import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useOrder } from '../context/OrderContext';
import { useToast } from '../context/ToastContext';
import { formatINR } from '../utils/currency';
import { processRazorpayPayment } from '../utils/razorpay';
import { validateAddressForm, isValidEmail, isValidIndianPhone, isValidIndianPincode } from '../utils/validationUtils';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  Truck,
  CreditCard,
  QrCode,
  Banknote,
  ChevronRight,
  User,
  Phone,
  MapPin,
  Sparkles,
  ArrowRight,
  Check,
  Plus,
  AlertCircle,
  Zap,
  Package,
  Calendar,
  Gift,
  Building2,
  Clock,
  MessageSquare,
  FileText,
  BadgePercent,
  Wallet,
  Receipt
} from 'lucide-react';

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, subtotal, couponDiscount, shippingFee, total, totalSavings, appliedCoupon } = useCart();
  const { user, isAuthenticated, setIsAuthModalOpen, setAuthMode, setAuthNotice } = useAuth();
  const { createOrder } = useOrder();
  const { addToast } = useToast();

  const [step, setStep] = useState(1); // 1: Address, 2: Delivery, 3: Payment
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [selectedSavedAddrId, setSelectedSavedAddrId] = useState(null);

  // Address Form State (Empty by default)
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
  });

  // Delivery Method State (NOT PRESELECTED)
  const [deliveryMode, setDeliveryMode] = useState(null); // null | 'standard' | 'express' | 'sameday'
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState('anytime'); // 'anytime' | 'morning' | 'evening'
  const [isGiftOrder, setIsGiftOrder] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');
  const [deliveryInstruction, setDeliveryInstruction] = useState('');

  const deliveryFee =
    deliveryMode === 'express'
      ? 149
      : deliveryMode === 'sameday'
      ? 249
      : 0;

  const finalTotal = total + deliveryFee;

  // Payment Method State (NOT PRESELECTED)
  const [paymentMethod, setPaymentMethod] = useState(null); // null | 'razorpay' | 'upi' | 'cards' | 'netbanking' | 'cod' | 'emi'
  const [isProcessing, setIsProcessing] = useState(false);

  // Sync user profile data and saved addresses
  useEffect(() => {
    if (user) {
      const defaultAddress = user.addresses?.find((a) => a.isDefault) || user.addresses?.[0];
      if (defaultAddress && !useNewAddress) {
        setSelectedSavedAddrId(defaultAddress.id);
        setFormData({
          fullName: defaultAddress.name || user.name || '',
          phone: defaultAddress.phone || user.phone || '',
          email: user.email || '',
          street: defaultAddress.street || '',
          city: defaultAddress.city || '',
          state: defaultAddress.state || '',
          pincode: defaultAddress.pincode || '',
        });
      } else {
        setFormData((prev) => ({
          ...prev,
          fullName: prev.fullName || user.name || '',
          email: user.email || '',
          phone: prev.phone || user.phone || '',
        }));
      }
    }
  }, [user, useNewAddress]);

  // Dynamic Estimated Delivery Dates
  const getDeliveryDates = () => {
    const today = new Date();
    const standardDate = new Date(today);
    standardDate.setDate(today.getDate() + 3);

    const expressDate = new Date(today);
    expressDate.setDate(today.getDate() + 1);

    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return {
      todayStr: today.toLocaleDateString('en-IN', options),
      standard: standardDate.toLocaleDateString('en-IN', options),
      express: expressDate.toLocaleDateString('en-IN', options),
    };
  };

  const deliveryDates = getDeliveryDates();

  // If user is not authenticated, prompt login
  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center animate-fadeIn">
        <div className="bg-white dark:bg-navy-900 rounded-3xl p-8 sm:p-12 border border-gold-500/30 shadow-2xl max-w-lg mx-auto space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-navy-900 dark:bg-navy-800 mx-auto flex items-center justify-center border border-gold-500/40 shadow-gold-sm">
            <Lock className="w-8 h-8 text-gold-400" />
          </div>
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-navy-950 dark:text-white">Authentication Required</h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
              Sign in or create your verified customer account to guarantee secure Razorpay payment verification, insurance, and live consignment tracking.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => {
                setAuthNotice('Please sign in to proceed with checkout.');
                setAuthMode('login');
                setIsAuthModalOpen(true);
              }}
              className="flex-1 py-3.5 bg-gold-gradient text-navy-950 font-bold text-xs sm:text-sm rounded-xl shadow-gold-sm hover:brightness-110 active:scale-98 transition-all cursor-pointer"
            >
              Sign In to Checkout
            </button>
            <button
              onClick={() => {
                setAuthNotice('Create an account to complete your order.');
                setAuthMode('register');
                setIsAuthModalOpen(true);
              }}
              className="flex-1 py-3.5 bg-navy-900 dark:bg-navy-800 text-gold-400 font-bold text-xs sm:text-sm rounded-xl hover:bg-navy-850 active:scale-98 transition-all border border-gold-500/30 cursor-pointer"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If cart is empty, redirect
  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center animate-fadeIn">
        <div className="bg-white dark:bg-navy-900 rounded-3xl p-10 border border-gray-200 dark:border-navy-750 shadow-sm space-y-4 max-w-md mx-auto">
          <h2 className="font-serif text-2xl font-bold text-navy-950 dark:text-white">Shopping Cart Empty</h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">There are no items in your cart to proceed with checkout.</p>
          <Link to="/shop" className="inline-block px-6 py-3 bg-gold-gradient text-navy-950 font-bold text-xs rounded-xl shadow-gold-sm hover:brightness-110">
            Discover Products
          </Link>
        </div>
      </div>
    );
  }

  const handleSelectSavedAddress = (addr) => {
    setSelectedSavedAddrId(addr.id);
    setUseNewAddress(false);
    setFormData({
      fullName: addr.name,
      phone: addr.phone,
      email: user?.email || '',
      street: addr.street,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
    });
  };

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Real-time Free India Pincode Auto-Detection for City & State
    if (name === 'pincode') {
      const cleanPin = value.replace(/\D/g, '').slice(0, 6);
      if (cleanPin.length === 6) {
        try {
          const res = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`);
          const data = await res.json();
          if (Array.isArray(data) && data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
            const po = data[0].PostOffice[0];
            setFormData((prev) => ({
              ...prev,
              city: prev.city || po.District || po.Block || '',
              state: prev.state || po.State || '',
            }));
          }
        } catch (e) {
          // Graceful fallback if offline
        }
      }
    }
  };

  const handleAddressSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();

    const validation = validateAddressForm({
      name: formData.fullName,
      phone: formData.phone,
      street: formData.street,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode,
    });

    if (!validation.isValid) {
      addToast(validation.error, 'error');
      return;
    }

    if (!isValidEmail(formData.email)) {
      addToast('Please enter a valid email address for order confirmation', 'error');
      return;
    }

    setStep(2);
  };

  const handleDeliverySubmit = () => {
    if (!deliveryMode) {
      addToast('Please select a delivery tier to proceed', 'error');
      return;
    }
    setStep(3);
  };

  const handleFinalPayment = async () => {
    if (!paymentMethod) {
      addToast('Please select your preferred payment method', 'error');
      return;
    }

    setIsProcessing(true);

    const deliveryTitle =
      deliveryMode === 'sameday'
        ? `Same-Day Express (${deliveryDates.todayStr}) • ${deliveryTimeSlot}`
        : deliveryMode === 'express'
        ? `Priority Air Express (${deliveryDates.express}) • ${deliveryTimeSlot}`
        : `Standard White-Glove (${deliveryDates.standard}) • ${deliveryTimeSlot}`;

    const paymentTitle =
      paymentMethod === 'razorpay'
        ? 'Razorpay All-in-One (UPI, Cards & NetBanking)'
        : paymentMethod === 'upi'
        ? 'Instant UPI (Google Pay, PhonePe, Paytm, BHIM)'
        : paymentMethod === 'cards'
        ? 'Credit / Debit Card (Visa, Mastercard, RuPay, Amex)'
        : paymentMethod === 'netbanking'
        ? 'NetBanking Direct (All Major Indian Banks)'
        : paymentMethod === 'cod'
        ? 'Cash on Delivery (Pay upon Receipt at Doorstep)'
        : 'No-Cost EMI (Pay in 3/6 Installments)';

    const paymentStatus = paymentMethod === 'cod' ? 'Pending (Cash on Delivery)' : 'Paid (Verified by Razorpay)';

    const orderPayload = {
      items: cartItems,
      subtotal,
      discount: couponDiscount,
      shipping: shippingFee + deliveryFee,
      total: finalTotal,
      couponCode: appliedCoupon?.code || '',
      shippingAddress: formData,
      paymentMethod: paymentTitle,
      paymentStatus,
      deliveryMode: deliveryTitle,
      giftOptions: isGiftOrder ? { isGift: true, message: giftMessage } : null,
      deliveryInstruction: deliveryInstruction.trim() || null,
    };

    // Razorpay Integration
    if (paymentMethod === 'cod') {
      await completeOrderProcess(orderPayload);
    } else {
      let paymentOrder;
      try {
        const paymentOrderResponse = await fetch('/api/payment/create-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('as_commerce_token') || ''}`,
          },
          body: JSON.stringify({
            amount: finalTotal,
            items: cartItems.map(({ id, quantity, selectedColor, selectedSize }) => ({ id, quantity, selectedColor, selectedSize })),
            couponCode: appliedCoupon?.code || '',
            deliveryMode: deliveryTitle,
            receipt: `AS-${Date.now().toString().slice(-8)}`,
          }),
        });
        paymentOrder = await paymentOrderResponse.json();
        if (!paymentOrderResponse.ok || !paymentOrder.success) throw new Error(paymentOrder.message || 'Unable to initialize payment');
      } catch (err) {
        setIsProcessing(false);
        addToast(err.message || 'Unable to initialize secure payment.', 'error');
        return;
      }

      const res = await processRazorpayPayment({
        orderId: paymentOrder.orderId,
        amount: finalTotal,
        userName: formData.fullName,
        userEmail: formData.email,
        userPhone: formData.phone,
        onSuccess: async (paymentInfo) => {
          await completeOrderProcess({ ...orderPayload, paymentVerification: paymentInfo });
        },
        onFailure: (err) => {
          setIsProcessing(false);
          addToast('Payment was cancelled or could not be completed.', 'error');
        }
      });

      if (!res?.isRealGateway) setIsProcessing(false);
    }
  };

  const completeOrderProcess = async (orderPayload) => {
    try {
      await createOrder(orderPayload);
      setIsProcessing(false);

      confetti({
        particleCount: 140,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#F5B83D', '#061A27', '#FFD36A', '#ffffff'],
      });

      navigate('/order-success');
    } catch (error) {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      
      {/* Checkout Progress Stepper */}
      <div className="max-w-2xl mx-auto mb-10">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 dark:bg-navy-750 -translate-y-1/2 z-0" />
          <div
            className="absolute top-1/2 left-0 h-0.5 bg-gold-500 -translate-y-1/2 z-0 transition-all duration-300"
            style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
          />

          {/* Step 1 */}
          <div className="relative z-10 flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                step >= 1 ? 'bg-navy-900 text-gold-400 border-2 border-gold-500 shadow-md' : 'bg-gray-200 dark:bg-navy-800 text-gray-500'
              }`}
            >
              1
            </div>
            <span className="text-[11px] font-bold text-navy-950 dark:text-white mt-1">Shipping</span>
          </div>

          {/* Step 2 */}
          <div className="relative z-10 flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                step >= 2 ? 'bg-navy-900 text-gold-400 border-2 border-gold-500 shadow-md' : 'bg-gray-200 dark:bg-navy-800 text-gray-500'
              }`}
            >
              2
            </div>
            <span className="text-[11px] font-bold text-navy-950 dark:text-white mt-1">Delivery</span>
          </div>

          {/* Step 3 */}
          <div className="relative z-10 flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                step >= 3 ? 'bg-navy-900 text-gold-400 border-2 border-gold-500 shadow-md' : 'bg-gray-200 dark:bg-navy-800 text-gray-500'
              }`}
            >
              3
            </div>
            <span className="text-[11px] font-bold text-navy-950 dark:text-white mt-1">Payment</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Form Steps (Col 8) + Summary (Col 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Dynamic Checkout Step Form */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* STEP 1: Address */}
          {step === 1 && (
            <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 sm:p-8 border border-gray-200/80 dark:border-navy-750 shadow-sm space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-navy-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-cream-100 dark:bg-navy-800 text-navy-900 border border-gold-500/20 shadow-gold-sm">
                    <MapPin className="w-5 h-5 text-gold-600 dark:text-gold-400" />
                  </div>
                  <div>
                    <h2 className="font-serif text-xl font-bold text-navy-950 dark:text-white">1. Shipping Address</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Where should we deliver your luxury parcel?</p>
                  </div>
                </div>
              </div>

              {/* Saved Address Selection if available */}
              {user.addresses && user.addresses.length > 0 && !useNewAddress && (
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                    Select Saved Address
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {user.addresses.map((addr) => {
                      const isOffice = addr.title?.toLowerCase() === 'office';
                      const isHome = addr.title?.toLowerCase() === 'home';
                      return (
                        <div
                          key={addr.id}
                          onClick={() => handleSelectSavedAddress(addr)}
                          className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                            selectedSavedAddrId === addr.id
                              ? 'border-gold-500 bg-gold-500/10 shadow-sm'
                              : 'border-gray-200 dark:border-navy-750 bg-gray-50/50 dark:bg-navy-850 hover:border-gold-500/30'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-xs text-navy-950 dark:text-gold-400 uppercase flex items-center gap-1.5">
                              {isHome ? '🏠 Home' : isOffice ? '🏢 Office' : '📍 Other'}
                            </span>
                            {selectedSavedAddrId === addr.id && (
                              <CheckCircle2 className="w-4 h-4 text-gold-500" />
                            )}
                          </div>
                          <p className="font-bold text-xs text-navy-950 dark:text-white">{addr.name}</p>
                          <p className="text-[11px] text-gray-600 dark:text-gray-300 truncate">
                            {addr.company ? `${addr.company}, ` : ''}{addr.street}, {addr.city} - {addr.pincode}
                          </p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 font-mono">📞 {addr.phone}</p>
                        </div>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setUseNewAddress(true);
                      setSelectedSavedAddrId(null);
                      setFormData({ fullName: user.name || '', phone: user.phone || '', email: user.email || '', street: '', city: '', state: '', pincode: '' });
                    }}
                    className="text-xs text-gold-600 dark:text-gold-400 font-bold hover:underline flex items-center gap-1 pt-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Deliver to a different address</span>
                  </button>
                </div>
              )}

              {/* Address Form (Manual or New) */}
              {(useNewAddress || !user.addresses || user.addresses.length === 0) && (
                <form onSubmit={handleAddressSubmit} className="space-y-4">
                  {user.addresses && user.addresses.length > 0 && (
                    <div className="flex justify-between items-center pb-2">
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Enter New Destination</span>
                      <button
                        type="button"
                        onClick={() => setUseNewAddress(false)}
                        className="text-xs text-gold-600 dark:text-gold-400 hover:underline cursor-pointer"
                      >
                        ← Use saved address
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        required
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="Recipient Full Name"
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-navy-850 text-navy-950 dark:text-white text-xs rounded-xl border border-gray-200 dark:border-navy-700 focus:outline-none focus:border-gold-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1">
                        Mobile No. *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="e.g. 9876543210"
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-navy-850 text-navy-950 dark:text-white text-xs rounded-xl border border-gray-200 dark:border-navy-700 focus:outline-none focus:border-gold-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1">
                      Email for Invoice & Tracking *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your.email@example.com"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-navy-850 text-navy-950 dark:text-white text-xs rounded-xl border border-gray-200 dark:border-navy-700 focus:outline-none focus:border-gold-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1">
                      Street Address / Flat / Building No. *
                    </label>
                    <input
                      type="text"
                      name="street"
                      required
                      value={formData.street}
                      onChange={handleInputChange}
                      placeholder="Flat No, Building, Street, Area"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-navy-850 text-navy-950 dark:text-white text-xs rounded-xl border border-gray-200 dark:border-navy-700 focus:outline-none focus:border-gold-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1">City *</label>
                      <input
                        type="text"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="City"
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-navy-850 text-navy-950 dark:text-white text-xs rounded-xl border border-gray-200 dark:border-navy-700 focus:outline-none focus:border-gold-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1">State *</label>
                      <input
                        type="text"
                        name="state"
                        required
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="State"
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-navy-850 text-navy-950 dark:text-white text-xs rounded-xl border border-gray-200 dark:border-navy-700 focus:outline-none focus:border-gold-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1">Pincode *</label>
                      <input
                        type="text"
                        name="pincode"
                        required
                        value={formData.pincode}
                        onChange={handleInputChange}
                        placeholder="e.g. 110001"
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-navy-850 text-navy-950 dark:text-white text-xs rounded-xl border border-gray-200 dark:border-navy-700 focus:outline-none focus:border-gold-500"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      className="px-8 py-3.5 bg-gold-gradient text-navy-950 font-bold text-xs sm:text-sm rounded-xl shadow-gold-sm hover:brightness-110 active:scale-98 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <span>Continue to Delivery Tier</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}

              {/* If using saved address and not new, direct continue button */}
              {!useNewAddress && user.addresses && user.addresses.length > 0 && (
                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={handleAddressSubmit}
                    className="px-8 py-3.5 bg-gold-gradient text-navy-950 font-bold text-xs sm:text-sm rounded-xl shadow-gold-sm hover:brightness-110 active:scale-98 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>Continue to Delivery Tier</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Delivery Tier & Logistics Customization (NOT PRESELECTED) */}
          {step === 2 && (
            <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 sm:p-8 border border-gray-200/80 dark:border-navy-750 shadow-sm space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-navy-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-cream-100 dark:bg-navy-800 text-navy-900 border border-gold-500/20 shadow-gold-sm">
                    <Truck className="w-5 h-5 text-gold-600 dark:text-gold-400" />
                  </div>
                  <div>
                    <h2 className="font-serif text-xl font-bold text-navy-950 dark:text-white">2. Delivery Preference</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Select your dispatch schedule & preferences</p>
                  </div>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="text-xs text-gold-600 dark:text-gold-400 font-semibold hover:underline cursor-pointer"
                >
                  Edit Address
                </button>
              </div>

              {/* Delivery Options Grid */}
              <div className="space-y-3.5">
                
                {/* 1. Standard White-Glove Shipping */}
                <div
                  onClick={() => setDeliveryMode('standard')}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all relative overflow-hidden ${
                    deliveryMode === 'standard'
                      ? 'border-gold-500 bg-gold-500/10 shadow-gold-sm ring-1 ring-gold-500/50'
                      : 'border-gray-200 dark:border-navy-750 bg-gray-50/50 dark:bg-navy-850 hover:border-gold-500/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center transition-all ${
                        deliveryMode === 'standard' ? 'border-gold-500 bg-gold-500' : 'border-gray-300 dark:border-navy-600'
                      }`}>
                        {deliveryMode === 'standard' && <div className="w-2 h-2 rounded-full bg-navy-950" />}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-navy-950 dark:text-white">
                            Standard White-Glove Shipping
                          </h4>
                          <span className="px-2 py-0.5 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-full">
                            Reliable
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Estimated delivery by <span className="font-semibold text-navy-950 dark:text-white">{deliveryDates.standard}</span>
                        </p>
                        <p className="text-[11px] text-gray-400 flex items-center gap-1 pt-1">
                          <Package className="w-3.5 h-3.5 text-gold-500" />
                          <span>Tamper-evident security packaging via Bluedart Express</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        {shippingFee === 0 ? 'FREE' : formatINR(shippingFee)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Priority Air Express */}
                <div
                  onClick={() => setDeliveryMode('express')}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all relative overflow-hidden ${
                    deliveryMode === 'express'
                      ? 'border-gold-500 bg-gold-500/10 shadow-gold-sm ring-1 ring-gold-500/50'
                      : 'border-gray-200 dark:border-navy-750 bg-gray-50/50 dark:bg-navy-850 hover:border-gold-500/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center transition-all ${
                        deliveryMode === 'express' ? 'border-gold-500 bg-gold-500' : 'border-gray-300 dark:border-navy-600'
                      }`}>
                        {deliveryMode === 'express' && <div className="w-2 h-2 rounded-full bg-navy-950" />}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-navy-950 dark:text-white">
                            Priority Air Express (Next Day Flight Dispatch)
                          </h4>
                          <span className="px-2.5 py-0.5 bg-gold-gradient text-navy-950 text-[10px] font-extrabold rounded-full uppercase shadow-gold-sm">
                            Fastest
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Guaranteed delivery by <span className="font-semibold text-gold-600 dark:text-gold-400">{deliveryDates.express}</span>
                        </p>
                        <p className="text-[11px] text-gray-400 flex items-center gap-1 pt-1">
                          <Gift className="w-3.5 h-3.5 text-gold-500" />
                          <span>Dedicated luxury gift box with gold ribbon & priority aircraft routing</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-bold text-navy-950 dark:text-gold-400 font-serif">
                        +₹149
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Same-Day Metro Dispatch */}
                <div
                  onClick={() => setDeliveryMode('sameday')}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all relative overflow-hidden ${
                    deliveryMode === 'sameday'
                      ? 'border-gold-500 bg-gold-500/10 shadow-gold-sm ring-1 ring-gold-500/50'
                      : 'border-gray-200 dark:border-navy-750 bg-gray-50/50 dark:bg-navy-850 hover:border-gold-500/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center transition-all ${
                        deliveryMode === 'sameday' ? 'border-gold-500 bg-gold-500' : 'border-gray-300 dark:border-navy-600'
                      }`}>
                        {deliveryMode === 'sameday' && <div className="w-2 h-2 rounded-full bg-navy-950" />}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-navy-950 dark:text-white">
                            Same-Day Ultra Metro Dispatch
                          </h4>
                          <span className="px-2 py-0.5 bg-blue-500/15 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded-full">
                            Within 12 Hours
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Delivers Today (<span className="font-semibold text-navy-950 dark:text-white">{deliveryDates.todayStr}</span>) via dedicated courier
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-bold text-navy-950 dark:text-gold-400 font-serif">
                        +₹249
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Delivery Time Slot Preference */}
              <div className="p-4 bg-gray-50 dark:bg-navy-850 rounded-2xl border border-gray-200/80 dark:border-navy-750 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-navy-950 dark:text-white">
                  <Clock className="w-4 h-4 text-gold-500" />
                  <span>Preferred Delivery Time Window</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setDeliveryTimeSlot('anytime')}
                    className={`py-2 px-3 rounded-xl border text-center font-medium transition-all ${
                      deliveryTimeSlot === 'anytime'
                        ? 'border-gold-500 bg-gold-500/15 text-gold-600 dark:text-gold-400 font-bold'
                        : 'border-gray-200 dark:border-navy-700 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    Anytime (9 AM - 9 PM)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryTimeSlot('morning')}
                    className={`py-2 px-3 rounded-xl border text-center font-medium transition-all ${
                      deliveryTimeSlot === 'morning'
                        ? 'border-gold-500 bg-gold-500/15 text-gold-600 dark:text-gold-400 font-bold'
                        : 'border-gray-200 dark:border-navy-700 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    Morning (9 AM - 1 PM)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryTimeSlot('evening')}
                    className={`py-2 px-3 rounded-xl border text-center font-medium transition-all ${
                      deliveryTimeSlot === 'evening'
                        ? 'border-gold-500 bg-gold-500/15 text-gold-600 dark:text-gold-400 font-bold'
                        : 'border-gray-200 dark:border-navy-700 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    Evening (2 PM - 8 PM)
                  </button>
                </div>
              </div>

              {/* Complimentary Gift Box Option */}
              <div className="p-4 bg-gray-50 dark:bg-navy-850 rounded-2xl border border-gray-200/80 dark:border-navy-750 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isGiftOrder}
                    onChange={(e) => setIsGiftOrder(e.target.checked)}
                    className="w-4 h-4 accent-gold-500 rounded"
                  />
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-gold-500" />
                    <span className="text-xs font-bold text-navy-950 dark:text-white">
                      This order is a gift (Include complimentary gift card & hide price tag)
                    </span>
                  </div>
                </label>

                {isGiftOrder && (
                  <div className="pt-2 animate-fadeIn">
                    <textarea
                      value={giftMessage}
                      onChange={(e) => setGiftMessage(e.target.value)}
                      placeholder="Write your personalized gift message here (Printed on gold foil card)..."
                      rows={2}
                      className="w-full px-4 py-2 bg-white dark:bg-navy-900 text-xs rounded-xl border border-gray-200 dark:border-navy-700 focus:outline-none focus:border-gold-500 text-navy-950 dark:text-white"
                    />
                  </div>
                )}
              </div>

              {/* Delivery Instructions */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  Courier Delivery Instructions (Optional)
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {['Call before arrival', 'Leave with security guard', 'Do not ring doorbell', 'Handle with care'].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setDeliveryInstruction((prev) => (prev ? `${prev}, ${chip}` : chip))}
                      className="text-[11px] px-2.5 py-1 bg-gray-100 dark:bg-navy-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gold-500/20 hover:text-gold-500 transition-all cursor-pointer"
                    >
                      + {chip}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={deliveryInstruction}
                  onChange={(e) => setDeliveryInstruction(e.target.value)}
                  placeholder="e.g. Leave parcel at front gate with security guard"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-navy-850 text-navy-950 dark:text-white text-xs rounded-xl border border-gray-200 dark:border-navy-700 focus:outline-none focus:border-gold-500"
                />
              </div>

              {/* Step 2 Actions */}
              <div className="pt-4 flex items-center justify-between border-t border-gray-100 dark:border-navy-800">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-gold-400 cursor-pointer"
                >
                  ← Back to Address
                </button>
                <button
                  type="button"
                  onClick={handleDeliverySubmit}
                  className="px-8 py-3.5 bg-gold-gradient text-navy-950 font-bold text-xs sm:text-sm rounded-xl shadow-gold-sm hover:brightness-110 active:scale-98 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Proceed to Payment</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Complete Payment Suite (NOT PRESELECTED) */}
          {step === 3 && (
            <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 sm:p-8 border border-gray-200/80 dark:border-navy-750 shadow-sm space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-navy-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-cream-100 dark:bg-navy-800 text-navy-900 border border-gold-500/20 shadow-gold-sm">
                    <Lock className="w-5 h-5 text-gold-600 dark:text-gold-400" />
                  </div>
                  <div>
                    <h2 className="font-serif text-xl font-bold text-navy-950 dark:text-white">3. Payment Gateway</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Choose your preferred transaction method</p>
                  </div>
                </div>
                <button
                  onClick={() => setStep(2)}
                  className="text-xs text-gold-600 dark:text-gold-400 font-semibold hover:underline cursor-pointer"
                >
                  Change Delivery
                </button>
              </div>

              {/* Razorpay Trust Header */}
              <div className="p-4 rounded-2xl bg-navy-850 border border-gold-500/30 text-white flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-gold-400 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-white">Bank-Grade 256-Bit SSL Encryption</p>
                    <p className="text-[11px] text-gray-400">PCI-DSS Level 1 Compliant • Powered by Razorpay</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30">
                    100% Protected
                  </span>
                </div>
              </div>

              {/* Payment Methods Grid */}
              <div className="space-y-3.5">
                
                {/* 1. Razorpay All-in-One Gateway */}
                <div
                  onClick={() => setPaymentMethod('razorpay')}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'razorpay'
                      ? 'border-gold-500 bg-gold-500/10 shadow-gold-sm ring-1 ring-gold-500/50'
                      : 'border-gray-200 dark:border-navy-750 bg-gray-50/50 dark:bg-navy-850 hover:border-gold-500/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center transition-all ${
                        paymentMethod === 'razorpay' ? 'border-gold-500 bg-gold-500' : 'border-gray-300 dark:border-navy-600'
                      }`}>
                        {paymentMethod === 'razorpay' && <div className="w-2 h-2 rounded-full bg-navy-950" />}
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-navy-950 dark:text-white flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-gold-500" />
                            <span>Razorpay Express Gateway (UPI, Cards & NetBanking)</span>
                          </h4>
                          <span className="px-2 py-0.5 bg-gold-gradient text-navy-950 font-extrabold text-[10px] rounded-md shadow-gold-sm">
                            Recommended
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                          All-in-one checkout supporting Google Pay, PhonePe, Paytm, BHIM UPI, Visa, Mastercard, RuPay, Amex & NetBanking.
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 pt-1.5 text-[10px] font-bold text-gray-700 dark:text-gray-200">
                          <span className="px-2.5 py-1 bg-white dark:bg-navy-900 border border-gold-500/30 rounded-lg shadow-xs flex items-center gap-1">
                            <span className="text-blue-500 font-black">G</span>Pay
                          </span>
                          <span className="px-2.5 py-1 bg-white dark:bg-navy-900 border border-gold-500/30 rounded-lg shadow-xs text-purple-500 font-bold">
                            PhonePe
                          </span>
                          <span className="px-2.5 py-1 bg-white dark:bg-navy-900 border border-gold-500/30 rounded-lg shadow-xs text-sky-500 font-bold">
                            Paytm
                          </span>
                          <span className="px-2.5 py-1 bg-white dark:bg-navy-900 border border-gold-500/30 rounded-lg shadow-xs font-serif font-black text-navy-950 dark:text-gold-400">
                            VISA
                          </span>
                          <span className="px-2.5 py-1 bg-white dark:bg-navy-900 border border-gold-500/30 rounded-lg shadow-xs text-red-500 font-bold">
                            Mastercard
                          </span>
                          <span className="px-2.5 py-1 bg-white dark:bg-navy-900 border border-gold-500/30 rounded-lg shadow-xs text-orange-500 font-bold">
                            RuPay
                          </span>
                          <span className="px-2.5 py-1 bg-white dark:bg-navy-900 border border-gold-500/30 rounded-lg shadow-xs text-emerald-600 font-bold">
                            50+ NetBanks
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Instant Direct UPI */}
                <div
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'upi'
                      ? 'border-gold-500 bg-gold-500/10 shadow-gold-sm ring-1 ring-gold-500/50'
                      : 'border-gray-200 dark:border-navy-750 bg-gray-50/50 dark:bg-navy-850 hover:border-gold-500/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center transition-all ${
                        paymentMethod === 'upi' ? 'border-gold-500 bg-gold-500' : 'border-gray-300 dark:border-navy-600'
                      }`}>
                        {paymentMethod === 'upi' && <div className="w-2 h-2 rounded-full bg-navy-950" />}
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-bold text-sm text-navy-950 dark:text-white flex items-center gap-2">
                          <QrCode className="w-4 h-4 text-gold-500" />
                          <span>Direct Instant UPI (Google Pay, PhonePe, Paytm, BHIM)</span>
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Scan QR or authorize payment directly via your mobile UPI App with 0% extra fee.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Credit / Debit Cards Direct */}
                <div
                  onClick={() => setPaymentMethod('cards')}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'cards'
                      ? 'border-gold-500 bg-gold-500/10 shadow-gold-sm ring-1 ring-gold-500/50'
                      : 'border-gray-200 dark:border-navy-750 bg-gray-50/50 dark:bg-navy-850 hover:border-gold-500/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center transition-all ${
                        paymentMethod === 'cards' ? 'border-gold-500 bg-gold-500' : 'border-gray-300 dark:border-navy-600'
                      }`}>
                        {paymentMethod === 'cards' && <div className="w-2 h-2 rounded-full bg-navy-950" />}
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-bold text-sm text-navy-950 dark:text-white flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-gold-500" />
                          <span>Credit & Debit Cards (Visa, Mastercard, RuPay, Amex)</span>
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Secure tokenized transactions with instant OTP verification.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. NetBanking Direct */}
                <div
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'netbanking'
                      ? 'border-gold-500 bg-gold-500/10 shadow-gold-sm ring-1 ring-gold-500/50'
                      : 'border-gray-200 dark:border-navy-750 bg-gray-50/50 dark:bg-navy-850 hover:border-gold-500/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center transition-all ${
                        paymentMethod === 'netbanking' ? 'border-gold-500 bg-gold-500' : 'border-gray-300 dark:border-navy-600'
                      }`}>
                        {paymentMethod === 'netbanking' && <div className="w-2 h-2 rounded-full bg-navy-950" />}
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-bold text-sm text-navy-950 dark:text-white flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-gold-500" />
                          <span>NetBanking (HDFC, ICICI, SBI, Axis, Kotak & 50+ Banks)</span>
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Direct corporate and retail banking authorization.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. Cash on Delivery (Pay on Receipt) */}
                <div
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-gold-500 bg-gold-500/10 shadow-gold-sm ring-1 ring-gold-500/50'
                      : 'border-gray-200 dark:border-navy-750 bg-gray-50/50 dark:bg-navy-850 hover:border-gold-500/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center transition-all ${
                        paymentMethod === 'cod' ? 'border-gold-500 bg-gold-500' : 'border-gray-300 dark:border-navy-600'
                      }`}>
                        {paymentMethod === 'cod' && <div className="w-2 h-2 rounded-full bg-navy-950" />}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-navy-950 dark:text-white flex items-center gap-2">
                            <Banknote className="w-4 h-4 text-gold-500" />
                            <span>Cash on Delivery (Pay upon Receipt)</span>
                          </h4>
                          <span className="px-2 py-0.5 bg-gray-200 dark:bg-navy-750 text-gray-700 dark:text-gray-300 text-[10px] font-bold rounded-md">
                            Doorstep Verification
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Inspect your package upon arrival before completing payment via Cash, UPI, or Card machine to the courier.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 6. No Cost EMI & PayLater */}
                <div
                  onClick={() => setPaymentMethod('emi')}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'emi'
                      ? 'border-gold-500 bg-gold-500/10 shadow-gold-sm ring-1 ring-gold-500/50'
                      : 'border-gray-200 dark:border-navy-750 bg-gray-50/50 dark:bg-navy-850 hover:border-gold-500/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center transition-all ${
                        paymentMethod === 'emi' ? 'border-gold-500 bg-gold-500' : 'border-gray-300 dark:border-navy-600'
                      }`}>
                        {paymentMethod === 'emi' && <div className="w-2 h-2 rounded-full bg-navy-950" />}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-navy-950 dark:text-white flex items-center gap-2">
                            <Receipt className="w-4 h-4 text-gold-500" />
                            <span>No-Cost EMI & PayLater</span>
                          </h4>
                          <span className="px-2 py-0.5 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-md">
                            0% Interest
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Pay in 3 or 6 easy monthly installments with major credit cards, Simpl, or ZestMoney.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-gray-100 dark:border-navy-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-gold-400 cursor-pointer"
                >
                  ← Back to Delivery
                </button>
                <button
                  type="button"
                  disabled={isProcessing || !paymentMethod}
                  onClick={handleFinalPayment}
                  className="px-10 py-4 bg-gold-gradient text-navy-950 font-bold text-xs sm:text-sm rounded-xl shadow-gold-sm hover:brightness-110 active:scale-98 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Lock className="w-4 h-4" />
                  <span>
                    {isProcessing
                      ? 'Processing Order...'
                      : paymentMethod === 'cod'
                      ? `Place COD Order • ${formatINR(finalTotal)}`
                      : paymentMethod
                      ? `Pay & Place Order • ${formatINR(finalTotal)}`
                      : 'Select Payment Method'}
                  </span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Right Side: Order Review Summary (Col 4) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-gray-200/80 dark:border-navy-750 shadow-sm space-y-4">
            <h3 className="font-serif text-lg font-bold text-navy-950 dark:text-white pb-3 border-b border-gray-100 dark:border-navy-800">
              Order Summary ({cartItems.length} items)
            </h3>

            {/* List of items */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={item.cartItemId} className="flex gap-3 items-center text-xs">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 rounded-xl object-cover border border-gray-200 dark:border-navy-700 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-navy-950 dark:text-white truncate">{item.name}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-[11px]">
                      Qty: {item.quantity} {item.selectedColor ? `• ${item.selectedColor}` : ''}
                    </p>
                  </div>
                  <span className="font-bold text-navy-950 dark:text-white font-serif">
                    {formatINR(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400 pt-3 border-t border-gray-100 dark:border-navy-800">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-navy-950 dark:text-white">{formatINR(subtotal)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                  <span>Discount</span>
                  <span>-{formatINR(couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-semibold text-navy-950 dark:text-white">
                  {shippingFee === 0 ? <span className="text-emerald-600 dark:text-emerald-400 font-bold">FREE</span> : formatINR(shippingFee)}
                </span>
              </div>
              {deliveryFee > 0 && (
                <div className="flex justify-between text-gold-600 dark:text-gold-400 font-bold">
                  <span>Delivery Speed Fee</span>
                  <span>+{formatINR(deliveryFee)}</span>
                </div>
              )}
              <div className="flex justify-between items-baseline pt-3 border-t border-gray-200 dark:border-navy-750 text-base font-bold text-navy-950 dark:text-white">
                <span>Final Total</span>
                <span className="text-2xl text-gold-600 dark:text-gold-400 font-serif">{formatINR(finalTotal)}</span>
              </div>
            </div>

            {/* Delivery address preview if past step 1 */}
            {step > 1 && (
              <div className="p-3 bg-gray-50 dark:bg-navy-850 rounded-2xl border border-gray-200/80 dark:border-navy-700 text-[11px] space-y-1 animate-fadeIn">
                <p className="font-bold text-navy-950 dark:text-gold-400">Shipping Destination:</p>
                <p className="text-gray-700 dark:text-gray-300 font-medium">{formData.fullName} ({formData.phone})</p>
                <p className="text-gray-600 dark:text-gray-400">{formData.street}, {formData.city}, {formData.state} - {formData.pincode}</p>
                {deliveryInstruction && (
                  <p className="text-[10px] text-gray-500 italic pt-1">Note: "{deliveryInstruction}"</p>
                )}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
