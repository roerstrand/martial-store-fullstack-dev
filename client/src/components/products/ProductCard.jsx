import { Link } from "react-router-dom";
import { HeartIcon, CartPlusIcon } from "../ui/Icons";
import { categoryLabel, salePriceOf } from "../../utils/productFormat";

export function Stars({ rating, count }) {
  const full = Math.round(rating || 0);
  return (
    <span className="ac-stars" aria-label={`Rated ${full} of 5`}>
      <span className="ac-stars__icons" aria-hidden="true">
        {"★".repeat(full)}
        <span className="ac-stars__off">{"★".repeat(5 - full)}</span>
      </span>
      {count > 0 && <span>({count})</span>}
    </span>
  );
}

export function Stock({ stock }) {
  const s = stock ?? 99;
  if (s === 0) return <span className="ac-stock ac-stock--out">Out of stock</span>;
  if (s < 10) return <span className="ac-stock ac-stock--low">{s} left</span>;
  return <span className="ac-stock ac-stock--in">In stock</span>;
}

export function Price({ product }) {
  const salePrice = salePriceOf(product);
  if (!salePrice) {
    return (
      <p className="ac-price">
        <span className="ac-price__now">{product.price}<small>EUR</small></span>
      </p>
    );
  }
  return (
    <p className="ac-price ac-price--sale">
      <span className="ac-price__now">{salePrice}<small>EUR</small></span>
      <s className="ac-price__was">{product.price}<small>EUR</small></s>
    </p>
  );
}

function ProductCard({ product, isFavorite, onToggleFavorite, onAddToCart, showCategory = false, dark = false }) {
  const href = `/products/${product._id}`;

  return (
    <article className={`ac-card${dark ? " ac-card--dark" : ""}`}>
      <div className="ac-card__media">
        <Link to={href} className="ac-card__img-link" tabIndex={-1} aria-hidden="true">
          <img src={`/images/products/${product.image}`} alt="" loading="lazy" />
        </Link>
        <div className="ac-card__badges">
          {product.sale > 0 && <span className="ac-badge ac-badge--sale">−{product.sale}%</span>}
          {product.isNewArrival && <span className="ac-badge ac-badge--glass">New</span>}
          {product.isBestseller && <span className="ac-badge ac-badge--glass">Bestseller</span>}
        </div>
        <button
          type="button"
          className={`ac-card__fav ac-glass-smoke${isFavorite ? " is-active" : ""}`}
          onClick={() => onToggleFavorite?.(product)}
          aria-pressed={isFavorite}
          aria-label={isFavorite ? `Remove ${product.title} from favorites` : `Add ${product.title} to favorites`}
        >
          <HeartIcon filled={isFavorite} />
        </button>
        {showCategory && (
          <span className="ac-card__cat ac-glass-smoke">{categoryLabel(product.category)}</span>
        )}
      </div>

      <div className="ac-card__body">
        <h3 className="ac-card__name">
          <Link to={href}>{product.title}</Link>
        </h3>
        <div className="ac-card__meta">
          <Stars rating={product.rating} count={product.numReviews} />
          <Stock stock={product.stock} />
        </div>
        <div className="ac-card__buy">
          <Price product={product} />
          <button
            type="button"
            className="ac-btn ac-btn--primary ac-card__add"
            onClick={() => onAddToCart?.(product)}
            aria-label={`Add ${product.title} to cart`}
          >
            <CartPlusIcon />
            <span>Add to cart</span>
            <span className="ac-card__add-short">Add</span>
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
