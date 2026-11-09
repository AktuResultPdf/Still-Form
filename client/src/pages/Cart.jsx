import { Link } from 'react-router-dom';
import { useCart } from '../hooks/CartContext.jsx';
import { formatPrice } from '../utils/format.js';

export default function Cart() {
  const { cart, cartError, updateItem, removeItem } = useCart();

  return (
    <main className="cart-page section-wrap">
      <p className="eyebrow">Your considered collection</p><h1>Your bag<span>.</span></h1>
      {cartError && <p className="inline-error" role="alert">{cartError}</p>}
      {!cart.items.length ? <div className="cart-empty"><span className="empty-mark">○</span><h2>A little room for something good.</h2><p>Your bag is taking a moment to itself.</p><Link to="/shop" className="button button-dark">Explore the collection <span>↗</span></Link></div> : (
        <div className="cart-layout">
          <div className="cart-lines">
            {cart.items.map((item) => <article className="cart-line" key={item.productId}>
              <Link to={`/products/${item.product.id}`} className="cart-thumb"><img src={item.product.image} alt="" /></Link>
              <div className="cart-line-info"><Link to={`/products/${item.product.id}`} className="product-name">{item.product.name}</Link><span className="product-category">{item.product.color}</span><button className="remove-link" onClick={() => removeItem(item.productId)}>Remove</button></div>
              <div className="quantity-control compact"><button onClick={() => updateItem(item.productId, Math.max(1, item.quantity - 1))} aria-label={`Decrease ${item.product.name} quantity`}>−</button><span>{item.quantity}</span><button onClick={() => updateItem(item.productId, item.quantity + 1)} aria-label={`Increase ${item.product.name} quantity`}>+</button></div>
              <span className="cart-line-price">{formatPrice(item.product.price * item.quantity)}</span>
            </article>)}
          </div>
          <aside className="order-summary"><h2>Order summary</h2><div className="summary-row"><span>Subtotal</span><span>{formatPrice(cart.subtotal)}</span></div><div className="summary-row"><span>Shipping</span><span>Calculated at checkout</span></div><p className="summary-note">Shipping is on us over ₹2,500.</p><Link to="/checkout" className="button button-dark checkout-button">Continue to checkout <span>↗</span></Link><p className="secure-note">A thoughtful little parcel, carefully packed.</p></aside>
        </div>
      )}
    </main>
  );
}
