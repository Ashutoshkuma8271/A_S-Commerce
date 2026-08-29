import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { supabase } from './services/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbFile = path.join(dataDir, 'database.json');

// Memory cache of persistent database
let memoryDB = {
  admins: [],
  users: [],
  password_resets: [],
  audit_logs: [],
  orders: [],
  coupons: [],
  products: [],
  settings: {
    announcementText: '✨ Complimentary White-Glove Shipping Across India on Orders Above ₹2,999',
    freeShippingThreshold: 2999,
    heroBadge: 'NEW SEASON COLLECTION 2026',
    heroHeadline: 'Elevate Your Style. Define Your Comfort.',
    heroSubheadline: 'Discover the latest trends in fashion, electronics, and lifestyle. Premium products, best prices at A_S Commerce.',
    heroDiscount: '50% OFF',
    supportPhone: '+91 98765 43210',
    supportEmail: 'concierge@ascommerce.luxury'
  }
};

function loadFromDisk() {
  try {
    if (fs.existsSync(dbFile)) {
      const raw = fs.readFileSync(dbFile, 'utf8');
      memoryDB = JSON.parse(raw);
    } else {
      saveToDisk();
    }
  } catch (err) {
    console.error('Failed to read db file, initializing fresh:', err);
    saveToDisk();
  }
}

function saveToDisk() {
  try {
    const tmpFile = `${dbFile}.tmp`;
    fs.writeFileSync(tmpFile, JSON.stringify(memoryDB, null, 2), 'utf8');
    fs.renameSync(tmpFile, dbFile);
  } catch (err) {
    console.error('Failed to write db file:', err);
  }
}

// Initial default catalog for clean store startup
const INITIAL_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Royal Heritage Chronograph Watch',
    brand: 'A_S Horology',
    category: 'accessories',
    categoryName: 'Accessories',
    price: 18999,
    originalPrice: 24999,
    discount: 24,
    rating: 4.9,
    reviewCount: 128,
    stockCount: 8,
    inStock: true,
    badge: 'LUXURY SELECTION',
    description: 'Precision Swiss-automatic chronograph encased in 316L gold-plated surgical steel with anti-reflective sapphire glass.',
    images: [
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: true,
    isTrending: true,
    isNewArrival: false,
    isSpecialOffer: false,
  },
  {
    id: 'prod-2',
    name: 'Artisanal Italian Leather Satchel',
    brand: 'A_S Bespoke',
    category: 'accessories',
    categoryName: 'Accessories',
    price: 9499,
    originalPrice: 14999,
    discount: 36,
    rating: 4.8,
    reviewCount: 94,
    stockCount: 12,
    inStock: true,
    badge: 'BESTSELLER',
    description: 'Full-grain Tuscan calfskin leather satchel with hand-burnished edges, solid brass hardware, and dual structured compartments.',
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: true,
    isTrending: false,
    isNewArrival: false,
    isSpecialOffer: true,
  },
  {
    id: 'prod-3',
    name: 'Bespoke Velvet Tailored Tuxedo',
    brand: 'A_S Couture',
    category: 'men',
    categoryName: 'Men Fashion',
    price: 12999,
    originalPrice: 19999,
    discount: 35,
    rating: 5.0,
    reviewCount: 76,
    stockCount: 5,
    inStock: true,
    badge: 'NEW ARRIVAL',
    description: 'Midnight navy silk-velvet tuxedo jacket tailored with peak grosgrain lapels and premium cupro lining.',
    images: [
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: true,
    isTrending: true,
    isNewArrival: true,
    isSpecialOffer: false,
  },
  {
    id: 'prod-4',
    name: 'Sculpted Minimalist Lounge Chair',
    brand: 'A_S Living',
    category: 'home-living',
    categoryName: 'Home & Living',
    price: 24999,
    originalPrice: 32999,
    discount: 24,
    rating: 4.9,
    reviewCount: 42,
    stockCount: 4,
    inStock: true,
    badge: 'ARCHITECTURE EDITION',
    description: 'Architectural solid walnut wood frame with organic bouclé upholstery and ergonomic contouring.',
    images: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: true,
    isTrending: false,
    isNewArrival: false,
    isSpecialOffer: false,
  }
];

