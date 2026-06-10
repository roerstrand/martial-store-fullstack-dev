import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import "../Pages.css";
import useFetch from "../../hooks/useFetch.jsx";
import { getProduct, getProducts } from "../../services/productService";
import { useCart } from "../../context/CartContext";
import { useFavorites } from "../../context/FavoriteContext";
import { REVIEWS } from "../../data/testimonials";
import PageNav from "../../components/PageNav";
import { useRecentlyViewed } from "../../hooks/useRecentlyViewed";
import RecentlyViewed from "../../components/products/RecentlyViewed";

function Stars({ rating }) {
  return (
    <span className="detail-stars">
      {[1,2,3,4,5].map(s => (
        <span key={s} className={s <= rating ? "star star--filled" : "star"}>{'★'}</span>
      ))}
    </span>
  );
}

function ProductDetailPage() {
  const { productId } = useParams();
  const [selectedSize, setSelectedSize] = useState(null);
  const [sizeError, setSizeError] = useState(false);
  const [, addToCart] = useCart();
  const [toggleFavorites, favorites] = useFavorites();
  const navigate = useNavigate();
  const { items: recentItems, addProduct } = useRecentlyViewed();

  const { data: product, loading, error } = useFetch(() => getProduct(productId), [productId]);

  const { data: relatedData } = useFetch(
    () => product?.category ? getProducts({ category: product.category }) : Promise.resolve([]),
    [product?.category]
  );

  useEffect(() => {
    setSelectedSize(null);
  }, [productId]);

  useEffect(() => {
    if (product?._id) addProduct(product);
  }, [product?._id]);

  if (error || (!loading && (!product || !product._id))) {
    const is404 = !product || !product._id || error?.response?.status === 404;
    return (
      <div className="product-detail-page">
        <PageNav back="/products" backLabel="All Products" />
        <div className="product-not-found">
          <p className="product-not-found__msg">
            {is404 ? "Product not found." : "Something went wrong loading this product."}
          </p>
          <div className="product-not-found__actions">
            <Link to="/products" className="auth-btn-secondary">BROWSE ALL PRODUCTS ›</Link>
            <Link to="/" className="auth-btn-secondary">BACK TO HOME ›</Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) return (
    <div className="skeleton-detail">
      <div className="skeleton-detail__img" />
      <div className="skeleton-detail__info">
        <div className="skeleton-detail__line" style={{ height: "1.4rem", width: "60%" }} />
        <div className="skeleton-detail__line" style={{ height: "0.8rem", width: "40%" }} />
        <div className="skeleton-detail__line" style={{ height: "1.1rem", width: "25%" }} />
        <div className="skeleton-detail__line" style={{ height: "0.7rem", width: "80%" }} />
        <div className="skeleton-detail__line" style={{ height: "0.7rem", width: "70%" }} />
        <div className="skeleton-detail__line" style={{ height: "2.5rem", width: "50%", marginTop: "0.5rem" }} />
      </div>
    </div>
  );

  const reviews = REVIEWS[product.category] ?? [];
  const related = (relatedData || []).filter(p => p._id !== productId).slice(0, 4);

  const discountedPrice = product.sale > 0
    ? (product.price * (1 - product.sale / 100)).toFixed(2)
    : null;

  const handleAddToCart = async () => {
    if (!selectedSize) { setSizeError(true); return; }
    await addToCart(product, selectedSize);
  };

  const handleBuyNow = async () => {
    if (!selectedSize) { setSizeError(true); return; }
    await addToCart(product, selectedSize, true);
    navigate("/cart");
  };

  const isFavorite = favorites?.some((f) => f._id === product?._id);

  return (
    <div className="product-detail-page">
      <PageNav back="/products" backLabel="All Products" />
      <div className="product-detail__layout">

        {/* Image column */}
        <div className="product-detail__image">
          <div className="product-detail__image-main">
            <img
              src={`/images/products/${product.image}`}
              alt={product.title}
              loading="lazy"
            />
          </div>
        </div>

        {/* Info column */}
        <div className="product-detail__info">

          {(product.isNewArrival || product.isLimitedSale || product.sale > 0) && (
            <div className="product-detail__badge-row">
              {product.isNewArrival && <span className="product-badge product-badge--new">NEW</span>}
              {product.isLimitedSale && <span className="product-badge product-badge--limited">LIMITED</span>}
              {product.sale > 0 && <span className="product-badge product-badge--sale">-{product.sale}%</span>}
            </div>
          )}

          <p className="product-detail__name">{product.title}</p>

          <div className="product-detail__social-row">
            <Stars rating={product.rating} />
            <span className="product-detail__rating-num">{product.rating}.0</span>
            {product.sold > 0 && (
              <span className="product-detail__sold">{product.sold} sold</span>
            )}
          </div>

          <div className="product-detail__price-row">
            {discountedPrice ? (
              <>
                <span className="product-detail__price">{discountedPrice} EUR</span>
                <span className="product-detail__price-original">{product.price} EUR</span>
              </>
            ) : (
              <span className="product-detail__price">{product.price} EUR</span>
            )}
          </div>

          <p className="product-detail__delivery">
            <span className="product-detail__delivery-icon">🚚</span>
            Free shipping on orders over 500 EUR
          </p>

          <p className="product-detail__availability">
            <span className="product-detail__stock-dot"></span>
            IN STOCK
          </p>

          <p className="product-detail__desc">{product.description}</p>

          <p className="product-detail__size-label">SIZE</p>
          <div className="product-detail__sizes">
            {["S", "M", "L"].map((size) => (
              <button
                key={size}
                className={`size-btn ${selectedSize === size ? "size-btn--active" : ""}`}
                onClick={() => { setSelectedSize(size); setSizeError(false); }}
              >
                {size}
              </button>
            ))}
          </div>
          {sizeError && (
            <p className="product-detail__size-error">Please select a size before continuing.</p>
          )}

          <div className="product-detail__cta-row">
            <button className="product-detail__add-cart" onClick={handleAddToCart}>
              ADD TO CART
            </button>
            <button className="product-detail__buy" onClick={handleBuyNow}>
              BUY NOW
            </button>
            <button
              className={`product-detail__fav-btn${isFavorite ? " product-detail__fav-btn--active" : ""}`}
              onClick={() => toggleFavorites(product)}
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              {isFavorite ? "♥" : "♡"}
            </button>
          </div>

          <div className="product-detail__trust-row">
            <div className="trust-item">
              <span className="trust-item__icon">🚚</span>
              <span>Free shipping</span>
            </div>
            <div className="trust-item">
              <span className="trust-item__icon">↩</span>
              <span>Easy returns</span>
            </div>
            <div className="trust-item">
              <span className="trust-item__icon">🔒</span>
              <span>Secure payment</span>
            </div>
          </div>

          {product.details && (
            <>
              <p className="product-detail__materials-title">MATERIALS / DETAILS</p>
              <p className="product-detail__materials-text">{product.details}</p>
            </>
          )}
        </div>
      </div>

      {reviews.length > 0 && (
        <div className="product-reviews">
          <p className="product-reviews__title">Customer Reviews</p>
          <div className="product-reviews__list">
            {reviews.map((r, i) => (
              <div key={i} className="product-review">
                <div className="product-review__top">
                  <span className="product-review__author">{r.author}</span>
                  <Stars rating={r.rating} />
                  <span className="product-review__date">{r.date}</span>
                </div>
                <p className="product-review__text">"{r.text}"</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {related.length > 0 && (
        <div className="product-detail__related">
          <p className="product-detail__related-title">YOU MAY ALSO LIKE</p>
          <div className="product-detail__related-grid">
            {related.map(p => (
              <Link key={p._id} to={`/products/${p._id}`} className="product-detail__related-card">
                <div className="product-detail__related-img">
                  <img src={`/images/products/${p.image}`} alt={p.title} loading="lazy" />
                </div>
                <p className="product-detail__related-name">{p.title}</p>
                <p className="product-detail__related-price">{p.price} EUR</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      <Link to="/" className="auth-btn-secondary" style={{ margin: "0 1.5rem 2rem" }}>
        BACK TO HOME ›
      </Link>

      <RecentlyViewed items={recentItems} currentId={productId} />
    </div>
  );
}

export default ProductDetailPage;
