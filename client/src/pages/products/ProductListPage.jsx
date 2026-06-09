import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import { getProducts } from "../../services/productService";
import Filter, { DEFAULT_FILTERS } from "../../components/products/Filter";
import { useFavorites } from "../../context/FavoriteContext";
import { useCart } from "../../context/CartContext";
import "../Pages.css";

const CATEGORIES = ["all", "bjj", "boxing", "muaythai", "karate"];

const SYNONYMS = {
  shoes:    ["boots", "footwear"],
  boots:    ["shoes", "footwear"],
  gloves:   ["mitts", "mittens"],
  shorts:   ["pants", "trunks"],
  headgear: ["helmet", "head guard"],
};

function expandQuery(q) {
  const extras = SYNONYMS[q] ?? [];
  return [q, ...extras];
}

function applyFilters(products, category, filters, search) {
  let result = category === "all"
    ? [...products]
    : products.filter((p) => p.category === category);

  if (search.trim()) {
    const queries = expandQuery(search.trim().toLowerCase());
    result = result.filter((p) =>
      queries.some(q =>
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
      )
    );
  }

  if (filters.onSale)     result = result.filter((p) => p.sale > 0);
  if (filters.minPrice !== "") result = result.filter((p) => p.price >= Number(filters.minPrice));
  if (filters.maxPrice !== "") result = result.filter((p) => p.price <= Number(filters.maxPrice));
  if (filters.minRating > 0)  result = result.filter((p) => p.rating >= filters.minRating);

  if (filters.sort === "price-asc")   result.sort((a, b) => a.price - b.price);
  if (filters.sort === "price-desc")  result.sort((a, b) => b.price - a.price);
  if (filters.sort === "name-asc")    result.sort((a, b) => a.title.localeCompare(b.title));
  if (filters.sort === "rating-desc") result.sort((a, b) => b.rating - a.rating);

  return result;
}

function StarRating({ rating, count }) {
  return (
    <span className="product-card__stars">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={`star${s <= Math.round(rating || 0) ? " star--filled" : ""}`}>★</span>
      ))}
      {count > 0 && <span className="product-card__review-count">({count})</span>}
    </span>
  );
}

function StockBadge({ stock }) {
  const s = stock ?? 99;
  if (s === 0) return <span className="product-card__stock product-card__stock--out">✕ Out of stock</span>;
  if (s < 10)  return <span className="product-card__stock product-card__stock--low">⚡ {s} left</span>;
  return <span className="product-card__stock product-card__stock--in">✓ In stock</span>;
}

