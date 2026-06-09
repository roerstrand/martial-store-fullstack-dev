import { useState, useEffect, useMemo, useRef } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import useFetch from "../hooks/useFetch.jsx";
import { getProducts, getNewArrivals, getLimitedSale } from "../services/productService";
import { getArticles } from "../services/articleService";
import { useFavorites } from "../context/FavoriteContext";
import { useCart } from "../context/CartContext";
import { useRecentlyViewed } from "../hooks/useRecentlyViewed";
import RecentlyViewed from "../components/products/RecentlyViewed";
import "./Pages.css";

const SLIDE_INTERVAL = 3500;
const SLIDE_INTERVAL_AFTER_INTERACTION = 7000;
const VISIBLE = 4;

const TESTIMONIALS = [
  {
    id: 1,
    quote: "Best BJJ gear I've trained in. The quality is on par with brands costing twice the price.",
    name: "Marcus T.",
    discipline: "Brazilian Jiu-Jitsu · Black Belt",
    rating: 5,
  },
  {
    id: 2,
    quote: "My Muay Thai gloves have taken thousands of rounds. Still holding up perfectly after 18 months.",
    name: "Sara K.",
    discipline: "Muay Thai · National competitor",
    rating: 5,
  },
  {
    id: 3,
    quote: "I equip my entire boxing gym with Apex Core gear. The club pricing and fast delivery is unbeatable.",
    name: "Coach Dimitri P.",
    discipline: "Boxing · Head coach, 12 years",
    rating: 5,
  },
];

const CATEGORY_TILES = [
  { value: "bjj",      label: "Brazilian Jiu-Jitsu", img: "/images/misc/bjj_triangle.jpg" },
  { value: "boxing",   label: "Boxing",               img: "/images/misc/woman_headkick.jpg" },
  { value: "muaythai", label: "Muay Thai",             img: "/images/misc/muaythai_fight.jpg" },
  { value: "karate",   label: "Karate",                img: "/images/misc/karate_sunset.jpg" },
];

function Stars({ rating, count, dark }) {
  const full = Math.round(rating || 0);
  return (
    <span className={`shelf-stars${dark ? " shelf-stars--dark" : ""}`}>
      <span className="shelf-stars__icons">
        {[1,2,3,4,5].map(s => (
          <span key={s} className={s <= full ? "shelf-star shelf-star--on" : "shelf-star"}>★</span>
        ))}
      </span>
      {count > 0 && <span className="shelf-stars__count">({count})</span>}
    </span>
  );
}

function StockLabel({ stock, dark }) {
  const s = stock ?? 99;
  if (s === 0) return <span className={`shelf-stock shelf-stock--out${dark ? " shelf-stock--dark" : ""}`}>✕ Out of stock</span>;
  if (s < 10)  return <span className={`shelf-stock shelf-stock--low${dark ? " shelf-stock--dark" : ""}`}>⚡ {s} left</span>;
  return <span className={`shelf-stock shelf-stock--in${dark ? " shelf-stock--dark" : ""}`}>✓ In stock</span>;
}

