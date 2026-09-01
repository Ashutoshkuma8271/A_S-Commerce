import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useOrder } from '../context/OrderContext';
import { useToast } from '../context/ToastContext';
import { formatINR } from '../utils/currency';
import { downloadOrderInvoice } from '../utils/invoiceGenerator';
import {
  Search,
  Package,
  CheckCircle2,
  Clock,
  Truck,
  MapPin,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  FileText,
} from 'lucide-react';

export const TrackOrderPage = () => {
  const [searchParams] = useSearchParams();
  const { getOrderById, orders } = useOrder();
  const { addToast } = useToast();

  const urlId = searchParams.get('id') || '';
  const [searchQuery, setSearchQuery] = useState(urlId || (orders[0]?.id || ''));
  const [activeOrder, setActiveOrder] = useState(() => getOrderById(urlId) || orders[0] || null);

  useEffect(() => {
    if (urlId) {
      const found = getOrderById(urlId);
      if (found) {
        setActiveOrder(found);
        setSearchQuery(urlId);
      }
    } else if (orders.length > 0 && !activeOrder) {
      setActiveOrder(orders[0]);
      setSearchQuery(orders[0].id);
    }
  }, [urlId, orders]);

  // Keep activeOrder synchronized with live status updates from OrderContext
  useEffect(() => {
    if (activeOrder && activeOrder.id) {
      const updated = getOrderById(activeOrder.id);
      if (updated && (updated.status !== activeOrder.status || updated.trackingNumber !== activeOrder.trackingNumber)) {
        setActiveOrder(updated);
      }
    }
  }, [orders]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      addToast('Please enter an Order ID or Tracking Number', 'error');
      return;
    }
    const found = getOrderById(searchQuery.trim());
    if (found) {
      setActiveOrder(found);
      addToast('Consignment details found', 'success');
    } else {
      setActiveOrder(null);
      addToast('No consignment found with this ID', 'error');
    }
  };

  // Helper to dynamically build timeline milestones based on real-time order status
  const getOrderTimeline = (order) => {
    if (!order) return [];
    if (Array.isArray(order.timeline) && order.timeline.length > 0) {
      return order.timeline;
    }

    const status = (order.status || 'Confirmed').toLowerCase();
    const isPlaced = true;
    const isPaid = (order.paymentStatus || 'Paid').toLowerCase() === 'paid' || status !== 'pending';
    const isProcessing = ['processing', 'confirmed', 'shipped', 'out for delivery', 'delivered'].some(s => status.includes(s));
    const isShipped = ['shipped', 'out for delivery', 'delivered'].some(s => status.includes(s));
    const isOutForDelivery = ['out for delivery', 'delivered'].some(s => status.includes(s));
    const isDelivered = status.includes('delivered');

    return [
      {
        step: 'Order Placed',
        time: order.date || 'Confirmed',
        done: isPlaced,
        desc: 'Order registered in A_S Commerce master inventory system'
      },
      {
        step: 'Payment Verified',
        time: order.paymentStatus || 'Paid',
        done: isPaid,
        desc: `Payment of ${formatINR(order.total || 0)} verified via ${order.paymentMethod || 'Razorpay'}`
      },
      {
        step: 'Processing & Inspection',
        time: isProcessing ? 'Completed' : 'Scheduled',
        done: isProcessing,
        desc: 'Artisanal packaging, luxury seal, and multi-point quality check'
      },
      {
        step: 'Dispatched with Courier',
        time: order.trackingNumber ? `Waybill: ${order.trackingNumber}` : (isShipped ? 'In Transit' : 'Pending dispatch'),
        done: isShipped,
        desc: `Handed over to ${order.carrier || 'Bluedart Express Luxury Logistics'}`
      },
      {
        step: 'Out for Delivery',
        time: isOutForDelivery ? 'Out for Delivery' : 'In Transit',
        done: isOutForDelivery,
        desc: 'Consignment is in your local delivery hub for scheduled handoff'
      },
      {
        step: 'Delivered',
        time: isDelivered ? 'Delivered' : `Expected: ${order.estimatedDelivery || 'In 3-4 days'}`,
        done: isDelivered,
        desc: 'Successfully delivered to verified recipient address'
      }
    ];
  };

  const timeline = activeOrder ? getOrderTimeline(activeOrder) : [];
  const shipping = activeOrder?.shippingAddress || {};
  const recipientName = shipping.name || shipping.fullName || activeOrder?.customerName || 'Valued Customer';
  const recipientPhone = shipping.phone || activeOrder?.customerPhone || '';
  const recipientStreet = shipping.street || activeOrder?.shippingStreet || 'Main Delivery Location';
  const recipientCity = shipping.city || activeOrder?.shippingCity || '';
  const recipientState = shipping.state || activeOrder?.shippingState || '';
  const recipientPincode = shipping.pincode || activeOrder?.shippingPincode || '';
  const itemsList = Array.isArray(activeOrder?.items) ? activeOrder.items : [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="text-center mb-8">
        <span className="text-xs font-bold uppercase tracking-widest text-gold-600 font-sans">
          Real-Time Logistics
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-navy-950 mt-1">
          Track Your Luxury Consignment
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto mt-2">
          Enter your Order ID or tracking code to view live milestones and download tax invoices.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-gray-200/80 shadow-sm mb-10 max-w-2xl mx-auto">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gold-600 absolute left-4 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. AS-259049 or Tracking ID"
              className="w-full pl-11 pr-4 py-3 bg-gray-50 text-xs sm:text-sm rounded-2xl border border-gray-200 focus:outline-none focus:border-gold-500 font-mono font-bold uppercase"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-gold-gradient text-navy-950 font-bold text-xs sm:text-sm rounded-2xl shadow-gold-sm hover:brightness-105 transition-all cursor-pointer"
          >
            Track Status
          </button>
        </form>

        {/* Quick Suggestion Pills */}
        {orders.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
            <span>Recent orders:</span>
            {orders.slice(0, 4).map((ord) => (
              <button
                key={ord.id}
                type="button"
                onClick={() => {
                  setSearchQuery(ord.id);
                  setActiveOrder(ord);
                }}
                className="font-mono text-gold-700 hover:underline font-bold bg-gold-500/10 px-2.5 py-1 rounded-lg cursor-pointer"
              >
                #{ord.id}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tracking Details & Timeline */}
      {activeOrder ? (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-sm space-y-8 animate-fadeIn">
          
          {/* Order Header Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base sm:text-lg font-bold text-navy-950">
                  Order #{activeOrder.id}
                </span>
                <span className="px-3 py-0.5 bg-gold-500/15 text-navy-950 border border-gold-500/30 text-[11px] font-bold rounded-full">
                  {activeOrder.status || 'Confirmed'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Placed on {activeOrder.date || 'Recent'} via {activeOrder.carrier || 'Bluedart Express Luxury Logistics'}
              </p>
              {activeOrder.trackingNumber && (
                <p className="text-xs text-gold-700 font-mono font-bold mt-0.5">
                  Waybill Tracking: {activeOrder.trackingNumber}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:items-end gap-2">
              <button
                onClick={() => downloadOrderInvoice(activeOrder)}
                className="px-3.5 py-1.5 bg-white hover:bg-gold-50 border border-gold-500/40 text-navy-950 font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                title="Download Official Tax Invoice"
              >
                <FileText className="w-3.5 h-3.5 text-gold-600" />
                <span>Download Invoice</span>
              </button>
              <div className="text-left sm:text-right">
                <span className="text-[11px] text-gray-400 block">Estimated Delivery</span>
                <span className="text-sm font-bold text-navy-950 font-serif">
                  {activeOrder.estimatedDelivery || '4-5 Business Days'}
                </span>
              </div>
            </div>
          </div>

          {/* Luxury Step-by-Step Vertical Timeline */}
          <div>
            <h3 className="font-serif text-lg font-bold text-navy-950 mb-6">
              Consignment Progress Timeline
            </h3>

            <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-gray-200">
              {timeline.map((item, idx) => (
                <div key={idx} className="relative flex items-start gap-4">
                  {/* Timeline Dot */}
                  <div
                    className={`absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
                      item.done
                        ? 'bg-navy-900 border-gold-500 text-gold-400 shadow-gold-sm'
                        : 'bg-white border-gray-300 text-gray-300'
                    }`}
                  >
                    {item.done ? (
                      <CheckCircle2 className="w-3.5 h-3.5 fill-current text-navy-900" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-gray-300" />
                    )}
                  </div>

                  {/* Milestone Info */}
                  <div className="flex-1 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className={`text-xs sm:text-sm font-bold ${item.done ? 'text-navy-950' : 'text-gray-400'}`}>
                        {item.step}
                      </h4>
                      <span className={`text-[11px] font-mono ${item.done ? 'text-gold-700 font-bold' : 'text-gray-400'}`}>
                        {item.time}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address & Items Footer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100 text-xs">
            <div className="p-4 bg-cream-100 rounded-2xl border border-gold-500/20 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-navy-950">
                <MapPin className="w-3.5 h-3.5 text-gold-600" />
                <span>Destination Address</span>
              </div>
              <p className="text-gray-800 font-medium">{recipientName} {recipientPhone && `(${recipientPhone})`}</p>
              <p className="text-gray-600">
                {recipientStreet}{recipientCity && `, ${recipientCity}`}{recipientState && `, ${recipientState}`}{recipientPincode && ` - ${recipientPincode}`}
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
              <div className="flex justify-between font-bold text-navy-950">
                <span>Items in Consignment</span>
                <span>{itemsList.length} items</span>
              </div>
              <p className="text-gray-600 truncate">
                {itemsList.length > 0 ? itemsList.map((i) => `${i.name} (x${i.quantity || 1})`).join(', ') : 'Curated Luxury Item'}
              </p>
              <p className="text-gold-700 font-bold">
                Total Value: {formatINR(activeOrder.total || 0)}
              </p>
            </div>
          </div>

        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 shadow-sm space-y-4">
          <Package className="w-12 h-12 text-gray-400 mx-auto" />
          <h3 className="font-serif text-xl font-bold text-navy-950">No Consignment Found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Please enter your order ID or tracking code. You can also view all your recent consignments under your customer account.
          </p>
          <Link
            to="/account/orders"
            className="inline-block px-6 py-2.5 bg-gold-gradient text-navy-950 font-bold text-xs rounded-xl shadow-gold-sm hover:brightness-105"
          >
            Go to My Orders
          </Link>
        </div>
      )}

    </div>
  );
};

export default TrackOrderPage;
