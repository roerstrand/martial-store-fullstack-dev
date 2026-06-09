import { useLocation, Link, useNavigate } from "react-router-dom";
import "../Pages.css";
import PageNav from "../../components/PageNav";

const CARRIER_URLS = {
  PostNord: "https://www.postnord.se/en/our-tools/track-trace",
  DHL: "https://www.dhl.com/gb-en/home/tracking.html",
};

function OrderConfirmationPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) {
    return (
      <div className="confirmation-page">
        <PageNav back="/" backLabel="Back to Home" />
        <h1>Order placed</h1>
        <p style={{ margin: "1.5rem 0" }}>
          Your order is confirmed. View your order history in{" "}
          <Link to="/my-pages" className="confirmation-track-link">My Pages</Link>.
        </p>
      </div>
    );
  }

  const { order, shippingInfo, shipping, carrier, shippingCost, cartSnapshot } = state;

  const subtotal = cartSnapshot.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  return (
    <div className="confirmation-page">
      <PageNav back="/" backLabel="Back to Home" />
      <div className="flow-breadcrumb">
        <span>CART</span>
        <span>=›</span>
        <span>CHECKOUT</span>
        <span>=›</span>
        <span className="flow-breadcrumb__step--active">CONFIRMATION</span>
      </div>

      <h1>✓ Order confirmed</h1>

      <div className="confirmation-layout">
        <div>
          <p className="confirmation-section-title">Order details</p>
          <div className="confirmation-row">
            <span className="confirmation-row__label">Order number</span>
            <span>{order._id}</span>
          </div>
          <div className="confirmation-row">
            <span className="confirmation-row__label">Email</span>
            <span>{shippingInfo.email}</span>
          </div>
          <div className="confirmation-row">
            <span className="confirmation-row__label">Shipping method</span>
            <span>{shipping}{carrier ? ` · ${carrier}` : ""}</span>
          </div>
          {carrier && CARRIER_URLS[carrier] && (
            <div className="confirmation-row">
              <span className="confirmation-row__label">Track shipment</span>
              <a href={CARRIER_URLS[carrier]} target="_blank" rel="noreferrer" className="confirmation-track-link">
                Track at {carrier} →
              </a>
            </div>
          )}

          <p
            className="confirmation-section-title"
            style={{ marginTop: "1.5rem" }}
          >
            Shipping address
          </p>
          <p>{shippingInfo.name}</p>
          <p>{shippingInfo.address}</p>
          <p>
            {shippingInfo.zip} {shippingInfo.city}
          </p>
        </div>

        <div>
          <p className="confirmation-section-title">Order summary</p>
          {cartSnapshot.map((item, i) => (
            <div
              key={`${item.product._id}-${item.size}-${i}`}
              className="confirmation-item"
            >
              <p className="confirmation-item__name">
                {item.product.title} ({item.size})
              </p>
              <div className="confirmation-item__row">
                <span>Quantity: {item.quantity}</span>
                <span>{item.product.price * item.quantity} EUR</span>
              </div>
            </div>
          ))}

          <div className="confirmation-row" style={{ marginTop: "0.5rem" }}>
            <span className="confirmation-row__label">Subtotal</span>
            <span>{subtotal} EUR</span>
          </div>
          <div className="confirmation-row">
            <span className="confirmation-row__label">Shipping</span>
            <span>{shippingCost} EUR</span>
          </div>
          <div className="confirmation-row">
            <span className="confirmation-row__label">VAT included</span>
          </div>
          <div className="confirmation-total">
            <span>Total</span>
            <span>{subtotal + shippingCost} EUR</span>
          </div>
        </div>
      </div>

      <div className="confirmation-footer">
        <Link to="/products" className="confirmation-btn">
          Continue shopping
        </Link>
        <button
          className="confirmation-btn confirmation-btn--secondary"
          onClick={() => navigate(`/orders/${order._id}`, { state: { fromConfirmation: true, confirmationState: state } })}
        >
          Track order
        </button>
        <Link to="/" className="confirmation-btn confirmation-btn--secondary">
          Back to home ›
        </Link>
      </div>
    </div>
  );
}

export default OrderConfirmationPage;
