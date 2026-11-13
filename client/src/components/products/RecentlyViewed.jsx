import { Link } from "react-router-dom";
import { Price } from "./ProductCard";

function RecentlyViewed({ items, currentId }) {
  const visible = items.filter((p) => p._id !== currentId);
  if (visible.length === 0) return null;

  return (
    <section className="ac-section ac-recent">
      <div className="ac-container">
        <div className="ac-section-head">
          <div>
            <p className="ac-eyebrow">Pick up where you left off</p>
            <h2 className="ac-h2">Recently Viewed</h2>
          </div>
        </div>
        <div className="ac-recent__row">
          {visible.map((product) => (
            <Link key={product._id} to={`/products/${product._id}`} className="ac-recent__card ac-glass-frost">
              <div className="ac-recent__img">
                <img src={`/images/products/${product.image}`} alt="" loading="lazy" />
              </div>
              <div className="ac-recent__info">
                <p className="ac-recent__name">{product.title}</p>
                <Price product={product} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default RecentlyViewed;