export async function initDB() {
  loadFromDisk();

  // Try to pull registered admins from Supabase cloud if table exists
  try {
    const { data: supaAdmins } = await supabase.from('admins').select('*').limit(1);
    if (supaAdmins && supaAdmins.length > 0) {
      const sa = supaAdmins[0];
      memoryDB.admins = [{
        id: sa.id,
        name: sa.name,
        email: sa.email,
        passwordHash: sa.password_hash,
        role: sa.role || 'admin',
        isActive: sa.is_active ? 1 : 0,
        singleAdminLock: 1,
        createdAt: sa.created_at,
        updatedAt: sa.updated_at,
        lastLoginAt: sa.last_login_at
      }];
      saveToDisk();
      console.log('⚡ Loaded Master Admin from Supabase Cloud:', sa.email);
    }
  } catch (e) {
    // Supabase table sync fallback
  }

  if (!memoryDB.products || memoryDB.products.length === 0) {
    memoryDB.products = INITIAL_PRODUCTS;
    saveToDisk();
  }

  if (!memoryDB.coupons || memoryDB.coupons.length === 0) {
    memoryDB.coupons = [
      { code: 'WELCOME10', discountPercent: 10, minOrder: 999, description: '10% Welcome Discount for New Patrons' },
      { code: 'ASGOLD20', discountPercent: 20, minOrder: 4999, description: '20% Extra off on Luxury Horology' },
      { code: 'LUXURY50', discountPercent: 50, minOrder: 9999, description: 'Exclusive VIP Season Finale 50% Off' }
    ];
    saveToDisk();
  }

  if (!memoryDB.users) {
    memoryDB.users = [];
    saveToDisk();
  }

  if (!memoryDB.orders) {
    memoryDB.orders = [];
    saveToDisk();
  }
}

