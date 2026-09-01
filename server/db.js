import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { supabase } from './services/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, 'data');
try {
  if (!fs.existsSync(dataDir) && !process.env.VERCEL) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
} catch (e) {}

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
    }
  } catch (err) {
    // Read fallback
  }
}

function saveToDisk() {
  if (process.env.VERCEL) return;
  try {
    const tmpFile = `${dbFile}.tmp`;
    fs.writeFileSync(tmpFile, JSON.stringify(memoryDB, null, 2), 'utf8');
    fs.renameSync(tmpFile, dbFile);
  } catch (err) {
    // Silently ignore on read-only environments
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

  // 1. Pull registered admins from Supabase cloud
  try {
    const { data: supaAdmins } = await supabase.from('admins').select('*');
    if (supaAdmins && supaAdmins.length > 0) {
      memoryDB.admins = supaAdmins.map(sa => ({
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
      }));
      saveToDisk();
      console.log('⚡ Loaded Admin(s) from Supabase Cloud:', supaAdmins.map(a => a.email).join(', '));
    }
  } catch (e) {
    console.warn('Supabase admins sync note:', e.message);
  }

  // 2. Pull live products catalog from Supabase cloud
  try {
    const { data: supaProducts } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (supaProducts && supaProducts.length > 0) {
      memoryDB.products = supaProducts.map(p => ({
        id: p.id,
        name: p.name,
        brand: p.brand || 'A_S Luxury',
        category: p.category,
        categoryName: p.category_name || (p.category ? p.category.toUpperCase() : 'General'),
        price: Number(p.price) || 0,
        originalPrice: p.original_price ? Number(p.original_price) : null,
        discount: p.discount ? Number(p.discount) : 0,
        rating: Number(p.rating) || 5.0,
        reviewCount: Number(p.review_count || p.reviews_count) || 0,
        stockCount: p.stock_count !== undefined ? Number(p.stock_count) : 10,
        inStock: p.in_stock !== false && (p.stock_count === undefined || Number(p.stock_count) > 0),
        badge: p.badge || '',
        description: p.description || '',
        images: Array.isArray(p.images) && p.images.length > 0 ? p.images : (p.image_url ? [p.image_url] : (p.image ? [p.image] : [])),
        isFeatured: Boolean(p.is_featured),
        isTrending: Boolean(p.is_trending),
        isNewArrival: Boolean(p.is_new_arrival),
        isSpecialOffer: Boolean(p.is_special_offer),
        colors: p.colors || [],
        colorNames: p.color_names || [],
        sizes: p.sizes || [],
        specs: p.specs || {},
        createdAt: p.created_at,
        updatedAt: p.updated_at
      }));
      saveToDisk();
      console.log(`⚡ Loaded ${memoryDB.products.length} Products from Supabase Cloud`);
    } else if (!memoryDB.products || memoryDB.products.length === 0) {
      memoryDB.products = INITIAL_PRODUCTS;
      saveToDisk();
    }
  } catch (e) {
    if (!memoryDB.products || memoryDB.products.length === 0) {
      memoryDB.products = INITIAL_PRODUCTS;
      saveToDisk();
    }
  }

  // 3. Pull live site settings from Supabase
  try {
    const { data: supaSettings } = await supabase.from('site_settings').select('*').or('key.eq.config,id.eq.config').maybeSingle();
    if (supaSettings) {
      memoryDB.settings = {
        announcementText: supaSettings.announcement_text || memoryDB.settings.announcementText,
        freeShippingThreshold: Number(supaSettings.free_shipping_threshold) || memoryDB.settings.freeShippingThreshold || 999,
        heroBadge: supaSettings.hero_badge || memoryDB.settings.heroBadge,
        heroHeadline: supaSettings.hero_headline || memoryDB.settings.heroHeadline,
        heroSubheadline: supaSettings.hero_subheadline || memoryDB.settings.heroSubheadline,
        heroDiscount: supaSettings.hero_discount || memoryDB.settings.heroDiscount,
        supportPhone: supaSettings.support_phone || memoryDB.settings.supportPhone,
        supportEmail: supaSettings.support_email || memoryDB.settings.supportEmail,
        storeName: supaSettings.store_name || 'A_S Luxury Commerce',
        heroCtaText: supaSettings.hero_cta_text || 'Explore Collection',
        heroCtaLink: supaSettings.hero_cta_link || '/shop',
        supportAddress: supaSettings.support_address || '',
      };
      saveToDisk();
      console.log('⚡ Loaded Live Site Settings from Supabase Cloud');
    }
  } catch (e) {}

  // 4. Pull live coupons from Supabase
  try {
    const { data: supaCoupons } = await supabase.from('coupons').select('*');
    if (supaCoupons && supaCoupons.length > 0) {
      memoryDB.coupons = supaCoupons.map(c => ({
        code: c.code,
        discountPercent: c.discount_percent,
        discountAmount: c.discount_amount,
        minOrder: c.min_order || 0,
        description: c.description,
        isActive: c.is_active !== false
      }));
      saveToDisk();
    } else if (!memoryDB.coupons || memoryDB.coupons.length === 0) {
      memoryDB.coupons = [
        { code: 'WELCOME10', discountPercent: 10, minOrder: 999, description: '10% Welcome Discount for New Patrons' },
        { code: 'ASGOLD20', discountPercent: 20, minOrder: 4999, description: '20% Extra off on Luxury Horology' },
        { code: 'LUXURY50', discountPercent: 50, minOrder: 9999, description: 'Exclusive VIP Season Finale 50% Off' }
      ];
      saveToDisk();
    }
  } catch (e) {}

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

  updateAdmin: async (id, updates) => {
    loadFromDisk();
    const index = memoryDB.admins.findIndex(a => a.id === id || (updates.email && a.email.toLowerCase() === updates.email.toLowerCase()));
    const now = new Date().toISOString();
    
    if (index !== -1) {
      memoryDB.admins[index] = { ...memoryDB.admins[index], ...updates, updatedAt: now };
      saveToDisk();
    }

    const supaUpdates = {};
    if (updates.name) supaUpdates.name = updates.name;
    if (updates.passwordHash) supaUpdates.password_hash = updates.passwordHash;
    if (updates.lastLoginAt) supaUpdates.last_login_at = updates.lastLoginAt;
    supaUpdates.updated_at = now;

    try {
      if (id) {
        await supabase.from('admins').update(supaUpdates).eq('id', id);
      }
      if (updates.email || (index !== -1 && memoryDB.admins[index]?.email)) {
        const targetEmail = (updates.email || memoryDB.admins[index]?.email).toLowerCase().trim();
        await supabase.from('admins').update(supaUpdates).eq('email', targetEmail);
      }
    } catch (e) {
      console.warn('Supabase admin update note:', e.message);
    }

    return index !== -1 ? memoryDB.admins[index] : null;
  },

  createPasswordReset: async ({ token, adminEmail, email, role = 'customer', expiresAt }) => {
    loadFromDisk();
    const targetEmail = (adminEmail || email || '').toLowerCase().trim();
    const resetId = `rst-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const expiresNum = typeof expiresAt === 'number' ? expiresAt : (Date.now() + 15 * 60 * 1000);
    const expiresIso = new Date(expiresNum).toISOString();
    const now = new Date().toISOString();

    const entry = {
      id: resetId,
      token,
      adminEmail: targetEmail,
      email: targetEmail,
      role,
      expiresAt: expiresNum,
      used: false,
      createdAt: now
    };

    if (!memoryDB.password_resets) memoryDB.password_resets = [];
    memoryDB.password_resets = memoryDB.password_resets.filter(r => r.token !== token && r.email !== targetEmail);
    memoryDB.password_resets.push(entry);
    saveToDisk();

    try {
      if (role === 'admin') {
        await supabase.from('admins').update({
          reset_token: token,
          reset_token_expires_at: expiresIso
        }).eq('email', targetEmail);
      } else {
        await supabase.from('users').update({
          reset_token: token,
          reset_token_expires_at: expiresIso
        }).eq('email', targetEmail);
      }
    } catch (e) {
      console.warn('Supabase password reset token save note:', e.message);
    }
  },

  createPasswordResetRecord: async ({ id, email, role = 'customer', action = 'Password Reset', status = 'Completed', ip = '127.0.0.1' }) => {
    loadFromDisk();
    const record = {
      id: id || `rst-${Date.now()}`,
      action: `${action} (${role}) - ${status}`,
      admin_email: email,
      ip,
      resource: `Account ${email}`,
      details: `Password reset execution completed for ${role} account: ${email}`,
      created_at: new Date().toISOString()
    };
    if (!memoryDB.audit_logs) memoryDB.audit_logs = [];
    memoryDB.audit_logs.unshift(record);
    saveToDisk();

    try {
      await supabase.from('audit_logs').insert({
        id: record.id,
        action: record.action,
        admin_email: record.admin_email,
        ip: record.ip,
        resource: record.resource,
        details: record.details,
        created_at: record.created_at
      });
    } catch (e) {}

    return record;
  },

  getPasswordReset: (token) => {
    loadFromDisk();
    return (memoryDB.password_resets || []).find(r => r.token === token && !r.used);
  },

  getPasswordResetAsync: async (token) => {
    loadFromDisk();
    const cleanToken = (token || '').trim();
    if (!cleanToken) return null;

    try {
      // 1. Check if token belongs to an administrator in Supabase
      const { data: adminData, error: adminErr } = await supabase
        .from('admins')
        .select('*')
        .eq('reset_token', cleanToken)
        .maybeSingle();

      if (adminData && !adminErr) {
        const expiresTime = adminData.reset_token_expires_at
          ? new Date(adminData.reset_token_expires_at).getTime()
          : 0;
        if (expiresTime > Date.now()) {
          return {
            id: `rst-adm-${adminData.id}`,
            token: cleanToken,
            adminEmail: adminData.email,
            email: adminData.email,
            role: 'admin',
            expiresAt: expiresTime,
            used: false
          };
        }
      }

      // 2. Check if token belongs to a customer in Supabase
      const { data: userData, error: userErr } = await supabase
        .from('users')
        .select('*')
        .eq('reset_token', cleanToken)
        .maybeSingle();

      if (userData && !userErr) {
        const expiresTime = userData.reset_token_expires_at
          ? new Date(userData.reset_token_expires_at).getTime()
          : 0;
        if (expiresTime > Date.now()) {
          return {
            id: `rst-usr-${userData.id}`,
            token: cleanToken,
            adminEmail: userData.email,
            email: userData.email,
            role: 'customer',
            expiresAt: expiresTime,
            used: false
          };
        }
      }
    } catch (e) {
      console.warn('Supabase getPasswordResetAsync note:', e.message);
    }

    // 3. Fallback to local memory/disk cache
    return (memoryDB.password_resets || []).find(
      r => r.token === cleanToken && !r.used && r.expiresAt > Date.now()
    ) || null;
  },

  markPasswordResetUsed: async (token) => {
    loadFromDisk();
    const cleanToken = (token || '').trim();
    if (memoryDB.password_resets) {
      const index = memoryDB.password_resets.findIndex(r => r.token === cleanToken);
      if (index !== -1) {
        memoryDB.password_resets[index].used = true;
        saveToDisk();
      }
    }

    try {
      await supabase
        .from('admins')
        .update({ reset_token: null, reset_token_expires_at: null })
        .eq('reset_token', cleanToken);
      await supabase
        .from('users')
        .update({ reset_token: null, reset_token_expires_at: null })
        .eq('reset_token', cleanToken);
    } catch (e) {}
  },

  // 2. CUSTOMER USERS OPERATIONS
  getUsers: () => {
    loadFromDisk();
    return memoryDB.users || [];
  },

  getUsersAsync: async () => {
    try {
      const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
      if (!error && Array.isArray(data)) {
        memoryDB.users = data.map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone || '',
          role: 'customer',
          isVerified: u.is_verified !== false,
          addresses: u.addresses || [],
          wishlist: u.wishlist || [],
          createdAt: u.created_at,
          updatedAt: u.updated_at
        }));
        saveToDisk();
        return memoryDB.users;
      }
    } catch (e) {}
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
    const clean = (email || '').toLowerCase().trim();
    if (!clean) return null;

    try {
      const { data, error } = await supabase.from('users').select('*').eq('email', clean).maybeSingle();
      if (!error) {
        if (data) {
          const user = {
            id: data.id,
            name: data.name,
            email: data.email,
            phone: data.phone || '',
            passwordHash: data.password_hash,
            role: 'customer',
            isVerified: Boolean(data.is_verified),
            addresses: data.addresses || [],
            wishlist: data.wishlist || [],
            verificationOtp: data.verification_otp,
            otpExpiresAt: data.otp_expires_at ? new Date(data.otp_expires_at).getTime() : null,
            createdAt: data.created_at,
            updatedAt: data.updated_at
          };
          if (memoryDB.users) {
            const idx = memoryDB.users.findIndex(u => u.email.toLowerCase() === clean);
            if (idx !== -1) memoryDB.users[idx] = user;
            else memoryDB.users.push(user);
          }
          saveToDisk();
          return user;
        } else {
          // User was removed/deleted from Supabase table! Purge from local memory & disk
          if (memoryDB.users) {
            memoryDB.users = memoryDB.users.filter(u => u.email.toLowerCase() !== clean);
            saveToDisk();
          }
          return null;
        }
      }
    } catch (e) {
      console.warn('Supabase user lookup note:', e.message);
    }

    return (memoryDB.users || []).find(u => u.email.toLowerCase() === clean) || null;
  },

  getAdminByEmail: (email) => {
    loadFromDisk();
    if (!email) return null;
    const clean = email.toLowerCase().trim();
    return (memoryDB.admins || []).find(a => a.email.toLowerCase() === clean);
  },

  getAdminByEmailAsync: async (email) => {
    loadFromDisk();
    if (!email) return null;
    const clean = email.toLowerCase().trim();

    try {
      const { data, error } = await supabase.from('admins').select('*').eq('email', clean).maybeSingle();
      if (!error && data) {
        const admin = {
          id: data.id,
          name: data.name,
          email: data.email,
          passwordHash: data.password_hash,
          role: data.role || 'admin',
          isActive: data.is_active !== false,
          singleAdminLock: data.single_admin_lock ?? 1,
          createdAt: data.created_at,
          updatedAt: data.updated_at
        };
        if (memoryDB.admins) {
          const idx = memoryDB.admins.findIndex(a => a.email.toLowerCase() === clean || a.id === admin.id);
          if (idx !== -1) memoryDB.admins[idx] = admin;
          else memoryDB.admins.push(admin);
        }
        return admin;
      }
    } catch (e) {
      console.warn('Supabase admin lookup note:', e.message);
    }

    // Fallback: check if memory has any admin matching the clean email
    const localMatch = (memoryDB.admins || []).find(a => a.email && a.email.toLowerCase() === clean);
    if (localMatch) return localMatch;

    return null;
  },

  createUser: async ({ id, name, email, phone, passwordHash, role = 'customer', isVerified = false, verificationOtp = null, otpExpiresAt = null }) => {
    loadFromDisk();
    const cleanEmail = (email || '').toLowerCase().trim();
    if (!memoryDB.users) memoryDB.users = [];
    
    // Purge any stale memory records for this email
    memoryDB.users = memoryDB.users.filter(u => u.email.toLowerCase() !== cleanEmail);

    const now = new Date().toISOString();
    const otpExpiryTimestamp = otpExpiresAt ? (typeof otpExpiresAt === 'number' ? otpExpiresAt : new Date(otpExpiresAt).getTime()) : null;
    const otpExpiryIso = otpExpiryTimestamp ? new Date(otpExpiryTimestamp).toISOString() : null;

    const newUser = {
      id: id || `usr-${Date.now()}`,
      name,
      email: cleanEmail,
      phone: phone || '',
      passwordHash,
      role: 'customer',
      isVerified,
      verificationOtp,
      otpExpiresAt: otpExpiryTimestamp,
      addresses: [],
      wishlist: [],
      createdAt: now,
      updatedAt: now
    };

    memoryDB.users.push(newUser);
    saveToDisk();

    // Direct write to Supabase table (upsert on conflict email)
    try {
      const { error } = await supabase.from('users').upsert({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        password_hash: newUser.passwordHash,
        role: 'customer',
        is_verified: isVerified,
        verification_otp: verificationOtp,
        otp_expires_at: otpExpiryIso,
        addresses: [],
        wishlist: [],
        created_at: now,
        updated_at: now
      }, { onConflict: 'email' });

      if (error) {
        console.warn('Supabase users upsert note:', error.message);
      } else {
        console.log(`⚡ Saved Customer User ${cleanEmail} into Supabase table public.users`);
      }
    } catch (err) {
      console.warn('Supabase users table write note:', err.message);
    }

    return newUser;
  },

  verifyUserOtp: async (email, otp) => {
    loadFromDisk();
    const clean = (email || '').toLowerCase().trim();
    const cleanOtp = (otp || '').toString().trim();
    
    // Query Supabase directly for the latest live user record, or fallback to memory
    let user = await db.getUserByEmailAsync(clean);
    if (!user) {
      user = (memoryDB.users || []).find(u => u.email.toLowerCase() === clean);
    }

    if (!user) {
      return { success: false, message: 'User account not found. Please register again.' };
    }

    const storedOtp = (user.verificationOtp || '').toString().trim();
    if (!storedOtp || storedOtp !== cleanOtp) {
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

    if (memoryDB.users) {
      const idx = memoryDB.users.findIndex(u => u.email.toLowerCase() === clean);
      if (idx !== -1) memoryDB.users[idx] = user;
      else memoryDB.users.push(user);
    }
    saveToDisk();

    try {
      await supabase.from('users').update({ is_verified: true, verification_otp: null, otp_expires_at: null, updated_at: now }).eq('email', clean);
      if (user.id) {
        await supabase.from('users').update({ is_verified: true, verification_otp: null, otp_expires_at: null, updated_at: now }).eq('id', user.id);
      }
    } catch (e) {
      console.warn('Supabase user verification update note:', e.message);
    }

    return { success: true, user };
  },

  setSignupOtp: async (email, otp, expiresAt) => {
    loadFromDisk();
    const clean = (email || '').toLowerCase().trim();
    const otpExpiryTimestamp = expiresAt ? (typeof expiresAt === 'number' ? expiresAt : new Date(expiresAt).getTime()) : null;
    const otpExpiryIso = otpExpiryTimestamp ? new Date(otpExpiryTimestamp).toISOString() : null;

    const userIndex = memoryDB.users?.findIndex(u => u.email.toLowerCase() === clean);
    if (userIndex !== undefined && userIndex !== -1) {
      memoryDB.users[userIndex].verificationOtp = otp;
      memoryDB.users[userIndex].otpExpiresAt = otpExpiryTimestamp;
      saveToDisk();
    }

    try {
      await supabase.from('users').update({ 
        verification_otp: otp, 
        otp_expires_at: otpExpiryIso,
        updated_at: new Date().toISOString() 
      }).eq('email', clean);
    } catch (e) {}
  },

  updateUser: async (id, updates) => {
    loadFromDisk();
    const userIndex = memoryDB.users?.findIndex(u => u.id === id);
    const now = new Date().toISOString();

    if (userIndex !== undefined && userIndex !== -1) {
      memoryDB.users[userIndex] = { ...memoryDB.users[userIndex], ...updates, updatedAt: now };
      saveToDisk();
    }

    const supaUpdates = {};
    if (updates.name) supaUpdates.name = updates.name;
    if (updates.phone) supaUpdates.phone = updates.phone;
    if (updates.passwordHash) supaUpdates.password_hash = updates.passwordHash;
    if (updates.addresses) supaUpdates.addresses = updates.addresses;
    if (updates.wishlist) supaUpdates.wishlist = updates.wishlist;
    if (updates.avatar) supaUpdates.avatar = updates.avatar;
    if (updates.isVerified !== undefined) supaUpdates.is_verified = updates.isVerified;
    if (updates.verificationOtp !== undefined) supaUpdates.verification_otp = updates.verificationOtp;
    if (updates.otpExpiresAt !== undefined) {
      supaUpdates.otp_expires_at = updates.otpExpiresAt ? new Date(updates.otpExpiresAt).toISOString() : null;
    }
    supaUpdates.updated_at = now;

    try {
      if (id) {
        await supabase.from('users').update(supaUpdates).eq('id', id);
      }
      if (updates.email || (userIndex !== undefined && userIndex !== -1 && memoryDB.users[userIndex]?.email)) {
        const targetEmail = (updates.email || memoryDB.users[userIndex]?.email).toLowerCase().trim();
        await supabase.from('users').update(supaUpdates).eq('email', targetEmail);
      }
    } catch (e) {
      console.warn('Supabase user update note:', e.message);
    }

    return userIndex !== undefined && userIndex !== -1 ? memoryDB.users[userIndex] : null;
  },

  deleteUser: async (id, email) => {
    loadFromDisk();
    const cleanEmail = (email || '').toLowerCase().trim();
    
    // 1. Remove from local memory DB
    if (memoryDB.users) {
      memoryDB.users = memoryDB.users.filter(u => {
        if (id && u.id === id) return false;
        if (cleanEmail && u.email.toLowerCase() === cleanEmail) return false;
        return true;
      });
      saveToDisk();
    }

    // 2. Remove from Supabase public.users table
    try {
      if (id) {
        await supabase.from('users').delete().eq('id', id);
      }
      if (cleanEmail) {
        await supabase.from('users').delete().eq('email', cleanEmail);
      }
      console.log(`⚡ Safely deleted customer user data (${cleanEmail || id}) from Supabase and local cache.`);
    } catch (e) {
      console.warn('Supabase delete user note:', e.message);
    }

    return { success: true };
  },

  // 3. PRODUCTS OPERATIONS
  getProducts: () => {
    loadFromDisk();
    return memoryDB.products || [];
  },

  getProductsAsync: async () => {
    try {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        memoryDB.products = data.map(p => ({
          id: p.id,
          name: p.name,
          brand: p.brand || 'A_S Luxury',
          category: p.category,
          categoryName: p.category_name || (p.category ? p.category.toUpperCase() : 'General'),
          price: Number(p.price) || 0,
          originalPrice: p.original_price ? Number(p.original_price) : null,
          discount: p.discount ? Number(p.discount) : 0,
          rating: Number(p.rating) || 5.0,
          reviewCount: Number(p.review_count || p.reviews_count) || 0,
          stockCount: p.stock_count !== undefined ? Number(p.stock_count) : 10,
          inStock: p.in_stock !== false && (p.stock_count === undefined || Number(p.stock_count) > 0),
          badge: p.badge || '',
          description: p.description || '',
          images: Array.isArray(p.images) && p.images.length > 0 ? p.images : (p.image_url ? [p.image_url] : (p.image ? [p.image] : [])),
          isFeatured: Boolean(p.is_featured),
          isTrending: Boolean(p.is_trending),
          isNewArrival: Boolean(p.is_new_arrival),
          isSpecialOffer: Boolean(p.is_special_offer),
          colors: p.colors || [],
          colorNames: p.color_names || [],
          sizes: p.sizes || [],
          specs: p.specs || {},
          createdAt: p.created_at,
          updatedAt: p.updated_at
        }));
        saveToDisk();
        return memoryDB.products;
      }
    } catch (e) {
      console.warn('Supabase getProductsAsync note:', e.message);
    }
    loadFromDisk();
    return memoryDB.products || [];
  },

  getProductById: (id) => {
    loadFromDisk();
    return (memoryDB.products || []).find(p => p.id === id);
  },

  getProductByIdAsync: async (id) => {
    loadFromDisk();
    const local = (memoryDB.products || []).find(p => p.id === id);
    if (local) return local;

    try {
      const { data, error } = await supabase.from('products').select('*').eq('id', id).maybeSingle();
      if (!error && data) {
        return {
          id: data.id,
          name: data.name,
          brand: data.brand || 'A_S Luxury',
          category: data.category,
          categoryName: data.category_name || (data.category ? data.category.toUpperCase() : 'General'),
          price: Number(data.price) || 0,
          originalPrice: data.original_price ? Number(data.original_price) : null,
          discount: data.discount ? Number(data.discount) : 0,
          rating: Number(data.rating) || 5.0,
          reviewCount: Number(data.review_count || data.reviews_count) || 0,
          stockCount: data.stock_count !== undefined ? Number(data.stock_count) : 10,
          inStock: data.in_stock !== false && (data.stock_count === undefined || Number(data.stock_count) > 0),
          badge: data.badge || '',
          description: data.description || '',
          images: Array.isArray(data.images) && data.images.length > 0 ? data.images : (data.image_url ? [data.image_url] : (data.image ? [data.image] : [])),
          isFeatured: Boolean(data.is_featured),
          isTrending: Boolean(data.is_trending),
          isNewArrival: Boolean(data.is_new_arrival),
          isSpecialOffer: Boolean(data.is_special_offer),
          colors: data.colors || [],
          colorNames: data.color_names || [],
          sizes: data.sizes || [],
          specs: data.specs || {},
          createdAt: data.created_at,
          updatedAt: data.updated_at
        };
      }
    } catch (e) {}

    return null;
  },

  saveToDisk: () => {
    saveToDisk();
  },

  createProduct: async (productData) => {
    loadFromDisk();
    const id = productData.id || `prod-${Date.now()}`;
    const now = new Date().toISOString();
    const imagesArr = Array.isArray(productData.images) && productData.images.length > 0
      ? productData.images
      : (productData.image ? [productData.image] : ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800']);

    const newProd = {
      id,
      name: productData.name,
      brand: productData.brand || 'A_S Luxury',
      category: productData.category,
      categoryName: productData.categoryName || (productData.category ? productData.category.toUpperCase() : 'General'),
      price: Number(productData.price) || 0,
      originalPrice: productData.originalPrice ? Number(productData.originalPrice) : null,
      discount: productData.discount ? Number(productData.discount) : 0,
      rating: Number(productData.rating) || 5.0,
      reviewCount: Number(productData.reviewCount) || 0,
      stockCount: productData.stockCount !== undefined ? Number(productData.stockCount) : 10,
      inStock: productData.inStock !== false && (productData.stockCount === undefined || Number(productData.stockCount) > 0),
      badge: productData.badge || '',
      description: productData.description || '',
      images: imagesArr,
      isFeatured: productData.isFeatured !== undefined ? Boolean(productData.isFeatured) : true,
      isTrending: Boolean(productData.isTrending),
      isNewArrival: productData.isNewArrival !== undefined ? Boolean(productData.isNewArrival) : true,
      isSpecialOffer: Boolean(productData.isSpecialOffer),
      colors: productData.colors || [],
      colorNames: productData.colorNames || [],
      sizes: productData.sizes || [],
      specs: productData.specs || {},
      createdAt: now,
      updatedAt: now
    };

    if (!memoryDB.products) memoryDB.products = [];
    memoryDB.products.unshift(newProd);
    saveToDisk();

    try {
      const { error } = await supabase.from('products').upsert({
        id: newProd.id,
        name: newProd.name,
        brand: newProd.brand,
        category: newProd.category,
        category_name: newProd.categoryName,
        price: newProd.price,
        original_price: newProd.originalPrice,
        discount: newProd.discount,
        rating: newProd.rating,
        review_count: newProd.reviewCount,
        stock_count: newProd.stockCount,
        in_stock: newProd.inStock,
        badge: newProd.badge,
        description: newProd.description,
        images: newProd.images,
        is_featured: newProd.isFeatured,
        is_trending: newProd.isTrending,
        is_new_arrival: newProd.isNewArrival,
        is_special_offer: newProd.isSpecialOffer,
        colors: newProd.colors,
        color_names: newProd.colorNames,
        sizes: newProd.sizes,
        specs: newProd.specs,
        created_at: now,
        updated_at: now
      }, { onConflict: 'id' });

      if (error) {
        console.warn('Supabase product upsert error:', error.message);
      } else {
        console.log(`⚡ Saved Product "${newProd.name}" (${newProd.id}) into Supabase table public.products`);
      }
    } catch (e) {
      console.warn('Supabase product insert note:', e.message);
    }

    return newProd;
  },

  updateProduct: async (id, updates) => {
    loadFromDisk();
    const index = memoryDB.products.findIndex(p => p.id === id);
    const now = new Date().toISOString();
    
    if (index !== -1) {
      memoryDB.products[index] = { ...memoryDB.products[index], ...updates, updatedAt: now };
      saveToDisk();
    }

    const supaUpdate = { updated_at: now };
    if (updates.name !== undefined) supaUpdate.name = updates.name;
    if (updates.brand !== undefined) supaUpdate.brand = updates.brand;
    if (updates.category !== undefined) supaUpdate.category = updates.category;
    if (updates.categoryName !== undefined) supaUpdate.category_name = updates.categoryName;
    if (updates.price !== undefined) supaUpdate.price = Number(updates.price);
    if (updates.originalPrice !== undefined) supaUpdate.original_price = updates.originalPrice ? Number(updates.originalPrice) : null;
    if (updates.discount !== undefined) supaUpdate.discount = Number(updates.discount) || 0;
    if (updates.stockCount !== undefined) {
      supaUpdate.stock_count = Number(updates.stockCount);
      supaUpdate.in_stock = Number(updates.stockCount) > 0 && updates.inStock !== false;
    }
    if (updates.inStock !== undefined) supaUpdate.in_stock = Boolean(updates.inStock);
    if (updates.badge !== undefined) supaUpdate.badge = updates.badge;
    if (updates.description !== undefined) supaUpdate.description = updates.description;
    if (updates.images !== undefined) supaUpdate.images = updates.images;
    if (updates.isFeatured !== undefined) supaUpdate.is_featured = Boolean(updates.isFeatured);
    if (updates.isTrending !== undefined) supaUpdate.is_trending = Boolean(updates.isTrending);
    if (updates.isNewArrival !== undefined) supaUpdate.is_new_arrival = Boolean(updates.isNewArrival);
    if (updates.isSpecialOffer !== undefined) supaUpdate.is_special_offer = Boolean(updates.isSpecialOffer);
    if (updates.colors !== undefined) supaUpdate.colors = updates.colors;
    if (updates.colorNames !== undefined) supaUpdate.color_names = updates.colorNames;
    if (updates.sizes !== undefined) supaUpdate.sizes = updates.sizes;
    if (updates.specs !== undefined) supaUpdate.specs = updates.specs;

    try {
      const { error } = await supabase.from('products').update(supaUpdate).eq('id', id);
      if (error) {
        console.warn('Supabase update product error:', error.message);
      } else {
        console.log(`⚡ Updated Product ${id} in Supabase table public.products`);
      }
    } catch (e) {
      console.warn('Supabase update product note:', e.message);
    }

    return index !== -1 ? memoryDB.products[index] : null;
  },

  deleteProduct: async (id) => {
    loadFromDisk();
    const index = memoryDB.products.findIndex(p => p.id === id);
    if (index !== -1) {
      memoryDB.products.splice(index, 1);
      saveToDisk();
    }

    try {
      await supabase.from('products').delete().eq('id', id);
      console.log(`⚡ Deleted Product ${id} from Supabase table public.products`);
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

  getOrderByIdAsync: async (id) => {
    loadFromDisk();
    if (!id) return null;
    const clean = id.toString().trim();
    
    const found = (memoryDB.orders || []).find(o =>
      o.id?.toUpperCase() === clean.toUpperCase() ||
      o.trackingNumber?.toUpperCase() === clean.toUpperCase()
    );
    if (found) return found;

    try {
      const { data } = await supabase.from('orders').select('*').eq('id', clean).maybeSingle();
      if (data) {
        const order = {
          id: data.id,
          customerId: data.customer_id,
          customerName: data.customer_name,
          customerEmail: data.user_email || data.customer_email,
          customerPhone: data.customer_phone,
          items: data.items || [],
          subtotal: data.subtotal || data.total_amount,
          total: data.total_amount,
          status: data.status || 'Processing',
          carrier: data.carrier || 'Bluedart Express',
          trackingNumber: data.tracking_number || '',
          paymentMethod: data.payment_method || 'Razorpay',
          paymentStatus: data.payment_status || 'Paid',
          shippingAddress: {
            name: data.customer_name || 'Customer',
            email: data.user_email || data.customer_email || '',
            phone: data.customer_phone || '',
            street: data.shipping_street || '',
            city: data.shipping_city || '',
            pincode: data.shipping_pincode || '',
          },
          createdAt: data.created_at,
          updatedAt: data.updated_at
        };
        if (!memoryDB.orders) memoryDB.orders = [];
        memoryDB.orders.unshift(order);
        return order;
      }
    } catch (e) {}
    return null;
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

    // Automatically decrement product stock for ordered items
    if (Array.isArray(newOrder.items) && Array.isArray(memoryDB.products)) {
      for (const item of newOrder.items) {
        const prodId = item.id || item.productId;
        const qty = Number(item.quantity) || 1;
        const prodIndex = memoryDB.products.findIndex(p => p.id === prodId);
        if (prodIndex !== -1) {
          const currentStock = Number(memoryDB.products[prodIndex].stockCount ?? memoryDB.products[prodIndex].stock ?? 10);
          const newStock = Math.max(0, currentStock - qty);
          memoryDB.products[prodIndex].stockCount = newStock;
          memoryDB.products[prodIndex].inStock = newStock > 0;
          
          try {
            await supabase.from('products').update({
              stock_count: newStock,
              in_stock: newStock > 0,
              updated_at: now
            }).eq('id', prodId);
          } catch (e) {}
        }
      }
    }

    saveToDisk();

    try {
      await supabase.from('orders').insert({
        id: newOrder.id,
        user_email: newOrder.shippingAddress?.email || newOrder.customerEmail || 'customer@ascommerce.luxury',
        customer_name: newOrder.shippingAddress?.name || newOrder.shippingAddress?.fullName || newOrder.customerName || 'Customer',
        customer_phone: newOrder.shippingAddress?.phone || newOrder.customerPhone || '',
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

  updateOrderStatus: async (orderId, { status, carrier, trackingNumber, note }) => {
    loadFromDisk();
    if (!orderId) return null;
    const clean = orderId.toString().trim();
    const now = new Date().toISOString();

    let order = (memoryDB.orders || []).find(o => o.id?.toUpperCase() === clean.toUpperCase());
    if (!order) {
      order = await db.getOrderByIdAsync(clean);
    }
    if (!order) return null;

    if (status) order.status = status;
    if (carrier) order.carrier = carrier;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (note) order.adminNote = note;
    order.updatedAt = now;

    if (memoryDB.orders) {
      const idx = memoryDB.orders.findIndex(o => o.id === order.id);
      if (idx !== -1) memoryDB.orders[idx] = { ...order };
    }
    saveToDisk();

    try {
      await supabase.from('orders').update({
        status: order.status,
        carrier: order.carrier,
        tracking_number: order.trackingNumber,
        updated_at: now
      }).eq('id', order.id);
      console.log(`⚡ Updated Order #${order.id} in Supabase to status: ${order.status}`);
    } catch (e) {
      console.warn('Supabase update order status error:', e.message);
    }

    return order;
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

  // 4. ORDERS OPERATIONS
  getOrders: () => {
    loadFromDisk();
    return memoryDB.orders || [];
  },

  getOrdersAsync: async () => {
    try {
      const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (data && data.length > 0) {
        memoryDB.orders = data.map(o => ({
          id: o.id,
          customerId: o.customer_id,
          customerName: o.customer_name,
          customerEmail: o.user_email || o.customer_email,
          customerPhone: o.customer_phone,
          items: o.items || [],
          subtotal: o.subtotal || o.total_amount,
          total: o.total_amount,
          status: o.status || 'Processing',
          carrier: o.carrier || 'Bluedart Express',
          trackingNumber: o.tracking_number || '',
          paymentMethod: o.payment_method || 'Razorpay',
          paymentStatus: o.payment_status || 'Paid',
          shippingAddress: {
            name: o.customer_name || 'Customer',
            email: o.user_email || o.customer_email || '',
            phone: o.customer_phone || '',
            street: o.shipping_street || '',
            city: o.shipping_city || '',
            pincode: o.shipping_pincode || '',
          },
          createdAt: o.created_at,
          updatedAt: o.updated_at
        }));
        saveToDisk();
        return memoryDB.orders;
      }
    } catch (e) {}
    loadFromDisk();
    return memoryDB.orders || [];
  },

  getCoupons: () => {
    loadFromDisk();
    return memoryDB.coupons || [];
  },

  getCouponsAsync: async () => {
    try {
      const { data } = await supabase.from('coupons').select('*');
      if (data && data.length > 0) {
        memoryDB.coupons = data.map(c => ({
          code: c.code,
          discountPercent: c.discount_percent,
          discountAmount: c.discount_amount,
          minOrder: c.min_order || 0,
          description: c.description,
          isActive: c.is_active !== false
        }));
        saveToDisk();
        return memoryDB.coupons;
      }
    } catch (e) {}
    loadFromDisk();
    return memoryDB.coupons || [];
  },

  getSettings: () => {
    loadFromDisk();
    return memoryDB.settings;
  },

  getSettingsAsync: async () => {
    try {
      const { data, error } = await supabase.from('site_settings').select('*').or('key.eq.config,id.eq.config').maybeSingle();
      if (!error && data) {
        memoryDB.settings = {
          announcementText: data.announcement_text || memoryDB.settings.announcementText,
          freeShippingThreshold: Number(data.free_shipping_threshold) || memoryDB.settings.freeShippingThreshold || 999,
          heroBadge: data.hero_badge || memoryDB.settings.heroBadge,
          heroHeadline: data.hero_headline || memoryDB.settings.heroHeadline,
          heroSubheadline: data.hero_subheadline || memoryDB.settings.heroSubheadline,
          heroDiscount: data.hero_discount || memoryDB.settings.heroDiscount,
          supportPhone: data.support_phone || memoryDB.settings.supportPhone,
          supportEmail: data.support_email || memoryDB.settings.supportEmail,
          storeName: data.store_name || 'A_S Luxury Commerce',
          heroCtaText: data.hero_cta_text || 'Explore Collection',
          heroCtaLink: data.hero_cta_link || '/shop',
          supportAddress: data.support_address || '',
        };
        saveToDisk();
        return memoryDB.settings;
      }
    } catch (e) {
      console.warn('Supabase getSettingsAsync note:', e.message);
    }
    loadFromDisk();
    return memoryDB.settings;
  },

  updateSettings: async (newSettings) => {
    loadFromDisk();
    memoryDB.settings = { ...memoryDB.settings, ...newSettings };
    saveToDisk();
    const now = new Date().toISOString();

    try {
      const { error } = await supabase.from('site_settings').upsert({
        key: 'config',
        id: 'config',
        announcement_text: memoryDB.settings.announcementText,
        free_shipping_threshold: Number(memoryDB.settings.freeShippingThreshold) || 999,
        hero_badge: memoryDB.settings.heroBadge,
        hero_headline: memoryDB.settings.heroHeadline,
        hero_subheadline: memoryDB.settings.heroSubheadline,
        hero_discount: memoryDB.settings.heroDiscount,
        support_phone: memoryDB.settings.supportPhone,
        support_email: memoryDB.settings.supportEmail,
        store_name: memoryDB.settings.storeName || 'A_S Luxury Commerce',
        hero_cta_text: memoryDB.settings.heroCtaText || 'Explore Collection',
        hero_cta_link: memoryDB.settings.heroCtaLink || '/shop',
        support_address: memoryDB.settings.supportAddress || '',
        updated_at: now
      }, { onConflict: 'key' });

      if (error) {
        console.warn('Supabase site_settings upsert error:', error.message);
      } else {
        console.log('⚡ Synchronized Site Settings into Supabase table public.site_settings');
      }
    } catch (e) {
      console.warn('Supabase site_settings upsert note:', e.message);
    }

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
        ip: entry.ip,
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

  getAuditLogsAsync: async (limit = 100) => {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (data && data.length > 0) {
        memoryDB.audit_logs = data.map(l => ({
          id: l.id,
          action: l.action,
          adminId: l.admin_id,
          adminEmail: l.admin_email,
          ip: l.ip || l.ip_address,
          resource: l.resource,
          details: l.details,
          createdAt: l.created_at,
          timestamp: l.created_at
        }));
        saveToDisk();
        return memoryDB.audit_logs;
      }
    } catch (e) {}

    loadFromDisk();
    return (memoryDB.audit_logs || []).slice(0, limit);
  },

  getStats: () => {
    loadFromDisk();
    const products = memoryDB.products || [];
    const orders = memoryDB.orders || [];
    const users = memoryDB.users || [];
    const coupons = memoryDB.coupons || [];
    const revenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const lowStock = products.filter(p => Number(p.stockCount) < 5).length;

    return {
      totalProducts: products.length,
      totalOrders: orders.length,
      totalCustomers: users.length,
      totalCoupons: coupons.length,
      totalRevenue: revenue,
      lowStockCount: lowStock,
      recentOrders: orders.slice(0, 5),
      recentAuditLogs: (memoryDB.audit_logs || []).slice(0, 5)
    };
  },

  getStatsAsync: async () => {
    try {
      const [orders, logs, products, users, coupons] = await Promise.all([
        db.getOrdersAsync(),
        db.getAuditLogsAsync(10),
        db.getProductsAsync ? db.getProductsAsync() : Promise.resolve(db.getProducts()),
        db.getUsersAsync(),
        Promise.resolve(db.getCoupons())
      ]);

      const totalRev = (orders || []).reduce((sum, o) => sum + (Number(o.total) || 0), 0);
      const lowStock = (products || []).filter(p => Number(p.stockCount) < 5).length;

      return {
        totalProducts: (products || []).length,
        totalOrders: (orders || []).length,
        totalCustomers: (users || []).length,
        totalCoupons: (coupons || []).length,
        totalRevenue: totalRev,
        lowStockCount: lowStock,
        recentOrders: (orders || []).slice(0, 5),
        recentAuditLogs: (logs || []).slice(0, 5)
      };
    } catch (e) {
      return db.getStats();
    }
  }
};

export default db;

