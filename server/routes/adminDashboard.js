import express from 'express';
import multer from 'multer';
import { db } from '../db.js';
import { requireAdmin, logAudit } from '../middleware/auth.js';
import { uploadToCloudinary } from '../services/cloudinary.js';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Enforce requireAdmin on all administrative routes
router.use(requireAdmin);

// 0. POST /api/admin/upload-image — Cloudinary Direct CDN Upload
router.post('/upload-image', upload.single('image'), async (req, res) => {
  try {
    let imageSource;
    if (req.file) {
      imageSource = req.file.buffer;
    } else if (req.body.imageBase64) {
      imageSource = req.body.imageBase64;
    } else {
      return res.status(400).json({ success: false, message: 'No image file or base64 data provided' });
    }

    const result = await uploadToCloudinary(imageSource, 'as_commerce_products');

    logAudit({
      action: 'Image uploaded to Cloudinary CDN',
      adminId: req.admin.id,
      adminEmail: req.admin.email,
      ip: req.ip,
      resource: result.public_id,
      details: `Uploaded media: ${result.secure_url}`
    });

    return res.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format
    });
  } catch (err) {
    console.error('Upload to Cloudinary failed:', err);
    return res.status(500).json({ success: false, message: 'Failed to upload image to Cloudinary CDN' });
  }
});

// 1. GET /api/admin/stats — Dashboard Analytics & KPIs
router.get('/stats', async (req, res) => {
  try {
    const stats = await db.getStatsAsync();
    return res.json({
      success: true,
      stats,
      recentOrders: stats.recentOrders,
      recentAuditLogs: stats.recentAuditLogs
    });
  } catch (err) {
    console.error('Stats error:', err);
    return res.status(500).json({ success: false, message: 'Server error retrieving telemetry' });
  }
});

// 2. PRODUCTS CRUD
// GET /api/admin/products (with high-performance pagination & search)
router.get('/products', (req, res) => {
  try {
    const { page, limit, search, category } = req.query;
    let products = db.getProducts();

    if (category && category !== 'all') {
      products = products.filter(p => p.category === category);
    }
    if (search) {
      const q = search.toLowerCase();
      products = products.filter(p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q));
    }

    const total = products.length;

    if (page && limit) {
      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 20;
      const start = (pageNum - 1) * limitNum;
      const paginated = products.slice(start, start + limitNum);
      return res.json({
        success: true,
        products: paginated,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum)
      });
    }

    return res.json({ success: true, products, total });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch catalog' });
  }
});

// POST /api/admin/products — Create Product
router.post('/products', (req, res) => {
  try {
    const { name, brand, category, categoryName, price, originalPrice, discount, stockCount, inStock, badge, description, image } = req.body;
    if (!name || !price || !category) {
      return res.status(400).json({ success: false, message: 'Name, price and category are required.' });
    }

    const created = db.createProduct({
      name,
      brand: brand || 'A_S Luxury',
      category,
      categoryName: categoryName || category.toUpperCase(),
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : null,
      discount: discount ? Number(discount) : 0,
      stockCount: stockCount ? Number(stockCount) : 10,
      inStock: inStock !== false,
      badge: badge || '',
      description: description || '',
      images: [image || 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800']
    });

    logAudit({
      action: 'Product created',
      adminId: req.admin.id,
      adminEmail: req.admin.email,
      ip: req.ip,
      resource: `Product ${created.id}`,
      details: `Created "${created.name}" priced at ₹${created.price}`
    });

    return res.status(201).json({ success: true, message: 'Product created successfully.', product: created });
  } catch (err) {
    console.error('Create product error:', err);
    return res.status(500).json({ success: false, message: 'Server error adding product' });
  }
});

// PUT /api/admin/products/:id — Edit Product
router.put('/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.getProductById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const updated = db.updateProduct(id, req.body);

    logAudit({
      action: 'Product updated',
      adminId: req.admin.id,
      adminEmail: req.admin.email,
      ip: req.ip,
      resource: `Product ${id}`,
      details: `Updated "${updated.name}" (Price: ₹${updated.price}, Stock: ${updated.stockCount})`
    });

    return res.json({ success: true, message: `Product "${updated.name}" updated successfully.`, product: updated });
  } catch (err) {
    console.error('Update product error:', err);
    return res.status(500).json({ success: false, message: 'Server error updating product' });
  }
});

// DELETE /api/admin/products/:id — Delete Product
router.delete('/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.getProductById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    db.deleteProduct(id);

    logAudit({
      action: 'Product deleted',
      adminId: req.admin.id,
      adminEmail: req.admin.email,
      ip: req.ip,
      resource: `Product ${id}`,
      details: `Deleted "${existing.name}"`
    });

    return res.json({ success: true, message: `Product "${existing.name}" removed from catalog.` });
  } catch (err) {
    console.error('Delete product error:', err);
    return res.status(500).json({ success: false, message: 'Server error deleting product' });
  }
});

