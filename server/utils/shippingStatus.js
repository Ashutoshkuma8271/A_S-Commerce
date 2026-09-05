export function normalizeShippingStatus(rawStatus) {
  if (!rawStatus) return 'Processing';
  const clean = rawStatus.toUpperCase();

  if (clean.includes('OUT') || clean.includes('OFD')) return 'Out for Delivery';
  if (clean.includes('DELIVER') || clean === 'DLVD') return 'Delivered';
  if (clean.includes('TRANSIT') || clean.includes('INTRANSIT') || clean.includes('DISPATCH') || clean.includes('SHIPPED')) return 'In Transit';
  if (clean.includes('PACK') || clean.includes('RTS') || clean.includes('READY')) return 'Packed';
  if (clean.includes('CANCEL') || clean.includes('RTO')) return 'Cancelled';

  return 'Processing';
}
