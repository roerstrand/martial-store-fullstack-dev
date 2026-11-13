import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SearchIcon, ArrowRightIcon } from "./ui/Icons";

function Hero({ children }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/products?q=${encodeURIComponent(q)}` : "/products");
  };

  return (
    <section className="ac-hero">
      <div className="ac-hero__media">
        <img src="/images/misc/woman_headkick.jpg" alt="" className="ac-hero__img" fetchPriority="high" />
        <div className="ac-hero__shade" />
      </div>

      {children}

      <div className="ac-hero__content">
        <p className="ac-eyebrow ac-eyebrow--light">Premium equipment · Martial arts</p>
        <h1 className="ac-hero__title">
          <span>Fight</span>
          <span>Gear</span>
        </h1>
        <p className="ac-hero__sub">
          <strong>For winners</strong>
        </p>
        <div className="ac-hero__ctas">
          <Link to="/products" className="ac-btn ac-btn--primary ac-btn--lg">
            All Products <ArrowRightIcon width="16" height="16" />
          </Link>
          <Link to="/products?sale=true" className="ac-btn ac-btn--glass ac-btn--lg">Shop Sale</Link>
        </div>
      </div>

      <form className="ac-hero__search ac-glass-frost" onSubmit={handleSearch} role="search">
        <label htmlFor="hero-search" className="ac-hero__search-label">
          <span>Find your gear</span>
          <span>Gloves · Gis · Pads · Guards</span>
        </label>
        <div className="ac-hero__search-field">
          <SearchIcon />
          <input
            id="hero-search"
            type="search"
            placeholder="Search gear, categories, keywords…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
          />
        </div>
        <button type="submit" className="ac-btn ac-btn--ink">Search</button>
      </form>
    </section>
  );
}

export default Hero;
