import React, { createContext, useContext, useState, useEffect } from 'react';
import { useCart } from './CartContext';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

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

  // Subscribe to Realtime Supabase changes on 'orders' table
  useEffect(() => {
    const channel = supabase
      .channel('realtime:public:orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('⚡ [Realtime Orders Update received]:', payload.eventType, payload.new || payload.old);
          if (payload.eventType === 'UPDATE' && payload.new) {
            const updated = payload.new;
            setOrders((prev) =>
              prev.map((o) => {
                if (o.id === updated.id) {
                  return {
                    ...o,
                    status: updated.status || o.status,
                    carrier: updated.carrier || o.carrier,
                    trackingNumber: updated.tracking_number || o.trackingNumber,
                    paymentStatus: updated.payment_status || o.paymentStatus,
                    estimatedDelivery: updated.estimated_delivery || o.estimatedDelivery,
                    updatedAt: updated.updated_at
                  };
                }
                return o;
              })
            );
          } else if (payload.eventType === 'INSERT' && payload.new) {
            const newOrder = payload.new;
            const mappedOrder = {
              id: newOrder.id,
              customerId: newOrder.user_id,
              customerName: newOrder.customer_name || 'Valued Customer',
              customerEmail: newOrder.user_email || newOrder.customer_email || '',
              customerPhone: newOrder.customer_phone || '',
              items: Array.isArray(newOrder.items) ? newOrder.items : (typeof newOrder.items === 'string' ? JSON.parse(newOrder.items || '[]') : []),
              subtotal: Number(newOrder.subtotal) || Number(newOrder.total_amount) || 0,
              total: Number(newOrder.total_amount) || 0,
              status: newOrder.status || 'Confirmed',
              carrier: newOrder.carrier || 'Bluedart Express Luxury Courier',
              trackingNumber: newOrder.tracking_number || '',
              paymentMethod: newOrder.payment_method || 'Razorpay',
              paymentStatus: newOrder.payment_status || 'Paid',
              date: newOrder.created_at ? newOrder.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
              estimatedDelivery: newOrder.estimated_delivery || '4-5 Business Days',
              shippingAddress: {
                name: newOrder.customer_name || 'Customer',
                email: newOrder.user_email || newOrder.customer_email || '',
                phone: newOrder.customer_phone || '',
                street: newOrder.shipping_street || '',
                city: newOrder.shipping_city || '',
                state: newOrder.shipping_state || '',
                pincode: newOrder.shipping_pincode || '',
              },
              createdAt: newOrder.created_at,
              updatedAt: newOrder.updated_at
            };

            if (!userEmail || (mappedOrder.customerEmail || '').toLowerCase() === userEmail) {
              setOrders((prev) => [mappedOrder, ...prev.filter(o => o.id !== mappedOrder.id)]);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userEmail]);

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
    const clean = id.toString().trim().toUpperCase();
    return orders.find((o) =>
      (o.id && o.id.toString().toUpperCase() === clean) ||
      (o.trackingNumber && o.trackingNumber.toString().toUpperCase() === clean)
    );
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
