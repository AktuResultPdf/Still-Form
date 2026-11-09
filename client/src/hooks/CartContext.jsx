import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api.js';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [], subtotal: 0 });
  const [cartError, setCartError] = useState('');

  async function refreshCart() {
    try {
      const { data } = await api.get('/cart');
      setCart(data);
      setCartError('');
    } catch {
      setCartError('Your basket could not be loaded. Please try again.');
    }
  }

  useEffect(() => {
    refreshCart();
  }, []);

  async function addItem(productId, quantity = 1) {
    try {
      const { data } = await api.post('/cart', { productId, quantity });
      setCart(data);
      setCartError('');
      return true;
    } catch {
      setCartError('That item could not be added. Please try again.');
      return false;
    }
  }

  async function updateItem(productId, quantity) {
    const { data } = await api.patch(`/cart/${productId}`, { quantity });
    setCart(data);
  }

  async function removeItem(productId) {
    const { data } = await api.delete(`/cart/${productId}`);
    setCart(data);
  }

  return (
    <CartContext.Provider value={{ cart, cartError, refreshCart, addItem, updateItem, removeItem, setCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
