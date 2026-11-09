// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { CartProvider } from '../hooks/CartContext.jsx';
import ProductCard from '../components/ProductCard.jsx';
import Home from '../pages/Home.jsx';
import api from '../services/api.js';

vi.mock('../services/api.js', () => ({ default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() } }));

const products = [{
  id: 'arc-mug', name: 'Arc Ceramic Mug', category: 'Tableware', price: 680,
  stock: 18, rating: 4.8, reviewCount: 42, color: 'Chalk', description: 'A ceramic mug.',
  image: 'https://example.test/mug.jpg', featured: true
}];

beforeEach(() => {
  api.get.mockImplementation((path) => Promise.resolve({
    data: path === '/cart' ? { items: [], subtotal: 0 } : { products, total: products.length }
  }));
});

describe('home storefront', () => {
  it('should render featured products returned by the catalog API', async () => {
    render(<MemoryRouter><CartProvider><Home /></CartProvider></MemoryRouter>);
    expect(await screen.findByRole('link', { name: 'View Arc Ceramic Mug' })).toBeInTheDocument();
    expect(screen.getByText('₹680')).toBeInTheDocument();
  });

  it('should show a retry message when the catalog request fails', async () => {
    api.get.mockImplementation((path) => path === '/cart'
      ? Promise.resolve({ data: { items: [], subtotal: 0 } })
      : Promise.reject(new Error('Service unavailable')));
    render(<MemoryRouter><CartProvider><Home /></CartProvider></MemoryRouter>);
    expect(await screen.findByRole('alert')).toHaveTextContent(/couldn’t load the collection/i);
  });

  it('should show a helpful message when adding an item fails', async () => {
    api.post.mockRejectedValueOnce(new Error('Service unavailable'));
    const user = userEvent.setup();
    render(<MemoryRouter><CartProvider><ProductCard product={products[0]} /></CartProvider></MemoryRouter>);
    await user.click(screen.getByRole('button', { name: 'Add Arc Ceramic Mug to bag' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/could not be added/i);
  });
});
