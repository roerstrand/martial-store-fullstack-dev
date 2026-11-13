import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="ac-footer">
      <img src="/images/misc/woman_headkick.jpg" alt="" className="ac-footer__bg" loading="lazy" />
      <div className="ac-container">
        <div className="ac-footer__inner">
          <div className="ac-footer__brand ac-glass-smoke">
            <div className="ac-footer__brand-row">
              <img src="/images/logo.png" alt="" />
              <span>Apex Core</span>
            </div>
            <p>Train hard. Fight smart.</p>
          </div>
          <div className="ac-footer__col">
            <p className="ac-footer__title">Shop</p>
            <Link to="/products" className="ac-footer__link">All products</Link>
            <Link to="/products?sale=true" className="ac-footer__link">Sale</Link>
            <Link to="/favorites" className="ac-footer__link">Favorites</Link>
            <Link to="/articles" className="ac-footer__link">Stories</Link>
          </div>
          <div className="ac-footer__col">
            <p className="ac-footer__title">Information</p>
            <Link to="/info/about" className="ac-footer__link">About us</Link>
            <Link to="/info/shipping" className="ac-footer__link">Shipping</Link>
            <Link to="/info/returns" className="ac-footer__link">Returns</Link>
            <Link to="/info/faq" className="ac-footer__link">FAQ</Link>
          </div>
          <div className="ac-footer__col">
            <p className="ac-footer__title">Contact</p>
            <Link to="/contact" className="ac-footer__link">Contact us</Link>
            <a href="mailto:support@apexcore.com" className="ac-footer__link">support@apexcore.com</a>
          </div>
        </div>
        <div className="ac-footer__bottom">
          <p>&copy; 2026 Robin Erik Strandberg. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
