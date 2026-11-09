import { Link, NavLink } from 'react-router-dom';
import { useCart } from '../hooks/CartContext.jsx';

export default function Header() {
  const { cart } = useCart();
  const itemCount = cart.items.reduce((count, item) => count + item.quantity, 0);

  return (
    <header className="site-header">
      <Link to="/" className="wordmark" aria-label="Still & Form home">still<span>&amp; form</span></Link>
      <nav className="main-nav" aria-label="Main navigation">
        <NavLink to="/shop">Shop</NavLink>
        <a href="/#story">Our approach</a>
      </nav>
      <Link to="/cart" className="bag-link" aria-label={`Shopping bag, ${itemCount} items`}>
        <span>Bag</span><span className="bag-count">{itemCount}</span>
      </Link>
    </header>
  );
}
