import { Link } from 'react-router-dom';

export default function NotFound() {
  return <main className="detail-message"><p className="eyebrow">A little detour</p><h1>Nothing here<span>.</span></h1><p>That page has wandered off.</p><Link to="/" className="button button-dark">Head home <span>↗</span></Link></main>;
}
