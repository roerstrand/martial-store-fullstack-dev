import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import CartItem from "../../components/cart/CartItem";
import "../Pages.css";
import PageNav from "../../components/PageNav";

function CartPage() {
  const [cart, , , clearCart, , , , , updateSize] = useCart();
  const navigate = useNavigate();
  const [bulkSize, setBulkSize] = useState(null);
  const [applied, setApplied] = useState(false);

  const missingSize = cart.some((item) => !item.size);

  const handleApplyBulkSize = async () => {
    if (!bulkSize) return;
    for (const item of cart.filter((i) => !i.size)) {
      await updateSize(item.product, null, bulkSize);
    }
    setBulkSize(null);
    setApplied(true);
    setTimeout(() => setApplied(false), 2000);
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

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
            {totalQuantity > 0 && (
              <span className="cart-count">{totalQuantity}</span>
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
            {missingSize && (
              <div className="cart-bulk-size">
                <span className="cart-bulk-size__label">Set size for all unsized items</span>
                <div className="cart-bulk-size__btns">
                  {["S", "M", "L"].map((s) => (
                    <button
                      key={s}
                      className={`size-btn${bulkSize === s ? " size-btn--active" : ""}`}
                      onClick={() => setBulkSize(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <button
                  className="cart-bulk-size__apply"
                  onClick={handleApplyBulkSize}
                  disabled={!bulkSize}
                >
                  Apply to all products with no size selected
                </button>
                {applied && <p className="cart-bulk-size__applied">Size applied to all items.</p>}
              </div>
            )}
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
                  <span className="cart-summary__shipping-note">Calculated at checkout</span>
                </div>
                <div className="cart-summary__row cart-summary__row--total">
                  <span className="cart-summary__label">Total</span>
                  <span>From {subtotal + 5} EUR</span>
                </div>
              </div>
              {missingSize && (
                <p className="cart-size-warning">
                  Select a size for all items before checking out.
                </p>
              )}
              <button
                className="cart-checkout-btn"
                onClick={() => !missingSize && navigate("/checkout")}
                disabled={missingSize}
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
