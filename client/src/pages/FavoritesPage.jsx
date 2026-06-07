import { useState } from "react";
import { Link } from "react-router-dom";
import { useFavorites } from "../context/FavoriteContext";
import { useCart } from "../context/CartContext";
import "./Pages.css";
import FavoriteItem from "../components/favorites/FavoriteItem";
import PageNav from "../components/PageNav";

function FavoritesPage() {
  const [, favorites, , clearFavorites] = useFavorites();
  const [, addToCart] = useCart();
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
            <button className="clear-btn" onClick={clearFavorites}>Clear all</button>
          </div>
        )}
      </div>

      {favorites.length === 0 ? (
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
            <button
              className="favorites-bulk__btn"
              onClick={handleAddAll}
              disabled={!bulkSize}
            >
              ADD ALL TO CART
            </button>
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
