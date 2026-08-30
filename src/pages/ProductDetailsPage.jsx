import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PRODUCTS } from '../data/products';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { formatINR } from '../utils/currency';
import { isValidIndianPincode } from '../utils/validationUtils';
import { RatingStars } from '../components/common/RatingStars';
import { ProductCard } from '../components/common/ProductCard';
import {
  Heart,
  ShoppingBag,
  Zap,
  Truck,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Share2,
  Star,
  MapPin,
  Check,
  Clock,
  MessageCircle,
  Eye,
  X,
  Send,
  Flame,
  Award,
  Lock
} from 'lucide-react';

const RECENTLY_VIEWED_KEY = 'as_commerce_recently_viewed';

export const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToast } = useToast();

  const product = PRODUCTS.find((p) => p.id === id) || PRODUCTS[0];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(
    (product.colorNames && product.colorNames[0]) || 'Standard'
  );
  const [selectedSize, setSelectedSize] = useState(
    (product.sizes && product.sizes[0]) || 'Standard'
  );
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [pincode, setPincode] = useState('400020');
  const [pincodeChecked, setPincodeChecked] = useState(true);

  // Zoom Lens State
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  // Write Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewName, setReviewName] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [customReviews, setCustomReviews] = useState([]);

  // Recently Viewed State
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  const isFavorite = isInWishlist(product.id);

  // Track Recently Viewed in localStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || '[]');
      const filtered = saved.filter((pid) => pid !== product.id);
      const updated = [product.id, ...filtered].slice(0, 8);
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));

      // Load products for recently viewed
      const loaded = updated
        .filter((pid) => pid !== product.id)
        .map((pid) => PRODUCTS.find((p) => p.id === pid))
        .filter(Boolean);
      setRecentlyViewed(loaded);
    } catch (e) {
      console.error(e);
    }
  }, [product.id]);

  // Related products
  const relatedProducts = useMemo(() => {
    return PRODUCTS.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 4);
  }, [product]);

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedColor, selectedSize, true);
  };

  const handleBuyNow = () => {
    const success = addToCart(product, quantity, selectedColor, selectedSize, false);
    if (success) {
      navigate('/checkout');
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      addToast('Product link copied!', 'copy');
    }
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`Check out ${product.name} on A_S Commerce: ${window.location.href}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  const handleCheckPincode = (e) => {
    e.preventDefault();
    if (!isValidIndianPincode(pincode)) {
      addToast('Enter a valid 6-digit pincode', 'error');
      return;
    }
    setPincodeChecked(true);
    addToast(`Delivery available to ${pincode}`, 'success');
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) {
      addToast('Please fill all review fields', 'error');
      return;
    }

    const newRev = {
      user: reviewName,
      rate: reviewRating,
      date: 'Just now',
      comment: reviewComment,
      verified: true
    };

    setCustomReviews([newRev, ...customReviews]);
    setIsReviewModalOpen(false);
    setReviewName('');
    setReviewComment('');
    setReviewRating(5);
    addToast('Review submitted successfully!', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-6 flex-wrap">
        <Link to="/" className="hover:text-gold-600">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/shop" className="hover:text-gold-600">Catalog</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to={`/category/${product.category}`} className="hover:text-gold-600">
          {product.categoryName}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-navy-950 dark:text-white font-bold truncate max-w-xs">{product.name}</span>
      </div>

      {/* Main Product Showcase Box */}
      <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 sm:p-10 border border-gray-200/80 dark:border-navy-750 shadow-sm mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Interactive Zoom Gallery (Col 6) */}
          <div className="lg:col-span-6 space-y-4">
            
            {/* Main Interactive Zoom Image */}
            <div
              onMouseEnter={() => setIsZooming(true)}
              onMouseLeave={() => setIsZooming(false)}
              onMouseMove={handleMouseMove}
              className="relative aspect-square w-full rounded-3xl overflow-hidden bg-gray-50 dark:bg-navy-850 border border-gray-100 dark:border-navy-700 shadow-inner group cursor-crosshair"
            >
              <img
                src={product.images[activeImageIndex] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover object-center transition-transform duration-200"
                style={
                  isZooming
                    ? {
                        transform: 'scale(2)',
                        transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                      }
                    : { transform: 'scale(1)' }
                }
              />

              {/* Discount Tag */}
              {product.discount > 0 && (
                <span className="absolute top-4 left-4 px-3 py-1 bg-gold-gradient text-navy-950 font-extrabold text-xs rounded-xl shadow-gold-sm uppercase tracking-wider z-10 pointer-events-none">
                  {product.discount}% OFF
                </span>
              )}

              {/* Zoom Prompt Pill */}
              <div className="absolute bottom-4 left-4 px-3 py-1 bg-navy-950/70 text-white text-[11px] font-semibold rounded-full backdrop-blur-md flex items-center gap-1.5 pointer-events-none opacity-80 group-hover:opacity-0 transition-opacity">
                <Eye className="w-3.5 h-3.5 text-gold-400" />
                <span>Hover to Zoom Lens</span>
              </div>

              {/* Share Actions */}
              <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                <button
                  onClick={handleWhatsAppShare}
                  className="p-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-md transition-all cursor-pointer"
                  title="Share via WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                </button>
                <button
                  onClick={handleShare}
                  className="p-2.5 rounded-full bg-white/90 dark:bg-navy-800 text-navy-900 dark:text-white hover:text-gold-500 shadow-sm backdrop-blur-sm transition-all cursor-pointer"
                  title="Copy product link"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Thumbnail Navigation Row */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 bg-white dark:bg-navy-800 cursor-pointer ${
                      activeImageIndex === idx
                        ? 'border-gold-500 shadow-gold-sm scale-105'
                        : 'border-gray-200 dark:border-navy-700 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Meta & Purchase Matrix (Col 6) */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <div>
              {/* Brand & Live Stock Pill */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-widest text-gold-600 dark:text-gold-400 bg-gold-500/10 px-3 py-1 rounded-full border border-gold-500/20">
                  {product.brand}
                </span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full flex items-center gap-1 border border-emerald-500/20">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  <span>In Vault ({product.stockCount || 5} pieces left)</span>
                </span>
              </div>

              {/* Title */}
              <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-navy-950 dark:text-white leading-tight mb-3">
                {product.name}
              </h1>

              {/* Rating & Authenticity */}
              <div className="flex items-center gap-3 mb-5">
                <RatingStars rating={product.rating} count={product.reviewsCount} size="w-4 h-4" />
                <span className="text-gray-300 dark:text-navy-700">|</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-gold-500" />
                  100% Certified Authentic
                </span>
              </div>

              {/* Price Box */}
              <div className="p-4 bg-cream-100 dark:bg-navy-850 rounded-2xl border border-gold-500/20 mb-6">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-extrabold text-navy-950 dark:text-white font-serif">
                    {formatINR(product.price)}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-base text-gray-400 line-through">
                      {formatINR(product.originalPrice)}
                    </span>
                  )}
                  {product.discount > 0 && (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-md">
                      Save {formatINR(product.originalPrice - product.price)} ({product.discount}% OFF)
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Inclusive of all luxury duties & taxes. Eligible for <strong>Free Express Dispatch</strong>.
                </p>
              </div>

              {/* Short Description */}
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                {product.description}
              </p>

              {/* Color Selection */}
              {product.colorNames && product.colorNames.length > 0 && (
                <div className="mb-5">
                  <span className="block text-xs font-bold text-navy-950 dark:text-white uppercase tracking-wide mb-2">
                    Color: <span className="text-gold-600 dark:text-gold-400 font-semibold">{selectedColor}</span>
                  </span>
                  <div className="flex flex-wrap gap-2.5">
                    {product.colorNames.map((colName, idx) => {
                      const colHex = (product.colors && product.colors[idx]) || '#061A27';
                      const active = selectedColor === colName;
                      return (
                        <button
                          key={colName}
                          onClick={() => setSelectedColor(colName)}
                          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs transition-all cursor-pointer ${
                            active
                              ? 'border-gold-500 bg-gold-500/10 text-navy-950 dark:text-gold-400 font-bold shadow-sm'
                              : 'border-gray-200 dark:border-navy-700 text-gray-600 dark:text-gray-300 bg-white dark:bg-navy-800'
                          }`}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-sm"
                            style={{ backgroundColor: colHex }}
                          />
                          <span>{colName}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-navy-950 dark:text-white uppercase tracking-wide">
                      Select Size: <span className="text-gold-600 dark:text-gold-400 font-semibold">{selectedSize}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => addToast('Standard International Luxury Fit. True to size.', 'info')}
                      className="text-[11px] text-gold-600 dark:text-gold-400 font-semibold hover:underline cursor-pointer"
                    >
                      Size Guide
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((sz) => (
                      <button
                        key={sz}
                        onClick={() => setSelectedSize(sz)}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          selectedSize === sz
                            ? 'border-navy-900 dark:border-gold-500 bg-navy-900 dark:bg-gold-500/20 text-gold-400 font-bold shadow-sm'
                            : 'border-gray-200 dark:border-navy-700 text-gray-700 dark:text-gray-300 bg-white dark:bg-navy-800'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity & CTA Buttons */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-4">
                  {/* Quantity selector */}
                  <div className="flex items-center border border-gray-300 dark:border-navy-700 rounded-2xl overflow-hidden bg-gray-50 dark:bg-navy-850 h-12">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3.5 text-base font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-navy-750 h-full cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-4 text-sm font-bold text-navy-950 dark:text-white">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3.5 text-base font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-navy-750 h-full cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  {/* Add to Cart */}
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 h-12 bg-navy-900 dark:bg-navy-800 hover:bg-navy-850 text-gold-400 font-bold text-xs sm:text-sm rounded-2xl border border-gold-500/30 transition-all flex items-center justify-center gap-2 shadow-md active:scale-98 cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Cart • {formatINR(product.price * quantity)}</span>
                  </button>

                  {/* Wishlist */}
                  <button
                    onClick={() => toggleWishlist(product)}
                    className={`h-12 w-12 rounded-2xl border flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                      isFavorite
                        ? 'bg-red-50 dark:bg-red-950/30 text-red-500 border-red-200 dark:border-red-900'
                        : 'bg-gray-50 dark:bg-navy-850 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-navy-750 hover:text-red-500'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Buy Now Button */}
                <button
                  onClick={handleBuyNow}
                  className="w-full h-12 bg-gold-gradient text-navy-950 font-bold text-xs sm:text-sm rounded-2xl shadow-gold-sm hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Instant Buy Now</span>
                </button>
              </div>
            </div>

            {/* Pincode & Delivery Checker (Amazon/Flipkart Style) */}
            <div className="pt-4 border-t border-gray-100 dark:border-navy-800 space-y-3">
              <form onSubmit={handleCheckPincode} className="flex gap-2">
                <div className="relative flex-1">
                  <MapPin className="w-4 h-4 text-gold-600 dark:text-gold-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="Enter 6-digit Pincode"
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-navy-850 text-navy-950 dark:text-white text-xs rounded-xl border border-gray-200 dark:border-navy-700 focus:outline-none focus:border-gold-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-navy-900 dark:bg-navy-800 text-gold-400 font-bold text-xs rounded-xl hover:bg-navy-850 cursor-pointer border border-gold-500/20"
                >
                  Check Speed
                </button>
              </form>

              {pincodeChecked && (
                <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/30 text-xs space-y-1 animate-fadeIn">
                  <p className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Express Dispatch Available for {pincode}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 text-[11px]">
                    • Standard Delivery (3-4 Days): <strong>FREE</strong><br />
                    • Priority Air Express (1-2 Days): Available at checkout
                  </p>
                </div>
              )}

              {/* Guarantees Row */}
              <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] text-gray-500 dark:text-gray-400 text-center">
                <div className="p-2 bg-gray-50 dark:bg-navy-850 rounded-xl">
                  <Truck className="w-4 h-4 text-gold-600 dark:text-gold-400 mx-auto mb-1" />
                  <span>Free Shipping</span>
                </div>
                <div className="p-2 bg-gray-50 dark:bg-navy-850 rounded-xl">
                  <RotateCcw className="w-4 h-4 text-gold-600 dark:text-gold-400 mx-auto mb-1" />
                  <span>30 Day Return</span>
                </div>
                <div className="p-2 bg-gray-50 dark:bg-navy-850 rounded-xl">
                  <ShieldCheck className="w-4 h-4 text-gold-600 dark:text-gold-400 mx-auto mb-1" />
                  <span>100% Genuine</span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Tabbed Info & Customer Reviews */}
        <div className="mt-14 pt-8 border-t border-gray-200 dark:border-navy-800">
          <div className="flex gap-4 border-b border-gray-200 dark:border-navy-800 mb-6">
            <button
              onClick={() => setActiveTab('description')}
              className={`pb-3 font-serif text-sm sm:text-base font-bold transition-colors relative cursor-pointer ${
                activeTab === 'description'
                  ? 'text-navy-950 dark:text-white'
                  : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              Specifications & Craftsmanship
              {activeTab === 'description' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-500 rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-3 font-serif text-sm sm:text-base font-bold transition-colors relative cursor-pointer ${
                activeTab === 'reviews'
                  ? 'text-navy-950 dark:text-white'
                  : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              Patron Reviews ({product.reviewsCount + customReviews.length})
              {activeTab === 'reviews' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-500 rounded-full" />
              )}
            </button>
          </div>

          {activeTab === 'description' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
              <div className="space-y-3">
                <h4 className="font-bold text-navy-950 dark:text-white">Artisanal Details</h4>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {product.description}
                </p>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Every product from A_S Commerce is subjected to rigorous quality control inspections, ensuring impeccable stitching, material resilience, and enduring prestige.
                </p>
              </div>

              {product.specs && (
                <div className="bg-gray-50 dark:bg-navy-850 p-5 rounded-2xl border border-gray-200 dark:border-navy-700 space-y-2.5">
                  <h4 className="font-bold text-navy-950 dark:text-white mb-3 uppercase tracking-wider text-xs">
                    Technical Specifications
                  </h4>
                  {Object.entries(product.specs).map(([k, v]) => (
                    <div key={k} className="flex justify-between py-1 border-b border-gray-200/60 dark:border-navy-700 text-xs">
                      <span className="text-gray-500 dark:text-gray-400 font-medium">{k}</span>
                      <span className="text-navy-950 dark:text-white font-bold">{v}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-serif text-xl font-bold text-navy-950 dark:text-white">Customer Reviews</h4>
                  <RatingStars rating={product.rating} count={product.reviewsCount + customReviews.length} size="w-4 h-4" />
                </div>
                <button
                  onClick={() => setIsReviewModalOpen(true)}
                  className="px-4 py-2 bg-gold-gradient text-navy-950 font-bold text-xs rounded-xl shadow-gold-sm hover:brightness-110 cursor-pointer"
                >
                  Write a Review
                </button>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {[...customReviews,
                  { user: 'Vikram Singhania', rate: 5, date: '3 days ago', comment: 'Spectacular quality and packaging. The fit and finish are exceptional.' },
                  { user: 'Natasha Roy', rate: 5, date: '1 week ago', comment: 'Worth every rupee. Fast delivery and exactly as showcased in the photograph.' },
                  { user: 'Karan Joshi', rate: 4, date: '2 weeks ago', comment: 'Superb build and premium aesthetics. Highly satisfied with my purchase.' }
                ].map((r, i) => (
                  <div key={i} className="p-4 bg-gray-50 dark:bg-navy-850 rounded-2xl border border-gray-200 dark:border-navy-700 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-navy-950 dark:text-white">{r.user}</span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-semibold">
                          Verified Buyer
                        </span>
                      </div>
                      <span className="text-gray-400 text-[10px]">{r.date}</span>
                    </div>
                    <RatingStars rating={r.rate} showNumber={false} size="w-3 h-3" />
                    <p className="text-gray-600 dark:text-gray-300">{r.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Recently Viewed Products Section (Amazon Style) */}
      {recentlyViewed.length > 0 && (
        <div className="space-y-6 mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-gold-600 dark:text-gold-400 font-sans">
              Recently Explored
            </span>
            <h3 className="font-serif text-2xl font-bold text-navy-950 dark:text-white mt-1">
              Pieces You Recently Viewed
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentlyViewed.slice(0, 4).map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </div>
      )}

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-gold-600 dark:text-gold-400 font-sans">
              Complementary Selections
            </span>
            <h3 className="font-serif text-2xl font-bold text-navy-950 dark:text-white mt-1">
              You May Also Admire
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </div>
      )}

      {/* Write a Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-gold-500/30 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-navy-800">
              <h3 className="font-serif text-lg font-bold text-navy-950 dark:text-white">Write a Patron Review</h3>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-navy-950 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Your Overall Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= reviewRating
                            ? 'text-gold-500 fill-gold-500'
                            : 'text-gray-300 dark:text-navy-700'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  placeholder="e.g. Aryan Malhotra"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-navy-850 text-navy-950 dark:text-white text-xs rounded-xl border border-gray-200 dark:border-navy-700 focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Review Comments</label>
                <textarea
                  required
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Describe craftsmanship, fit, packaging quality..."
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-navy-850 text-navy-950 dark:text-white text-xs rounded-xl border border-gray-200 dark:border-navy-700 focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="flex-1 py-2.5 bg-gray-100 dark:bg-navy-800 text-gray-700 dark:text-gray-300 font-bold text-xs rounded-xl hover:bg-gray-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gold-gradient text-navy-950 font-bold text-xs rounded-xl shadow-gold-sm hover:brightness-110 cursor-pointer"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
