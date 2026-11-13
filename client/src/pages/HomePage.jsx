import { useState, useEffect, useMemo, useRef } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import useFetch from "../hooks/useFetch.jsx";
import { getProducts, getNewArrivals, getLimitedSale } from "../services/productService";
import { getArticles } from "../services/articleService";
import { useFavorites } from "../context/FavoriteContext";
import { useCart } from "../context/CartContext";
import { useRecentlyViewed } from "../hooks/useRecentlyViewed";
import RecentlyViewed from "../components/products/RecentlyViewed";
import ProductCard from "../components/products/ProductCard";
import { categoryLabel } from "../utils/productFormat";
import {
  ArrowLeftIcon, ArrowRightIcon, PauseIcon, PlayIcon, TruckIcon, ReturnIcon, ShieldIcon, LockIcon,
} from "../components/ui/Icons";
import "./Pages.css";

const SLIDE_INTERVAL = 3500;
const SLIDE_INTERVAL_AFTER_INTERACTION = 7000;

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
  { value: "bjj",      label: "Brazilian Jiu-Jitsu", img: "/images/misc/bjj_triangle.jpg",   focus: "50% 30%", place: "bl", tone: "deep" },
  { value: "boxing",   label: "Boxing",              img: "/images/misc/muaythai_fight.jpg", focus: "50% 38%", place: "bl", tone: "light" },
  { value: "muaythai", label: "Muay Thai",           img: "/images/misc/muaythai_sparr.jpg", focus: "35% 35%", place: "br", tone: "deep" },
  { value: "karate",   label: "Karate",              img: "/images/misc/karate_sunset.jpg",  focus: "30% 65%", place: "br", tone: "light" },
];

const USPS = [
  { icon: <TruckIcon />,  text: "Free shipping over 100 EUR", sub: "Fast delivery across Europe" },
  { icon: <ReturnIcon />, text: "30-day returns",             sub: "No questions asked" },
  { icon: <ShieldIcon />, text: "Premium quality gear",       sub: "Tested by fighters" },
  { icon: <LockIcon />,   text: "Secure payments",            sub: "Card, Swish & Klarna" },
];

function visibleForWidth() {
  if (typeof window === "undefined") return 4;
  if (window.innerWidth >= 1200) return 4;
  if (window.innerWidth >= 760) return 3;
  return 2;
}

