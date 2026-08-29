# A_S Commerce — Luxury E-Commerce Platform

A full-stack, enterprise-grade e-commerce application engineered with high-performance React 18, Tailwind CSS, Node.js Express, Supabase cloud database, Brevo multi-channel transactional email delivery, and Razorpay payment gateway integration.

---

## 🌟 Architecture & Highlights

- **Full-Bleed Cinematic Storefront**: Dark-mode luxury theme featuring smooth Ken-Burns visual banners, responsive typography, and animated micro-interactions.
- **Horizontal Scalable Category Engine**: Touch-enabled, momentum-scrolling category rail with dynamic boundary detection and circular product avatars.
- **End-to-End Authentication**:
  - Customer registration with time-bounded 6-digit email OTP verification.
  - Passwordless login (Magic Link) and tokenized 15-minute password resets.
  - Role-based access control (Customers vs. Admin Staff) with 10-round Bcrypt password hashing.
- **Live Search & Autocomplete**: Real-time multi-attribute product search with recent searches and trending keywords.
- **Interactive Shopping Pipeline**:
  - Slide-out Cart Drawer with dynamic coupon discounts and free shipping progress tracker.
  - Persistent Wishlist with local and server sync.
  - Quick View Modal with multi-image gallery, size/color selectors, and real-time inventory checks.
- **Secured Payment Gateway**: Razorpay integration with cryptographic HMAC-SHA256 signature verification.
- **Live Order Tracking**: Multi-stage visual milestone tracker (Placed → Confirmed → Shipped → Out for Delivery → Delivered).
- **Admin Management Dashboard**: Product catalog CRUD, coupon engine, order lifecycle management, customer analytics, and audit logging.

---

## 🗺️ Complete User Journey & System Flow

```
[ Visitor Lands on Storefront ]
          │
          ├──► Cinematic Hero Banner (Curated seasonal collections)
          ├──► Circular Category Rail (Men, Women, Electronics, Living, Beauty, Footwear, Accessories)
          ├──► Live Product Search & Instant Autocomplete
          └──► Filter by Signature Collections (Featured, Trending, New Arrivals, Special Offers)
          │
[ Product Discovery & Selection ]
          │
          ├──► Quick View Modal OR Full Product Details Page (Specs, Reviews, Stock Status)
          ├──► Add to Wishlist / Add to Cart with Size & Variant Selectors
          └──► Slide-out Cart Drawer (Apply WELCOME10 coupon, auto shipping calculation)
          │
[ Secure Authentication ]
          │
          ├──► New User: Email + Name + Password ──► 6-Digit Brevo/Supabase OTP Email ──► Verified
          ├──► Existing User: Email + Password OR Magic Link Passwordless Sign-In
          └──► Forgot Password: Email Token Link (15-min expiry) ──► Reset Form ──► Auto-login
          │
[ Checkout & Payment ]
          │
          ├──► Shipping Address & Order Summary Review
          ├──► Razorpay Modal Gateway (UPI, Cards, NetBanking, Wallets)
          ├──► Server-side HMAC-SHA256 Signature Verification
          └──► Order Placed ──► Confirmation Email Dispatched
          │
[ Post-Purchase & Management ]
          │
          ├──► Live Order Milestone Tracker (/track-order)
          ├──► Customer Dashboard (Order history, saved addresses, profile settings)
          └──► Admin Control Center (/admin/dashboard - Revenue metrics, stock updates, order dispatch)
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React, React Router v6, Canvas Confetti |
| **Backend & APIs** | Node.js, Express, JSON Web Tokens (JWT), Express Rate Limit, Helmet Security |
| **Database & Cloud** | Supabase (PostgreSQL), Supabase Realtime, Cloudinary Media CDN |
| **Email Delivery** | Brevo SMTP Relay, Direct Brevo REST API, Nodemailer |
| **Payments** | Razorpay Node SDK & Razorpay Standard Checkout |
| **Hosting & Deployment** | Vercel (Client SPA + Serverless Functions) |

---

## 📁 Project Directory Structure

```
commerce/
├── api/                    # Vercel Serverless Function entry point
│   └── index.js            # Express server wrapper for Vercel
├── public/                 # Static public assets and favicons
├── server/                 # Express backend application
│   ├── data/               # Persistent backup storage & mock datasets
│   ├── middleware/         # Auth, Rate Limiter, and Security guards
│   ├── routes/             # Admin, Auth, Order, and Payment endpoints
│   ├── services/           # Supabase cloud database client
│   ├── utils/              # Email delivery service & Brevo dispatchers
│   ├── db.js               # Database abstraction & SQL sync engine
│   └── server.js           # Main Express server configuration
├── src/                    # React frontend application
│   ├── assets/             # Curated product images and brand logos
│   ├── components/         # Modular React components
│   │   ├── common/         # AuthModal, CartDrawer, ProductCard, QuickView
│   │   ├── home/           # HeroSection, CategorySection, FeaturedSection, TrustBar
│   │   └── layout/         # MainHeader, NavigationBar, MobileNav, Footer
│   ├── context/            # AuthContext, CartContext, WishlistContext, ToastContext
│   ├── data/               # Product catalog, categories, and promotions
│   ├── pages/              # Shop, ProductDetails, Checkout, Orders, AdminDashboard
│   ├── utils/              # Razorpay triggers and formatting utilities
│   ├── App.jsx             # Route definitions and layout wrapper
│   ├── index.css           # Global typography, color variables, and luxury scrollbars
│   └── main.jsx            # Application root entry point
├── .env.example            # Environment variable template
├── .gitignore              # Ignored files (node_modules, credentials)
├── index.html              # HTML shell with Google Fonts
├── package.json            # Node dependencies and build scripts
├── tailwind.config.js      # Custom luxury gold and navy palette config
├── vercel.json             # Vercel routing rules & API rewrites
└── vite.config.js          # Vite build bundler configuration
```

---

## 🚀 Getting Started Locally

### 1. Clone the Repository
```bash
git clone https://github.com/Ashutoshkuma8271/A_S-Commerce.git
cd A_S-Commerce
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the project root based on `.env.example`:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Razorpay Payment Gateway
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id

# Email SMTP (Brevo / Nodemailer)
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your_brevo_smtp_user
SMTP_PASS=your_brevo_smtp_key
SMTP_FROM_EMAIL=your_verified_sender_email

# Server Secrets
PORT=5000
JWT_SECRET=your_super_secret_jwt_key
```

### 4. Run Development Servers
```bash
# Start Frontend and Backend concurrently
npm run dev
```

---

## 🚢 Deploying to Vercel

1. Push your repository to GitHub.
2. Import the project into **Vercel** (`https://vercel.com/new`).
3. Set the Framework Preset to **Vite**.
4. Add all environment variables from your `.env` file in the **Vercel Project Settings → Environment Variables**.
5. Click **Deploy**. Vercel will automatically build the client SPA and serve the backend API routes through `/api/index.js`.

---

## 📄 License
This project is licensed under the MIT License.