// Database Operations Layer with Strict Single-Admin Constraint & Supabase Sync
export const db = {
  // 1. ADMIN OPERATIONS
  getAdminCount: () => {
    loadFromDisk();
    return memoryDB.admins.filter(a => a.isActive === 1 || a.isActive === true).length;
  },

  getAdminByEmail: (email) => {
    loadFromDisk();
    return memoryDB.admins.find(a => a.email.toLowerCase() === email.toLowerCase());
  },

  getAdminById: (id) => {
    loadFromDisk();
    return memoryDB.admins.find(a => a.id === id);
  },

  createFirstAdmin: async ({ id, name, email, passwordHash, role = 'admin', isActive = 1 }) => {
    loadFromDisk();
    if (memoryDB.admins.length > 0) {
      throw new Error('ADMIN_ALREADY_EXISTS');
    }

    const now = new Date().toISOString();
    const newAdmin = {
      id,
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: 'admin',
      isActive: 1,
      singleAdminLock: 1,
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now
    };

    memoryDB.admins.push(newAdmin);
    saveToDisk();

    // Direct write to Supabase table
    try {
      await supabase.from('admins').insert({
        id: newAdmin.id,
        name: newAdmin.name,
        email: newAdmin.email,
        password_hash: newAdmin.passwordHash,
        role: 'admin',
        is_active: true,
        single_admin_lock: 1,
        created_at: now,
        updated_at: now
      });
      console.log('⚡ Saved Admin into Supabase table public.admins');
    } catch (err) {
      console.warn('Supabase admins table write note:', err.message);
    }

    return newAdmin;
  },

  updateAdmin: (id, updates) => {
    loadFromDisk();
    const index = memoryDB.admins.findIndex(a => a.id === id);
    if (index === -1) return null;
    const now = new Date().toISOString();
    memoryDB.admins[index] = { ...memoryDB.admins[index], ...updates, updatedAt: now };
    saveToDisk();

    const supaUpdates = {};
    if (updates.name) supaUpdates.name = updates.name;
    if (updates.passwordHash) supaUpdates.password_hash = updates.passwordHash;
    if (updates.lastLoginAt) supaUpdates.last_login_at = updates.lastLoginAt;
    supaUpdates.updated_at = now;

    // Asynchronous non-blocking Supabase sync for sub-millisecond API response
    supabase.from('admins').update(supaUpdates).eq('id', id).then().catch(e => {
      console.warn('Supabase admin sync note:', e.message);
    });

    return memoryDB.admins[index];
  },

  createPasswordReset: ({ token, adminEmail, expiresAt }) => {
    loadFromDisk();
    if (!memoryDB.password_resets) memoryDB.password_resets = [];
    memoryDB.password_resets.push({ token, adminEmail, expiresAt, used: false, createdAt: new Date().toISOString() });
    saveToDisk();
  },

  createPasswordResetRecord: ({ id, email, role = 'customer', action = 'Password Reset', status = 'Completed', ip = '127.0.0.1' }) => {
    loadFromDisk();
    if (!memoryDB.password_resets) memoryDB.password_resets = [];
    const record = {
      id: id || `rst-${Date.now()}`,
      email,
      role,
      action,
      status,
      ip,
      createdAt: new Date().toISOString()
    };
    memoryDB.password_resets.unshift(record);
    saveToDisk();
    return record;
  },

  getPasswordReset: (token) => {
    loadFromDisk();
    return (memoryDB.password_resets || []).find(r => r.token === token && !r.used);
  },

  markPasswordResetUsed: (token) => {
    loadFromDisk();
    const index = (memoryDB.password_resets || []).findIndex(r => r.token === token);
    if (index !== -1) {
      memoryDB.password_resets[index].used = true;
      saveToDisk();
    }
  },

  // 2. CUSTOMER USERS OPERATIONS
  getUsers: () => {
    loadFromDisk();
    return memoryDB.users || [];
  },

  getUserById: (id) => {
    loadFromDisk();
    return (memoryDB.users || []).find(u => u.id === id);
  },

  getUserByEmail: (email) => {
    loadFromDisk();
    return (memoryDB.users || []).find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  getUserByEmailAsync: async (email) => {
    loadFromDisk();
    const clean = email.toLowerCase().trim();
    let user = (memoryDB.users || []).find(u => u.email.toLowerCase() === clean);

    if (!user) {
      try {
        const { data, error } = await supabase.from('users').select('*').eq('email', clean).maybeSingle();
        if (data && !error) {
          user = {
            id: data.id,
            name: data.name,
            email: data.email,
            phone: data.phone || '',
            passwordHash: data.password_hash,
            role: 'customer',
            isVerified: data.is_verified !== false,
            addresses: data.addresses || [],
            wishlist: data.wishlist || [],
            createdAt: data.created_at,
            updatedAt: data.updated_at
          };
          if (!memoryDB.users) memoryDB.users = [];
          memoryDB.users.push(user);
          saveToDisk();
        }
      } catch (e) {
        // Supabase lookup note
      }
    }

    return user;
  },

  getAdminByEmail: (email) => {
    loadFromDisk();
    return (memoryDB.admins || []).find(a => a.email.toLowerCase() === email.toLowerCase().trim());
  },

  getAdminByEmailAsync: async (email) => {
    loadFromDisk();
    const clean = email.toLowerCase().trim();
    let admin = (memoryDB.admins || []).find(a => a.email.toLowerCase() === clean);

    if (!admin) {
      try {
        const { data, error } = await supabase.from('admins').select('*').eq('email', clean).maybeSingle();
        if (data && !error) {
          admin = {
            id: data.id,
            name: data.name,
            email: data.email,
            passwordHash: data.password_hash,
            role: 'admin',
            isActive: data.is_active ?? 1,
            singleAdminLock: data.single_admin_lock ?? 1,
            createdAt: data.created_at,
            updatedAt: data.updated_at
          };
          if (!memoryDB.admins) memoryDB.admins = [];
          memoryDB.admins.push(admin);
          saveToDisk();
        }
      } catch (e) {}
    }

    return admin;
  },

  createUser: async ({ id, name, email, phone, passwordHash, role = 'customer', isVerified = false, verificationOtp = null, otpExpiresAt = null }) => {
    loadFromDisk();
    if (!memoryDB.users) memoryDB.users = [];

    const now = new Date().toISOString();
    const newUser = {
      id: id || `usr-${Date.now()}`,
      name,
      email: email.toLowerCase(),
      phone: phone || '',
      passwordHash,
      role: 'customer',
      isVerified,
      verificationOtp,
      otpExpiresAt,
      addresses: [],
      wishlist: [],
      createdAt: now,
      updatedAt: now
    };

    memoryDB.users.push(newUser);
    saveToDisk();

    // Direct write to Supabase table
    try {
      await supabase.from('users').insert({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        password_hash: newUser.passwordHash,
        role: 'customer',
        is_verified: isVerified,
        verification_otp: verificationOtp,
        addresses: [],
        wishlist: [],
        created_at: now,
        updated_at: now
      });
      console.log('⚡ Saved Customer User into Supabase table public.users');
    } catch (err) {
      console.warn('Supabase users table write note:', err.message);
    }

    return newUser;
  },

  verifyUserOtp: (email, otp) => {
    loadFromDisk();
    const clean = email.toLowerCase().trim();
    const userIndex = memoryDB.users?.findIndex(u => u.email.toLowerCase() === clean);
    if (userIndex === undefined || userIndex === -1) {
      return { success: false, message: 'User account not found.' };
    }

    const user = memoryDB.users[userIndex];
    if (!user.verificationOtp || user.verificationOtp.toString().trim() !== otp.toString().trim()) {
      return { success: false, message: 'Invalid 6-digit verification code. Please check and try again.' };
    }

    if (user.otpExpiresAt && Date.now() > user.otpExpiresAt) {
      return { success: false, message: 'Verification code has expired. Please request a new code.' };
    }

    const now = new Date().toISOString();
    user.isVerified = true;
    user.verificationOtp = null;
    user.otpExpiresAt = null;
    user.updatedAt = now;

    memoryDB.users[userIndex] = user;
    saveToDisk();

    supabase.from('users').update({ is_verified: true, verification_otp: null, updated_at: now }).eq('id', user.id).then().catch(() => {});

    return { success: true, user };
  },

  setSignupOtp: (email, otp, expiresAt) => {
    loadFromDisk();
    const clean = email.toLowerCase().trim();
    const userIndex = memoryDB.users?.findIndex(u => u.email.toLowerCase() === clean);
    if (userIndex !== undefined && userIndex !== -1) {
      memoryDB.users[userIndex].verificationOtp = otp;
      memoryDB.users[userIndex].otpExpiresAt = expiresAt;
      saveToDisk();
      supabase.from('users').update({ verification_otp: otp, updated_at: new Date().toISOString() }).eq('id', memoryDB.users[userIndex].id).then().catch(() => {});
    }
  },

  updateUser: (id, updates) => {
    loadFromDisk();
    const userIndex = memoryDB.users?.findIndex(u => u.id === id);
    const adminIndex = memoryDB.admins?.findIndex(a => a.id === id);
    const now = new Date().toISOString();

    if (userIndex !== undefined && userIndex !== -1) {
      memoryDB.users[userIndex] = { ...memoryDB.users[userIndex], ...updates, updatedAt: now };
      saveToDisk();
      const supaUpdates = {};
      if (updates.name) supaUpdates.name = updates.name;
      if (updates.phone) supaUpdates.phone = updates.phone;
      if (updates.passwordHash) supaUpdates.password_hash = updates.passwordHash;
      if (updates.addresses) supaUpdates.addresses = updates.addresses;
      if (updates.wishlist) supaUpdates.wishlist = updates.wishlist;
      if (updates.avatar) supaUpdates.avatar_url = updates.avatar;
      supaUpdates.updated_at = now;

      // Fast non-blocking async Supabase sync
      supabase.from('users').update(supaUpdates).eq('id', id).then().catch(e => {
        console.warn('Supabase user sync note:', e.message);
      });
      return memoryDB.users[userIndex];
    }

    if (adminIndex !== undefined && adminIndex !== -1) {
      memoryDB.admins[adminIndex] = { ...memoryDB.admins[adminIndex], ...updates, updatedAt: now };
      saveToDisk();
      const supaUpdates = {};
      if (updates.name) supaUpdates.name = updates.name;
      if (updates.passwordHash) supaUpdates.password_hash = updates.passwordHash;
      supaUpdates.updated_at = now;

      // Fast non-blocking async Supabase sync
      supabase.from('admins').update(supaUpdates).eq('id', id).then().catch(e => {
        console.warn('Supabase admin sync note:', e.message);
      });
      return memoryDB.admins[adminIndex];
    }

    return null;
  },

  // 3. PRODUCTS OPERATIONS
  getProducts: () => {
    loadFromDisk();
    return memoryDB.products || [];
  },

  createProduct: async (productData) => {
    loadFromDisk();
    const id = `prod-${Date.now()}`;
    const newProd = {
      id,
      ...productData,
      rating: 5.0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    memoryDB.products.unshift(newProd);
    saveToDisk();

    try {
      await supabase.from('products').insert({
        id: newProd.id,
        name: newProd.name,
        brand: newProd.brand,
        category: newProd.category,
        category_name: newProd.categoryName,
        price: newProd.price,
        original_price: newProd.originalPrice,
        discount: newProd.discount,
        stock_count: newProd.stockCount,
        in_stock: newProd.inStock,
        badge: newProd.badge,
        description: newProd.description,
        images: newProd.images,
        created_at: newProd.createdAt,
        updated_at: newProd.updatedAt
      });
      console.log('⚡ Saved Product into Supabase table public.products');
    } catch (e) {
      // Supabase product insert note
    }

    return newProd;
  },

  updateProduct: async (id, updates) => {
    loadFromDisk();
    const index = memoryDB.products.findIndex(p => p.id === id);
    if (index === -1) return null;
    const now = new Date().toISOString();
    memoryDB.products[index] = { ...memoryDB.products[index], ...updates, updatedAt: now };
    saveToDisk();

    try {
      await supabase.from('products').update({
        name: updates.name,
        price: updates.price,
        original_price: updates.originalPrice,
        stock_count: updates.stockCount,
        badge: updates.badge,
        description: updates.description,
        updated_at: now
      }).eq('id', id);
    } catch (e) {}

    return memoryDB.products[index];
  },

  deleteProduct: async (id) => {
    loadFromDisk();
    const index = memoryDB.products.findIndex(p => p.id === id);
    if (index === -1) return false;
    memoryDB.products.splice(index, 1);
    saveToDisk();

    try {
      await supabase.from('products').delete().eq('id', id);
    } catch (e) {}

    return true;
  },

  // 4. ORDERS OPERATIONS
  getOrders: () => {
    loadFromDisk();
    return memoryDB.orders || [];
  },

  getOrderById: (id) => {
    loadFromDisk();
    if (!id) return null;
    const clean = id.toString().trim().toUpperCase();
    return (memoryDB.orders || []).find(o =>
      o.id?.toUpperCase() === clean ||
      o.trackingNumber?.toUpperCase() === clean
    );
  },

  createOrder: async (orderData) => {
    loadFromDisk();
    const now = new Date().toISOString();
    const id = `AS-${Date.now().toString().slice(-6)}`;
    const newOrder = {
      id,
      ...orderData,
      createdAt: now,
      updatedAt: now
    };
    if (!memoryDB.orders) memoryDB.orders = [];
    memoryDB.orders.unshift(newOrder);
    saveToDisk();

    try {
      await supabase.from('orders').insert({
        id: newOrder.id,
        user_email: newOrder.shippingAddress?.email || 'customer@ascommerce.luxury',
        customer_name: newOrder.shippingAddress?.name || newOrder.shippingAddress?.fullName || 'Customer',
        customer_phone: newOrder.shippingAddress?.phone || '',
        shipping_street: newOrder.shippingAddress?.street || '',
        shipping_city: newOrder.shippingAddress?.city || '',
        shipping_pincode: newOrder.shippingAddress?.pincode || '',
        items: newOrder.items || [],
        subtotal: newOrder.subtotal || newOrder.total,
        total_amount: newOrder.total,
        payment_method: newOrder.paymentMethod || 'Razorpay',
        payment_status: newOrder.paymentStatus || 'Paid',
        status: newOrder.status || 'Processing',
        created_at: now,
        updated_at: now
      });
      console.log('⚡ Saved Order into Supabase table public.orders');
    } catch (e) {}

    return newOrder;
  },

  updateOrderStatus: async (orderId, { status, carrier, trackingNumber }) => {
    loadFromDisk();
    const index = memoryDB.orders.findIndex(o => o.id === orderId);
    if (index === -1) return null;

    const now = new Date().toISOString();
    memoryDB.orders[index].status = status || memoryDB.orders[index].status;
    if (carrier) memoryDB.orders[index].carrier = carrier;
    if (trackingNumber) memoryDB.orders[index].trackingNumber = trackingNumber;
    memoryDB.orders[index].updatedAt = now;
    saveToDisk();

    try {
      await supabase.from('orders').update({
        status,
        carrier,
        tracking_number: trackingNumber,
        updated_at: now
      }).eq('id', orderId);
    } catch (e) {}

    return memoryDB.orders[index];
  },

  // 5. COUPONS & SITE SETTINGS
  getCoupons: () => {
    loadFromDisk();
    return memoryDB.coupons || [];
  },

  createCoupon: async (coupon) => {
    loadFromDisk();
    if (!memoryDB.coupons) memoryDB.coupons = [];
    memoryDB.coupons.push(coupon);
    saveToDisk();

    try {
      await supabase.from('coupons').insert({
        code: coupon.code,
        discount_percent: coupon.discountPercent,
        min_order: coupon.minOrder || 0,
        description: coupon.description
      });
    } catch (e) {}

    return coupon;
  },

  deleteCoupon: async (code) => {
    loadFromDisk();
    memoryDB.coupons = (memoryDB.coupons || []).filter(c => c.code !== code);
    saveToDisk();

    try {
      await supabase.from('coupons').delete().eq('code', code);
    } catch (e) {}

    return true;
  },

  getSettings: () => {
    loadFromDisk();
    return memoryDB.settings;
  },

  updateSettings: (newSettings) => {
    loadFromDisk();
    memoryDB.settings = { ...memoryDB.settings, ...newSettings };
    saveToDisk();
    return memoryDB.settings;
  },

  // 6. AUDIT LOGS
  createAuditLog: async (log) => {
    loadFromDisk();
    const id = `audit-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const now = new Date().toISOString();
    const entry = { id, ...log, createdAt: now };
    if (!memoryDB.audit_logs) memoryDB.audit_logs = [];
    memoryDB.audit_logs.unshift(entry);
    saveToDisk();

    try {
      await supabase.from('audit_logs').insert({
        id: entry.id,
        action: entry.action,
        admin_id: entry.adminId,
        admin_email: entry.adminEmail,
        ip_address: entry.ip,
        resource: entry.resource,
        details: entry.details,
        created_at: now
      });
    } catch (e) {}

    return entry;
  },

  getAuditLogs: (limit = 100) => {
    loadFromDisk();
    return (memoryDB.audit_logs || []).slice(0, limit);
  },

  getStats: () => {
    loadFromDisk();
    const products = memoryDB.products || [];
    const orders = memoryDB.orders || [];
    const revenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const lowStock = products.filter(p => Number(p.stockCount) < 5).length;

    return {
      totalProducts: products.length,
      totalOrders: orders.length,
      totalRevenue: revenue,
      lowStockCount: lowStock,
      recentOrders: orders.slice(0, 5),
      recentAuditLogs: (memoryDB.audit_logs || []).slice(0, 5)
    };
  }
};
