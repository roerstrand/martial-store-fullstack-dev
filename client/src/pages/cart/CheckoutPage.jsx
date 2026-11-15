import { useState, useMemo } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import PaymentForm from "../../components/cart/PaymentForm";
import KlarnaModal from "../../components/cart/KlarnaModal";
import SwishModal from "../../components/cart/SwishModal";
import CardModal from "../../components/cart/CardModal";
import { createOrder } from "../../services/orderService";
import { ArrowLeftIcon, ArrowRightIcon } from "../../components/ui/Icons";
import "../Pages.css";

const SHIPPING_COSTS = { standard: 5, express: 19, pickup: 0 };

function CheckoutPage() {
  const [cart, , , clearCart, , , , , , cartLoading] = useCart();
  const [user] = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [pendingData, setPendingData] = useState(null);
  const [shippingChoice, setShippingChoice] = useState("standard");

  const initialValues = useMemo(() => {
    const addresses = (() => {
      try { return JSON.parse(localStorage.getItem("saved_addresses")) || []; }
      catch { return []; }
    })();
    const addr = addresses[0];
    return {
      name:    user?.name  ?? "",
      email:   user?.email ?? "",
      address: addr?.street  ?? "",
      zip:     addr?.zip     ?? "",
      city:    addr?.city    ?? "",
    };
  }, [user]);

  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  const handleFormSubmit = ({ shipping, payment, carrier, ...shippingInfo }) => {
    const shippingCost = SHIPPING_COSTS[shipping] ?? 5;
    setPendingData({ shipping, payment, carrier, shippingCost, shippingInfo, totalPrice: subtotal + shippingCost });
  };

  const handleConfirmPayment = async () => {
    if (!pendingData) return;
    setIsLoading(true);
    const { shipping, carrier, shippingCost, shippingInfo, totalPrice } = pendingData;
    const products = cart.map((item) => ({
      product_id: item.product._id,
      price: item.product.price,
      size: item.size,
      quantity: item.quantity,
    }));
    let order;
    try {
      order = await createOrder(products, totalPrice, shipping, carrier);
    } catch {
      setIsLoading(false);
      alert("Something went wrong placing your order. Please try again.");
      return;
    }
    const cartSnapshot = [...cart];
    await clearCart();
    setPendingData(null);
    navigate("/confirmation", {
      state: { order, shippingInfo, shipping, carrier, shippingCost, cartSnapshot },
    });
  };

  if (!cartLoading && (cart.length === 0 || cart.some((item) => !item.size)) && !pendingData && !isLoading) {
    return <Navigate to="/cart" replace />;
  }

  const shippingCost = SHIPPING_COSTS[shippingChoice] ?? 5;
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="checkout-page ac-page ac-page-backdrop">
      <div className="ac-container">
        <Link to="/cart" className="ac-backlink"><ArrowLeftIcon /> Back to cart</Link>
        <h1 className="ac-visually-hidden">Checkout</h1>

        <ol className="ac-steps ac-glass-frost" aria-label="Checkout progress">
          <li className="is-done"><span className="ac-steps__n" aria-hidden="true">✓</span><Link to="/cart">Cart<span className="ac-visually-hidden"> (done)</span></Link></li>
          <li className="ac-steps__sep" aria-hidden="true" />
          <li className="is-current" aria-current="step"><span className="ac-steps__n" aria-hidden="true">2</span>Checkout</li>
          <li className="ac-steps__sep" aria-hidden="true" />
          <li><span className="ac-steps__n" aria-hidden="true">3</span>Confirmation</li>
        </ol>

        {pendingData && pendingData.payment === "klarna" && (
          <KlarnaModal total={pendingData.totalPrice} onConfirm={handleConfirmPayment} onClose={() => setPendingData(null)} />
        )}
        {pendingData && pendingData.payment === "swish" && (
          <SwishModal total={pendingData.totalPrice} onConfirm={handleConfirmPayment} onClose={() => setPendingData(null)} />
        )}
        {pendingData && pendingData.payment === "card" && (
          <CardModal total={pendingData.totalPrice} onConfirm={handleConfirmPayment} onClose={() => setPendingData(null)} />
        )}

        <div className="ac-checkout">
          <PaymentForm onSubmit={handleFormSubmit} initialValues={initialValues} onShippingChange={setShippingChoice} />

          <aside className="ac-checkout__aside" aria-labelledby="summary-title">
            <img src="/images/misc/grappling_standing.jpg" alt="" />
            <div className="ac-summary ac-glass-smoke">
              <div className="ac-summary__head">
                <h2 id="summary-title">Your order</h2>
                <span>{itemCount} {itemCount === 1 ? "item" : "items"}</span>
              </div>

              <div className="ac-summary__items">
                {cart.map((item, i) => (
                  <div key={`${item.product._id}-${item.size}-${i}`} className="ac-summary__item">
                    <img src={`/images/products/${item.product.image}`} alt="" />
                    <div>
                      <p className="ac-summary__item-name">{item.product.title}</p>
                      <p className="ac-summary__item-meta">
                        {item.size ? `Size ${item.size} · ` : ""}Qty {item.quantity}
                      </p>
                    </div>
                    <span className="ac-summary__item-price">{item.product.price * item.quantity} EUR</span>
                  </div>
                ))}
              </div>

              <div className="ac-summary__rows">
                <div className="ac-summary__row"><span>Subtotal</span><span>{subtotal} EUR</span></div>
                <div className="ac-summary__row">
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? "Free" : `${shippingCost} EUR`}</span>
                </div>
              </div>

              <div className="ac-summary__total">
                <span>Total</span>
                <b>{subtotal + shippingCost}<small>EUR</small></b>
              </div>

              <button
                type="submit"
                form="checkout-form"
                className="ac-btn ac-btn--primary ac-btn--block"
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : <>Complete order <ArrowRightIcon /></>}
              </button>

              <div className="ac-summary__trust">
                <span>✓ Secure payment</span>
                <span>✓ Fast delivery</span>
              </div>

              <p className="ac-summary__note">
                You will be redirected to your payment provider — Stripe, Klarna or Swish — to complete your purchase securely.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
