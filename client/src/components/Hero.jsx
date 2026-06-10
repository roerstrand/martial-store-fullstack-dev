import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoriteContext";

function Hero({ onToggleMenu }) {
  const [cart] = useCart();
  const [, favorites] = useFavorites();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const favCount = favorites.length;

  return (
    <div className="apex-hero">
      <img
        src="/images/misc/woman_headkick.jpg"
        alt=""
        className="apex-hero__img"
      />
      <Link to="/" className="apex-hero__brand" onClick={() => onToggleMenu?.()}>
        <img
          src="/images/logo.png"
          alt="Apex Core"
          className="apex-hero__logo"
        />
        <span className="apex-hero__brand-name">APEX CORE</span>
      </Link>

      <p className="apex-hero__tagline">
        <span className="apex-hero__tagline-main">Fight Gear</span>
        <span className="apex-hero__tagline-sub">For Winners</span>
      </p>
      <p className="apex-hero__subtitle">Premium Equipment · Martial Arts</p>

      <div className="apex-hero__icons">
        <Link to="/favorites" className="apex-hero__icon">
          <img src="/icons/Favorites.png" alt="Favorites" />
          {favCount > 0 && <span className="apex-hero__badge">{favCount}</span>}
        </Link>
        <Link to="/cart" className="apex-hero__icon">
          <img src="/icons/Cart.svg" alt="Cart" />
          {cartCount > 0 && <span className="apex-hero__badge">{cartCount}</span>}
        </Link>
      </div>

      <button
        className="apex-hero__burger"
        onClick={onToggleMenu}
        aria-label="Menu"
      >
        <img src="/icons/Burger.svg" alt="Menu" />
      </button>
    </div>
  );
}

export default Hero;