// 3. ORDERS & DELIVERY MANAGEMENT
// GET /api/admin/orders
router.get('/orders', async (req, res) => {
  try {
    const orders = await db.getOrdersAsync();
    return res.json({ success: true, orders });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch consignments' });
  }
});

// PUT /api/admin/orders/:id/status — Advance Logistics & Delivery Status
router.put('/orders/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status, carrier, trackingNumber, note } = req.body;

    const previous = db.getOrderById(id);
    if (!previous) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const updated = db.updateOrderStatus(id, { status, carrier, trackingNumber, note });

    logAudit({
      action: 'Order status updated',
      adminId: req.admin.id,
      adminEmail: req.admin.email,
      ip: req.ip,
      resource: `Order #${id}`,
      details: `Status advanced to "${status}" (Carrier: ${carrier || updated.carrier}, Tracking: ${trackingNumber || updated.trackingNumber})`
    });

    return res.json({ success: true, message: `Order #${id} logistics updated.`, order: updated });
  } catch (err) {
    console.error('Update order error:', err);
    return res.status(500).json({ success: false, message: 'Server error updating order' });
  }
});

// 4. WEBSITE SECTIONS & CONTENT CUSTOMIZER
// GET /api/admin/settings
router.get('/settings', async (req, res) => {
  try {
    const settings = await db.getSettingsAsync();
    return res.json({ success: true, settings });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch settings' });
  }
});

// PUT /api/admin/settings — Update Website Content
router.put('/settings', async (req, res) => {
  try {
    const updated = await db.updateSettings(req.body);

    logAudit({
      action: 'Website content updated',
      adminId: req.admin.id,
      adminEmail: req.admin.email,
      ip: req.ip,
      resource: 'Website Sections',
      details: 'Updated announcement bar, hero banner copy, and store parameters'
    });

    return res.json({ success: true, message: 'Website content & section parameters updated successfully.', settings: updated });
  } catch (err) {
    console.error('Settings update error:', err);
    return res.status(500).json({ success: false, message: 'Server error saving settings' });
  }
});

// 5. COUPONS & PROMOTIONS
// GET /api/admin/coupons
router.get('/coupons', (req, res) => {
  try {
    const coupons = db.getCoupons();
    return res.json({ success: true, coupons });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch coupons' });
  }
});

// POST /api/admin/coupons
router.post('/coupons', (req, res) => {
  try {
    const { code, discountPercent, discountAmount, minOrder, description } = req.body;
    if (!code || !description) {
      return res.status(400).json({ success: false, message: 'Code and description are required.' });
    }

    const cleanCode = code.trim().toUpperCase();
    const now = new Date().toISOString();

    const created = db.createCoupon({
      code: cleanCode,
      discountPercent: discountPercent ? Number(discountPercent) : null,
      discountAmount: discountAmount ? Number(discountAmount) : null,
      minOrder: minOrder ? Number(minOrder) : 0,
      description,
      isActive: 1,
      createdAt: now
    });

    logAudit({
      action: 'Coupon created',
      adminId: req.admin.id,
      adminEmail: req.admin.email,
      ip: req.ip,
      resource: `Coupon ${cleanCode}`,
      details: `Created voucher ${cleanCode}`
    });

    return res.status(201).json({ success: true, message: `Coupon ${cleanCode} created.`, coupon: created });
  } catch (err) {
    if (err.message === 'COUPON_ALREADY_EXISTS') {
      return res.status(400).json({ success: false, message: 'Coupon code already exists.' });
    }
    return res.status(500).json({ success: false, message: 'Server error creating coupon' });
  }
});

// DELETE /api/admin/coupons/:code
router.delete('/coupons/:code', (req, res) => {
  try {
    const { code } = req.params;
    db.deleteCoupon(code);

    logAudit({
      action: 'Coupon deleted',
      adminId: req.admin.id,
      adminEmail: req.admin.email,
      ip: req.ip,
      resource: `Coupon ${code}`,
      details: `Removed voucher ${code}`
    });

    return res.json({ success: true, message: `Coupon ${code} removed.` });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error deleting coupon' });
  }
});

// 6. SECURITY AUDIT TRAIL
// GET /api/admin/audit-logs
router.get('/audit-logs', async (req, res) => {
  try {
    const logs = await db.getAuditLogsAsync(100);
    return res.json({ success: true, logs });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error fetching audit trail' });
  }
});

export default router;
