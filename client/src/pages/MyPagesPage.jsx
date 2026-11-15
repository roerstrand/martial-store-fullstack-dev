import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PageNav from "../components/PageNav";
import { useFavorites } from "../context/FavoriteContext";
import { useCart } from "../context/CartContext";
import { getMyOrders } from "../services/orderService";
import { changePassword, updateProfile } from "../services/authService";
import useFetch from "../hooks/useFetch.jsx";
import FavoriteItem from "../components/favorites/FavoriteItem";
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
      <h1 className="mp-section-title">Welcome back, {user?.name}</h1>
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

function printReturnLabel(order) {
  const items = (order.products ?? [])
    .map((item) => `${item.product_id?.title ?? "Product"} ×${item.quantity}`)
    .join("\n");
  const win = window.open("", "_blank", "width=600,height=500");
  if (!win) { alert("Enable popups to print the return label."); return; }
  win.document.write(`<!DOCTYPE html><html><head><title>Return Label – #${order._id.slice(-8).toUpperCase()}</title>
<style>
  body{font-family:monospace;padding:2rem;background:#fff}
  .label{border:2px dashed #333;padding:1.5rem;max-width:420px;margin:0 auto}
  h2{margin:0 0 1.25rem;font-size:1.1rem;text-transform:uppercase;letter-spacing:.08em}
  .field{margin:.6rem 0;font-size:.9rem;line-height:1.5}
  .items{margin-top:1rem;padding-top:1rem;border-top:1px solid #aaa}
  .footer{margin-top:1.5rem;font-size:.75rem;color:#666;border-top:1px solid #ccc;padding-top:1rem}
</style></head><body>
<div class="label">
  <h2>Return Label</h2>
  <div class="field"><strong>Return to:</strong><br>Apex Core Returns<br>1 Fight Street<br>London EC1A 1BB</div>
  <div class="field"><strong>Order:</strong> #${order._id.slice(-8).toUpperCase()}</div>
  <div class="field"><strong>Return date:</strong> ${new Date().toLocaleDateString("sv-SE")}</div>
  <div class="items"><strong>Items:</strong><br>${items.replace(/\n/g, "<br>")}</div>
  <div class="footer">Drop off at your nearest carrier location.<br>Refund processed within 5–10 business days to your original payment method.</div>
</div>
<script>window.onload=()=>{window.print();window.close();}<\/script>
</body></html>`);
  win.document.close();
}

