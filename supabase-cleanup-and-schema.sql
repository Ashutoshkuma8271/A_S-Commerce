-- ==============================================================================
-- A_S COMMERCE — 100% ACCURATE & TESTED SUPABASE SQL SCRIPT
-- Paste and run directly in Supabase Dashboard -> SQL Editor
-- ==============================================================================

-- 1. NON-DESTRUCTIVE MIGRATION
-- This script intentionally does not DROP tables or CASCADE-delete production data.
-- Archive obsolete tables separately only after a verified backup and rollback plan.

-- 2. ENSURE CORE `admins` TABLE & COLUMNS
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

ALTER TABLE public.admins ADD COLUMN IF NOT EXISTS reset_token TEXT;
ALTER TABLE public.admins ADD COLUMN IF NOT EXISTS reset_token_expires_at TIMESTAMPTZ;
ALTER TABLE public.admins ADD COLUMN IF NOT EXISTS single_admin_lock INTEGER DEFAULT 1;

-- 3. ENSURE CORE `users` TABLE & COLUMNS (Unified Profile, Addresses, Wishlist)
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

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS reset_token TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS reset_token_expires_at TIMESTAMPTZ;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS addresses JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS wishlist JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS verification_otp TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMPTZ;

-- 4. ENSURE CORE `products` TABLE
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

-- 5. ENSURE CORE `orders` TABLE & COLUMNS
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  user_email TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  shipping_street TEXT,
  shipping_city TEXT,
  shipping_state TEXT,
  shipping_pincode TEXT,
  shipping_country TEXT,
  shipping_address JSONB,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC,
  discount_amount NUMERIC DEFAULT 0,
  shipping_fee NUMERIC DEFAULT 0,
  total_amount NUMERIC NOT NULL,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending',
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  delivery_mode TEXT,
  status TEXT DEFAULT 'Order Placed',
  carrier TEXT,
  tracking_number TEXT,
  estimated_delivery TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment verification handoff between checkout and order creation.
-- Backend service-role access only; no anonymous or authenticated client policy.
CREATE TABLE IF NOT EXISTS public.payment_verifications (
  id TEXT PRIMARY KEY,
  razorpay_order_id TEXT UNIQUE NOT NULL,
  razorpay_payment_id TEXT,
  user_id TEXT NOT NULL,
  amount_paise BIGINT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  reconciliation_status TEXT,
  reconciliation_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.payment_verifications ADD COLUMN IF NOT EXISTS reconciliation_status TEXT;
ALTER TABLE public.payment_verifications ADD COLUMN IF NOT EXISTS reconciliation_reason TEXT;

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS user_email TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_phone TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_street TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_city TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_pincode TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_state TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_country TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_address JSONB;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS subtotal NUMERIC;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_fee NUMERIC DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS total_amount NUMERIC;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_mode TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Order Placed';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS carrier TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS estimated_delivery TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 6. ENSURE CORE `coupons` TABLE
CREATE TABLE IF NOT EXISTS public.coupons (
  code TEXT PRIMARY KEY,
  discount_percent NUMERIC,
  discount_amount NUMERIC,
  min_order NUMERIC DEFAULT 0,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ENSURE CORE `site_settings` TABLE
CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY,
  key TEXT,
  value JSONB,
  announcement_text TEXT,
  free_shipping_threshold NUMERIC,
  hero_badge TEXT,
  hero_headline TEXT,
  hero_subheadline TEXT,
  hero_discount TEXT,
  support_phone TEXT,
  support_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ENSURE CORE `audit_logs` TABLE
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

-- 9. PERFORMANCE INDEXES (Using exact column names)
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users (email);
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON public.users (reset_token);
CREATE INDEX IF NOT EXISTS idx_admins_email ON public.admins (email);
CREATE INDEX IF NOT EXISTS idx_admins_reset_token ON public.admins (reset_token);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category);
CREATE INDEX IF NOT EXISTS idx_orders_user_email ON public.orders (user_email);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_verifications_expiry ON public.payment_verifications (expires_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs (created_at DESC);

-- Basic data integrity constraints. These are safe for new rows; clean existing
-- invalid rows before adding stricter NOT NULL constraints in a later migration.
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower ON public.users (LOWER(email));
CREATE UNIQUE INDEX IF NOT EXISTS idx_admins_email_lower ON public.admins (LOWER(email));
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_price_nonnegative;
ALTER TABLE public.products ADD CONSTRAINT products_price_nonnegative CHECK (price >= 0);
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_stock_nonnegative;
ALTER TABLE public.products ADD CONSTRAINT products_stock_nonnegative CHECK (stock_count >= 0);
ALTER TABLE public.coupons DROP CONSTRAINT IF EXISTS coupons_discount_valid;
ALTER TABLE public.coupons ADD CONSTRAINT coupons_discount_valid CHECK (
  (discount_percent IS NULL OR (discount_percent >= 0 AND discount_percent <= 100))
  AND (discount_amount IS NULL OR discount_amount >= 0)
);

UPDATE public.orders SET status = 'Order Placed' WHERE status = 'Confirmed';
ALTER TABLE public.orders ALTER COLUMN status SET DEFAULT 'Order Placed';
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check CHECK (
  status IN ('Order Placed', 'Payment Confirmed', 'Processing', 'Packed', 'Shipped', 'In Transit', 'Out for Delivery', 'Delivered', 'Cancelled', 'Confirmed')
);

-- 10. REALTIME REPLICATION (Supabase Dashboard -> Database -> Publications)
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.site_settings;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.coupons;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;

-- 11. ROW LEVEL SECURITY
-- The Node API uses SUPABASE_SERVICE_ROLE_KEY and is the only writer.
-- Do not grant anonymous table-wide access to customer, order, admin, or audit data.
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_verifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins_all_access" ON public.admins;
DROP POLICY IF EXISTS "users_all_access" ON public.users;
DROP POLICY IF EXISTS "products_all_access" ON public.products;
DROP POLICY IF EXISTS "orders_all_access" ON public.orders;
DROP POLICY IF EXISTS "coupons_all_access" ON public.coupons;
DROP POLICY IF EXISTS "site_settings_all_access" ON public.site_settings;
DROP POLICY IF EXISTS "audit_logs_all_access" ON public.audit_logs;

DROP POLICY IF EXISTS "public_catalog_read" ON public.products;
CREATE POLICY "public_catalog_read" ON public.products FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_settings_read" ON public.site_settings;
CREATE POLICY "public_settings_read" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_active_coupons_read" ON public.coupons;
CREATE POLICY "public_active_coupons_read" ON public.coupons FOR SELECT TO anon, authenticated USING (is_active = true);
