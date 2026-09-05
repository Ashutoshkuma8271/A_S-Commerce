import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import { db, initDB } from './db.js';
import adminAuthRouter from './routes/adminAuth.js';
import adminDashboardRouter from './routes/adminDashboard.js';
import paymentRouter, { consumeVerifiedPayment } from './routes/payment.js';
import shippingWebhooksRouter from './routes/shippingWebhooks.js';
import { testSupabaseConnection } from './services/supabase.js';
import { uploadToCloudinary } from './services/cloudinary.js';
import crypto from 'crypto';
import { sendSignupOtpEmail, sendPasswordResetEmail, sendOrderConfirmationEmail } from './utils/emailService.js';
import { JWT_SECRET, requireCustomer } from './middleware/auth.js';
import { calculateOrderTotals } from './utils/orderPricing.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security: Rate Limiters against Brute-Force & DoS attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 auth attempts per IP per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.'
  }
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  message: {
    success: false,
    message: 'Rate limit exceeded. Please throttle your requests.'
  }
});

// In-Memory Password Reset OTP Storage with 15-Minute Expiry
const customerResetOTPs = new Map();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are permitted (JPEG, PNG, WebP)'), false);
    }
  }
});

// Performance: Gzip/Brotli Payload Compression
app.use(compression());

// Trust proxy for Vercel / Cloudflare edge routing & accurate rate limiting
app.set('trust proxy', 1);

// Security Middlewares
const productionCsp = process.env.NODE_ENV === 'production' ? {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", 'https://checkout.razorpay.com'],
    connectSrc: ["'self'", 'https://api.postalpincode.in', 'https://api.razorpay.com', ...(process.env.SUPABASE_URL ? [new URL(process.env.SUPABASE_URL).origin] : []), 'wss:'],
    imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
    styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    styleSrcAttr: ["'unsafe-inline'"],
    fontSrc: ["'self'", 'data:', 'https://fonts.gstatic.com'],
    frameSrc: ["'self'", 'https://api.razorpay.com', 'https://checkout.razorpay.com'],
    objectSrc: ["'none'"],
  },
} : false;

app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: productionCsp,
}));

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5000',
  'http://localhost:3000',
  'https://ascommerce.vercel.app',
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim()).filter(Boolean) : []),
  ...(process.env.PUBLIC_APP_URL ? [process.env.PUBLIC_APP_URL.trim()] : [])
];

export function isOriginApproved(origin) {
  if (!origin) return false;
  return allowedOrigins.some(allowed => {
    if (allowed === origin) return true;
    try {
      const allowedUrl = new URL(allowed);
      const originUrl = new URL(origin);
      return allowedUrl.origin === originUrl.origin;
    } catch (e) {
      return false;
    }
  }) || origin.endsWith('.vercel.app') || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || isOriginApproved(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true
}));

