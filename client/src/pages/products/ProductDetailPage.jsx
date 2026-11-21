import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import "../Pages.css";
import useFetch from "../../hooks/useFetch.jsx";
import { getProduct, getProducts } from "../../services/productService";
import { useCart } from "../../context/CartContext";
import { useFavorites } from "../../context/FavoriteContext";
import { REVIEWS } from "../../data/testimonials";
import { useRecentlyViewed } from "../../hooks/useRecentlyViewed";
import RecentlyViewed from "../../components/products/RecentlyViewed";
import ProductCard, { Stars, Stock } from "../../components/products/ProductCard";
import { categoryLabel } from "../../utils/productFormat";
import { ArrowLeftIcon, ArrowRightIcon, CartPlusIcon, HeartIcon, TruckIcon, ReturnIcon, LockIcon } from "../../components/ui/Icons";

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
        <div className="ac-container"><Link to="/products" className="ac-backlink"><ArrowLeftIcon /> All Products</Link></div>
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
    <div style={{ minHeight: "100vh" }}>
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
  const stock = product.stock ?? 99;

  return (
    <div className="product-detail-page ac-page ac-page-backdrop">
      <div className="ac-container">
        <Link to="/products" className="ac-backlink"><ArrowLeftIcon /> All Products</Link>

        <div className="ac-pdp">
          <div className="ac-pdp__media">
            <img src={`/images/products/${product.image}`} alt={product.title} />
            <div className="ac-pdp__media-badges">
              {product.sale > 0 && <span className="ac-badge ac-badge--sale">−{product.sale}%</span>}
              {product.isNewArrival && <span className="ac-badge ac-badge--glass">New</span>}
              {product.isLimitedSale && <span className="ac-badge ac-badge--glass">Limited</span>}
            </div>
          </div>

          <div className="ac-pdp__panel ac-glass-frost">
            <div>
              <span className="ac-pdp__cat">{categoryLabel(product.category)}</span>
              <h1 className="ac-pdp__title">{product.title}</h1>
            </div>

            <div className="ac-pdp__social">
              <Stars rating={product.rating} count={product.numReviews} />
              {product.sold > 0 && <span>{product.sold} sold</span>}
            </div>

            <div className="ac-pdp__pricebox">
              {discountedPrice ? (
                <p className="ac-price ac-price--sale">
                  <span className="ac-price__now">{discountedPrice}<small>EUR</small></span>
                  <s className="ac-price__was">{product.price}<small>EUR</small></s>
                </p>
              ) : (
                <p className="ac-price"><span className="ac-price__now">{product.price}<small>EUR</small></span></p>
              )}
              <Stock stock={stock} />
            </div>

            <p className="ac-pdp__desc">{product.description}</p>

            <div>
              <p className="ac-pdp__label" id="size-label">
                <span>Size</span>
                <b>{selectedSize ? `Selected: ${selectedSize}` : "Choose a size"}</b>
              </p>
              <div className={`ac-sizes${sizeError ? " ac-sizes--error" : ""}`} role="radiogroup" aria-labelledby="size-label">
                {["S", "M", "L"].map((size) => (
                  <button
                    key={size}
                    type="button"
                    role="radio"
                    aria-checked={selectedSize === size}
                    className={`ac-size${selectedSize === size ? " is-active" : ""}`}
                    onClick={() => { setSelectedSize(size); setSizeError(false); }}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {sizeError && (
                <p className="ac-pdp__error" role="alert">Please select a size before continuing.</p>
              )}
            </div>

            <div className="ac-pdp__ctas">
              <button type="button" className="ac-btn ac-btn--primary" onClick={handleAddToCart}>
                <CartPlusIcon /> Add to cart
              </button>
              <button type="button" className="ac-btn ac-btn--ink" onClick={handleBuyNow}>
                Buy now
              </button>
              <button
                type="button"
                className={`ac-iconbtn${isFavorite ? " is-active" : ""}`}
                onClick={() => toggleFavorites(product)}
                aria-pressed={isFavorite}
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                <HeartIcon filled={isFavorite} />
              </button>
            </div>

            <p className="ac-pdp__delivery"><TruckIcon width="18" height="18" /> Free shipping on orders over 500 EUR</p>

            <div className="ac-pdp__trust">
              <div><TruckIcon /><span>Free shipping</span></div>
              <div><ReturnIcon /><span>Easy returns</span></div>
              <div><LockIcon /><span>Secure payment</span></div>
            </div>

            {product.details && (
              <div className="ac-pdp__details">
                <p className="ac-pdp__label"><span>Materials / details</span></p>
                <p>{product.details}</p>
              </div>
            )}
          </div>
        </div>

        {reviews.length > 0 && (
          <section className="ac-section ac-section--flush">
            <div className="ac-section-head">
              <div>
                <p className="ac-eyebrow">What fighters say</p>
                <h2 className="ac-h2">Customer Reviews</h2>
              </div>
            </div>
            <div className="ac-reviews">
              {reviews.map((r, i) => (
                <div key={i} className="ac-review ac-glass-frost">
                  <div className="ac-review__top">
                    <b>{r.author}</b>
                    <span className="ac-review__date">{r.date}</span>
                  </div>
                  <Stars rating={r.rating} />
                  <p>“{r.text}”</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {related.length > 0 && (
          <section className="ac-section ac-section--flush">
            <div className="ac-section-head">
              <div>
                <p className="ac-eyebrow">Same discipline</p>
                <h2 className="ac-h2">You May Also Like</h2>
              </div>
              <Link to={`/products?category=${product.category}`} className="ac-link-arrow">View all <ArrowRightIcon /></Link>
            </div>
            <div className="ac-product-grid ac-product-grid--flush">
              {related.map((p) => (
                <ProductCard
                  key={p._id}
                  product={p}
                  isFavorite={favorites.some((f) => f._id === p._id)}
                  onToggleFavorite={toggleFavorites}
                  onAddToCart={(item) => addToCart(item, null)}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      <RecentlyViewed items={recentItems} currentId={productId} />
    </div>
  );
}

export default ProductDetailPage;
