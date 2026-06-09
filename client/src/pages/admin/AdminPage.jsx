import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  adminGetAllOrders,
  adminUpdateOrderStatus,
  adminDeleteOrder,
  adminGetAllUsers,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
} from "../../services/adminService";
import { getProducts } from "../../services/productService";
import "../Pages.css";

const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];
const CATEGORIES = ["bjj", "boxing", "muaythai", "karate"];

const EMPTY_PRODUCT = {
  title: "", price: "", description: "", category: "bjj",
  image: "", sale: 0, rating: 4, sold: 0,
};

function AdminPage() {
  const [user] = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("products");

  const [products, setProducts]   = useState([]);
  const [orders, setOrders]       = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");

  const [editProduct, setEditProduct] = useState(null);
  const [productForm, setProductForm] = useState(EMPTY_PRODUCT);
  const [showForm, setShowForm]       = useState(false);
  const [saving, setSaving]           = useState(false);
  const [toast, setToast]             = useState("");

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
    }
  }, [user]);

  useEffect(() => {
    loadTab(tab);
  }, [tab]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const loadTab = async (t) => {
    setLoading(true);
    setError("");
    try {
      if (t === "products")  setProducts(await getProducts());
      if (t === "orders")    setOrders(await adminGetAllOrders());
      if (t === "customers") setCustomers(await adminGetAllUsers());
    } catch {
      setError("Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Products ── */
  const openCreate = () => {
    setEditProduct(null);
    setProductForm(EMPTY_PRODUCT);
    setShowForm(true);
  };

  const openEdit = (p) => {
    setEditProduct(p);
    setProductForm({
      title: p.title, price: p.price, description: p.description,
      category: p.category, image: p.image ?? "", sale: p.sale ?? 0,
      rating: p.rating ?? 0, sold: p.sold ?? 0,
    });
    setShowForm(true);
  };

  const handleProductSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...productForm,
        price: Number(productForm.price),
        sale: Number(productForm.sale),
        rating: Number(productForm.rating),
        sold: Number(productForm.sold),
      };
      if (editProduct) {
        const updated = await adminUpdateProduct(editProduct._id, payload);
        setProducts(prev => prev.map(p => p._id === updated._id ? updated : p));
        showToast("Product updated.");
      } else {
        const created = await adminCreateProduct(payload);
        setProducts(prev => [...prev, created]);
        showToast("Product created.");
      }
      setShowForm(false);
    } catch {
      setError("Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm("Delete this product?")) return;
    try {
      await adminDeleteProduct(id);
      setProducts(prev => prev.filter(p => p._id !== id));
      showToast("Product deleted.");
    } catch {
      setError("Delete failed.");
    }
  };

  /* ── Orders ── */
  const handleStatusChange = async (orderId, status) => {
    try {
      const updated = await adminUpdateOrderStatus(orderId, status);
      setOrders(prev => prev.map(o => o._id === updated._id ? updated : o));
      showToast("Status updated.");
    } catch {
      setError("Status update failed.");
    }
  };

  const handleDeleteOrder = async (id) => {
    if (!confirm("Delete this order?")) return;
    try {
      await adminDeleteOrder(id);
      setOrders(prev => prev.filter(o => o._id !== id));
      showToast("Order deleted.");
    } catch {
      setError("Delete failed.");
    }
  };

  const pf = (key, val) => setProductForm(f => ({ ...f, [key]: val }));

  return (
    <div className="admin-page">
      {toast && <div className="admin-toast">{toast}</div>}

      <div className="admin-header">
        <div>
          <p className="admin-header__eyebrow">Admin Panel</p>
          <h1 className="admin-header__title">Dashboard</h1>
        </div>
        <Link to="/" className="admin-back-btn">‹ Back to site</Link>
      </div>

      <nav className="admin-tabs">
        {["products", "orders", "customers"].map(t => (
          <button
            key={t}
            className={`admin-tab${tab === t ? " admin-tab--active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </nav>

      {error && <p className="admin-error">{error}</p>}

      <div className="admin-content">
        {/* ── PRODUCTS ── */}
        {tab === "products" && (
          <div>
            <div className="admin-section-bar">
              <span className="admin-section-bar__count">{products.length} products</span>
              <button className="admin-btn-primary" onClick={openCreate}>+ Add product</button>
            </div>

            {showForm && (
              <form className="admin-form" onSubmit={handleProductSave}>
                <p className="admin-form__title">{editProduct ? "Edit product" : "New product"}</p>
                <div className="admin-form__grid">
                  <div className="admin-form__field">
                    <label>Title</label>
                    <input className="admin-input" value={productForm.title} onChange={e => pf("title", e.target.value)} required />
                  </div>
                  <div className="admin-form__field">
                    <label>Price (EUR)</label>
                    <input className="admin-input" type="number" min="0" value={productForm.price} onChange={e => pf("price", e.target.value)} required />
                  </div>
                  <div className="admin-form__field admin-form__field--wide">
                    <label>Description</label>
                    <textarea className="admin-input admin-textarea" value={productForm.description} onChange={e => pf("description", e.target.value)} required />
                  </div>
                  <div className="admin-form__field">
                    <label>Category</label>
                    <select className="admin-input" value={productForm.category} onChange={e => pf("category", e.target.value)}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="admin-form__field">
                    <label>Image filename</label>
                    <input className="admin-input" value={productForm.image} onChange={e => pf("image", e.target.value)} placeholder="e.g. bjj_gi.jpg" />
                  </div>
                  <div className="admin-form__field">
                    <label>Sale %</label>
                    <input className="admin-input" type="number" min="0" max="100" value={productForm.sale} onChange={e => pf("sale", e.target.value)} />
                  </div>
                  <div className="admin-form__field">
                    <label>Rating (1–5)</label>
                    <input className="admin-input" type="number" min="1" max="5" value={productForm.rating} onChange={e => pf("rating", e.target.value)} />
                  </div>
                </div>
                <div className="admin-form__actions">
                  <button type="submit" className="admin-btn-primary" disabled={saving}>
                    {saving ? "Saving..." : editProduct ? "Save changes" : "Create product"}
                  </button>
                  <button type="button" className="admin-btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                </div>
              </form>
            )}

            {!loading && products.length > 0 && (() => {
              const totalSold    = products.reduce((s, p) => s + (p.sold || 0), 0);
              const totalRevenue = products.reduce((s, p) => s + (p.sold || 0) * p.price, 0);
              const chartData    = [...products]
                .filter(p => (p.sold || 0) > 0)
                .sort((a, b) => b.sold - a.sold)
                .map(p => ({
                  name: p.title.length > 16 ? p.title.slice(0, 15) + "…" : p.title,
                  sold: p.sold,
                  revenue: p.sold * p.price,
                }));

              return (
                <>
                  <div className="admin-stats-row">
                    <div className="admin-stat-card">
                      <span className="admin-stat-card__label">Products</span>
                      <strong className="admin-stat-card__value">{products.length}</strong>
                    </div>
                    <div className="admin-stat-card">
                      <span className="admin-stat-card__label">Units sold</span>
                      <strong className="admin-stat-card__value">{totalSold}</strong>
                    </div>
                    <div className="admin-stat-card">
                      <span className="admin-stat-card__label">Est. revenue</span>
                      <strong className="admin-stat-card__value">{totalRevenue.toLocaleString("sv-SE")} EUR</strong>
                    </div>
                  </div>

                  {chartData.length > 0 && (() => {
                    const max = Math.max(...chartData.map(d => d.sold));
                    return (
                      <div className="admin-chart">
                        <p className="admin-chart__title">Units sold per product</p>
                        <div className="admin-chart__bars">
                          {chartData.map((d, i) => (
                            <div key={i} className="admin-chart__col">
                              <span className="admin-chart__val">{d.sold}</span>
                              <div className="admin-chart__bar-wrap">
                                <div
                                  className={`admin-chart__bar${i === 0 ? " admin-chart__bar--top" : ""}`}
                                  style={{ height: `${Math.round((d.sold / max) * 100)}%` }}
                                />
                              </div>
                              <span className="admin-chart__label">{d.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </>
              );
            })()}

            {loading ? <p className="loading">Loading...</p> : (
              <div className="admin-table">
                <div className="admin-table__head admin-table__head--products">
                  <span>Product</span><span>Category</span><span>Price</span><span>Sale</span><span>Rating</span><span>Sold</span><span />
                </div>
                {products.map(p => (
                  <div key={p._id} className="admin-table__row admin-table__row--products">
                    <span className="admin-table__name">{p.title}</span>
                    <span className="admin-table__badge">{p.category}</span>
                    <span>{p.price}  EUR</span>
                    <span>{p.sale > 0 ? `-${p.sale}%` : "—"}</span>
                    <span>{p.rating}</span>
                    <span>{p.sold ?? 0}</span>
                    <div className="admin-table__actions">
                      <button className="admin-btn-edit" onClick={() => openEdit(p)}>Edit</button>
                      <button className="admin-btn-delete" onClick={() => handleDeleteProduct(p._id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ORDERS ── */}
        {tab === "orders" && (
          <div>
            <div className="admin-section-bar">
              <span className="admin-section-bar__count">{orders.length} orders</span>
            </div>
            {loading ? <p className="loading">Loading...</p> : (
              <div className="admin-table">
                <div className="admin-table__head admin-table__head--orders">
                  <span>Order ID</span><span>Customer</span><span>Total</span><span>Status</span><span />
                </div>
                {orders.map(o => (
                  <div key={o._id} className="admin-table__row admin-table__row--orders">
                    <span className="admin-table__id">#{o._id.slice(-8).toUpperCase()}</span>
                    <span className="admin-table__muted">{o.user_id?.name ?? o.user_id ?? "—"}</span>
                    <span>{o.totalPrice} EUR</span>
                    <select
                      className="admin-status-select"
                      value={o.status}
                      onChange={e => handleStatusChange(o._id, e.target.value)}
                    >
                      {ORDER_STATUSES.map(s => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                    <div className="admin-table__actions">
                      <button className="admin-btn-delete" onClick={() => handleDeleteOrder(o._id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── CUSTOMERS ── */}
        {tab === "customers" && (
          <div>
            <div className="admin-section-bar">
              <span className="admin-section-bar__count">{customers.length} users</span>
            </div>
            {loading ? <p className="loading">Loading...</p> : (
              <div className="admin-table">
                <div className="admin-table__head admin-table__head--customers">
                  <span>Name</span><span>Email</span><span>Role</span><span>Joined</span>
                </div>
                {customers.map(c => (
                  <div key={c._id} className="admin-table__row admin-table__row--customers">
                    <span className="admin-table__name">{c.name}</span>
                    <span className="admin-table__muted">{c.email}</span>
                    <span className={`admin-table__badge${c.role === "admin" ? " admin-table__badge--admin" : ""}`}>
                      {c.role}
                    </span>
                    <span className="admin-table__muted">
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString("sv-SE") : "—"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPage;
