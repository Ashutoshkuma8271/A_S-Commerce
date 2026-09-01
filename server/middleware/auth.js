import jwt from 'jsonwebtoken';
import { db } from '../db.js';
import rateLimit from 'express-rate-limit';

export const JWT_SECRET = process.env.JWT_SECRET || 'as_commerce_master_jwt_secret_key_2026_luxury';

// Audit Logger Helper
export function logAudit({ action, adminId = null, adminEmail = null, ip = null, resource = null, details = null }) {
  try {
    const id = `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const timestamp = new Date().toISOString();
    db.createAuditLog({ id, action, adminId, adminEmail, ip, resource, details, timestamp });
  } catch (err) {
    console.error('Audit Log Error:', err);
  }
}

// Strict Admin Authorization Middleware
export async function requireAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.admin_token) {
      token = req.cookies.admin_token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No access token provided.'
      });
    }

    // Verify token cryptographic signature
    const decoded = jwt.verify(token, JWT_SECRET);

    // Query the database directly — Async check against Supabase & local cache
    let admin = await db.getAdminByIdAsync(decoded.id);
    if (!admin && decoded.email) {
      admin = await db.getAdminByEmailAsync(decoded.email);
    }
    if (!admin) {
      admin = db.getAdminById(decoded.id);
    }

    if (!admin) {
      logAudit({
        action: 'Unauthorized API Access Attempt',
        ip: req.ip,
        resource: req.originalUrl,
        details: 'Token provided for non-existent admin ID'
      });
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Administrator identity does not exist.'
      });
    }

    if (!admin.isActive) {
      logAudit({
        action: 'Deactivated Admin Access Attempt',
        adminId: admin.id,
        adminEmail: admin.email,
        ip: req.ip,
        resource: req.originalUrl
      });
      return res.status(403).json({
        success: false,
        message: 'Forbidden. This administrator account has been deactivated.'
      });
    }

    if (admin.role !== 'admin') {
      logAudit({
        action: 'Invalid Role Privilege Escalation Blocked',
        adminId: admin.id,
        adminEmail: admin.email,
        ip: req.ip,
        resource: req.originalUrl
      });
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Administrative privileges required.'
      });
    }

    // Attach validated admin context to request
    req.admin = admin;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please log in again.'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid authorization token.'
    });
  }
}

// Rate limiters
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  validate: false,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const signupRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  validate: false,
  message: {
    success: false,
    message: 'Too many signup attempts. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