app.use(express.json({
  limit: '10mb',
  verify: (req, res, buffer) => {
    req.rawBody = Buffer.from(buffer);
  },
}));
app.use('/api', apiLimiter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Payment Gateway Routes (Razorpay)
app.use('/api/payment', paymentRouter);

// Admin Auth Routes (with Brute-Force Rate Limiting)
app.use('/api/admin/auth', authLimiter, adminAuthRouter);

// Protected Admin Dashboard Routes
app.use('/api/admin', adminDashboardRouter);

// Automated Shipping Aggregator Webhooks (Shiprocket / Delhivery / BlueDart)
app.use('/api/webhooks', shippingWebhooksRouter);

// Customer User Registration with 6-Digit Email OTP
app.post('/api/auth/register', authLimiter, async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body || {};
    if (role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Administrative role cannot be assigned through public registration.'
      });
    }

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required.' });
    }

    // Enforce Strong Password Policy (Min 8 chars, uppercase, lowercase, number, special char)
    const hasMinLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasMinLength || !hasUpper || !hasLower || !hasNumber || !hasSpecial) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const isMasterAdminEmail = cleanEmail === 'ashutoshkumaryadav933499@gmail.com';
    const adminExisting = isMasterAdminEmail || (await db.getAdminByEmailAsync(cleanEmail));
    if (adminExisting) {
      return res.status(403).json({
        success: false,
        message: 'This email address is reserved exclusively for the Master Administrator. It cannot be registered as a customer account. Please sign in via the Admin Portal at /admin/login.'
      });
    }

    const existing = await db.getUserByEmailAsync(cleanEmail);
    if (existing && existing.isVerified) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists and is verified. Please sign in.' });
    }

    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpExpiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes validity
    const passwordHash = await bcrypt.hash(password, 10);

    if (existing && !existing.isVerified) {
      await db.updateUser(existing.id, {
        name,
        phone: phone || '',
        passwordHash,
        verificationOtp: otp,
        otpExpiresAt
      });
      await db.setSignupOtp(cleanEmail, otp, otpExpiresAt);
    } else {
      await db.createUser({
        name,
        email: cleanEmail,
        phone: phone || '',
        passwordHash,
        role: 'customer',
        isVerified: false,
        verificationOtp: otp,
        otpExpiresAt
      });
    }

    // Send Luxury HTML OTP Email via Brevo / SMTP
    await sendSignupOtpEmail(cleanEmail, name, otp);

    return res.json({
      success: true,
      requireOtp: true,
      email: cleanEmail,
      message: 'OTP sent to your email'
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

// Customer User Verify Signup OTP
app.post('/api/auth/verify-signup-otp', authLimiter, async (req, res) => {
  try {
    const { email, otp } = req.body || {};
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and 6-digit OTP are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const result = await db.verifyUserOtp(cleanEmail, otp);

    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message });
    }

    const user = result.user;
    const token = jwt.sign(
      { id: user.id, email: user.email, role: 'customer' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: 'customer',
        addresses: user.addresses || [],
        wishlist: user.wishlist || []
      },
      token,
      message: 'Account verified successfully'
    });
  } catch (err) {
    console.error('Verify OTP error:', err);
    return res.status(500).json({ success: false, message: 'OTP verification failed' });
  }
});

// Customer User Resend Signup OTP
app.post('/api/auth/resend-signup-otp', authLimiter, async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await db.getUserByEmailAsync(cleanEmail);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Account is already verified' });
    }

    const otp = crypto.randomInt(100000, 1000000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000;

    db.setSignupOtp(cleanEmail, otp, expiresAt);
    await sendSignupOtpEmail(cleanEmail, user.name, otp);

    return res.json({
      success: true,
      message: 'OTP resent to your email'
    });
  } catch (err) {
    console.error('Resend OTP error:', err);
    return res.status(500).json({ success: false, message: 'Failed to resend OTP' });
  }
});

// Customer User Login
app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Strict Security Guard: Admins cannot log in via Customer Storefront
    const isMasterAdmin = cleanEmail === 'ashutoshkumaryadav933499@gmail.com';
    const adminUser = isMasterAdmin || (await db.getAdminByEmailAsync(cleanEmail));
    if (adminUser) {
      return res.status(403).json({
        success: false,
        isAdminAccount: true,
        message: 'This email is registered as the Master Administrator. Please sign in via the Admin Portal at /admin/login.'
      });
    }

    // 2. Customer User Lookup
    const user = await db.getUserByEmailAsync(cleanEmail);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (user.isVerified === false) {
      const otp = crypto.randomInt(100000, 1000000).toString();
      const expiresAt = Date.now() + 15 * 60 * 1000;
      db.setSignupOtp(cleanEmail, otp, expiresAt);
      await sendSignupOtpEmail(cleanEmail, user.name, otp);

      return res.json({
        success: false,
        requireOtp: true,
        email: cleanEmail,
        message: 'Please verify your account. OTP sent to your email.'
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: 'customer' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: 'customer',
        addresses: user.addresses || [],
        wishlist: user.wishlist || []
      },
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Login failed' });
  }
});

