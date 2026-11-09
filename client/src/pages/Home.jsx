import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';
import ProductCard from '../components/ProductCard.jsx';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/products?sort=featured&limit=4')
      .then(({ data }) => setProducts(data.products))
      .catch(() => setError('We couldn’t load the collection. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">A slower kind of everyday</p>
          <h1>Good things,<br /><em>well considered.</em></h1>
          <p className="hero-description">Objects with a little more thought in them. Made to be reached for, every single day.</p>
          <Link to="/shop" className="button button-dark">Explore the collection <span>↗</span></Link>
          <div className="hero-note"><span className="note-mark">✳</span> Small-batch, long-loved essentials</div>
        </div>
        <div className="hero-image-wrap">
          <img className="hero-image" src="https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?auto=format&fit=crop&w=1400&q=90" alt="A considered still life of ceramics and natural materials" />
          <span className="image-caption">The Sunday table · 04 / 08</span>
          <span className="hero-stamp">Made for<br />the moments<br />in between.</span>
        </div>
      </section>

      <section className="collection section-wrap">
        <div className="section-heading">
          <div><p className="eyebrow">The considered edit</p><h2>Everyday, elevated.</h2></div>
          <Link to="/shop" className="text-link">View all objects <span>↗</span></Link>
        </div>
        {loading ? <div className="loading-state">Gathering the good things…</div> : error ? <div className="error-state" role="alert">{error}</div> : products.length ? (
          <div className="product-grid">{products.map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}</div>
        ) : <div className="empty-state">Our shelves are taking a breather. Visit again soon.</div>}
      </section>

      <section className="manifesto">
        <span className="manifesto-star">✳</span>
        <p>“A good object doesn’t ask for attention.<br /><em>It earns a place in your day.”</em></p>
        <span className="manifesto-caption">OUR WAY OF LOOKING AT THINGS</span>
      </section>
    </main>
  );
}
