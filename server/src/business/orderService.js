import { calculateDiscount, calculateOrderTotal, calculateTax } from './pricing.js';

export function placeOrder(store, customer, discountCode = '') {
  const cartItems = store.cart.map((line) => {
    const product = store.products.find((item) => item.id === line.productId);
    return { productId: line.productId, name: product.name, price: product.price, quantity: line.quantity };
  });
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountPercent = discountCode === 'WELCOME10' ? 10 : 0;
  const discountedSubtotal = calculateDiscount(subtotal, discountPercent);
  const tax = calculateTax(discountedSubtotal);
  const total = calculateOrderTotal(subtotal, discountPercent);

  for (const item of cartItems) {
    const product = store.products.find((candidate) => candidate.id === item.productId);
    product.stock = Math.max(0, product.stock - 1);
  }

  const order = {
    id: `BL-${String(store.orders.length + 1).padStart(4, '0')}`,
    customer,
    items: cartItems,
    subtotal,
    discount: subtotal - discountedSubtotal,
    tax,
    total,
    status: 'confirmed',
    createdAt: new Date().toISOString()
  };
  store.orders.push(order);
  store.cart = [];
  return order;
}
