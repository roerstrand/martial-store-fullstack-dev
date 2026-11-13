import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoriteContext";
import { HeartIcon, BagIcon, MenuIcon, CloseIcon, ChevronDownIcon } from "./ui/Icons";

const CATEGORIES = [
  { value: "bjj",      label: "BJJ" },
  { value: "boxing",   label: "Boxing" },
  { value: "muaythai", label: "Muay Thai" },
  { value: "karate",   label: "Karate" },
];

function Navbar({ variant = "dark" }) {
  const [user, , , logout] = useAuth();
  const [cart] = useCart();
  const [, favorites] = useFavorites();
  const navigate = useNavigate();
  const location = useLocation();
  const routeKey = location.pathname + location.search;
  const [catOpenAt, setCatOpenAt] = useState(null);
  const [menuOpenAt, setMenuOpenAt] = useState(null);
  const catOpen = catOpenAt === routeKey;
  const menuOpen = menuOpenAt === routeKey;
  const setCatOpen = (next) => setCatOpenAt((prev) => {
    const value = typeof next === "function" ? next(prev === routeKey) : next;
    return value ? routeKey : null;
  });
  const toggleMenu = () => setMenuOpenAt((prev) => (prev === routeKey ? null : routeKey));
  const [loginNotice, setLoginNotice] = useState(false);
  const catRef = useRef(null);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const favCount = favorites.length;
  const params = new URLSearchParams(location.search);
  const saleActive = params.get("sale") === "true";
  const onProducts = location.pathname === "/products" && !saleActive;
  const onStories = location.pathname.startsWith("/articles");
  const glass = variant === "dark" ? "ac-glass-smoke" : "ac-glass-frost";

  useEffect(() => {
    const handler = (e) => {
      if (catRef.current && !catRef.current.contains(e.target)) setCatOpenAt(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleProfile = () => {
    if (!user) {
      setLoginNotice(true);
      setTimeout(() => setLoginNotice(false), 3000);
    } else {
      navigate("/my-pages");
    }
  };

  const handleLogout = () => { logout(); navigate("/login"); };
  const goCategory = (value) => navigate(`/products?category=${value}`);
  const toggleSale = () => navigate(saleActive ? "/products" : "/products?sale=true");

  return (
    <header className={`ac-nav ac-nav--${variant}`}>
      <div className={`ac-nav__bar ${glass}`}>
        <Link to="/" className="ac-nav__brand" aria-label="Apex Core home">
          <img src="/images/logo.png" alt="" />
          <span>Apex Core</span>
        </Link>

        <nav className="ac-nav__links" aria-label="Main">
          <Link to="/products" className={`ac-nav__link${onProducts ? " is-active" : ""}`}>All Products</Link>
          <button type="button" className={`ac-nav__link ac-nav__link--sale${saleActive ? " is-active" : ""}`} onClick={toggleSale}>
            Sale
          </button>
          <div ref={catRef} style={{ position: "relative" }}>
            <button
              type="button"
              className={`ac-nav__link${catOpen ? " is-active" : ""}`}
              onClick={() => setCatOpen((o) => !o)}
              aria-expanded={catOpen}
            >
              Categories <ChevronDownIcon className="ac-nav__chev" />
            </button>
            {catOpen && (
              <div className={`ac-nav__drop ${glass}`}>
                <button type="button" onClick={() => { setCatOpen(false); navigate("/"); }}>All disciplines</button>
                <hr />
                {CATEGORIES.map((c) => (
                  <button key={c.value} type="button" onClick={() => goCategory(c.value)}>{c.label}</button>
                ))}
              </div>
            )}
          </div>
          <Link to="/articles" className={`ac-nav__link${onStories ? " is-active" : ""}`}>Stories</Link>
        </nav>

        <div className="ac-nav__right">
          <Link to="/favorites" className="ac-nav__icon" aria-label={`Favorites (${favCount})`}>
            <HeartIcon />
            {favCount > 0 && <span className="ac-nav__badge">{favCount}</span>}
          </Link>
          <Link to="/cart" className="ac-nav__icon" aria-label={`Cart (${cartCount})`}>
            <BagIcon />
            {cartCount > 0 && <span className="ac-nav__badge">{cartCount}</span>}
          </Link>

          <div className="ac-nav__auth">
            {user ? (
              <>
                {user.role === "admin" && (
                  <Link to="/admin" className="ac-nav__link ac-nav__link--sale">Admin</Link>
                )}
                <button type="button" onClick={handleProfile} className="ac-nav__link">Profile</button>
                <button type="button" onClick={handleLogout} className="ac-btn ac-btn--outline">Log out</button>
              </>
            ) : (
              <>
                <Link to="/login" className="ac-nav__link">Log in</Link>
                <Link to="/register" className="ac-btn ac-btn--primary">Create account</Link>
              </>
            )}
          </div>

          <button
            type="button"
            className="ac-nav__icon ac-nav__burger"
            onClick={toggleMenu}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>

          {loginNotice && (
            <div className={`ac-nav__notice ${glass}`} role="status">Please log in to view Profile</div>
          )}
        </div>
      </div>

      {menuOpen && (
        <nav className={`ac-nav__drawer ${glass}`} aria-label="Mobile">
          <Link to="/products" className="ac-nav__link">All Products</Link>
          <button type="button" className={`ac-nav__link ac-nav__link--sale${saleActive ? " is-active" : ""}`} onClick={toggleSale}>Sale</button>
          {CATEGORIES.map((c) => (
            <button key={c.value} type="button" className="ac-nav__link" onClick={() => goCategory(c.value)}>{c.label}</button>
          ))}
          <Link to="/articles" className="ac-nav__link">Stories</Link>
          <Link to="/favorites" className="ac-nav__link">Favorites{favCount > 0 ? ` (${favCount})` : ""}</Link>
          <hr />
          {user ? (
            <>
              {user.role === "admin" && (
                <Link to="/admin" className="ac-nav__link ac-nav__link--sale">Admin Page</Link>
              )}
              <Link to="/my-pages" className="ac-nav__link">Profile</Link>
              <button type="button" onClick={handleLogout} className="ac-nav__link">Log out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="ac-nav__link">Log in</Link>
              <Link to="/register" className="ac-nav__link">Create account</Link>
            </>
          )}
        </nav>
      )}
    </header>
  );
}

export default Navbar;
