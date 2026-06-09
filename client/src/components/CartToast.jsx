import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "../pages/Pages.css";

function CartToast() {
  const [cart,,,,,,,toast] = useCart();
  if (!toast) return null;
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="cart-toast">
      <span className="cart-toast__text">Added to cart</span>
      <Link to="/cart" className="cart-toast__link">View Cart{cartCount > 0 ? ` (${cartCount})` : ""} ›</Link>
    </div>
  );
}

export default CartToast;
