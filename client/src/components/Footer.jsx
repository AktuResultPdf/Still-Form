import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer" id="story">
      <div className="footer-top">
        <Link to="/" className="wordmark">still<span>&amp; form</span></Link>
        <p>Made for the everyday, kept for a long time.</p>
        <a href="mailto:hello@stillandform.goods">Say hello ↗</a>
      </div>
      <div className="footer-bottom"><span>© 2026 Still &amp; Form</span><span>Thoughtful things, thoughtfully made.</span></div>
    </footer>
  );
}
