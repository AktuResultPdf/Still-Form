import { describe, expect, it } from 'vitest';
import { calculateDiscount, calculateOrderTotal, calculateTax } from '../src/business/pricing.js';
import { placeOrder } from '../src/business/orderService.js';
import { createStore } from '../src/app.js';

describe('order pricing rules', () => {
  it('should calculate 10% tax on the taxable subtotal', () => {
    expect(calculateTax(500)).toBe(50);
  });

  it('should apply a 10% discount exactly once', () => {
    expect(calculateDiscount(1000, 10)).toBe(900);
  });

  it('should include 10% tax in the total when no discount applies', () => {
    expect(calculateOrderTotal(1000)).toBe(1100);
  });

  it('should not reduce an order below zero for a large discount', () => {
    expect(calculateDiscount(500, 100)).toBe(0);
  });
});

describe('order placement', () => {
  it('should preserve the cart quantities in the order receipt', () => {
    const store = createStore();
    store.cart = [{ productId: 'arc-mug', quantity: 2 }];
    const order = placeOrder(store, { name: 'Ari', email: 'ari@example.com', address: '12 Lane' });
    expect(order.items[0].quantity).toBe(2);
    expect(order.subtotal).toBe(1360);
  });
});