// Customer Forgot Password (Dispatch Luxury Email Reset Link)
app.post('/api/auth/forgot-password', authLimiter, async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await db.getUserByEmailAsync(cleanEmail);

    if (!user) {
      return res.json({ success: true, message: 'If an account exists, password reset instructions have been sent.' });
    }

    // Generate cryptographic 32-byte recovery token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

    let trustedBaseUrl = 'https://ascommerce.vercel.app';
    if (process.env.PUBLIC_APP_URL) {
      try {
        const parsed = new URL(process.env.PUBLIC_APP_URL);
        trustedBaseUrl = parsed.origin;
      } catch (e) {}
    } else if (req.headers.origin && isOriginApproved(req.headers.origin)) {
      try {
        trustedBaseUrl = new URL(req.headers.origin).origin;
      } catch (e) {}
    } else if (process.env.NODE_ENV !== 'production') {
      trustedBaseUrl = `http://localhost:${PORT || 5000}`;
    }

    await db.createPasswordReset({ token, email: cleanEmail, role: 'customer', expiresAt });
    const resetUrl = `${trustedBaseUrl}/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(cleanEmail)}`;

    await sendPasswordResetEmail(cleanEmail, resetUrl, 'customer');

    return res.json({
      success: true,
      message: 'Reset link sent to your email',
      expiresInMinutes: 15
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    return res.status(500).json({ success: false, message: 'Failed to process password reset request.' });
  }
});

// Reset Password with Token (Strict Previous Password Reuse Prevention)
app.post(['/api/auth/reset-password-with-token', '/api/auth/reset-password'], authLimiter, async (req, res) => {
  try {
    const { token, email, newPassword } = req.body || {};
    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Reset token and new password are required.' });
    }

    let user = null;
    let cleanEmail = email ? email.trim().toLowerCase() : '';

    const resetRecord = await db.getPasswordResetAsync(token);
    if (!resetRecord || resetRecord.role !== 'customer') {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset link. Please request a new link.' });
    }
    if (Date.now() > resetRecord.expiresAt) {
      return res.status(400).json({ success: false, message: 'This password reset link has expired. Please request a fresh link.' });
    }
    cleanEmail = (resetRecord.email || '').trim().toLowerCase();

    if (!cleanEmail) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    user = await db.getUserByEmailAsync(cleanEmail);
    if (!user) {
      return res.status(404).json({ success: false, message: 'No registered account found with this email.' });
    }

    // Validate Strong Password
    const hasMinLength = newPassword.length >= 8;
    const hasUpper = /[A-Z]/.test(newPassword);
    const hasLower = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

    if (!hasMinLength || !hasUpper || !hasLower || !hasNumber || !hasSpecial) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.'
      });
    }

    // Enforce Strict Rule: New password CANNOT be the same as previous password
    if (user.passwordHash) {
      const isSamePassword = await bcrypt.compare(newPassword, user.passwordHash);
      if (isSamePassword) {
        return res.status(400).json({
          success: false,
          message: 'New password cannot be the same as your previous password. Please choose a different password for security.'
        });
      }
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await db.updateUser(user.id, { passwordHash });

    await db.markPasswordResetUsed(token);

    // Track Audit Log in password_resets table
    await db.createPasswordResetRecord({
      id: `rst-${Date.now()}`,
      email: cleanEmail,
      role: user.role || 'customer',
      action: 'Password Reset via Email Link',
      status: 'Completed',
      ip: req.ip || '127.0.0.1'
    });

    return res.json({
      success: true,
      message: 'Password updated securely! You can now sign in with your new password.'
    });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({ success: false, message: 'Password reset failed.' });
  }
});

// Customer Profile Picture Upload to Cloudinary & Supabase
app.post('/api/users/upload-avatar', requireCustomer, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded' });
    }
    const result = await uploadToCloudinary(req.file.buffer, 'as-commerce/avatars');
    return res.json({
      success: true,
      url: result.secure_url,
      message: 'Profile picture uploaded to Cloudinary successfully'
    });
  } catch (err) {
    console.error('Avatar upload error:', err);
    return res.status(500).json({ success: false, message: 'Avatar upload failed' });
  }
});

app.get('/api/users/me', requireCustomer, (req, res) => {
  return res.json({
    success: true,
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone || '',
      role: 'customer',
      addresses: req.user.addresses || [],
      wishlist: req.user.wishlist || [],
    },
  });
});

