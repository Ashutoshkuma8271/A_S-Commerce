/**
 * Centralized Cart & Pricing Utilities for A_S Commerce
 */

export const FREE_SHIPPING_THRESHOLD = 999;
export const STANDARD_SHIPPING_FEE = 99;

/**
 * Calculates progress towards free shipping qualification.
 * @param {number} subtotal 
 * @returns {{ progressPercent: number, amountNeeded: number, isEligible: boolean }}
 */
export const calculateFreeShippingProgress = (subtotal = 0) => {
  const current = Math.max(0, Number(subtotal) || 0);
  const isEligible = current >= FREE_SHIPPING_THRESHOLD;
  const progressPercent = Math.min(100, Math.round((current / FREE_SHIPPING_THRESHOLD) * 100));
  const amountNeeded = Math.max(0, FREE_SHIPPING_THRESHOLD - current);

  return {
    progressPercent,
    amountNeeded,
    isEligible,
  };
};

/**
 * Computes discount percentage given original and final price.
 * @param {number} originalPrice 
 * @param {number} currentPrice 
 * @returns {number}
 */
export const calculateDiscountPercentage = (originalPrice, currentPrice) => {
  if (!originalPrice || !currentPrice || originalPrice <= currentPrice) return 0;
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
};