function ProductShelf({ title, subtitle, products, loading, linkTo, onNavigate, onAddToCart, onToggleFavorite, favorites, variant, heroImage }) {
  if (!loading && (!products || products.length === 0)) return null;

  if (heroImage) {
    return (
      <section className={`home-shelf home-shelf--${variant || "default"} home-shelf--editorial`}>
        <div className="home-shelf__editorial">
          <div
            className="home-shelf__editorial-hero"
            onClick={() => onNavigate(linkTo)}
            role="link"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && onNavigate(linkTo)}
          >
            <img src={heroImage} alt={title} />
            <div className="home-shelf__editorial-overlay">
              {variant === "sale" && <span className="home-shelf__tag home-shelf__tag--sale">Sale</span>}
              {variant === "new" && <span className="home-shelf__tag home-shelf__tag--new">New</span>}
              <h2 className="home-shelf__editorial-title">{title}</h2>
              {subtitle && <p className="home-shelf__editorial-sub">{subtitle}</p>}
              <span className="home-shelf__editorial-cta">View All ›</span>
            </div>
          </div>
          <div className="home-shelf__editorial-list">
            {loading && [0, 1, 2].map((i) => (
              <div key={i} className="home-shelf-row-card">
                <div className="skeleton" style={{ width: 110, height: 110, borderRadius: 6, flexShrink: 0 }} />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <div className="skeleton" style={{ height: "0.7rem", width: "70%", borderRadius: 4 }} />
                  <div className="skeleton" style={{ height: "0.9rem", width: "35%", borderRadius: 4 }} />
                </div>
              </div>
            ))}
            {!loading && products.slice(0, 3).map((product) => {
              const isFav = favorites?.some((f) => f._id === product._id);
              const salePrice = product.sale > 0
                ? Math.round(product.price * (1 - product.sale / 100))
                : null;
              return (
                <div
                  key={product._id}
                  className="home-shelf-row-card"
                  onClick={() => onNavigate(`/products/${product._id}`)}
                  role="link"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && onNavigate(`/products/${product._id}`)}
                >
                  <div className="home-shelf-row-card__img">
                    <img src={`/images/products/${product.image}`} alt={product.title} loading="lazy" />
                    {variant === "sale" && product.sale > 0 && (
                      <span className="home-shelf-card__sale-badge">−{product.sale}%</span>
                    )}
                  </div>
                  <div className="home-shelf-row-card__info">
                    <div className="home-shelf-row-card__badges">
                      {product.isBestseller && <span className="shelf-badge shelf-badge--best">Bestseller</span>}
                      {product.isNewArrival && <span className="shelf-badge shelf-badge--new">New</span>}
                    </div>
                    <p className="home-shelf-row-card__name">{product.title}</p>
                    <Stars rating={product.rating} count={product.numReviews} />
                    <div className="home-shelf-row-card__price-row">
                      {salePrice ? (
                        <>
                          <span className="home-shelf-card__price--original">{product.price} EUR</span>
                          <span className="home-shelf-card__price--sale">{salePrice} EUR</span>
                        </>
                      ) : (
                        <span className="home-shelf-row-card__price">{product.price} EUR</span>
                      )}
                    </div>
                    <StockLabel stock={product.stock} />
                  </div>
                  <div className="home-shelf-row-card__actions">
                    <button
                      className={`home-shelf-row-card__fav${isFav ? " active" : ""}`}
                      onClick={(e) => { e.stopPropagation(); onToggleFavorite?.(product); }}
                    >
                      <img src={isFav ? "/icons/FavoritesFilled.png" : "/icons/Favorites.png"} alt="Favorite" />
                    </button>
                    <button
                      className="home-shelf-row-card__cart"
                      onClick={(e) => { e.stopPropagation(); onAddToCart(product, null); }}
                    >
                      <img src="/icons/Cart add.svg" alt="Add to cart" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`home-shelf home-shelf--${variant || "default"}`}>
      <div className="home-shelf__header">
        <div className="home-shelf__header-left">
          {variant === "sale" && <span className="home-shelf__tag home-shelf__tag--sale">Sale</span>}
          {variant === "new" && <span className="home-shelf__tag home-shelf__tag--new">New</span>}
          <div>
            <h2 className="home-shelf__title">{title}</h2>
            {subtitle && <p className="home-shelf__sub">{subtitle}</p>}
          </div>
        </div>
        <Link to={linkTo} className="home-shelf__link">View All ›</Link>
      </div>
      <div className="home-shelf__row">
        {loading && Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton-grid-card">
            <div className="skeleton-grid-card__img skeleton" />
            <div className="skeleton-grid-card__body">
              <div className="skeleton-grid-card__name skeleton" />
              <div className="skeleton-grid-card__price skeleton" />
              <div className="skeleton-grid-card__stars skeleton" />
            </div>
          </div>
        ))}
        {!loading && products.slice(0, 4).map((product) => {
          const isFav = favorites?.some((f) => f._id === product._id);
          const salePrice = product.sale > 0
            ? Math.round(product.price * (1 - product.sale / 100))
            : null;
          return (
            <div
              key={product._id}
              className={`home-shelf-card${variant === "sale" ? " home-shelf-card--sale" : ""}${variant === "new" ? " home-shelf-card--new" : ""}`}
              onClick={() => onNavigate(`/products/${product._id}`)}
              role="link"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && onNavigate(`/products/${product._id}`)}
            >
              <div className="home-shelf-card__img-wrap">
                <img src={`/images/products/${product.image}`} alt={product.title} loading="lazy" />
                {variant === "sale" && product.sale > 0 && (
                  <span className="home-shelf-card__sale-badge">−{product.sale}%</span>
                )}
                {variant === "new" && (
                  <span className="home-shelf-card__new-badge">New</span>
                )}
                <button
                  className={`home-shelf-card__fav${isFav ? " active" : ""}`}
                  onClick={(e) => { e.stopPropagation(); onToggleFavorite?.(product); }}
                  aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
                >
                  <img src={isFav ? "/icons/FavoritesFilled.png" : "/icons/Favorites.png"} alt="" />
                </button>
              </div>
              <div className="home-shelf-card__body">
                {product.isBestseller && <span className="shelf-badge shelf-badge--best">Bestseller</span>}
                <p className="home-shelf-card__name">{product.title}</p>
                <Stars rating={product.rating} count={product.numReviews} dark={variant === "sale"} />
                <div className="home-shelf-card__price-row">
                  {salePrice ? (
                    <>
                      <span className="home-shelf-card__price--original">{product.price} EUR</span>
                      <span className="home-shelf-card__price--sale">{salePrice} EUR</span>
                    </>
                  ) : (
                    <span className="home-shelf-card__price">{product.price} EUR</span>
                  )}
                </div>
                <StockLabel stock={product.stock} dark={variant === "sale"} />
                <button
                  className="home-shelf-card__cart"
                  onClick={(e) => { e.stopPropagation(); onAddToCart(product, null); }}
                >
                  Add to cart
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function HomePage() {
  const [toggleFavorites, favorites] = useFavorites();
  const [cart, addToCart] = useCart();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const { items: recentItems } = useRecentlyViewed();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const category = searchParams.get("category");
  const sale = searchParams.get("sale");
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [newsletterError, setNewsletterError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/products");
    }
  };

  const { data: allProducts, loading } = useFetch(getProducts);
  const { data: allArticles } = useFetch(() => getArticles({ random: "true", limit: 3 }));
  const { data: newArrivalsData, loading: newArrivalsLoading } = useFetch(getNewArrivals);
  const { data: limitedSaleData, loading: limitedSaleLoading } = useFetch(getLimitedSale);

  const products = useMemo(() => {
    if (!allProducts) return [];
    if (category) return allProducts.filter((p) => p.category === category);
    if (sale) return allProducts.filter((p) => p.sale > 0);
    return allProducts;
  }, [allProducts, category, sale]);
  const featuredArticles = useMemo(
    () => allArticles ? allArticles.filter((a) => a.image).slice(0, 3) : [],
    [allArticles]
  );

  const [displayIndex, setDisplayIndex] = useState(0);
  const [phase, setPhase] = useState("idle");
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);
  const pausedRef = useRef(false);
  const manuallyPausedRef = useRef(false);
  const interactedRef = useRef(false);

  useEffect(() => {
    if (!allProducts) return;
    allProducts.forEach((p) => {
      if (p.image) { const img = new Image(); img.src = `/images/products/${p.image}`; }
    });
  }, [allProducts]);

  useEffect(() => { setDisplayIndex(0); setPhase("idle"); }, [category, sale]);

  const startSlide = (delay = SLIDE_INTERVAL) => {
    clearInterval(intervalRef.current);
    if (products.length <= VISIBLE || pausedRef.current) return;
    intervalRef.current = setInterval(() => {
      setPhase("exit");
      setTimeout(() => {
        setDisplayIndex((prev) => (prev + 1) % products.length);
        setPhase("enter");
        setTimeout(() => setPhase("idle"), 400);
      }, 280);
    }, delay);
  };

  const pauseSlide  = () => { clearInterval(intervalRef.current); pausedRef.current = true; setIsPaused(true); };
  const resumeSlide = () => {
    pausedRef.current = false; setIsPaused(false);
    startSlide(interactedRef.current ? SLIDE_INTERVAL_AFTER_INTERACTION : SLIDE_INTERVAL);
    interactedRef.current = false;
  };
  const togglePause = () => {
    if (isPaused) { manuallyPausedRef.current = false; resumeSlide(); }
    else          { manuallyPausedRef.current = true;  pauseSlide();  }
  };
  const handleInteraction = () => { interactedRef.current = true; if (!pausedRef.current) startSlide(SLIDE_INTERVAL_AFTER_INTERACTION); };

  useEffect(() => { startSlide(); return () => clearInterval(intervalRef.current); }, [products.length]);

  const visibleProducts = products.length > 0
    ? Array.from({ length: Math.min(VISIBLE, products.length) }, (_, i) =>
        products[(displayIndex + i) % products.length])
    : [];

  return (
    <div className="home-page">

      {/* SEARCH + CART BAR */}
      <div className="home-topbar">
        <form className="home-search" onSubmit={handleSearch}>
          <svg className="home-search__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className="home-search__input"
            type="text"
            placeholder="Search gear, categories, keywords…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoComplete="off"
          />
          <button type="submit" className="home-search__btn">SEARCH</button>
        </form>
        {cartCount > 0 && (
          <div className="home-topbar__cart">
            <Link to="/favorites" className="ml-cart-bar__btn ml-cart-bar__btn--fav">
              Favorites{favorites.length > 0 ? ` (${favorites.length})` : ""}
            </Link>
            <Link to="/cart" className="ml-cart-bar__btn">View Cart{cartCount > 0 ? ` (${cartCount})` : ""} ›</Link>
            <Link to="/checkout" className="ml-cart-bar__btn ml-cart-bar__btn--checkout">Checkout ›</Link>
          </div>
        )}
      </div>

      {/* USP STRIP */}
      <div className="home-usp">
        <div className="home-usp__item">
          <span className="home-usp__icon">✓</span>
          <span className="home-usp__text">Free shipping over 100 EUR</span>
        </div>
        <div className="home-usp__item">
          <span className="home-usp__icon">✓</span>
          <span className="home-usp__text">30-day returns</span>
        </div>
        <div className="home-usp__item">
          <span className="home-usp__icon">✓</span>
          <span className="home-usp__text">Premium quality gear</span>
        </div>
        <div className="home-usp__item">
          <span className="home-usp__icon">✓</span>
          <span className="home-usp__text">Secure payments</span>
        </div>
      </div>

      {/* POPULAR GEAR CAROUSEL */}
      <section className="home-products">
        <div className="home-products__topbar">
          <p className="home-products__label">Popular gear</p>
          <button className="home-products__pause-btn" onClick={togglePause}>{isPaused ? "▶" : "⏸"}</button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }} onMouseEnter={pauseSlide} onMouseLeave={() => { if (!manuallyPausedRef.current) resumeSlide(); }}>
          <button className="home-products__arrow" onClick={() => { setDisplayIndex((p) => (p - 1 + products.length) % products.length); startSlide(); }} disabled={products.length <= VISIBLE}>‹</button>
          <div className="home-slideshow-wrapper" style={{ flex: 1 }}>
            <div className={`home-products__grid home-products__grid--${phase}`}>
              {loading && Array.from({ length: VISIBLE }).map((_, i) => (
                <div key={i} className="skeleton-product-card">
                  <div className="skeleton-product-card__img skeleton" />
                  <div className="skeleton-product-card__body">
                    <div className="skeleton-product-card__title skeleton" />
                    <div className="skeleton-product-card__price skeleton" />
                  </div>
                </div>
              ))}
              {visibleProducts.map((product, i) => (
                <div
                  key={`${product._id}-${displayIndex}-${i}`}
                  className="home-product-card"
                  onClick={() => navigate(`/products/${product._id}`)}
                  role="link" tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && navigate(`/products/${product._id}`)}
                >
                  <div className="home-product-card__img-wrap">
                    <img src={`/images/products/${product.image}`} alt={product.title} />
                    {product.sale > 0 && <span className="home-product-card__sale">-{product.sale}%</span>}
                    {product.isBestseller && <span className="home-product-card__best">Bestseller</span>}
                  </div>
                  <div className="home-product-card__footer">
                    <div className="home-product-card__text">
                      <span className="home-product-card__title">{product.title}</span>
                      <Stars rating={product.rating} count={product.numReviews} />
                      <div className="home-product-card__price-row">
                        <span className="home-product-card__price">{product.price} EUR</span>
                        <StockLabel stock={product.stock} />
                      </div>
                    </div>
                    <div className="home-product-card__actions">
                      <button
                        className={`home-product-card__fav-btn${favorites.some(f => f._id === product._id) ? " active" : ""}`}
                        onClick={(e) => { e.stopPropagation(); toggleFavorites(product); handleInteraction(); }}
                      >
                        <img src={favorites.some(f => f._id === product._id) ? "/icons/FavoritesFilled.png" : "/icons/Favorites.png"} alt="Favorite" />
                      </button>
                      <button className="home-product-card__cart" onClick={(e) => { e.stopPropagation(); addToCart(product, null); handleInteraction(); }}>
                        <img src="/icons/Cart add.svg" alt="Add to cart" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button className="home-products__arrow" onClick={() => { setDisplayIndex((p) => (p + 1) % products.length); startSlide(); }} disabled={products.length <= VISIBLE}>›</button>
        </div>
        {products.length > VISIBLE && (
          <div className="home-products__dots">
            {products.map((_, i) => (
              <button key={i} className={`home-products__dot${i === displayIndex ? " home-products__dot--active" : ""}`} onClick={() => { setDisplayIndex(i); startSlide(); }} />
            ))}
          </div>
        )}
        {(category || sale) && (
          <button className="home-products__clear" onClick={() => navigate("/")}>✕ Clear filter</button>
        )}
      </section>

      {/* PRODUCT SHELVES */}
      <div className="home-shelves">
        <ProductShelf title="New Arrivals" subtitle="Just dropped" products={newArrivalsData || []} loading={newArrivalsLoading} linkTo="/products?newArrival=true" onNavigate={navigate} onAddToCart={addToCart} onToggleFavorite={toggleFavorites} favorites={favorites} variant="new" heroImage="/images/misc/muaythai_fight.jpg" />
        {(limitedSaleLoading || (limitedSaleData || []).length > 0) && (
          <ProductShelf title="Limited Sale" subtitle="While stocks last" products={limitedSaleData || []} loading={limitedSaleLoading} linkTo="/products?limitedSale=true" onNavigate={navigate} onAddToCart={addToCart} onToggleFavorite={toggleFavorites} favorites={favorites} variant="sale" heroImage="/images/misc/grappling_ground.jpg" />
        )}
      </div>

      {/* FEATURED CATEGORIES */}
      <section className="home-categories">
        <div className="home-categories__header">
          <h2 className="home-shelf__title">Shop by Discipline</h2>
        </div>
        <div className="home-categories__grid">
          {CATEGORY_TILES.map((cat) => (
            <div
              key={cat.value}
              className="home-cat-tile"
              onClick={() => navigate(`/?category=${cat.value}`)}
              role="link" tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && navigate(`/?category=${cat.value}`)}
            >
              <img src={cat.img} alt={cat.label} className="home-cat-tile__img" loading="lazy" />
              <div className="home-cat-tile__overlay" />
              <span className="home-cat-tile__label">{cat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="home-social-proof">
        <div className="home-social-proof__header">
          <span>Trusted by fighters</span>
        </div>
        <div className="home-social-stats">
          <div className="home-social-stat">
            <span className="home-social-stat__num">10,000+</span>
            <span className="home-social-stat__label">Fighters worldwide</span>
          </div>
          <div className="home-social-stat home-social-stat--center">
            <span className="home-social-stat__num">4.8<span className="home-social-stat__denom">/5</span></span>
            <span className="home-social-stat__label">Average rating</span>
          </div>
          <div className="home-social-stat">
            <span className="home-social-stat__num">Pro</span>
            <span className="home-social-stat__label">Used by professional athletes</span>
          </div>
        </div>
        <div className="home-testimonials__grid">
          {TESTIMONIALS.map((t) => (
            <div key={t.id} className="home-testimonial-card">
              <div className="home-testimonial-card__stars">
                {[1,2,3,4,5].map(s => (
                  <span key={s} className={s <= t.rating ? "home-testimonial-star home-testimonial-star--on" : "home-testimonial-star"}>★</span>
                ))}
              </div>
              <p className="home-testimonial-card__quote">"{t.quote}"</p>
              <div className="home-testimonial-card__author">
                <span className="home-testimonial-card__name">{t.name}</span>
                <span className="home-testimonial-card__discipline">{t.discipline}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ARTICLES */}
      <section className="home-articles">
        <div className="home-articles__header">
          <span>Stories</span>
        </div>
        <div className="home-articles__grid">
          {featuredArticles.map((article) => (
            <Link key={article._id} to={`/articles/${article._id}`} className="home-article-card">
              <img src={`/images/articles/${article.image}`} alt={article.title} loading="lazy" />
              <div className="home-article-card__text">
                <p className="home-article-card__title">{article.title}</p>
                <p className="home-article-card__author">by {article.author}</p>
              </div>
            </Link>
          ))}
        </div>
        <div className="home-articles__footer">
          <Link to="/articles" className="home-articles__more-btn">More Stories ›</Link>
        </div>
      </section>

      {/* RECENTLY VIEWED */}
      <RecentlyViewed items={recentItems} />

      {/* NEWSLETTER */}
      <section className="home-newsletter">
        <h2 className="home-newsletter__heading">Join the Apex Core Community</h2>
        <p className="home-newsletter__sub">Get training tips, stories and exclusive offers.</p>
        {subscribed ? (
          <p className="home-newsletter__success">You're in. Welcome to the community.</p>
        ) : (
          <form className="home-newsletter__form" onSubmit={(e) => {
            e.preventDefault();
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
              setNewsletterError("Please enter a valid email address (e.g. name@domain.com).");
              return;
            }
            setNewsletterError("");
            setSubscribed(true);
          }}>
            <input className="home-newsletter__input" type="email" placeholder="Your email address" value={email} onChange={(e) => { setEmail(e.target.value); setNewsletterError(""); }} required />
            {newsletterError && <p className="product-detail__size-error" style={{ marginTop: "0.4rem" }}>{newsletterError}</p>}
            <button type="submit" className="home-newsletter__btn">Subscribe</button>
          </form>
        )}
      </section>

    </div>
  );
}

export default HomePage;
