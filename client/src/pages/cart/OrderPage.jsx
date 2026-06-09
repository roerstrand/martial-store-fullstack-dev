import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import useFetch from "../../hooks/useFetch.jsx";
import { getOrder } from "../../services/orderService";
import "../Pages.css";
import PageNav from "../../components/PageNav";

const CARRIER_URLS = {
  PostNord: "https://www.postnord.se/en/our-tools/track-trace",
  DHL: "https://www.dhl.com/gb-en/home/tracking.html",
};

const STATUS_LABELS = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

function OrderPage() {
  const { orderId } = useParams();
  const { state: locationState } = useLocation();
  const navigate = useNavigate();
  const { data: order, loading, error } = useFetch(() => getOrder(orderId));

  if (loading) return <p className="loading">Loading order...</p>;
  if (error) return <p className="loading">Could not load order.</p>;
  if (!order) return <p className="loading">Order not found.</p>;

  return (
    <div className="confirmation-page">
      <PageNav back="/my-pages" backLabel="Back to My Pages" />
      <p className="confirmation-section-title">Order tracking</p>

      <div className="confirmation-row">
        <span className="confirmation-row__label">Order number</span>
        <span>{order._id}</span>
      </div>
      <div className="confirmation-row">
        <span className="confirmation-row__label">Date</span>
        <span>{new Date(order.createdAt).toLocaleDateString("sv-SE")}</span>
      </div>
      <div className="confirmation-row">
        <span className="confirmation-row__label">Status</span>
        <span className={`mp-table__status mp-table__status--${order.status}`}>
          {STATUS_LABELS[order.status] ?? order.status}
        </span>
      </div>
      {order.shippingMethod && (
        <div className="confirmation-row">
          <span className="confirmation-row__label">Shipping</span>
          <span>{order.shippingMethod}{order.carrier ? ` · ${order.carrier}` : ""}</span>
        </div>
      )}
      {order.carrier && CARRIER_URLS[order.carrier] && (
        <div className="confirmation-row">
          <span className="confirmation-row__label">Track shipment</span>
          <a href={CARRIER_URLS[order.carrier]} target="_blank" rel="noreferrer" className="confirmation-track-link">
            Track at {order.carrier} →
          </a>
        </div>
      )}

      {order.products?.length > 0 && (
        <div style={{ margin: "1.5rem 0" }}>
          <p className="confirmation-section-title" style={{ marginBottom: "0.5rem" }}>Products</p>
          <div className="mp-order-card" style={{ marginBottom: 0 }}>
            <div className="mp-order-card__items">
              {order.products.map((item, i) => {
                const p = item.product_id;
                return (
                  <div key={i} className="mp-order-card__item">
                    {p?.image ? (
                      <img src={`/images/products/${p.image}`} alt={p.title} className="mp-order-card__item-img" />
                    ) : (
                      <div className="mp-order-card__item-img" />
                    )}
                    <span className="mp-order-card__item-name">{p?.title ?? "Product"}</span>
                    <span className="mp-order-card__item-qty">×{item.quantity}</span>
                    <span className="mp-order-card__item-unitprice">{item.price} EUR/st</span>
                    <span className="mp-order-card__item-line">{(item.price * item.quantity).toFixed(2)} EUR</span>
                  </div>
                );
              })}
            </div>
            <div className="mp-order-card__footer">
              <span className="mp-order-card__total">Total: <strong>{order.totalPrice} EUR</strong></span>
            </div>
          </div>
        </div>
      )}

      <div className="confirmation-footer" style={{ marginTop: "2rem" }}>
        <Link to="/products" className="confirmation-btn">Continue shopping</Link>
        {locationState?.fromConfirmation && (
          <button
            className="confirmation-btn confirmation-btn--secondary"
            onClick={() => navigate("/confirmation", { state: locationState.confirmationState })}
          >
            ← Back to confirmation
          </button>
        )}
        <Link to="/" className="confirmation-btn confirmation-btn--secondary">Back to home ›</Link>
      </div>
    </div>
  );
}

export default OrderPage;
