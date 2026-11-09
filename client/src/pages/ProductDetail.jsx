import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api.js';
import { useCart } from '../hooks/CartContext.jsx';
import { formatPrice } from '../utils/format.js';

export default function ProductDetail() {
  const { id } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [added, setAdded] = useState(false);

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(({ data }) => setProduct(data.product))
      .catch(() => setError('We couldn’t find that object.'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleAdd() {
    if (await addItem(product.id, quantity)) {
      setAdded(true);
      window.setTimeout(() => setAdded(false), 1800);
    }
  }

  if (loading) return <main className="detail-message">Finding your object…</main>;
  if (error || !product) return <main className="detail-message error-state" role="alert">{error || 'We couldn’t find that object.'}<Link to="/shop" className="text-link">Back to the collection ↗</Link></main>;

  return (
    <main className="detail-page section-wrap">
      <div className="breadcrumbs"><Link to="/shop">Shop</Link><span>/</span><span>{product.category}</span><span>/</span><span>{product.name}</span></div>
      <div className="detail-layout">
        <div className="detail-image-wrap"><img src={product.image} alt={product.name} className="detail-image" /><span className="detail-image-note">A closer look · {product.color}</span></div>
        <div className="detail-copy">
          <p className="eyebrow">{product.category} · {product.color}</p>
          <h1>{product.name}</h1>
          <div className="detail-rating"><span>★★★★★</span> {product.rating} <span className="muted">({product.reviewCount} notes)</span></div>
          <p className="detail-price">{formatPrice(product.price)} <span>INR</span></p>
          <p className="detail-description">{product.description}</p>
          <div className="detail-stock"><span className="stock-dot" /> In the studio · {product.stock} ready to ship</div>
          <div className="buy-row">
            <div className="quantity-control"><button onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease quantity">−</button><span>{quantity}</span><button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} aria-label="Increase quantity">+</button></div>
            <button className="button button-dark add-button" onClick={handleAdd}>{added ? 'Added to your bag' : 'Add to bag'} <span>{added ? '✓' : '↗'}</span></button>
          </div>
          <div className="detail-assurances"><p><span>01</span> Thoughtfully made in small batches</p><p><span>02</span> Free shipping on orders over ₹2,500</p><p><span>03</span> 30 days to find its place at home</p></div>
        </div>
      </div>
    </main>
  );
}
