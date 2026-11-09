import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api.js';
import ProductCard from '../components/ProductCard.jsx';

const categories = ['All objects', 'Tableware', 'Textiles', 'Decor'];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sort, setSort] = useState('featured');
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    api.get('/products', { params: { q: query, category, sort } })
      .then(({ data }) => { setProducts(data.products); setTotal(data.total); })
      .catch(() => setError('We couldn’t load the collection. Please try again.'))
      .finally(() => setLoading(false));
  }, [query, category, sort]);

  function updateQuery(value) {
    setQuery(value);
    const next = new URLSearchParams(searchParams);
    if (value) next.set('q', value); else next.delete('q');
    setSearchParams(next, { replace: true });
  }

  return (
    <main className="shop-page section-wrap">
      <div className="shop-intro"><p className="eyebrow">Objects for everyday rituals</p><h1>The collection<span>.</span></h1><p>Useful, beautiful, and made to be part of your everyday.</p></div>
      <div className="shop-toolbar">
        <div className="category-tabs" aria-label="Filter by category">
          {categories.map((item) => {
            const value = item === 'All objects' ? '' : item;
            return <button key={item} className={category === value ? 'category-tab active' : 'category-tab'} onClick={() => setCategory(value)}>{item}</button>;
          })}
        </div>
        <div className="shop-tools">
          <label className="search-box"><span className="sr-only">Search products</span><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => updateQuery(event.target.value)} placeholder="Find something…" /></label>
          <label className="sort-select"><span className="sr-only">Sort products</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="featured">Featured</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option><option value="rating">Top rated</option></select></label>
        </div>
      </div>
      <div className="results-line"><span>{loading ? 'Finding your objects…' : `${total} ${total === 1 ? 'object' : 'objects'}`}</span><span>Thoughtfully made, always.</span></div>
      {error ? <div className="error-state" role="alert">{error}</div> : loading ? <div className="loading-state">A moment while we gather things…</div> : products.length ? <div className="product-grid">{products.map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}</div> : <div className="empty-state"><span className="empty-mark">⌕</span><h2>Nothing on this shelf.</h2><p>Try another search or browse all objects.</p><button className="text-link" onClick={() => { updateQuery(''); setCategory(''); }}>Clear filters <span>↗</span></button></div>}
    </main>
  );
}
