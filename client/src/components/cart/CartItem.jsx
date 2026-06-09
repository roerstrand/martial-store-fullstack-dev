import { useCart } from "../../context/CartContext";

function CartItem({ item }) {
  const [, , removeFromCart, , , increaseItem, decreaseItem, , updateSize] = useCart();

  return (
    <div className={`cart-item${!item.size ? " cart-item--no-size" : ""}`}>
      <img
        className="cart-item__image"
        src={`/images/products/${item.product.image}`}
        alt={item.product.title}
      />
      <div className="cart-item__details">
        <p className="cart-item__name">{item.product.title}</p>

        <div className="cart-item__row">
          <span className="cart-item__meta-label">Size</span>
          {item.size ? (
            <span className="cart-item__badge">{item.size}</span>
          ) : (
            <div className="cart-item__size-pick">
              <span className="cart-item__size-prompt">Pick a size</span>
              <div className="cart-item__size-btns">
                {["S", "M", "L"].map((s) => (
                  <button
                    key={s}
                    className="cart-item__size-btn"
                    onClick={() => updateSize(item.product, null, s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="cart-item__row">
          <span className="cart-item__price">{item.product.price * item.quantity} EUR</span>
          <div className="cart-item__qty">
            <button
              className="cart-item__qty-btn"
              onClick={() => decreaseItem(item.product._id)}
              aria-label="Decrease quantity"
            >−</button>
            <span className="cart-item__qty-num">{item.quantity}</span>
            <button
              className="cart-item__qty-btn"
              onClick={() => increaseItem(item.product._id)}
              aria-label="Increase quantity"
            >+</button>
          </div>
          <button
            className="cart-item__remove"
            onClick={() => removeFromCart(item.product._id, item.size)}
          >
            REMOVE
          </button>
        </div>
      </div>
    </div>
  );
}

export default CartItem;
