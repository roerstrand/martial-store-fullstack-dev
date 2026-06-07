import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import CartItem from "../../components/cart/CartItem";
import "../Pages.css";
import PageNav from "../../components/PageNav";

function CartPage() {
  const [cart, , , clearCart] = useCart();
  const navigate = useNavigate();

  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const shipping = 19;
  const total = subtotal + shipping;

  return (
    <div className="cart-page">
      <PageNav back="/products" backLabel="All Products" />
      <div className="cart-header">
        <div className="flow-breadcrumb">
          <span className="flow-breadcrumb__step--active">CART</span>
          <span>›</span>
          <span>CHECKOUT</span>
          <span>›</span>
          <span>CONFIRMATION</span>
        </div>
        <div className="cart-header__title-row">
          <h1>
            Your Cart
            {cart.length > 0 && (
              <span className="cart-count">{cart.length}</span>
            )}
          </h1>
          {cart.length > 0 && (
            <button className="clear-btn" onClick={clearCart}>Clear cart</button>
          )}
        </div>
      </div>

      {cart.length === 0 ? (
        <div className="cart-empty">
          <p>Your cart is empty</p>
          <Link to="/products" className="auth-btn-secondary">BROWSE PRODUCTS ›</Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items-col">
            <div className="cart-items">
              {cart.map((item, index) => (
                <CartItem
                  key={`${item.product._id}-${item.size}-${index}`}
                  item={item}
                />
              ))}
            </div>
            <div className="cart-nav-links">
              <Link to="/products" className="auth-btn-secondary">← ALL PRODUCTS</Link>
              <Link to="/" className="auth-btn-secondary">BACK TO HOME ›</Link>
            </div>
          </div>

          <div className="cart-summary-col">
            <div className="cart-summary-card">
              <h2>Order Summary</h2>
              <div className="cart-summary">
                <div className="cart-summary__row">
                  <span className="cart-summary__label">Subtotal</span>
                  <span>{subtotal} EUR</span>
                </div>
                <div className="cart-summary__row">
                  <span className="cart-summary__label">Shipping</span>
                  <span>{shipping} EUR</span>
                </div>
                <div className="cart-summary__row cart-summary__row--total">
                  <span className="cart-summary__label">Total</span>
                  <span>{total} EUR</span>
                </div>
              </div>
              <button
                className="cart-checkout-btn"
                onClick={() => navigate("/checkout")}
              >
                CHECKOUT ›
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPage;