// Customer User Profile, Addresses & Wishlist Database Synchronization
app.put(['/api/users/me', '/api/users/profile'], requireCustomer, async (req, res) => {
  try {
    const { name, phone, addresses, wishlist, avatar, role } = req.body || {};
    if (role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Role modification is not allowed.'
      });
    }

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (addresses !== undefined) updates.addresses = addresses;
    if (wishlist !== undefined) updates.wishlist = wishlist;
    if (avatar !== undefined) updates.avatar = avatar;

    const updated = await db.updateUser(req.user.id, updates);
    return res.json({ success: true, message: 'Profile updated successfully', user: updated });
  } catch (err) {
    console.error('Update profile error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});

// Authenticated Customer Password Change
app.post('/api/users/change-password', requireCustomer, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body || {};
    const cleanEmail = req.user.email;

    if (!cleanEmail || !currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current password and new password are required.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long.' });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'New passwords do not match.' });
    }

    const user = await db.getUserByEmailAsync(cleanEmail) || db.getUserByEmail(cleanEmail);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Customer account not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password entered is incorrect.' });
    }

    const isSameAsOld = await bcrypt.compare(newPassword, user.passwordHash);
    if (isSameAsOld) {
      return res.status(400).json({ success: false, message: 'New password cannot be the same as your current password.' });
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);
    await db.updateUser(user.id, { passwordHash: newHash });

    return res.json({ success: true, message: 'Your password has been updated securely.' });
  } catch (err) {
    console.error('Customer change password error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update password.' });
  }
});

// Delete Customer Account Endpoint (Safely removes data from Supabase & local cache)
app.delete(['/api/users/me', '/api/users/profile'], requireCustomer, async (req, res) => {
  try {
    await db.deleteUser(req.user.id, req.user.email);

    return res.json({
      success: true,
      message: 'Your account has been deleted successfully. You are welcome to re-register at any time.'
    });
  } catch (err) {
    console.error('Delete account error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete account. Please try again.' });
  }
});

