import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__col footer__col--brand">
          <div className="footer__brand">Apex Core</div>
          <p className="footer__tagline">Train hard. Fight smart.</p>
        </div>
        <div className="footer__col">
          <p className="footer__col-title">Shop</p>
          <Link to="/products" className="footer__link">All products</Link>
          <Link to="/products?sale=true" className="footer__link">Sale</Link>
          <Link to="/favorites" className="footer__link">Favorites</Link>
          <Link to="/articles" className="footer__link">Stories</Link>
        </div>
        <div className="footer__col">
          <p className="footer__col-title">Information</p>
          <Link to="/info/about" className="footer__link">About us</Link>
          <Link to="/info/shipping" className="footer__link">Shipping</Link>
          <Link to="/info/returns" className="footer__link">Returns</Link>
          <Link to="/info/faq" className="footer__link">FAQ</Link>
        </div>
        <div className="footer__col">
          <p className="footer__col-title">Contact</p>
          <Link to="/contact" className="footer__link">Contact us</Link>
          <a href="mailto:support@apexcore.com" className="footer__link">support@apexcore.com</a>
        </div>
      </div>
      <div className="footer__bottom">
        <p className="footer__copy">&copy; 2026 Robin Erik Strandberg. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
