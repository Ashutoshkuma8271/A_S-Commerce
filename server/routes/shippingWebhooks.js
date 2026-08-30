import express from 'express';
import { db } from '../db.js';
import supabase from '../services/supabase.js';

const router = express.Router();

/**
 * Helper to map courier statuses to standard internal lifecycle status
 */
function normalizeShippingStatus(rawStatus) {
  if (!rawStatus) return 'Processing';
  const clean = rawStatus.toUpperCase();

  if (clean.includes('DELIVER') || clean === 'DLVD') return 'Delivered';
  if (clean.includes('OUT') || clean.includes('OFD')) return 'Out for Delivery';
  if (clean.includes('TRANSIT') || clean.includes('INTRANSIT') || clean.includes('DISPATCH') || clean.includes('SHIPPED')) return 'In Transit';
  if (clean.includes('PACK') || clean.includes('RTS') || clean.includes('READY')) return 'Packed';
  if (clean.includes('CANCEL') || clean.includes('RTO')) return 'Cancelled';

  return 'Processing';
}

/**
 * 1. POST /api/webhooks/shipping/update
 * Universal Webhook Handler for Shiprocket, Delhivery, BlueDart, or custom aggregators.
 */
router.post('/shipping/update', async (req, res) => {
  try {
    const payload = req.body || {};
    
    // Support common courier payload formats (Shiprocket, Delhivery, BlueDart)
    const orderId = payload.order_id || payload.orderId || payload.awb_code || payload.tracking_number;
    const rawStatus = payload.current_status || payload.status || payload.shipment_status || payload.status_name;
    const carrier = payload.courier_name || payload.carrier || 'Bluedart Express';
    const trackingNumber = payload.awb || payload.tracking_number || payload.waybill;
    const currentLocation = payload.current_location || payload.location || payload.city || 'Regional Logistics Hub';
    const activityDesc = payload.scanned_location || payload.instructions || payload.comment || `Package status updated to ${rawStatus}`;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Missing order_id or tracking_number in webhook payload'
      });
    }

    const normalizedStatus = normalizeShippingStatus(rawStatus);
    const existingOrder = db.getOrderById(orderId);

    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: `Order #${orderId} not found in store database`
      });
    }

    // Update in local DB
    const updatedOrder = await db.updateOrderStatus(existingOrder.id, {
      status: normalizedStatus,
      carrier: carrier || existingOrder.carrier,
      trackingNumber: trackingNumber || existingOrder.trackingNumber
    });

    // Update timeline steps if present
    const nowStr = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });

    if (updatedOrder.timeline && Array.isArray(updatedOrder.timeline)) {
      if (normalizedStatus === 'Packed') {
        updatedOrder.timeline[1] = { step: 'Dispatched & Packed', time: nowStr, done: true, desc: `Packed at ${currentLocation}` };
      } else if (normalizedStatus === 'In Transit') {
        updatedOrder.timeline[1].done = true;
        updatedOrder.timeline[2] = { step: 'In Transit', time: nowStr, done: true, desc: `En route via ${carrier} (${currentLocation})` };
      } else if (normalizedStatus === 'Out for Delivery') {
        updatedOrder.timeline[1].done = true;
        updatedOrder.timeline[2].done = true;
        updatedOrder.timeline[3] = { step: 'Out for Delivery', time: nowStr, done: true, desc: `Courier executive assigned at ${currentLocation}` };
      } else if (normalizedStatus === 'Delivered') {
        updatedOrder.timeline.forEach((step) => { step.done = true; });
        updatedOrder.timeline[4] = { step: 'Delivered', time: nowStr, done: true, desc: `Delivered safely to recipient` };
      }
      db.saveToDisk();
    }

    // Synchronize to Supabase cloud table public.orders
    try {
      await supabase.from('orders').update({
        status: normalizedStatus,
        updated_at: new Date().toISOString()
      }).eq('id', existingOrder.id);
    } catch (e) {
      console.warn('Supabase webhook sync note:', e.message);
    }

    console.log(`📦 [SHIPPING WEBHOOK] Order #${existingOrder.id} status updated to: ${normalizedStatus} (${carrier})`);

    return res.json({
      success: true,
      message: `Order #${existingOrder.id} successfully updated to ${normalizedStatus}`,
      order: updatedOrder
    });
  } catch (error) {
    console.error('Shipping webhook processing error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process shipping webhook update',
      error: error.message
    });
  }
});

/**
 * 2. GET /api/webhooks/shipping/simulate/:orderId/:status
 * Test/Simulation endpoint for advancing order status during testing
 */
router.get('/shipping/simulate/:orderId/:status', async (req, res) => {
  const { orderId, status } = req.params;
  const normalizedStatus = normalizeShippingStatus(status);
  const existingOrder = db.getOrderById(orderId);

  if (!existingOrder) {
    return res.status(404).json({ success: false, message: `Order #${orderId} not found` });
  }

  const updatedOrder = await db.updateOrderStatus(existingOrder.id, {
    status: normalizedStatus,
    carrier: 'Bluedart Express',
    trackingNumber: existingOrder.trackingNumber || `BLUEDART-${Math.floor(100000 + Math.random() * 900000)}`
  });

  return res.json({
    success: true,
    message: `Simulated shipping update: Order #${existingOrder.id} is now ${normalizedStatus}`,
    order: updatedOrder
  });
});

export default router;
