import { useState } from "react";

const PAYMENT_METHODS = [
  { value: "card",   label: "Credit / Debit Card", icon: "/icons/Card payments.png" },
  { value: "swish",  label: "Swish",               icon: "/icons/Swish.png" },
  { value: "klarna", label: "Klarna",               icon: "/icons/Klarna.png" },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[\d\s\-().]{7,20}$/;
const ZIP_RE   = /^[\d\s\-]{3,10}$/;

function validate(form) {
  const errors = [];
  if (!form.name.trim())
    errors.push({ field: "name", msg: "Full name is required." });
  if (!form.email.trim())
    errors.push({ field: "email", msg: "Email address is required." });
  else if (!EMAIL_RE.test(form.email.trim()))
    errors.push({ field: "email", msg: "Email must be formatted as: name@domain.com" });
  if (!form.phone.trim())
    errors.push({ field: "phone", msg: "Phone number is required." });
  else if (!PHONE_RE.test(form.phone.trim()))
    errors.push({ field: "phone", msg: "Phone number may only contain digits, +, spaces, and dashes." });
  if (!form.address.trim())
    errors.push({ field: "address", msg: "Street address is required." });
  if (!form.zip.trim())
    errors.push({ field: "zip", msg: "Postal code is required." });
  else if (!ZIP_RE.test(form.zip.trim()))
    errors.push({ field: "zip", msg: "Postal code may only contain digits." });
  if (!form.city.trim())
    errors.push({ field: "city", msg: "City is required." });
  return errors;
}

function PaymentForm({ onSubmit, initialValues = {} }) {
  const [form, setForm] = useState({
    name:    initialValues.name    ?? "",
    email:   initialValues.email   ?? "",
    phone:   initialValues.phone   ?? "",
    address: initialValues.address ?? "",
    zip:     initialValues.zip     ?? "",
    city:    initialValues.city    ?? "",
  });
  const [shipping, setShipping] = useState("standard");
  const [payment, setPayment] = useState("card");
  const [errors, setErrors] = useState([]);

  const shippingOptions = [
    { value: "standard", label: "Standard", meta: "3–5 days · 5 EUR",  carrier: "PostNord" },
    { value: "express",  label: "Express",  meta: "1–2 days · 19 EUR", carrier: "DHL" },
    { value: "pickup",   label: "Pickup",   meta: "In store · Free",   carrier: null },
  ];

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors.length)
      setErrors((prev) => prev.filter((err) => err.field !== e.target.name));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (errs.length) {
      setErrors(errs);
      document.getElementById("checkout-error-popup")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setErrors([]);
    const selectedOption = shippingOptions.find((o) => o.value === shipping);
    onSubmit({ ...form, shipping, payment, carrier: selectedOption?.carrier ?? null });
  };

  const fieldHasError = (field) => errors.some((e) => e.field === field);

  return (
    <form id="checkout-form" className="checkout-form" onSubmit={handleSubmit} noValidate>

      {errors.length > 0 && (
        <div id="checkout-error-popup" className="checkout-error-popup" role="alert">
          <div className="checkout-error-popup__header">
            <span className="checkout-error-popup__icon">⚠</span>
            <strong>Please fix the following before continuing</strong>
            <button
              type="button"
              className="checkout-error-popup__close"
              onClick={() => setErrors([])}
              aria-label="Dismiss errors"
            >✕</button>
          </div>
          <ul className="checkout-error-popup__list">
            {errors.map((err) => (
              <li key={err.field}>{err.msg}</li>
            ))}
          </ul>
        </div>
      )}

      <p className="checkout-section-title">Contact information</p>
      <input
        className={`apex-input${fieldHasError("name") ? " apex-input--error" : ""}`}
        type="text" name="name" placeholder="Full name"
        value={form.name} onChange={handleChange}
        autoComplete="name"
      />
      <input
        className={`apex-input${fieldHasError("email") ? " apex-input--error" : ""}`}
        type="email" name="email" placeholder="Email address (e.g. name@domain.com)"
        value={form.email} onChange={handleChange}
        inputMode="email" autoComplete="email"
      />
      <input
        className={`apex-input${fieldHasError("phone") ? " apex-input--error" : ""}`}
        type="tel" name="phone" placeholder="Phone number"
        value={form.phone} onChange={handleChange}
        autoComplete="tel"
      />

      <p className="checkout-section-title">Shipping address</p>
      <input
        className={`apex-input${fieldHasError("address") ? " apex-input--error" : ""}`}
        type="text" name="address" placeholder="Street address"
        value={form.address} onChange={handleChange}
        autoComplete="street-address"
      />
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <input
          className={`apex-input${fieldHasError("zip") ? " apex-input--error" : ""}`}
          type="text" name="zip" placeholder="Postal code"
          value={form.zip} onChange={handleChange}
          autoComplete="postal-code"
        />
        <input
          className={`apex-input${fieldHasError("city") ? " apex-input--error" : ""}`}
          type="text" name="city" placeholder="City"
          value={form.city} onChange={handleChange}
          autoComplete="address-level2"
        />
      </div>

      <p className="checkout-section-title">Shipping method</p>
      <div className="shipping-options">
        {shippingOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={`shipping-option${shipping === opt.value ? " shipping-option--active" : ""}`}
            onClick={() => setShipping(opt.value)}
          >
            <span className="shipping-option__radio" />
            <span className="shipping-option__body">
              <span className="shipping-option__label">{opt.label}{opt.carrier ? ` · ${opt.carrier}` : ""}</span>
              <span className="shipping-option__meta">{opt.meta}</span>
            </span>
          </button>
        ))}
      </div>

      <p className="checkout-section-title">Payment method</p>
      <div className="payment-methods">
        {PAYMENT_METHODS.map((m) => (
          <button
            key={m.value}
            type="button"
            className={`payment-method${payment === m.value ? " payment-method--active" : ""}`}
            onClick={() => setPayment(m.value)}
          >
            <img src={m.icon} alt={m.label} className="payment-method__icon" />
            <span className="payment-method__label">{m.label}</span>
          </button>
        ))}
      </div>

    </form>
  );
}

export default PaymentForm;
