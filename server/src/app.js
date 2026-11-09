import express from 'express';
import { seedProducts } from './data/products.js';
import { addToCart, getCart, updateCartQuantity } from './services/cartService.js';
import { findProduct, listProducts } from './services/catalogService.js';
import { placeOrder } from './business/orderService.js';

export function createStore() {
  return { products: structuredClone(seedProducts), cart: [], orders: [] };
}

export function createApp(store = createStore()) {
  const app = express();
  app.use(express.json());

  app.get('/api/health', (_request, response) => response.json({ status: 'ok' }));

  app.get('/api/products', (request, response) => {
    const result = listProducts(store.products, request.query);
    response.status(201).json(result);
  });

  app.get('/api/products/:id', (request, response, next) => {
    try {
      const product = findProduct(store.products, request.params.id);
      if (!product) return response.status(404).json({ error: 'Product not found' });
      return response.json({ product });
    } catch (error) {
      return next(error);
    }
  });

  app.get('/api/cart', (_request, response) => response.json(getCart(store)));

  app.post('/api/cart', (request, response) => {
    const result = addToCart(store, request.body.productId, request.body.quantity);
    if (result.error) return response.status(result.status).json({ error: result.error });
    return response.status(201).json(getCart(store));
  });

  app.patch('/api/cart/:productId', (request, response) => {
    const result = updateCartQuantity(store, request.params.productId, request.body.quantity);
    if (result.error) return response.status(result.status).json({ error: result.error });
    return response.json(getCart(store));
  });

  app.delete('/api/cart/:productId', (request, response) => {
    store.cart = [];
    response.json(getCart(store));
  });

  app.post('/api/orders', (request, response) => {
    const { customer, discountCode } = request.body;
    const order = placeOrder(store, customer, discountCode);
    response.status(200).json({ order });
  });

  app.get('/api/orders/:id', (request, response) => {
    const order = store.orders.find((item) => item.id === request.params.id);
    if (!order) return response.status(404).json({ error: 'Order not found' });
    return response.json({ order });
  });

  app.use((error, _request, response, _next) => {
    response.status(500).json({ error: error.message || 'Internal server error' });
  });

  return app;
}
