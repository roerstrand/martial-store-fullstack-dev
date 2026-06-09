import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const CATEGORIES = [
  { value: "bjj",      label: "BJJ" },
  { value: "boxing",   label: "Boxing" },
  { value: "muaythai", label: "Muay Thai" },
  { value: "karate",   label: "Karate" },
];

function Navbar({ isOpen, onToggleMenu }) {
  const [user, , , logout] = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const saleActive = new URLSearchParams(location.search).get("sale") === "true";
  const [catOpen, setCatOpen] = useState(false);
  const [loginNotice, setLoginNotice] = useState(false);
  const catRef = useRef(null);

  const handleMyPages = () => {
    if (!user) {
      setLoginNotice(true);
      setTimeout(() => setLoginNotice(false), 3000);
    } else {
      navigate("/my-pages");
    }
  };

  useEffect(() => {
    const handler = (e) => {
      if (catRef.current && !catRef.current.contains(e.target)) setCatOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => { logout(); navigate("/login"); onToggleMenu?.(); };
  const handleCategory = (value) => { setCatOpen(false); navigate(`/products?category=${value}`); onToggleMenu?.(); };

  return (
    <>
      {/* Desktop */}
      <nav className="apex-navbar">
        <div className="apex-navbar__left">
          <Link to="/products" className="apex-nav-link">All Products</Link>
          <button
            className={`apex-nav-link apex-nav-link--sale${saleActive ? " apex-nav-link--active" : ""}`}
            onClick={() => navigate(saleActive ? "/products" : "/products?sale=true")}
          >
            Sale
          </button>
          <div ref={catRef} style={{ position: "relative" }}>
            <button className={`apex-nav-link apex-nav-link--drop${catOpen ? " apex-nav-link--active" : ""}`} onClick={() => setCatOpen((o) => !o)}>
              Categories <span className="apex-nav-chevron">{catOpen ? "▴" : "▾"}</span>
            </button>
            {catOpen && (
              <div className="apex-cat-dropdown">
                <button className="apex-cat-option" onClick={() => { setCatOpen(false); navigate("/"); }}>All disciplines</button>
                <div className="apex-cat-divider" />
                {CATEGORIES.map((c) => (
                  <button key={c.value} className="apex-cat-option" onClick={() => handleCategory(c.value)}>
                    {c.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Link to="/articles" className="apex-nav-link">Stories</Link>
        </div>

        <div className="apex-navbar__right" style={{ position: "relative" }}>
          <div className="apex-nav-separator" />
          {user ? (
            <>
              {user.role === "admin" && (
                <Link to="/admin" className="apex-nav-link apex-nav-link--sale">Admin Page</Link>
              )}
              <button onClick={handleMyPages} className="apex-nav-link">Profile</button>
              <button onClick={handleLogout} className="apex-nav-btn-ghost">Log out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="apex-nav-btn-outline">Log in</Link>
              <Link to="/register" className="apex-nav-btn-outline">Create account</Link>
            </>
          )}
          {loginNotice && (
            <div className="apex-login-notice">Please log in to view Profile</div>
          )}
        </div>
      </nav>

      {/* Mobile drawer */}
      <div className={`apex-mobile-nav ${isOpen ? "open" : ""}`}>
        <Link to="/products" className="apex-nav-link" onClick={onToggleMenu}>All Products</Link>
        <button
          className={`apex-nav-link apex-nav-link--sale${saleActive ? " apex-nav-link--active" : ""}`}
          onClick={() => { navigate(saleActive ? "/products" : "/products?sale=true"); onToggleMenu?.(); }}
        >Sale</button>
        {CATEGORIES.map((c) => (
          <button key={c.value} className="apex-nav-link" onClick={() => handleCategory(c.value)}>{c.label}</button>
        ))}
        <div className="apex-cat-divider" style={{ margin: "0.25rem 0" }} />
        <Link to="/favorites" className="apex-nav-link" onClick={onToggleMenu}>Favorites</Link>
        <Link to="/cart" className="apex-nav-link" onClick={onToggleMenu}>Cart</Link>
        {user ? (
          <>
            {user.role === "admin" && (
              <Link to="/admin" className="apex-nav-link apex-nav-link--sale" onClick={onToggleMenu}>Admin Page</Link>
            )}
            <Link to="/my-pages" className="apex-nav-link" onClick={onToggleMenu}>Profile</Link>
            <button onClick={handleLogout} className="apex-nav-link">Log out</button>
          </>
        ) : (
          <>
            <Link to="/login" className="apex-nav-link" onClick={onToggleMenu}>Log in</Link>
            <Link to="/register" className="apex-nav-link" onClick={onToggleMenu}>Create account</Link>
          </>
        )}
      </div>
    </>
  );
}

export default Navbar;
