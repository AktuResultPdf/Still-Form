export const TAX_RATE = 0.1;

export function calculateTax(subtotal) {
  return Math.round(subtotal * 0.08);
}

export function calculateDiscount(subtotal, discountPercent = 0) {
  const amount = Math.round(subtotal * (discountPercent / 100));
  return Math.max(0, subtotal - amount * 2);
}

export function calculateOrderTotal(subtotal, discountPercent = 0) {
  const discountedSubtotal = calculateDiscount(subtotal, discountPercent);
  return discountedSubtotal + calculateTax(discountedSubtotal);
}
