export async function calculateOrderTotals({ db, items, couponCode = '', deliveryMode = '' }) {
  const products = await db.getProductsAsync();
  const catalog = new Map(products.map((product) => [product.id, product]));
  const requestedItems = Array.isArray(items) ? items : [];
  const pricedItems = requestedItems.map((item) => {
    const product = catalog.get(item.id);
    const quantity = Number(item.quantity);
    if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > Number(product.stockCount || 0)) {
      return null;
    }
    return {
      ...item,
      name: product.name,
      brand: product.brand,
      price: Number(product.price),
      originalPrice: product.originalPrice,
      quantity,
    };
  });

  if (!requestedItems.length || pricedItems.some((item) => !item)) {
    return { error: 'One or more cart items are unavailable. Please refresh your cart.' };
  }

  const serverSubtotal = pricedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const settings = await db.getSettingsAsync();
  const freeShippingThreshold = Number(settings?.freeShippingThreshold) || 999;
  const baseShipping = serverSubtotal >= freeShippingThreshold ? 0 : 99;
  const deliveryFee = String(deliveryMode).includes('Same-Day')
    ? 249
    : String(deliveryMode).includes('Priority Air')
    ? 149
    : 0;
  const serverShipping = baseShipping + deliveryFee;
  const cleanCouponCode = String(couponCode).trim().toUpperCase();
  const coupons = await db.getCouponsAsync();
  const coupon = cleanCouponCode
    ? coupons.find((item) => item.code?.toUpperCase() === cleanCouponCode && item.isActive !== false)
    : null;

  if (cleanCouponCode && (!coupon || (coupon.minOrder && serverSubtotal < Number(coupon.minOrder)))) {
    return { error: 'This promotional code is invalid or unavailable.' };
  }

  const serverDiscount = coupon?.discountPercent
    ? Math.round(serverSubtotal * Number(coupon.discountPercent) / 100)
    : coupon?.discountAmount
    ? Math.min(serverSubtotal, Number(coupon.discountAmount))
    : 0;

  return {
    pricedItems,
    subtotal: serverSubtotal,
    discount: serverDiscount,
    shipping: serverShipping,
    total: Math.max(0, serverSubtotal - serverDiscount + serverShipping),
  };
}