function OrderHistory({ orders, loading }) {
  const [returnOrderId, setReturnOrderId] = useState(null);

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
      <h1 className="mp-section-title">Order History</h1>
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
              {(order.products ?? []).map((item, i) => {
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
              <div className="mp-order-card__footer-actions">
                {["delivered", "shipped"].includes(order.status) && (
                  <button
                    className="mp-return-btn"
                    onClick={() => setReturnOrderId(returnOrderId === order._id ? null : order._id)}
                  >
                    {returnOrderId === order._id ? "Cancel Return" : "Return ›"}
                  </button>
                )}
                <Link to={`/orders/${order._id}`} className="mp-table__link">View Order ›</Link>
              </div>
            </div>
            {returnOrderId === order._id && (
              <div className="mp-return-panel">
                <p className="mp-return-panel__title">Return Request – #{order._id.slice(-8).toUpperCase()}</p>
                <p className="mp-return-panel__info">
                  Items must be unused, in original packaging, and returned within 30 days of delivery.
                  Refunds are processed within 5–10 business days.
                </p>
                <div className="mp-return-panel__items">
                  {(order.products ?? []).map((item, i) => (
                    <div key={i} className="mp-return-panel__item">
                      <span>{item.product_id?.title ?? "Product"}</span>
                      <span>×{item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="mp-return-panel__actions">
                  <button className="mp-btn-primary" onClick={() => printReturnLabel(order)}>
                    Print Return Label ›
                  </button>
                  <button className="mp-btn-secondary" onClick={() => setReturnOrderId(null)}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Favorites({ favorites }) {
  const [cart, addToCart] = useCart();
  const [, , , clearFavorites] = useFavorites();
  const [bulkSize, setBulkSize] = useState(null);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (!favorites || favorites.length === 0)
    return (
      <div className="mp-empty">
        <p>No favorites saved yet.</p>
        <Link to="/products" className="auth-btn-primary" style={{ marginTop: "1rem", display: "inline-flex" }}>BROWSE GEAR ›</Link>
      </div>
    );

  const handleAddAll = () => {
    if (!bulkSize) return;
    favorites.forEach((product) => addToCart(product, bulkSize));
  };

  return (
    <div>
      <div className="mp-section-header">
        <h1 className="mp-section-title">Your Favorites</h1>
        <button className="clear-btn" onClick={clearFavorites}>Clear all</button>
      </div>

      <div className="favorites-bulk">
        <span className="favorites-bulk__label">Add all in size</span>
        <div className="favorites-bulk__sizes">
          {["S", "M", "L"].map((size) => (
            <button
              key={size}
              className={`size-btn${bulkSize === size ? " size-btn--active" : ""}`}
              onClick={() => setBulkSize(size)}
            >
              {size}
            </button>
          ))}
        </div>
        <div className="favorites-bulk__actions">
          <button
            className="favorites-bulk__btn"
            onClick={handleAddAll}
            disabled={!bulkSize}
          >
            ADD ALL TO CART
          </button>
          <Link to="/cart" className="favorites-bulk__nav-btn">VIEW CART{cartCount > 0 ? ` (${cartCount})` : ""} ›</Link>
          <Link to="/checkout" className="favorites-bulk__nav-btn favorites-bulk__nav-btn--checkout">CHECKOUT ›</Link>
        </div>
      </div>

      <div className="favorites-grid">
        {favorites.map((product) => (
          <FavoriteItem key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}

const ADDRESSES_KEY = "saved_addresses";
const EMPTY_ADDR = { name: "", street: "", city: "", zip: "", country: "" };
const ADDR_ZIP_RE = /^[\d\s\-]{3,10}$/;

function SavedAddresses() {
  const [addresses, setAddresses] = useState(() => {
    try { return JSON.parse(localStorage.getItem(ADDRESSES_KEY)) || []; }
    catch { return []; }
  });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_ADDR);
  const [errors, setErrors] = useState({});

  const persist = (next) => {
    setAddresses(next);
    localStorage.setItem(ADDRESSES_KEY, JSON.stringify(next));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())   e.name    = "Label is required.";
    if (!form.street.trim()) e.street  = "Street address is required.";
    if (!form.zip.trim())    e.zip     = "Postal code is required.";
    else if (!ADDR_ZIP_RE.test(form.zip.trim())) e.zip = "Postal code may only contain digits.";
    if (!form.city.trim())   e.city    = "City is required.";
    if (!form.country.trim()) e.country = "Country is required.";
    return e;
  };

  const openEdit = (a) => {
    setEditingId(a.id);
    setForm({ name: a.name, street: a.street, city: a.city, zip: a.zip, country: a.country });
    setErrors({});
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_ADDR);
    setErrors({});
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  };

  const handleSave = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    if (editingId) {
      persist(addresses.map((a) => a.id === editingId ? { ...form, id: editingId } : a));
    } else {
      persist([...addresses, { ...form, id: Date.now() }]);
    }
    handleCancel();
  };

  return (
    <div>
      <h1 className="mp-section-title">Saved Addresses</h1>
      {addresses.length === 0 && !showForm && (
        <p className="mp-empty-text">No addresses saved yet.</p>
      )}
      <div className="mp-address-list">
        {addresses.map((a) => (
          <div key={a.id} className="mp-address-card">
            <p className="mp-address-card__name">{a.name}</p>
            <p className="mp-address-card__line">{a.street}</p>
            <p className="mp-address-card__line">{a.zip} {a.city}, {a.country}</p>
            <div className="mp-address-card__actions">
              <button type="button" className="mp-address-card__edit" onClick={() => openEdit(a)}>Edit<span className="ac-visually-hidden"> {a.name}</span></button>
              <button type="button" className="mp-address-card__remove" aria-label={`Remove ${a.name}`} onClick={() => { if (confirm("Remove this address?")) persist(addresses.filter((x) => x.id !== a.id)); }}>Remove</button>
            </div>
          </div>
        ))}
      </div>
      {showForm ? (
        <form className="mp-form" onSubmit={handleSave}>
          <input
            id="address-name"
            aria-label="Address label"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "address-name-error" : undefined}
            className={`mp-input${errors.name ? " mp-input--error" : ""}`}
            placeholder="Label (e.g. Home)" value={form.name} onChange={handleChange("name")}
          />
          {errors.name && <p className="mp-field-error" id="address-name-error" role="alert">{errors.name}</p>}
          <input
            id="address-street"
            aria-label="Street address"
            aria-invalid={!!errors.street}
            aria-describedby={errors.street ? "address-street-error" : undefined}
            className={`mp-input${errors.street ? " mp-input--error" : ""}`}
            placeholder="Street address" value={form.street} onChange={handleChange("street")}
            autoComplete="street-address"
          />
          {errors.street && <p className="mp-field-error" id="address-street-error" role="alert">{errors.street}</p>}
          <div className="mp-form__row">
            <div>
              <input
                id="address-zip"
                aria-label="Postal code"
                aria-invalid={!!errors.zip}
                aria-describedby={errors.zip ? "address-zip-error" : undefined}
                className={`mp-input${errors.zip ? " mp-input--error" : ""}`}
                placeholder="ZIP" value={form.zip} onChange={handleChange("zip")}
                inputMode="numeric" autoComplete="postal-code"
              />
              {errors.zip && <p className="mp-field-error" id="address-zip-error" role="alert">{errors.zip}</p>}
            </div>
            <div>
              <input
                id="address-city"
                aria-label="City"
                aria-invalid={!!errors.city}
                aria-describedby={errors.city ? "address-city-error" : undefined}
                className={`mp-input${errors.city ? " mp-input--error" : ""}`}
                placeholder="City" value={form.city} onChange={handleChange("city")}
                autoComplete="address-level2"
              />
              {errors.city && <p className="mp-field-error" id="address-city-error" role="alert">{errors.city}</p>}
            </div>
          </div>
          <input
            id="address-country"
            aria-label="Country"
            aria-invalid={!!errors.country}
            aria-describedby={errors.country ? "address-country-error" : undefined}
            className={`mp-input${errors.country ? " mp-input--error" : ""}`}
            placeholder="Country" value={form.country} onChange={handleChange("country")}
            autoComplete="country-name"
          />
          {errors.country && <p className="mp-field-error" id="address-country-error" role="alert">{errors.country}</p>}
          <div className="mp-form__actions">
            <button type="submit" className="mp-btn-primary">{editingId ? "Update Address" : "Save Address"}</button>
            <button type="button" className="mp-btn-secondary" onClick={handleCancel}>Cancel</button>
          </div>
        </form>
      ) : (
        <button className="mp-btn-primary" style={{ marginTop: "1rem" }} onClick={() => { setEditingId(null); setForm(EMPTY_ADDR); setShowForm(true); }}>+ Add Address</button>
      )}
    </div>
  );
}

function ProfileSettings({ user }) {
  const [, , login] = useAuth();

  const [nameNew, setNameNew]       = useState("");
  const [nameRepeat, setNameRepeat] = useState("");
  const [nameError, setNameError]   = useState("");
  const [nameSaved, setNameSaved]   = useState(false);
  const [nameLoading, setNameLoading] = useState(false);

  const [emailNew, setEmailNew]       = useState("");
  const [emailError, setEmailError]   = useState("");
  const [emailPending, setEmailPending] = useState(null);
  const [emailSaved, setEmailSaved]   = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  const handleNameSave = async (e) => {
    e.preventDefault();
    setNameError("");
    const trimmed = nameNew.trim();
    if (!trimmed) { setNameError("Please enter a new username."); return; }
    if (trimmed === user?.name) { setNameError("New username must differ from your current one."); return; }
    if (trimmed !== nameRepeat.trim()) { setNameError("Usernames do not match."); return; }
    setNameLoading(true);
    try {
      const updated = await updateProfile({ name: trimmed });
      login({ ...user, ...updated });
      setNameNew(""); setNameRepeat("");
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 3000);
    } catch (err) {
      setNameError(err.response?.data?.message || "Failed to update username.");
    } finally {
      setNameLoading(false);
    }
  };

  const handleEmailRequest = (e) => {
    e.preventDefault();
    setEmailError("");
    const trimmed = emailNew.trim();
    if (!EMAIL_RE.test(trimmed)) {
      setEmailError("Please enter a valid email address (e.g. name@domain.com).");
      return;
    }
    if (trimmed === user?.email) {
      setEmailError("New email must differ from your current one.");
      return;
    }
    setEmailPending(trimmed);
    setEmailNew("");
  };

  const handleEmailConfirm = async () => {
    setEmailLoading(true);
    try {
      const updated = await updateProfile({ email: emailPending });
      login({ ...user, ...updated });
      setEmailPending(null);
      setEmailSaved(true);
      setTimeout(() => setEmailSaved(false), 3000);
    } catch (err) {
      setEmailError(err.response?.data?.message || "Failed to update email.");
      setEmailPending(null);
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <div>
      <h1 className="mp-section-title">Profile Settings</h1>

      <h2 className="mp-subsection-title">Change Username</h2>
      <p className="mp-current-value">Current: <strong>{user?.name}</strong></p>
      <form className="mp-form" onSubmit={handleNameSave}>
        <label className="mp-label" htmlFor="profile-name">New Username</label>
        <input
          id="profile-name"
          aria-invalid={!!nameError}
          aria-describedby={nameError ? "profile-name-error" : undefined}
          className={`mp-input${nameError ? " mp-input--error" : ""}`}
          value={nameNew}
          onChange={(e) => { setNameNew(e.target.value); setNameError(""); }}
          autoComplete="off"
          required
        />
        <label className="mp-label" htmlFor="profile-name-repeat">Repeat New Username</label>
        <input
          id="profile-name-repeat"
          aria-invalid={!!nameError}
          aria-describedby={nameError ? "profile-name-error" : undefined}
          className={`mp-input${nameError ? " mp-input--error" : ""}`}
          value={nameRepeat}
          onChange={(e) => { setNameRepeat(e.target.value); setNameError(""); }}
          autoComplete="off"
          required
        />
        {nameError && <p className="mp-field-error" id="profile-name-error" role="alert">{nameError}</p>}
        <div className="mp-form__actions">
          <button type="submit" className="mp-btn-primary" disabled={nameLoading}>
            {nameLoading ? "Saving…" : "Update Username"}
          </button>
        </div>
        <div role="status">{nameSaved && <p className="mp-success">Username updated successfully.</p>}</div>
      </form>

      <hr className="mp-divider" />

      <h2 className="mp-subsection-title">Change Email</h2>
      <p className="mp-current-value">Current: <strong>{user?.email}</strong></p>
      {emailPending ? (
        <div className="mp-email-pending">
          <p>Confirm that you want to change your email to <strong>{emailPending}</strong>.</p>
          <div className="mp-form__actions" style={{ marginTop: "1rem" }}>
            <button className="mp-btn-primary" onClick={handleEmailConfirm} disabled={emailLoading}>
              {emailLoading ? "Confirming…" : "Confirm Email Change"}
            </button>
            <button className="mp-btn-secondary" onClick={() => { setEmailPending(null); setEmailError(""); }}>Cancel</button>
          </div>
        </div>
      ) : (
        <form className="mp-form" onSubmit={handleEmailRequest}>
          <label className="mp-label" htmlFor="profile-email">New Email Address</label>
          <input
            id="profile-email"
            aria-invalid={!!emailError}
            aria-describedby={emailError ? "profile-email-error" : undefined}
            className={`mp-input${emailError ? " mp-input--error" : ""}`}
            type="email"
            value={emailNew}
            onChange={(e) => { setEmailNew(e.target.value); setEmailError(""); }}
            autoComplete="email"
            required
          />
          {emailError && <p className="mp-field-error" id="profile-email-error" role="alert">{emailError}</p>}
          <div className="mp-form__actions">
            <button type="submit" className="mp-btn-primary">Send Confirmation</button>
          </div>
          <div role="status">{emailSaved && <p className="mp-success">Email updated successfully.</p>}</div>
        </form>
      )}
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
      <h1 className="mp-section-title">Change Password</h1>
      <form className="mp-form" onSubmit={handleSave}>
        <label className="mp-label" htmlFor="password-current">Current Password</label>
        <input id="password-current" className="mp-input" type="password" value={form.current} onChange={(e) => setForm({ ...form, current: e.target.value })} autoComplete="current-password" required />
        <label className="mp-label" htmlFor="password-new">New Password</label>
        <input id="password-new" className="mp-input" type="password" value={form.next} onChange={(e) => setForm({ ...form, next: e.target.value })} autoComplete="new-password" required />
        <label className="mp-label" htmlFor="password-confirm">Confirm New Password</label>
        <input id="password-confirm" className="mp-input" type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} autoComplete="new-password" required />
        <div role="alert">{error && <p className="mp-error">{error}</p>}</div>
        <div role="status">{saved && <p className="mp-success">Password updated.</p>}</div>
        <div className="mp-form__actions">
          <button type="submit" className="mp-btn-primary">Update Password</button>
        </div>
      </form>
    </div>
  );
}

function MyPagesPage() {
  const [user, , , , initializing] = useAuth();
  const [, favorites] = useFavorites();
  const { data: orders, loading: ordersLoading } = useFetch(getMyOrders);
  const [activeTab, setActiveTab] = useState("dashboard");

  if (initializing || !user) return <div className="mp-page"><p className="loading">Loading…</p></div>;

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
      </aside>

      <div className="mp-content">
        {activeTab === "dashboard" && <Dashboard user={user} orders={orders} favorites={favorites} />}
        {activeTab === "orders"    && <OrderHistory orders={orders} loading={ordersLoading} />}
        {activeTab === "favorites" && <Favorites favorites={favorites} />}
        {activeTab === "addresses" && <SavedAddresses />}
        {activeTab === "profile"   && <ProfileSettings user={user} />}
        {activeTab === "password"  && <ChangePassword />}
      </div>
    </div>
  );
}

export default MyPagesPage;
