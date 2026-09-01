-- ==============================================================================
-- A_S COMMERCE — 100% CLEAN & ERROR-FREE SUPABASE SQL SCRIPT
-- Paste and run directly in Supabase Dashboard -> SQL Editor
-- ==============================================================================

-- 1. DROP ALL UNNECESSARY / OBSOLETE TABLES SAFELY
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.profile CASCADE;
DROP TABLE IF EXISTS public.user_profile CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;
DROP TABLE IF EXISTS public.user_addresses CASCADE;
DROP TABLE IF EXISTS public.user_address CASCADE;
DROP TABLE IF EXISTS public.addresses CASCADE;
DROP TABLE IF EXISTS public.password_resets CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.newsletter_subscriptions CASCADE;
DROP TABLE IF EXISTS public.newsletter_suscribtion CASCADE;
DROP TABLE IF EXISTS public.contact_messages CASCADE;
DROP TABLE IF EXISTS public.contact_message CASCADE;
DROP TABLE IF EXISTS public.cart_items CASCADE;
DROP TABLE IF EXISTS public.wishlists CASCADE;

-- 2. CORE TABLE: ADMINS
CREATE TABLE IF NOT EXISTS public.admins (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  is_active BOOLEAN DEFAULT true,
  single_admin_lock INTEGER DEFAULT 1,
  reset_token TEXT,
  reset_token_expires_at TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure columns exist if table was previously created
ALTER TABLE public.admins ADD COLUMN IF NOT EXISTS reset_token TEXT;
ALTER TABLE public.admins ADD COLUMN IF NOT EXISTS reset_token_expires_at TIMESTAMPTZ;
ALTER TABLE public.admins ADD COLUMN IF NOT EXISTS single_admin_lock INTEGER DEFAULT 1;

-- 3. CORE TABLE: USERS (All profile, address and wishlist data unified here)
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'customer',
  is_verified BOOLEAN DEFAULT false,
  verification_otp TEXT,
  otp_expires_at TIMESTAMPTZ,
  reset_token TEXT,
  reset_token_expires_at TIMESTAMPTZ,
  addresses JSONB DEFAULT '[]'::jsonb,
  wishlist JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure columns exist if table was previously created
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS reset_token TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS reset_token_expires_at TIMESTAMPTZ;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS addresses JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS wishlist JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS verification_otp TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMPTZ;

-- 4. CORE TABLE: PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT,
  category TEXT NOT NULL,
  category_name TEXT,
  price NUMERIC NOT NULL,
  original_price NUMERIC,
  discount NUMERIC DEFAULT 0,
  stock_count INTEGER DEFAULT 10,
  in_stock BOOLEAN DEFAULT true,
  badge TEXT,
  description TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  is_featured BOOLEAN DEFAULT false,
  is_trending BOOLEAN DEFAULT false,
  is_new_arrival BOOLEAN DEFAULT false,
  is_special_offer BOOLEAN DEFAULT false,
  rating NUMERIC DEFAULT 5.0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CORE TABLE: ORDERS (Order items & address stored directly in JSONB)
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  shipping_address JSONB,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC,
  discount NUMERIC DEFAULT 0,
  shipping_fee NUMERIC DEFAULT 0,
  tax NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending',
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  order_status TEXT DEFAULT 'Confirmed',
  carrier TEXT,
  tracking_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CORE TABLE: COUPONS
CREATE TABLE IF NOT EXISTS public.coupons (
  id TEXT,
  code TEXT PRIMARY KEY,
  discount_percent NUMERIC,
  discount_amount NUMERIC,
  min_order NUMERIC DEFAULT 0,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. CORE TABLE: SITE SETTINGS
CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY,
  key TEXT,
  value JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. CORE TABLE: AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  admin_id TEXT,
  admin_email TEXT,
  ip TEXT,
  resource TEXT,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users (email);
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON public.users (reset_token);
CREATE INDEX IF NOT EXISTS idx_admins_email ON public.admins (email);
CREATE INDEX IF NOT EXISTS idx_admins_reset_token ON public.admins (reset_token);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON public.orders (customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs (created_at DESC);

-- 10. ROW LEVEL SECURITY (RLS) & CLEAN PERMISSIVE POLICIES
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins_all_access" ON public.admins;
CREATE POLICY "admins_all_access" ON public.admins FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "users_all_access" ON public.users;
CREATE POLICY "users_all_access" ON public.users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "products_all_access" ON public.products;
CREATE POLICY "products_all_access" ON public.products FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "orders_all_access" ON public.orders;
CREATE POLICY "orders_all_access" ON public.orders FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "coupons_all_access" ON public.coupons;
CREATE POLICY "coupons_all_access" ON public.coupons FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "site_settings_all_access" ON public.site_settings;
CREATE POLICY "site_settings_all_access" ON public.site_settings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "audit_logs_all_access" ON public.audit_logs;
CREATE POLICY "audit_logs_all_access" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);
