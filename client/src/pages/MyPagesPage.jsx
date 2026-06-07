import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PageNav from "../components/PageNav";
import { useFavorites } from "../context/FavoriteContext";
import { getMyOrders } from "../services/orderService";
import { changePassword } from "../services/authService";
import useFetch from "../hooks/useFetch.jsx";
import "./Pages.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const STATUS_LABELS = {
  pending:    "Pending",
  processing: "Processing",
  shipped:    "Shipped",
  delivered:  "Delivered",
  cancelled:  "Cancelled",
};

const TABS = [
  { id: "dashboard",    label: "Dashboard" },
  { id: "orders",       label: "Order History" },
  { id: "favorites",    label: "Favorites" },
  { id: "addresses",    label: "Saved Addresses" },
  { id: "profile",      label: "Profile Settings" },
  { id: "password",     label: "Change Password" },
];

function Dashboard({ user, orders, favorites }) {
  return (
    <div className="mp-dashboard">
      <p className="mp-section-title">Welcome back, {user?.name}</p>
      <div className="mp-stats">
        <div className="mp-stat">
          <span className="mp-stat__value">{orders?.length ?? "—"}</span>
          <span className="mp-stat__label">Orders</span>
        </div>
        <div className="mp-stat">
          <span className="mp-stat__value">{favorites?.length ?? "—"}</span>
          <span className="mp-stat__label">Favorites</span>
        </div>
        <div className="mp-stat">
          <span className="mp-stat__value">{user ? new Date(user.createdAt ?? Date.now()).getFullYear() : "—"}</span>
          <span className="mp-stat__label">Member since</span>
        </div>
      </div>
      <div className="mp-quick-links">
        <Link to="/products" className="mp-quick-link">Shop All Gear ›</Link>
        <Link to="/products?sale=true" className="mp-quick-link">View Sale ›</Link>
      </div>
    </div>
  );
}

