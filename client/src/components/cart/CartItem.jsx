import { useCart } from "../../context/CartContext";

function CartItem({ item }) {
  const [, , removeFromCart, , , increaseItem, decreaseItem, , updateSize] = useCart();

  return (
    <div className="cart-item">
      <img
        className="cart-item__image"
        src={`/images/products/${item.product.image}`}
        alt={item.product.title}
      />
      <div className="cart-item__details">
        <p className="cart-item__name">{item.product.title}</p>

        <div className="cart-item__row">
          <span className="cart-item__meta-label" id={`size-${item.product._id}-${item.size}`}>Size</span>
          <div className="cart-item__size-btns" role="group" aria-labelledby={`size-${item.product._id}-${item.size}`}>
            {["S", "M", "L"].map((s) => (
              <button
                key={s}
                type="button"
                className={`cart-item__size-btn${item.size === s ? " cart-item__size-btn--active" : ""}`}
                aria-pressed={item.size === s}
                aria-label={`Size ${s}`}
                onClick={() => updateSize(item.product, item.size, s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="cart-item__row">
          <span className="cart-item__price">{item.product.price * item.quantity} EUR</span>
          <div className="cart-item__qty">
            <button
              className="cart-item__qty-btn"
              type="button"
              onClick={() => decreaseItem(item.product._id)}
              aria-label={`Decrease quantity of ${item.product.title}`}
            >−</button>
            <span className="cart-item__qty-num" aria-live="polite">
              <span className="ac-visually-hidden">Quantity </span>{item.quantity}
            </span>
            <button
              className="cart-item__qty-btn"
              type="button"
              onClick={() => increaseItem(item.product._id)}
              aria-label={`Increase quantity of ${item.product.title}`}
            >+</button>
          </div>
          <button
            type="button"
            className="cart-item__remove"
            onClick={() => removeFromCart(item.product._id, item.size)}
          >
            REMOVE<span className="ac-visually-hidden"> {item.product.title}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default CartItem;
