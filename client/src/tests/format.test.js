import { describe, expect, it } from 'vitest';
import { calculateCheckoutTotals, calculateSubtotal, formatPrice } from '../utils/format.js';

describe('storefront formatting and cart math', () => {
  it('formats Indian prices without decimal paise', () => {
    expect(formatPrice(680)).toBe('₹680');
  });

  it('calculates subtotal using each line quantity', () => {
    expect(calculateSubtotal([
      { product: { price: 500 }, quantity: 2 },
      { product: { price: 200 }, quantity: 3 }
    ])).toBe(1600);
  });

  it('returns zero for an empty basket', () => {
    expect(calculateSubtotal([])).toBe(0);
  });

  it('calculates tax and total for an order without a discount', () => {
    expect(calculateCheckoutTotals(1000)).toEqual({ discount: 0, tax: 100, total: 1100 });
  });

  it('applies the welcome discount once before calculating tax', () => {
    expect(calculateCheckoutTotals(1000, 'welcome10')).toEqual({ discount: 100, tax: 90, total: 990 });
  });
});
