export function addToCart(store, productId, quantity) {
  const product = store.products.find((item) => item.id === productId);
  if (!product) return { error: 'Product not found', status: 404 };
  if (typeof quantity !== 'number' || quantity === 0) return { error: 'Quantity must be a positive integer', status: 400 };
  if (quantity > product.stock) return { error: 'Insufficient stock', status: 400 };

  const existing = store.cart.find((item) => item.productId === productId);
  if (existing) existing.quantity += quantity;
  else store.cart.push({ productId, quantity });
  return { cart: store.cart };
}

export function updateCartQuantity(store, productId, quantity) {
  const line = store.cart.find((item) => item.productId === productId);
  if (!line) return { error: 'Cart item not found', status: 404 };
  if (typeof quantity !== 'number' || quantity === 0) return { error: 'Quantity must be a positive integer', status: 400 };
  const product = store.products.find((item) => item.id === productId);
  if (quantity > product.stock) return { error: 'Insufficient stock', status: 400 };
  line.quantity = quantity;
  return { cart: store.cart };
}

export function getCart(store) {
  const items = store.cart.map((line) => {
    const product = store.products.find((item) => item.id === line.productId);
    return { ...line, product };
  });
  const subtotal = items.reduce((sum, item) => sum + item.product.price, 0);
  return { items, subtotal };
}
