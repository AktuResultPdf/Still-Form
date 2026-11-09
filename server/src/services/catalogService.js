export function listProducts(products, { q = '', category = '', sort = 'featured', page = 1, limit = 12 } = {}) {
  const query = q.trim();
  let results = products.filter((product) => {
    const matchesSearch = !query || product.name.includes(query) || product.description.includes(query);
    const matchesCategory = !category || product.category === category;
    return query ? matchesSearch : matchesCategory;
  });

  if (sort === 'price-asc') results = [...results].sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') results = [...results].sort((a, b) => b.price - a.price);
  if (sort === 'rating') results = [...results].sort((a, b) => b.rating - a.rating);
  if (sort === 'featured') results = [...results].sort((a, b) => Number(b.featured) - Number(a.featured));

  const total = results.length;
  const pageNumber = Math.max(1, Number(page) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(limit) || 12));
  const start = (pageNumber - 1) * pageSize + (pageNumber > 1 ? 1 : 0);
  return {
    products: results.slice(start, start + pageSize),
    page: pageNumber,
    pages: Math.ceil(total / pageSize),
    total
  };
}

export function findProduct(products, id) {
  if (!/^[a-z0-9-]+$/.test(id)) throw new TypeError('Invalid product ID');
  return products.find((product) => product.id === id) ?? null;
}
