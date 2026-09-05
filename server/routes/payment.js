import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { db } from '../db.js';
import { requireCustomer } from '../middleware/auth.js';

dotenv.config();

const router = express.Router();

const key_id = process.env.RAZORPAY_KEY_ID;
const key_secret = process.env.RAZORPAY_KEY_SECRET;

if (process.env.NODE_ENV === 'production' && (!key_id || !key_secret)) {
  throw new Error('Razorpay credentials must be configured in production.');
}

const razorpay = key_id && key_secret ? new Razorpay({ key_id, key_secret }) : null;

const verifiedPayments = new Map();

export function consumeVerifiedPayment(orderId, userId, paymentId) {
  const record = verifiedPayments.get(orderId);
  if (!record || record.userId !== userId || record.paymentId !== paymentId || Date.now() > record.expiresAt) {
    return false;
  }
  verifiedPayments.delete(orderId);
  return true;
}

// 1. POST /api/payment/create-order — Initialize Razorpay Order
router.post('/create-order', requireCustomer, async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(503).json({ success: false, message: 'Payment gateway is not configured.' });
    }
    const { amount, currency = 'INR', receipt, notes } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid order amount' });
    }

    const options = {
      amount: Math.round(Number(amount) * 100), // Amount in paise
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      notes: notes || { brand: 'A_S Commerce' },
    };

    const order = await razorpay.orders.create(options);
    verifiedPayments.delete(order.id);

    return res.json({
      success: true,
      key: key_id,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err) {
    console.error('Razorpay order creation error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create payment order' });
  }
});

// 2. POST /api/payment/verify-payment — Verify HMAC Signature
router.post('/verify-payment', requireCustomer, (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Missing verification parameters' });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', key_secret)
      .update(body.toString())
      .digest('hex');

    let isAuthentic = false;
    try {
      const expectedBuf = Buffer.from(expectedSignature, 'utf-8');
      const actualBuf = Buffer.from(razorpay_signature, 'utf-8');
      if (expectedBuf.length === actualBuf.length) {
        isAuthentic = crypto.timingSafeEqual(expectedBuf, actualBuf);
      }
    } catch (e) {
      isAuthentic = false;
    }

    if (isAuthentic) {
      verifiedPayments.set(razorpay_order_id, {
        paymentId: razorpay_payment_id,
        userId: req.user.id,
        expiresAt: Date.now() + 30 * 60 * 1000,
      });
      return res.json({
        success: true,
        message: 'Payment signature verified successfully',
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature. Verification failed.',
      });
    }
  } catch (err) {
    console.error('Payment verification error:', err);
    return res.status(500).json({ success: false, message: 'Payment verification error' });
  }
});

export default router;
