export function formatPrice(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

export function calculateSubtotal(items) {
  return items.reduce((total, item) => total + item.product.price, 0);
}

export function calculateCheckoutTotals(subtotal, discountCode = '') {
  const discountRate = discountCode.trim().toUpperCase() === 'WELCOME10' ? 0.1 : 0;
  const discount = Math.round(subtotal * discountRate);
  const taxableSubtotal = subtotal - discount;
  const tax = Math.round(taxableSubtotal * 0.1);
  return { discount, tax, total: taxableSubtotal + tax };
}
