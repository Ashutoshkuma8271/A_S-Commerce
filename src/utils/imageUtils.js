/**
 * Image optimization utilities for Cloudinary & modern image CDNs
 * Automatically serves images in WebP / AVIF with responsive sizing & compression
 */

export function getOptimizedImageUrl(url, options = {}) {
  if (!url || typeof url !== 'string') return url;

  const { width = null, height = null, quality = 'auto', format = 'auto' } = options;

  // Optimize Cloudinary URLs with auto format (WebP/AVIF) and quality
  if (url.includes('res.cloudinary.com')) {
    // If already has transformation parameters
    if (url.includes('/image/upload/')) {
      const parts = url.split('/image/upload/');
      const transformations = [];

      if (width) transformations.push(`w_${width}`);
      if (height) transformations.push(`h_${height}`);
      transformations.push(`q_${quality}`);
      transformations.push(`f_${format}`);

      const transformStr = transformations.join(',');
      
      // Avoid duplicate transformation injection
      if (!parts[1].startsWith('f_auto') && !parts[1].startsWith('w_') && !parts[1].startsWith('q_')) {
        return `${parts[0]}/image/upload/${transformStr}/${parts[1]}`;
      }
    }
    return url;
  }

  // Optimize Unsplash URLs with auto format and compression
  if (url.includes('images.unsplash.com')) {
    try {
      const urlObj = new URL(url);
      urlObj.searchParams.set('auto', 'format');
      urlObj.searchParams.set('fit', 'crop');
      if (width) urlObj.searchParams.set('w', width.toString());
      if (quality === 'auto') urlObj.searchParams.set('q', '80');
      return urlObj.toString();
    } catch (e) {
      return url;
    }
  }

  return url;
}
