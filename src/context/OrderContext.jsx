import React, { createContext, useContext, useState, useEffect } from 'react';
import { useCart } from './CartContext';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';

const OrderContext = createContext(null);

export const OrderProvider = ({ children }) => {
  const { addToast } = useToast();
  const { clearCart } = useCart();
  const { user } = useAuth();

  const userEmail = (user?.email || '').trim().toLowerCase();
  const storageKey = userEmail ? `as_commerce_orders_${userEmail}` : 'as_commerce_orders_guest';

  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load orders', e);
    }
    return [];
  });

  const [latestOrder, setLatestOrder] = useState(null);

  // Re-load and sync orders whenever the logged-in customer changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      setOrders(saved ? JSON.parse(saved) : []);
    } catch (e) {
      setOrders([]);
    }

    if (!userEmail) return;

    const fetchBackendOrders = async () => {
      try {
        const res = await fetch(`/api/orders?email=${encodeURIComponent(userEmail)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.orders)) {
            setOrders((prev) => {
              const map = new Map();
              [...data.orders, ...prev].forEach((o) => {
                if (o && o.id && !map.has(o.id)) map.set(o.id, o);
              });
              return Array.from(map.values());
            });
          }
        }
      } catch (err) {}
    };

    fetchBackendOrders();
  }, [userEmail, storageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(orders));
    } catch (e) {
      console.error('Failed to save orders', e);
    }
  }, [orders, storageKey]);

  const createOrder = ({
    items,
    subtotal,
    discount,
    shipping,
    total,
    shippingAddress,
    paymentMethod = 'Razorpay / Online',
    paymentStatus = 'Paid',
    deliveryMode = 'Standard Delivery',
  }) => {
    const orderId = `AS-${Math.floor(100000 + Math.random() * 900000)}`;
    const today = new Date();
    const estDate = new Date(today);
    estDate.setDate(estDate.getDate() + (deliveryMode.includes('Express') ? 2 : 4));

    const newOrder = {
      id: orderId,
      customerId: user?.id || null,
      customerEmail: userEmail || (shippingAddress?.email || '').trim().toLowerCase(),
      customerName: user?.name || shippingAddress?.name || 'Valued Customer',
      customerPhone: user?.phone || shippingAddress?.phone || '',
      date: today.toISOString().split('T')[0],
      status: 'Order Placed',
      statusCode: 2,
      estimatedDelivery: estDate.toISOString().split('T')[0],
      carrier: 'Bluedart Express Luxury Courier',
      trackingNumber: `BD-${Math.floor(100000000 + Math.random() * 900000000)}IN`,
      items,
      subtotal,
      discount,
      shipping,
      total,
      paymentMethod,
      paymentStatus,
      deliveryMode,
      shippingAddress,
      timeline: [
        { step: 'Order Placed', time: 'Just now', done: true, desc: 'Order confirmed in A_S Commerce system' },
        { step: 'Payment Confirmed', time: 'Just now', done: true, desc: `Payment of ₹${total.toLocaleString('en-IN')} confirmed` },
        { step: 'Processing', time: 'Scheduled today', done: false, desc: 'Luxury packaging & inspection' },
        { step: 'Shipped', time: 'Pending dispatch', done: false, desc: 'Handed over to carrier' },
        { step: 'Out for Delivery', time: 'Pending', done: false, desc: 'On final delivery vehicle' },
        { step: 'Delivered', time: `Estimated ${estDate.toDateString()}`, done: false, desc: 'Delivered to shipping address' }
      ]
    };

    setOrders((prev) => [newOrder, ...prev]);
    setLatestOrder(newOrder);
    clearCart(true); // Silent clear to prevent duplicate 'Shopping bag cleared' toast

    // Persist order to Backend server & Supabase database
    try {
      fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      }).catch((err) => console.warn('Order database sync note:', err));
    } catch (e) {}

    addToast(`Order #${orderId} placed successfully!`, 'success', 3000, {
      id: 'order-placed-success',
      desc: 'Thank you for your order! Confirmation details generated.',
    });
    return newOrder;
  };

  const getOrderById = (id) => {
    if (!id) return null;
    const clean = id.trim().toUpperCase();
    return orders.find((o) => o.id.toUpperCase() === clean || o.trackingNumber.toUpperCase() === clean);
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        latestOrder,
        createOrder,
        getOrderById,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) throw new Error('useOrder must be used within OrderProvider');
  return context;
};
