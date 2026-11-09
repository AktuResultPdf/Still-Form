import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/CartContext.jsx';
import api from '../services/api.js';
import { calculateCheckoutTotals, formatPrice } from '../utils/format.js';

export default function Checkout() {
  const navigate = useNavigate();
  const { cart } = useCart();
  const [form, setForm] = useState({ name: '', email: '', address: '', discountCode: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { discount, tax, total } = calculateCheckoutTotals(cart.subtotal, form.discountCode);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const { data } = await api.post('/orders', { customer: { name: form.name, email: form.email, address: form.address }, discountCode: form.discountCode.trim().toUpperCase() });
      navigate(`/confirmation/${data.order.id}`);
    } catch {
      setError('We couldn’t place that order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!cart.items.length) return <main className="detail-message"><h1>Your bag is waiting.</h1><p>Add something lovely before checking out.</p><Link to="/shop" className="button button-dark">Explore the collection <span>↗</span></Link></main>;

  return (
    <main className="checkout-page section-wrap">
      <div className="breadcrumbs"><Link to="/cart">Your bag</Link><span>/</span><span>Checkout</span></div>
      <h1>Nearly yours<span>.</span></h1>
      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <section className="form-section"><p className="eyebrow">01 — The details</p><h2>Where should we send it?</h2>
            <label>Full name<input required autoComplete="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
            <label>Email address<input required type="email" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
            <label>Delivery address<textarea required rows="3" autoComplete="street-address" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} /></label>
          </section>
          <section className="form-section"><p className="eyebrow">02 — A little thank you</p><h2>Have a welcome code?</h2><label>Discount code<input value={form.discountCode} onChange={(event) => setForm({ ...form, discountCode: event.target.value })} placeholder="WELCOME10" /></label></section>
          {error && <p className="inline-error" role="alert">{error}</p>}
          <button type="submit" disabled={submitting} className="button button-dark place-order">{submitting ? 'Placing your order…' : 'Place your order'} <span>↗</span></button>
        </form>
        <aside className="order-summary checkout-summary"><h2>In your bag <span>{cart.items.length} things</span></h2>
          {cart.items.map((item) => <div className="mini-line" key={item.productId}><img src={item.product.image} alt="" /><div><span>{item.product.name}</span><small>Qty {item.quantity}</small></div><span>{formatPrice(item.product.price * item.quantity)}</span></div>)}
          <div className="summary-row"><span>Subtotal</span><span>{formatPrice(cart.subtotal)}</span></div>
          {discount > 0 && <div className="summary-row"><span>Welcome discount</span><span>−{formatPrice(discount)}</span></div>}
          <div className="summary-row"><span>Tax (10%)</span><span>{formatPrice(tax)}</span></div><div className="summary-row"><span>Shipping</span><span>On us</span></div><div className="summary-row total-row"><span>Total</span><span>{formatPrice(total)}</span></div>
        </aside>
      </div>
    </main>
  );
}
