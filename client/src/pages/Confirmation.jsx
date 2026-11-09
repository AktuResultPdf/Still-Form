import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api.js';
import { useCart } from '../hooks/CartContext.jsx';
import { formatPrice } from '../utils/format.js';

export default function Confirmation() {
  const { id } = useParams();
  const { refreshCart } = useCart();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/orders/${id}`).then(({ data }) => setOrder(data.order)).catch(() => setError('We couldn’t find that order.'));
    refreshCart();
  }, [id]);

  if (error) return <main className="detail-message error-state" role="alert">{error}<Link to="/shop" className="text-link">Back to the collection ↗</Link></main>;
  if (!order) return <main className="detail-message">Preparing your confirmation…</main>;

  return (
    <main className="confirmation-page section-wrap">
      <div className="confirmation-mark">✓</div><p className="eyebrow">A very good choice</p><h1>It’s on its way<span>.</span></h1>
      <p className="confirmation-copy">Thanks, {order.customer.name}. We’ve received your order and will send a note to <strong>{order.customer.email}</strong> when it’s on its way.</p>
      <div className="confirmation-receipt"><div className="receipt-top"><span>ORDER</span><strong>{order.id}</strong></div>{order.items.map((item) => <div className="receipt-row" key={item.productId}><span>{item.name} <small>× {item.quantity}</small></span><span>{formatPrice(item.price * item.quantity)}</span></div>)}<div className="receipt-row"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div><div className="receipt-row"><span>Discount</span><span>−{formatPrice(order.discount)}</span></div><div className="receipt-row"><span>Tax</span><span>{formatPrice(order.tax)}</span></div><div className="receipt-row receipt-total"><span>Total</span><span>{formatPrice(order.total)}</span></div></div>
      <Link to="/shop" className="text-link">Back to the good things <span>↗</span></Link>
    </main>
  );
}