// Customer & Scoped Orders API
app.get('/api/orders', requireCustomer, async (req, res) => {
  try {
    let orders = await db.getOrdersAsync();
    const userEmail = (req.user?.email || '').trim().toLowerCase();
    orders = orders.filter(o =>
      o.customerId === req.user.id ||
      o.userId === req.user.id ||
      (userEmail && o.customerEmail && o.customerEmail.trim().toLowerCase() === userEmail)
    );

    return res.json({ success: true, orders });
  } catch (err) {
    console.error('Fetch orders error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
});

app.post('/api/orders', requireCustomer, async (req, res) => {
  try {
    const orderData = { ...(req.body || {}), customerId: req.user.id, customerEmail: req.user.email, customerName: req.user.name, customerPhone: req.user.phone || '' };
    const totals = await calculateOrderTotals({
      db,
      items: orderData.items,
      couponCode: orderData.couponCode,
      deliveryMode: orderData.deliveryMode,
    });
    if (totals.error) return res.status(400).json({ success: false, message: totals.error });
    const submittedMoney = [orderData.subtotal, orderData.discount, orderData.shipping, orderData.total].map(Number);
    const calculatedMoney = [totals.subtotal, totals.discount, totals.shipping, totals.total];
    if (submittedMoney.some((value, index) => !Number.isFinite(value) || value !== calculatedMoney[index])) {
      return res.status(409).json({ success: false, message: 'Cart totals changed. Please review your cart and try again.' });
    }
    orderData.items = totals.pricedItems;
    orderData.subtotal = totals.subtotal;
    orderData.discount = totals.discount;
    orderData.shipping = totals.shipping;
    orderData.total = totals.total;
    const isCashOnDelivery = String(orderData.paymentMethod || '').toLowerCase().includes('cash on delivery');
    if (!isCashOnDelivery) {
      const payment = orderData.paymentVerification;
      let paymentRecord;
      try {
        paymentRecord = payment && await consumeVerifiedPayment(payment.orderId, req.user.id, payment.paymentId, Math.round(totals.total * 100));
      } catch (error) {
        console.error('Payment reconciliation lookup error:', error);
        return res.status(503).json({ success: false, retryable: true, message: 'Payment confirmation is temporarily unavailable. Please retry shortly.' });
      }
      if (!paymentRecord || paymentRecord.status === 'missing') {
        return res.status(400).json({ success: false, message: 'Payment verification is required before placing this order.' });
      }
      if (paymentRecord.status === 'mismatch') {
        await db.markPaymentReconciliationRequired({
          orderId: payment.orderId,
          userId: req.user.id,
          reason: 'Payment identity, amount, or verification lifetime did not match the server order.',
        });
        return res.status(409).json({
          success: false,
          reconciliationRequired: true,
          message: 'Payment was received but could not be matched to this order. Please contact support with your payment reference.',
        });
      }
      orderData.razorpayOrderId = paymentRecord.record.razorpay_order_id;
      orderData.razorpayPaymentId = paymentRecord.record.razorpay_payment_id;
    }
    orderData.paymentStatus = isCashOnDelivery ? 'Pending (Cash on Delivery)' : 'Paid (Verified by Razorpay)';
    delete orderData.paymentVerification;
    const newOrder = await db.createOrder(orderData);
    console.log(`⚡ Order Placed: #${newOrder.id} (Total: ₹${newOrder.total}) and saved to database & Supabase`);
    
    // Asynchronously send itemized order confirmation email via Brevo / SMTP
    try {
      sendOrderConfirmationEmail(newOrder).catch(e => console.warn('Order confirmation email note:', e.message));
    } catch (e) {}

    return res.json({
      success: true,
      message: 'Order created successfully and synchronized with Supabase database.',
      order: newOrder
    });
  } catch (err) {
    console.error('Create order error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create order' });
  }
});

app.get('/api/orders/:id', requireCustomer, async (req, res) => {
  try {
    const { id } = req.params;
    const order = await db.getOrderByIdAsync(id) || db.getOrderById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    const userEmail = (req.user?.email || '').trim().toLowerCase();
    const isOwner =
      order.customerId === req.user.id ||
      order.userId === req.user.id ||
      (userEmail && order.customerEmail && order.customerEmail.trim().toLowerCase() === userEmail);

    if (!isOwner) {
      return res.status(403).json({ success: false, message: 'You do not have access to this order.' });
    }
    return res.json({ success: true, order });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to find order' });
  }
});

// Public Live Catalog API
app.get('/api/products', async (req, res) => {
  try {
    const { category, search } = req.query;
    let products = await db.getProductsAsync();

    if (category && category !== 'all') {
      products = products.filter(p => p.category === category);
    }
    if (search) {
      const q = search.toLowerCase().trim();
      products = products.filter(p =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    }

    return res.json({ success: true, products, total: products.length });
  } catch (err) {
    console.error('Public products fetch error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load products' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await db.getProductByIdAsync(id) || db.getProductById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    return res.json({ success: true, product });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to find product' });
  }
});

// Public Live Site Settings API
app.get('/api/settings', async (req, res) => {
  try {
    const settings = await db.getSettingsAsync();
    return res.json({ success: true, settings });
  } catch (err) {
    console.error('Settings fetch error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load site settings' });
  }
});

// Public Coupons & Voucher Verification API
app.get('/api/coupons', async (req, res) => {
  try {
    const coupons = await db.getCouponsAsync();
    return res.json({ success: true, coupons });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch coupons' });
  }
});

app.post('/api/coupons/validate', async (req, res) => {
  try {
    const { code, orderTotal } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }

    const cleanCode = code.trim().toUpperCase();
    const coupons = await db.getCouponsAsync();
    const coupon = coupons.find(c => c.code.toUpperCase() === cleanCode && c.isActive !== false);

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid or expired coupon voucher.' });
    }

    const total = Number(orderTotal) || 0;
    if (coupon.minOrder && total < coupon.minOrder) {
      return res.status(400).json({
        success: false,
        message: `This coupon requires a minimum purchase of ₹${coupon.minOrder}.`
      });
    }

    let discountAmount = 0;
    if (coupon.discountPercent) {
      discountAmount = Math.round((total * coupon.discountPercent) / 100);
    } else if (coupon.discountAmount) {
      discountAmount = Number(coupon.discountAmount);
    }

    return res.json({
      success: true,
      valid: true,
      coupon: {
        code: coupon.code,
        discountPercent: coupon.discountPercent,
        discountAmount: discountAmount,
        description: coupon.description
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to validate coupon' });
  }
});

// 404 handler for unknown API routes
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found.' });
});

export default app;

async function startServer() {
  try {
    await initDB();
    await testSupabaseConnection();

    // Vite middleware in dev or static files in prod
    if (process.env.NODE_ENV !== 'production') {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true, host: '0.0.0.0' },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.use((req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`[A_S Commerce Server] Running on http://localhost:${PORT}`);
    });

    // Keep event loop active
    setInterval(() => {}, 1000 * 60 * 60);
  } catch (err) {
    console.error('Failed to start server:', err);
  }
}

if (!process.env.VERCEL) {
  startServer();
}
