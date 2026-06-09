import { useState } from "react";
import { Link } from "react-router-dom";
import { useFavorites } from "../context/FavoriteContext";
import { useCart } from "../context/CartContext";
import "./Pages.css";
import FavoriteItem from "../components/favorites/FavoriteItem";
import PageNav from "../components/PageNav";

function FavoritesPage() {
  const [, favorites, , clearFavorites, loading] = useFavorites();
  const [cart, addToCart] = useCart();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const [bulkSize, setBulkSize] = useState(null);

  const handleAddAll = () => {
    if (!bulkSize) return;
    favorites.forEach(product => addToCart(product, bulkSize));
  };

  return (
    <div className="favorites-page">
      <PageNav back="/" backLabel="Back to Home" />
      <div className="favorites-header">
        <h1>Favorites</h1>
        {favorites.length > 0 && (
          <div className="favorites-header__meta">
            <span className="favorites-count">{favorites.length} items</span>
            <button className="clear-btn" onClick={clearFavorites}>Clear All Favorites</button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="favorites-loading">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="skeleton-grid-card" />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="favorites-empty">
          <span className="favorites-empty__icon">♡</span>
          <p>No favorites yet</p>
          <Link to="/products" className="auth-btn-secondary">BROWSE PRODUCTS ›</Link>
        </div>
      ) : (
        <>
          <div className="favorites-bulk">
            <span className="favorites-bulk__label">Add all in size</span>
            <div className="favorites-bulk__sizes">
              {["S", "M", "L"].map(size => (
                <button
                  key={size}
                  className={`size-btn ${bulkSize === size ? "size-btn--active" : ""}`}
                  onClick={() => setBulkSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
            <div className="favorites-bulk__actions">
              <button
                className="favorites-bulk__btn"
                onClick={handleAddAll}
                disabled={!bulkSize}
              >
                ADD ALL TO CART
              </button>
              <Link to="/cart" className="favorites-bulk__nav-btn">VIEW CART{cartCount > 0 ? ` (${cartCount})` : ""} ›</Link>
              <Link to="/checkout" className="favorites-bulk__nav-btn favorites-bulk__nav-btn--checkout">CHECKOUT ›</Link>
            </div>
          </div>

          <div className="favorites-grid">
            {favorites.map((product) => (
              <FavoriteItem key={product._id} product={product} />
            ))}
          </div>
        </>
      )}

      <div className="favorites-nav">
        <Link to="/products" className="auth-btn-secondary">ALL PRODUCTS ›</Link>
        <Link to="/" className="auth-btn-secondary">BACK TO HOME ›</Link>
      </div>
    </div>
  );
}

export default FavoritesPage;
