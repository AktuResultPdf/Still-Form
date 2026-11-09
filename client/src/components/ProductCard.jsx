import { Link } from 'react-router-dom';
import { useCart } from '../hooks/CartContext.jsx';
import { formatPrice } from '../utils/format.js';

export default function ProductCard({ product, index = 0 }) {
  const { addItem } = useCart();

  return (
    <article className="product-card" style={{ '--card-index': index }}>
      <Link to={`/products/${product.id}`} className="product-image-link" aria-label={`View ${product.name}`}>
        <img className="product-image" src={product.image} alt={product.name} loading="lazy" />
        {product.compareAtPrice && <span className="product-tag">A little favourite</span>}
      </Link>
      <div className="product-meta">
        <div>
          <Link to={`/products/${product.id}`} className="product-name">{product.name}</Link>
          <p className="product-category">{product.category} · {product.color}</p>
        </div>
        <span className="product-price">{formatPrice(product.price)}</span>
      </div>
      <button className="quick-add" onClick={() => addItem(product.id)} aria-label={`Add ${product.name} to bag`}>
        <span>+</span> Add to bag
      </button>
    </article>
  );
}