function ProductListPage() {
  const [toggleFavorites, favorites] = useFavorites();
  const [, addToCart] = useCart();
  const { data: products, loading, error } = useFetch(getProducts);
  const [urlParams, setUrlParams] = useSearchParams();
  const saleParam        = urlParams.get("sale")        === "true";
  const limitedSaleParam = urlParams.get("limitedSale") === "true";
  const newArrivalParam  = urlParams.get("newArrival")  === "true";
  const category = urlParams.get("category") || "all";
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [search, setSearch] = useState(urlParams.get("q") || "");

  const setCategory = (cat) => {
    setUrlParams((prev) => {
      const next = new URLSearchParams(prev);
      if (cat === "all") next.delete("category");
      else next.set("category", cat);
      return next;
    });
  };

  if (error) return <p className="loading">Could not load products</p>;

  let displayed = loading ? [] : applyFilters(products, category, filters, search);
  if (!loading && saleParam)        displayed = displayed.filter((p) => p.sale > 0);
  if (!loading && limitedSaleParam) displayed = displayed.filter((p) => p.isLimitedSale);
  if (!loading && newArrivalParam)  displayed = displayed.filter((p) => p.isNewArrival);

  const isFiltered =
    category !== "all" ||
    filters.sort !== "default" ||
    filters.minPrice !== "" ||
    filters.maxPrice !== "" ||
    filters.onSale ||
    filters.minRating > 0 ||
    saleParam ||
    limitedSaleParam ||
    newArrivalParam;

  const clearFilters = () => {
    setUrlParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("category");
      next.delete("sale");
      next.delete("limitedSale");
      next.delete("newArrival");
      return next;
    });
    setFilters(DEFAULT_FILTERS);
  };

  return (
    <div className="products-page">

      <div className="products-toolbar">
        <Link to="/" className="auth-btn-secondary">‹ Back to Home</Link>
        <h1>Our Fight Gear</h1>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          {isFiltered && (
            <button className="filter-reset-btn" onClick={clearFilters}>CLEAR ✕</button>
          )}
          <button
            className="products-toolbar-btn"
            onClick={() => setShowFilter((prev) => !prev)}
          >
            {showFilter ? "CLOSE ✕" : "FILTER ›"}
          </button>
        </div>
      </div>

      <div className="products-search">
        <svg className="products-search__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          className="products-search__input"
          type="text"
          placeholder="Search gear, categories, keywords…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button className="products-search__clear" onClick={() => setSearch("")}>✕</button>
        )}
        <button className="products-search__btn" onClick={() => {}}>SEARCH</button>
      </div>

      <div className="products-categories">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`category-pill${category === cat ? " category-pill--active" : ""}`}
            onClick={() => setCategory(cat)}
          >
            {cat === "all" ? "All" : cat === "muaythai" ? "Muay Thai" : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {showFilter && (
        <Filter
          filters={filters}
          onChange={setFilters}
          onClose={() => setShowFilter(false)}
        />
      )}

      <p className="products-count">
        {search ? `${displayed.length} results for "${search}"` : `${displayed.length} products`}
      </p>

      {displayed.length === 0 && (
        <div className="products-empty">
          <p>No products match <strong>"{search}"</strong>.</p>
          <button className="products-toolbar-btn" onClick={() => setSearch("")}>Clear search</button>
        </div>
      )}

      <div className="products-grid">
        {loading && Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skeleton-grid-card">
            <div className="skeleton-grid-card__img skeleton" />
            <div className="skeleton-grid-card__body">
              <div className="skeleton-grid-card__name skeleton" />
              <div className="skeleton-grid-card__price skeleton" />
              <div className="skeleton-grid-card__stars skeleton" />
            </div>
          </div>
        ))}
        {displayed.map((product) => {
          const isFav = favorites.some((f) => f._id === product._id);
          const discountedPrice = product.sale > 0
            ? Math.round(product.price * (1 - product.sale / 100))
            : null;

          return (
            <Link to={`/products/${product._id}`} key={product._id} className="product-card">
              <div className="product-card__img-wrap">
                <img src={`/images/products/${product.image}`} alt={product.title} loading="lazy" />

                {product.sale > 0 && (
                  <span className="product-card__sale-badge">−{product.sale}%</span>
                )}
                {product.isBestseller && (
                  <span className="product-card__best-badge">Bestseller</span>
                )}

                <div className="product-card__overlay">
                  <span className="product-card__category-tag">
                    {product.category === "muaythai" ? "Muay Thai" : product.category.toUpperCase()}
                  </span>
                </div>

              </div>

              <div className="product-card__footer">
                <div className="product-card__info">
                  <span className="product-card__name">{product.title}</span>
                  <div className="product-card__price-row">
                    {discountedPrice ? (
                      <>
                        <span className="product-card__price product-card__price--original">
                          {product.price} <small>EUR</small>
                        </span>
                        <span className="product-card__price product-card__price--sale">
                          {discountedPrice} <small>EUR</small>
                        </span>
                      </>
                    ) : (
                      <span className="product-card__price">
                        {product.price} <small>EUR</small>
                      </span>
                    )}
                  </div>
                  <StarRating rating={product.rating} count={product.numReviews} />
                  <StockBadge stock={product.stock} />
                </div>

                <div className="product-card__actions">
                  <button
                    className="product-card__cart-btn"
                    onClick={(e) => { e.preventDefault(); addToCart(product, null); }}
                    title="Add to cart"
                  >
                    <img src="/icons/Cart add.svg" alt="Add to cart" />
                  </button>
                  <button
                    className={`home-product-card__fav-btn${isFav ? " active" : ""}`}
                    onClick={(e) => { e.preventDefault(); toggleFavorites(product); }}
                  >
                    <img
                      src={isFav ? "/icons/FavoritesFilled.png" : "/icons/Favorites.png"}
                      alt="Favorite"
                    />
                  </button>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

    </div>
  );
}

export default ProductListPage;
