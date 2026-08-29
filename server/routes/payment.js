import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { db } from '../db.js';

dotenv.config();

const router = express.Router();

const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_wkow4HMM1HSMUN';
const key_secret = process.env.RAZORPAY_KEY_SECRET || 'B4LKgmVsriY0RDVU25QhwHlR';

const razorpay = new Razorpay({
  key_id,
  key_secret,
});

// 1. POST /api/payment/create-order — Initialize Razorpay Order
router.post('/create-order', async (req, res) => {
  try {
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
router.post('/verify-payment', (req, res) => {
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
