import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import { getProducts } from "../../services/productService";
import Filter, { DEFAULT_FILTERS } from "../../components/products/Filter";
import { useFavorites } from "../../context/FavoriteContext";
import { useCart } from "../../context/CartContext";
import ProductCard from "../../components/products/ProductCard";
import { categoryLabel } from "../../utils/productFormat";
import { ArrowLeftIcon, SearchIcon, FilterIcon, CloseIcon } from "../../components/ui/Icons";
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

  const activeFilterCount =
    (filters.sort !== "default" ? 1 : 0) +
    (filters.minPrice !== "" ? 1 : 0) +
    (filters.maxPrice !== "" ? 1 : 0) +
    (filters.onSale ? 1 : 0) +
    (filters.minRating > 0 ? 1 : 0);

  const heading = limitedSaleParam ? "Limited Sale"
    : newArrivalParam ? "New Arrivals"
    : saleParam ? "Sale"
    : "Our Fight Gear";

  return (
    <div className="products-page ac-page ac-page-backdrop">
      <div className="ac-container">
        <Link to="/" className="ac-backlink"><ArrowLeftIcon /> Home</Link>

        <div className="ac-toolbar ac-glass-frost">
          <div className="ac-toolbar__top">
            <div className="ac-toolbar__title">
              <h1 className="ac-h2">{heading}</h1>
              <span className="ac-toolbar__count" aria-live="polite">
                {loading ? "Loading…" : search ? `${displayed.length} results for “${search}”` : `${displayed.length} products`}
              </span>
            </div>
          </div>

          <div className="ac-toolbar__row">
            <div className="ac-search">
              <SearchIcon />
              <label htmlFor="products-search" className="ac-visually-hidden">Search products</label>
              <input
                id="products-search"
                type="search"
                placeholder="Search gear, categories, keywords…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button type="button" className="ac-search__clear" onClick={() => setSearch("")} aria-label="Clear search">✕</button>
              )}
            </div>
            <div className="ac-toolbar__actions">
              {isFiltered && (
                <button type="button" className="ac-btn ac-btn--outline" onClick={clearFilters}>Clear ✕</button>
              )}
              <button
                type="button"
                className={`ac-btn ${showFilter ? "ac-btn--ink" : "ac-btn--outline"}`}
                onClick={() => setShowFilter((prev) => !prev)}
                aria-expanded={showFilter}
              >
                {showFilter ? <CloseIcon /> : <FilterIcon />}
                {showFilter ? "Close" : "Filter & sort"}
                {!showFilter && activeFilterCount > 0 && <span className="ac-filter-dot">{activeFilterCount}</span>}
              </button>
            </div>
          </div>

          <div className="ac-toolbar__cats" role="group" aria-label="Categories">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`ac-chip${category === cat ? " is-active" : ""}`}
                onClick={() => setCategory(cat)}
                aria-pressed={category === cat}
              >
                {cat === "all" ? "All" : categoryLabel(cat)}
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
        </div>

        {!loading && displayed.length === 0 && (
          <div className="ac-empty ac-glass-frost">
            <p>{search ? <>No products match <strong>“{search}”</strong>.</> : "No products match these filters."}</p>
            <button type="button" className="ac-btn ac-btn--ink" onClick={() => { setSearch(""); clearFilters(); }}>Show all products</button>
          </div>
        )}

        <div className="ac-product-grid">
          {loading && Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="ac-card">
              <div className="ac-card__media skeleton" />
              <div className="ac-card__body">
                <div className="skeleton" style={{ height: "0.9rem", width: "80%", borderRadius: 4 }} />
                <div className="skeleton" style={{ height: "1.1rem", width: "40%", borderRadius: 4 }} />
              </div>
            </div>
          ))}
          {displayed.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              isFavorite={favorites.some((f) => f._id === product._id)}
              onToggleFavorite={toggleFavorites}
              onAddToCart={(p) => addToCart(p, null)}
              showCategory
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProductListPage;
