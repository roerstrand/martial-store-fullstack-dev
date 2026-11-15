import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "../pages/Pages.css";

function CartToast() {
  const [cart,,,,,,,toast] = useCart();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const failed = toast?.error;

  return (
    <>
      <div role="status" className="ac-live">
        {toast && !failed && (
          <div className="cart-toast">
            <span className="cart-toast__text">Added to cart</span>
            <Link to="/cart" className="cart-toast__link">View Cart{cartCount > 0 ? ` (${cartCount})` : ""} ›</Link>
          </div>
        )}
      </div>
      <div role="alert" className="ac-live">
        {failed && (
          <div className="cart-toast cart-toast--error">
            <span className="cart-toast__text">{toast.title}</span>
          </div>
        )}
      </div>
    </>
  );
}

export default CartToast;
