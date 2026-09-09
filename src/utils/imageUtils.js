// Luxury Product Placeholder in case remote images fail or encounter a network error
export const FALLBACK_PRODUCT_IMAGE =
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';

export const handleImageError = (event, fallbackSrc = FALLBACK_PRODUCT_IMAGE) => {
  if (event && event.currentTarget) {
    event.currentTarget.onerror = null; // Prevent infinite loop if fallback also errors
    event.currentTarget.src = fallbackSrc;
  }
};