function OrderHistory({ orders, loading }) {
  if (loading) return <p className="loading">Loading orders...</p>;
  if (!orders || orders.length === 0)
    return (
      <div className="mp-empty">
        <p>No orders placed yet.</p>
        <Link to="/products" className="auth-btn-primary" style={{ marginTop: "1rem", display: "inline-flex" }}>SHOP NOW ›</Link>
      </div>
    );
  return (
    <div>
      <p className="mp-section-title">Order History</p>
      <div className="mp-orders">
        {orders.map((order) => (
          <div key={order._id} className="mp-order-card">
            <div className="mp-order-card__header">
              <span className="mp-order-card__id">#{order._id.slice(-8).toUpperCase()}</span>
              <span className="mp-order-card__date">
                {new Date(order.createdAt).toLocaleDateString("sv-SE")}
              </span>
              <span className={`mp-table__status mp-table__status--${order.status}`}>
                {STATUS_LABELS[order.status] ?? order.status}
              </span>
            </div>
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
              <Link to={`/orders/${order._id}`} className="mp-table__link">Track order ›</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Favorites({ favorites }) {
  if (!favorites || favorites.length === 0)
    return (
      <div className="mp-empty">
        <p>No favorites saved yet.</p>
        <Link to="/products" className="auth-btn-primary" style={{ marginTop: "1rem", display: "inline-flex" }}>BROWSE GEAR ›</Link>
      </div>
    );
  return (
    <div>
      <p className="mp-section-title">Your Favorites</p>
      <div className="mp-fav-grid">
        {favorites.map((product) => (
          <Link key={product._id} to={`/products/${product._id}`} className="mp-fav-card">
            <img src={`/images/products/${product.image}`} alt={product.title} className="mp-fav-card__img" />
            <div className="mp-fav-card__info">
              <span className="mp-fav-card__name">{product.title}</span>
              <span className="mp-fav-card__price">{product.price} EUR</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function SavedAddresses() {
  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", street: "", city: "", zip: "", country: "" });

  const handleSave = (e) => {
    e.preventDefault();
    setAddresses((prev) => [...prev, { ...form, id: Date.now() }]);
    setForm({ name: "", street: "", city: "", zip: "", country: "" });
    setShowForm(false);
  };

  return (
    <div>
      <p className="mp-section-title">Saved Addresses</p>
      {addresses.length === 0 && !showForm && (
        <p className="mp-empty-text">No addresses saved yet.</p>
      )}
      <div className="mp-address-list">
        {addresses.map((a) => (
          <div key={a.id} className="mp-address-card">
            <p className="mp-address-card__name">{a.name}</p>
            <p className="mp-address-card__line">{a.street}</p>
            <p className="mp-address-card__line">{a.zip} {a.city}, {a.country}</p>
            <button className="mp-address-card__remove" onClick={() => setAddresses((prev) => prev.filter((x) => x.id !== a.id))}>Remove</button>
          </div>
        ))}
      </div>
      {showForm ? (
        <form className="mp-form" onSubmit={handleSave}>
          <input className="mp-input" placeholder="Label (e.g. Home)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className="mp-input" placeholder="Street address" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} required />
          <div className="mp-form__row">
            <input className="mp-input" placeholder="ZIP" value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} required />
            <input className="mp-input" placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
          </div>
          <input className="mp-input" placeholder="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} required />
          <div className="mp-form__actions">
            <button type="submit" className="mp-btn-primary">Save Address</button>
            <button type="button" className="mp-btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      ) : (
        <button className="mp-btn-primary" style={{ marginTop: "1rem" }} onClick={() => setShowForm(true)}>+ Add Address</button>
      )}
    </div>
  );
}

function ProfileSettings({ user }) {
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [emailError, setEmailError] = useState("");

  const handleSave = (e) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      setEmailError("Please enter a valid email address (e.g. name@domain.com).");
      return;
    }
    setEmailError("");
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div>
      <p className="mp-section-title">Profile Settings</p>
      <form className="mp-form" onSubmit={handleSave}>
        <label className="mp-label">Username</label>
        <input className="mp-input" value={name} onChange={(e) => setName(e.target.value)} required />
        <label className="mp-label">Email</label>
        <input className="mp-input" type="email" value={email} onChange={(e) => { setEmail(e.target.value); setEmailError(""); }} required />
        {emailError && <p className="product-detail__size-error">{emailError}</p>}
        <div className="mp-form__actions">
          <button type="submit" className="mp-btn-primary">Save Changes</button>
        </div>
        {saved && <p className="mp-success">Changes saved.</p>}
      </form>
    </div>
  );
}

function ChangePassword() {
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    if (form.next !== form.confirm) { setError("Passwords do not match."); return; }
    if (form.next.length < 6) { setError("Password must be at least 6 characters."); return; }

    try {
      await changePassword({ currentPassword: form.current, newPassword: form.next });
      setSaved(true);
      setForm({ current: "", next: "", confirm: "" });
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update password.");
    }
  };

  return (
    <div>
      <p className="mp-section-title">Change Password</p>
      <form className="mp-form" onSubmit={handleSave}>
        <label className="mp-label">Current Password</label>
        <input className="mp-input" type="password" value={form.current} onChange={(e) => setForm({ ...form, current: e.target.value })} required />
        <label className="mp-label">New Password</label>
        <input className="mp-input" type="password" value={form.next} onChange={(e) => setForm({ ...form, next: e.target.value })} required />
        <label className="mp-label">Confirm New Password</label>
        <input className="mp-input" type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} required />
        {error && <p className="mp-error">{error}</p>}
        {saved && <p className="mp-success">Password updated.</p>}
        <div className="mp-form__actions">
          <button type="submit" className="mp-btn-primary">Update Password</button>
        </div>
      </form>
    </div>
  );
}

function MyPagesPage() {
  const [user] = useAuth();
  const [, favorites] = useFavorites();
  const { data: orders, loading: ordersLoading } = useFetch(getMyOrders);
  const [activeTab, setActiveTab] = useState("dashboard");
  const navigate = useNavigate();

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="mp-page">
      <PageNav back="/" backLabel="Back to Home" />
      <aside className="mp-sidebar">
        <div className="mp-sidebar__user">
          <div className="mp-sidebar__avatar">{user.name?.charAt(0).toUpperCase()}</div>
          <div>
            <p className="mp-sidebar__name">{user.name}</p>
            <p className="mp-sidebar__email">{user.email}</p>
          </div>
        </div>
        <nav className="mp-sidebar__nav">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`mp-sidebar__link${activeTab === tab.id ? " mp-sidebar__link--active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        <Link to="/products" className="mp-sidebar__back">← All Products</Link>
      </aside>

      <main className="mp-content">
        {activeTab === "dashboard" && <Dashboard user={user} orders={orders} favorites={favorites} />}
        {activeTab === "orders"    && <OrderHistory orders={orders} loading={ordersLoading} />}
        {activeTab === "favorites" && <Favorites favorites={favorites} />}
        {activeTab === "addresses" && <SavedAddresses />}
        {activeTab === "profile"   && <ProfileSettings user={user} />}
        {activeTab === "password"  && <ChangePassword />}
      </main>
    </div>
  );
}

export default MyPagesPage;
