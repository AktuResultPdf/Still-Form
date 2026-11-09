import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp, createStore } from '../src/app.js';
import { addToCart, getCart } from '../src/services/cartService.js';
import { listProducts } from '../src/services/catalogService.js';

let store;
let app;

beforeEach(() => {
  store = createStore();
  app = createApp(store);
});

describe('product API', () => {
  it('should return the product listing with HTTP 200', async () => {
    const response = await request(app).get('/api/products');
    expect(response.status).toBe(200);
    expect(response.body.products.length).toBeGreaterThan(0);
  });

  it('should combine search and category filters', async () => {
    const response = await request(app).get('/api/products?q=linen&category=Decor');
    expect(response.body.products).toEqual([]);
  });

  it('should search product names without regard to letter case', async () => {
    const response = await request(app).get('/api/products?q=MUG');
    expect(response.body.products.map((product) => product.id)).toContain('arc-mug');
  });

  it('should return 400 for an invalid product ID format', async () => {
    const response = await request(app).get('/api/products/%24%24%24');
    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/invalid product id/i);
  });

  it('should return 404 for a valid but nonexistent product ID', async () => {
    const response = await request(app).get('/api/products/not-in-catalog');
    expect(response.status).toBe(404);
  });

  it('should return the requested page without skipping products', () => {
    const products = [
      { id: 'first', name: 'First', description: '', category: 'Decor', price: 10, featured: false, rating: 1 },
      { id: 'second', name: 'Second', description: '', category: 'Decor', price: 20, featured: false, rating: 1 },
      { id: 'third', name: 'Third', description: '', category: 'Decor', price: 30, featured: false, rating: 1 }
    ];
    expect(listProducts(products, { sort: 'none', page: 2, limit: 1 }).products.map((product) => product.id)).toEqual(['second']);
  });
});

describe('cart API', () => {
  it('should reject negative product quantities', async () => {
    const response = await request(app).post('/api/cart').send({ productId: 'arc-mug', quantity: -2 });
    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/positive integer/i);
  });

  it('should reject fractional product quantities', async () => {
    const response = await request(app).post('/api/cart').send({ productId: 'arc-mug', quantity: 1.5 });
    expect(response.status).toBe(400);
  });

  it('should reject fractional quantities when updating a cart line', async () => {
    store.cart = [{ productId: 'arc-mug', quantity: 1 }];
    const response = await request(app).patch('/api/cart/arc-mug').send({ quantity: 1.5 });
    expect(response.status).toBe(400);
  });

  it('should not allow repeated additions to exceed available stock', () => {
    store.products.find((product) => product.id === 'arc-mug').stock = 3;
    expect(addToCart(store, 'arc-mug', 2).error).toBeUndefined();
    expect(addToCart(store, 'arc-mug', 2).status).toBe(400);
  });

  it('should calculate each cart line subtotal using its quantity', () => {
    store.cart = [{ productId: 'arc-mug', quantity: 2 }];
    expect(getCart(store).subtotal).toBe(1360);
  });

  it('should remove only the requested item from the cart', async () => {
    store.cart = [{ productId: 'arc-mug', quantity: 1 }, { productId: 'oak-tray', quantity: 2 }];
    const response = await request(app).delete('/api/cart/arc-mug');
    expect(response.status).toBe(200);
    expect(response.body.items.map((item) => item.productId)).toEqual(['oak-tray']);
  });
});

describe('order API', () => {
  it('should reject an empty cart at checkout', async () => {
    const response = await request(app).post('/api/orders').send({ customer: { name: 'Ari', email: 'ari@example.com', address: '12 Lane' } });
    expect(response.status).toBe(400);
  });

  it('should return HTTP 201 when an order is created', async () => {
    store.cart = [{ productId: 'arc-mug', quantity: 1 }];
    const response = await request(app).post('/api/orders').send({ customer: { name: 'Ari', email: 'ari@example.com', address: '12 Lane' } });
    expect(response.status).toBe(201);
    expect(response.body.order.status).toBe('confirmed');
  });

  it('should decrement inventory by the purchased quantity', async () => {
    store.cart = [{ productId: 'arc-mug', quantity: 3 }];
    await request(app).post('/api/orders').send({ customer: { name: 'Ari', email: 'ari@example.com', address: '12 Lane' } });
    expect(store.products.find((product) => product.id === 'arc-mug').stock).toBe(15);
  });

  it('should reject orders with missing customer details', async () => {
    store.cart = [{ productId: 'arc-mug', quantity: 1 }];
    const response = await request(app).post('/api/orders').send({ customer: { name: 'Ari' } });
    expect(response.status).toBe(400);
  });
});