function useVisibleCount() {
  const [count, setCount] = useState(visibleForWidth);
  useEffect(() => {
    const onResize = () => setCount(visibleForWidth());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return count;
}

function CardSkeleton() {
  return (
    <div className="ac-card">
      <div className="ac-card__media skeleton" />
      <div className="ac-card__body">
        <div className="skeleton" style={{ height: "0.9rem", width: "80%", borderRadius: 4 }} />
        <div className="skeleton" style={{ height: "1.1rem", width: "40%", borderRadius: 4 }} />
      </div>
    </div>
  );
}

function FeatureShelf({ eyebrow, title, subtitle, image, products, loading, linkTo, favorites, onToggleFavorite, onAddToCart, reverse, sale }) {
  if (!loading && (!products || products.length === 0)) return null;

  return (
    <div className={`ac-feature${reverse ? " ac-feature--reverse" : ""}`}>
      <Link to={linkTo} className="ac-feature__visual">
        <span className="ac-feature__media">
          <img src={image} alt="" loading="lazy" />
        </span>
        <div className="ac-feature__panel ac-glass-smoke">
          <span className={`ac-badge ${sale ? "ac-badge--sale" : "ac-badge--glass"}`} style={{ alignSelf: "flex-start" }}>{eyebrow}</span>
          <h2 className="ac-h2">{title}</h2>
          <div className="ac-feature__panel-row">
            <p>{subtitle}</p>
            <span className="ac-link-arrow ac-link-arrow--light">View all <ArrowRightIcon width="14" height="14" /></span>
          </div>
        </div>
      </Link>
      <div className="ac-feature__products">
        {loading && [0, 1, 2].map((i) => <CardSkeleton key={i} />)}
        {!loading && products.slice(0, 3).map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            isFavorite={favorites.some((f) => f._id === product._id)}
            onToggleFavorite={onToggleFavorite}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
    </div>
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
  const visible = useVisibleCount();

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
  const carouselRef = useRef(null);

  useEffect(() => {
    if (!allProducts) return;
    allProducts.forEach((p) => {
      if (p.image) { const img = new Image(); img.src = `/images/products/${p.image}`; }
    });
  }, [allProducts]);

  useEffect(() => { setDisplayIndex(0); setPhase("idle"); }, [category, sale]);

  useEffect(() => {
    if ((category || sale) && carouselRef.current) {
      carouselRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [category, sale]);

  const startSlide = (delay = SLIDE_INTERVAL) => {
    clearInterval(intervalRef.current);
    if (products.length <= visible || pausedRef.current) return;
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

  useEffect(() => { startSlide(); return () => clearInterval(intervalRef.current); }, [products.length, visible]);

  const canSlide = products.length > visible;
  const goPrev = () => { setDisplayIndex((p) => (p - 1 + products.length) % products.length); handleInteraction(); };
  const goNext = () => { setDisplayIndex((p) => (p + 1) % products.length); handleInteraction(); };

  const progressSegments = (() => {
    const total = products.length;
    if (!total) return [];
    const span = Math.min(visible, total);
    const start = displayIndex;
    const end = start + span;
    if (end <= total) return [{ left: (start / total) * 100, width: (span / total) * 100 }];
    return [
      { left: (start / total) * 100, width: ((total - start) / total) * 100 },
      { left: 0, width: ((end - total) / total) * 100 },
    ];
  })();

  const visibleProducts = products.length > 0
    ? Array.from({ length: Math.min(visible, products.length) }, (_, i) =>
        products[(displayIndex + i) % products.length])
    : [];

  const carouselTitle = category
    ? `${categoryLabel(category)} gear`
    : sale ? "On sale now" : "Popular gear";

  const addFromCarousel = (product) => { addToCart(product, null); handleInteraction(); };
  const favFromCarousel = (product) => { toggleFavorites(product); handleInteraction(); };
  const addFromShelf = (product) => addToCart(product, null);

  return (
    <div className="home-page ac-home">

      <div className="ac-container">
        {cartCount > 0 && (
          <div className="ac-quickcart">
            <Link to="/favorites" className="ac-btn ac-btn--outline">
              Favorites{favorites.length > 0 ? ` (${favorites.length})` : ""}
            </Link>
            <Link to="/cart" className="ac-btn ac-btn--ink">View Cart ({cartCount})</Link>
            <Link to="/checkout" className="ac-btn ac-btn--primary">Checkout ›</Link>
          </div>
        )}

        <ul className="ac-usp" aria-label="Why shop with us">
          {USPS.map((u) => (
            <li key={u.text} className="ac-usp__item ac-glass-frost">
              <span className="ac-usp__icon">{u.icon}</span>
              <span className="ac-usp__text">{u.text}<small>{u.sub}</small></span>
            </li>
          ))}
        </ul>
      </div>

      <section className="ac-section ac-container ac-carousel" ref={carouselRef}>
        <div className="ac-section-head">
          <div>
            <p className="ac-eyebrow">Fighters' favourites</p>
            <h2 className="ac-h2">{carouselTitle}</h2>
          </div>
          <div className="ac-carousel__head-right">
            <Link to="/products" className="ac-link-arrow">All products <ArrowRightIcon width="14" height="14" /></Link>
            {canSlide && (
              <div className="ac-carousel__controls ac-glass-thin" role="group" aria-label="Carousel controls">
                <button type="button" className="ac-iconbtn" onClick={goPrev} aria-label="Previous products"><ArrowLeftIcon /></button>
                <div className="ac-carousel__pos">
                  <span><b>{String(displayIndex + 1).padStart(2, "0")}</b> / {String(products.length).padStart(2, "0")}</span>
                  <span className="ac-carousel__track-bar" aria-hidden="true">
                    {progressSegments.map((seg, i) => (
                      <span key={i} style={{ left: `${seg.left}%`, width: `${seg.width}%` }} />
                    ))}
                  </span>
                </div>
                <button type="button" className="ac-iconbtn" onClick={togglePause} aria-label={isPaused ? "Play slideshow" : "Pause slideshow"}>
                  {isPaused ? <PlayIcon /> : <PauseIcon />}
                </button>
                <button type="button" className="ac-iconbtn" onClick={goNext} aria-label="Next products"><ArrowRightIcon /></button>
              </div>
            )}
          </div>
        </div>

        <div
          className={`ac-carousel__grid ac-carousel__grid--${phase}`}
          style={{ "--ac-visible": visible }}
          onMouseEnter={canSlide ? pauseSlide : undefined}
          onMouseLeave={canSlide ? () => { if (!manuallyPausedRef.current) resumeSlide(); } : undefined}
        >
          {loading && Array.from({ length: visible }).map((_, i) => <CardSkeleton key={i} />)}
          {visibleProducts.map((product, i) => (
            <ProductCard
              key={`${product._id}-${displayIndex}-${i}`}
              product={product}
              isFavorite={favorites.some((f) => f._id === product._id)}
              onToggleFavorite={favFromCarousel}
              onAddToCart={addFromCarousel}
            />
          ))}
        </div>

        {(category || sale) && (
          <button type="button" className="ac-chip ac-chip--danger ac-carousel__clear" onClick={() => navigate("/")}>✕ Clear filter</button>
        )}
      </section>

      <section className="ac-container ac-section--tight">
        <FeatureShelf
          eyebrow="New"
          title="New Arrivals"
          subtitle="Just dropped"
          image="/images/misc/grappling_standing.jpg"
          products={newArrivalsData || []}
          loading={newArrivalsLoading}
          linkTo="/products?newArrival=true"
          favorites={favorites}
          onToggleFavorite={toggleFavorites}
          onAddToCart={addFromShelf}
        />
        <FeatureShelf
          eyebrow="Sale"
          title="Limited Sale"
          subtitle="While stocks last"
          image="/images/misc/grappling_ground.jpg"
          products={limitedSaleData || []}
          loading={limitedSaleLoading}
          linkTo="/products?limitedSale=true"
          favorites={favorites}
          onToggleFavorite={toggleFavorites}
          onAddToCart={addFromShelf}
          reverse
          sale
        />
      </section>

      <section className="ac-container ac-section--tight">
        <div className="ac-section-head">
          <div>
            <p className="ac-eyebrow">Find your style</p>
            <h2 className="ac-h2">Shop by Discipline</h2>
          </div>
        </div>
        <div className="ac-disciplines">
          {CATEGORY_TILES.map((cat) => (
            <Link key={cat.value} to={`/?category=${cat.value}`} className={`ac-discipline ac-discipline--${cat.place}`}>
              <img src={cat.img} alt="" loading="lazy" style={{ objectPosition: cat.focus }} />
              <span className={`ac-discipline__label ${cat.tone === "light" ? "ac-glass-thin" : "ac-glass-smoke"}`}>
                <b>{cat.label}</b>
                <i aria-hidden="true"><ArrowRightIcon /></i>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="ac-proof" aria-labelledby="proof-title">
        <img src="/images/misc/karate_group.jpg" alt="" className="ac-proof__bg" loading="lazy" />
        <p className="ac-eyebrow ac-eyebrow--light">Social proof</p>
        <h2 className="ac-h2 ac-h2--light" id="proof-title">Trusted by Fighters</h2>
        <div className="ac-proof__stats ac-glass-smoke">
          <div className="ac-proof__stat">
            <span className="ac-proof__num">10,000<em>+</em></span>
            <span className="ac-proof__label">Fighters worldwide</span>
          </div>
          <div className="ac-proof__stat">
            <span className="ac-proof__num">4.8<small>/5</small></span>
            <span className="ac-proof__label">Average rating</span>
          </div>
          <div className="ac-proof__stat">
            <span className="ac-proof__num">Pro</span>
            <span className="ac-proof__label">Used by professional athletes</span>
          </div>
        </div>
        <div className="ac-proof__quotes">
          {TESTIMONIALS.map((t) => (
            <figure key={t.id} className="ac-quote ac-glass-dense">
              <span className="ac-quote__stars" aria-label={`${t.rating} of 5 stars`}>{"★".repeat(t.rating)}</span>
              <blockquote className="ac-quote__text">“{t.quote}”</blockquote>
              <figcaption className="ac-quote__who">
                <b>{t.name}</b>
                <span>{t.discipline}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {featuredArticles.length > 0 && (
        <section className="ac-section ac-container">
          <div className="ac-section-head">
            <div>
              <p className="ac-eyebrow">From the mat</p>
              <h2 className="ac-h2">Stories</h2>
            </div>
            <Link to="/articles" className="ac-link-arrow">More stories <ArrowRightIcon width="14" height="14" /></Link>
          </div>
          <div className="ac-stories">
            {featuredArticles.slice(0, 1).map((article) => (
              <Link key={article._id} to={`/articles/${article._id}`} className="ac-story-lead">
                <img src={`/images/articles/${article.image}`} alt="" loading="lazy" />
                <div className="ac-story-lead__panel ac-glass-smoke">
                  <div className="ac-story-meta">
                    <span className="ac-story-meta__cat">{categoryLabel(article.category)}</span>
                    <span className="ac-story-meta__by">by {article.author}</span>
                  </div>
                  <h3 className="ac-story-lead__title">{article.title}</h3>
                  {article.excerpt && <p className="ac-story-lead__excerpt">{article.excerpt}</p>}
                </div>
              </Link>
            ))}
            <div className="ac-stories__side">
              {featuredArticles.slice(1).map((article) => (
                <Link key={article._id} to={`/articles/${article._id}`} className="ac-story-card ac-glass-frost">
                  <div className="ac-story-card__img">
                    <img src={`/images/articles/${article.image}`} alt="" loading="lazy" />
                  </div>
                  <div className="ac-story-card__body">
                    <div className="ac-story-meta">
                      <span className="ac-story-meta__cat">{categoryLabel(article.category)}</span>
                    </div>
                    <h3 className="ac-story-card__title">{article.title}</h3>
                    {article.excerpt && <p className="ac-story-card__excerpt">{article.excerpt}</p>}
                    <span className="ac-story-card__by">by {article.author}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <RecentlyViewed items={recentItems} />

      <section className="ac-newsletter" aria-labelledby="newsletter-title">
        <img src="/images/misc/sumo.jpg" alt="" loading="lazy" />
        <div className="ac-newsletter__panel ac-glass-smoke">
          <p className="ac-eyebrow ac-eyebrow--light">Newsletter</p>
          <h2 className="ac-h2 ac-h2--light" id="newsletter-title">Join the Apex Core Community</h2>
          <p>Get training tips, stories and exclusive offers.</p>
          {subscribed ? (
            <p className="ac-newsletter__ok" role="status">You're in. Welcome to the community.</p>
          ) : (
            <form className="ac-newsletter__form" noValidate onSubmit={(e) => {
              e.preventDefault();
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
                setNewsletterError("Please enter a valid email address (e.g. name@domain.com).");
                return;
              }
              setNewsletterError("");
              setEmail("");
              setSubscribed(true);
            }}>
              <label htmlFor="newsletter-email">Email address</label>
              <input
                id="newsletter-email"
                type="email"
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setNewsletterError(""); }}
                aria-invalid={!!newsletterError}
              />
              <button type="submit" className="ac-btn ac-btn--primary">Subscribe</button>
              {newsletterError && <p className="ac-newsletter__error" role="alert">{newsletterError}</p>}
            </form>
          )}
        </div>
      </section>

    </div>
  );
}

export default HomePage;
