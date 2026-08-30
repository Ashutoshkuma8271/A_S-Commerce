import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useOrder } from '../context/OrderContext';
import { formatINR } from '../utils/currency';
import { downloadOrderInvoice } from '../utils/invoiceGenerator';
import {
  CheckCircle2,
  Package,
  Calendar,
  CreditCard,
  MapPin,
  ArrowRight,
  Printer,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';

export const OrderSuccessPage = () => {
  const { latestOrder, orders } = useOrder();
  const order = latestOrder || orders[0];

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-navy-950 mb-2">No recent order found</h2>
        <Link to="/" className="text-gold-600 font-bold hover:underline">
          Return to Homepage
        </Link>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fadeIn">
      
      {/* Celebration Header Card */}
      <div className="bg-navy-950 text-white rounded-3xl p-8 sm:p-12 text-center border border-gold-500/30 shadow-2xl relative overflow-hidden mb-8">
        <div className="relative z-10 space-y-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gold-gradient rounded-full mx-auto flex items-center justify-center shadow-gold-glow animate-pulse-subtle">
            <CheckCircle2 className="w-10 h-10 text-navy-950 stroke-[2.5]" />
          </div>

          <span className="inline-block px-3 py-1 bg-gold-500/10 border border-gold-500/30 rounded-full text-xs font-bold text-gold-400 uppercase tracking-widest">
            Payment Verified & Confirmed
          </span>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white">
            Order Placed Successfully!
          </h1>

          <p className="text-xs sm:text-sm text-gray-300 max-w-md mx-auto leading-relaxed">
            Thank you for choosing A_S Commerce. We are preparing your handcrafted order with signature luxury packaging.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <span className="text-xs text-gray-400">Order Reference:</span>
            <span className="text-sm font-mono font-bold text-gold-400 bg-navy-850 px-3.5 py-1.5 rounded-xl border border-navy-700">
              #{order.id}
            </span>
          </div>
        </div>

        <div className="absolute top-0 right-0 w-80 h-80 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Order Summary & Logistics Details */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-sm space-y-8 mb-8">
        
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-6 border-b border-gray-100 text-xs">
          <div className="p-4 bg-gray-50 rounded-2xl space-y-1">
            <div className="flex items-center gap-1.5 text-gray-500 font-medium">
              <Calendar className="w-3.5 h-3.5 text-gold-600" />
              <span>Estimated Delivery</span>
            </div>
            <p className="text-sm font-bold text-navy-950">{order.estimatedDelivery}</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl space-y-1">
            <div className="flex items-center gap-1.5 text-gray-500 font-medium">
              <CreditCard className="w-3.5 h-3.5 text-gold-600" />
              <span>Payment Mode</span>
            </div>
            <p className="text-sm font-bold text-navy-950 truncate">{order.paymentMethod}</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl space-y-1">
            <div className="flex items-center gap-1.5 text-gray-500 font-medium">
              <Package className="w-3.5 h-3.5 text-gold-600" />
              <span>Tracking Number</span>
            </div>
            <p className="text-sm font-mono font-bold text-gold-700">{order.trackingNumber}</p>
          </div>
        </div>

        {/* Ordered Items */}
        <div>
          <h3 className="font-serif text-lg font-bold text-navy-950 mb-4">Purchased Items</h3>
          <div className="space-y-3">
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-cream-50/60 border border-gray-100 text-xs"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-14 rounded-xl object-cover border border-gray-200 bg-white shrink-0"
                  />
                  <div>
                    <h4 className="font-bold text-navy-950 text-sm">{item.name}</h4>
                    <p className="text-gray-500 text-[11px]">
                      Quantity: {item.quantity} {item.selectedColor ? `• ${item.selectedColor}` : ''} {item.selectedSize ? `• ${item.selectedSize}` : ''}
                    </p>
                  </div>
                </div>
                <span className="font-bold text-navy-950 font-serif text-sm">
                  {formatINR(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Breakdown & Shipping Address */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100 text-xs">
          
          {/* Shipping Address */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-navy-950 uppercase tracking-wide">
              <MapPin className="w-3.5 h-3.5 text-gold-600" />
              <span>Shipping Address</span>
            </div>
            <p className="font-bold text-navy-950">{order.shippingAddress.name} ({order.shippingAddress.phone})</p>
            <p className="text-gray-600 leading-relaxed">
              {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
            </p>
          </div>

          {/* Price Breakdown */}
          <div className="bg-gray-50 p-4 rounded-2xl space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-bold text-navy-950">{formatINR(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-700 font-bold">
                <span>Discount Applied</span>
                <span>-{formatINR(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Delivery Fee</span>
              <span>{order.shipping === 0 ? 'FREE' : formatINR(order.shipping)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200 text-base font-bold text-navy-950">
              <span>Total Paid</span>
              <span className="text-xl text-gold-700 font-serif">{formatINR(order.total)}</span>
            </div>
          </div>

        </div>

      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => downloadOrderInvoice(order)}
          className="px-6 py-3.5 bg-white hover:bg-gold-50 border border-gold-500/40 text-navy-950 font-bold text-xs sm:text-sm rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer group"
        >
          <Printer className="w-4 h-4 text-gold-600 group-hover:scale-110 transition-transform" />
          <span>Download PDF Invoice</span>
        </button>

        <div className="flex items-center gap-3">
          <Link
            to={`/track-order?id=${order.id}`}
            className="px-6 py-3.5 bg-navy-900 text-gold-400 hover:bg-navy-850 font-bold text-xs sm:text-sm rounded-2xl border border-gold-500/30 transition-all flex items-center gap-2"
          >
            <Package className="w-4 h-4" />
            <span>Track Order Status</span>
          </Link>

          <Link
            to="/shop"
            className="px-6 py-3.5 bg-gold-gradient text-navy-950 font-bold text-xs sm:text-sm rounded-2xl shadow-gold-sm hover:brightness-105 transition-all flex items-center gap-2"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

    </div>
  );
};
