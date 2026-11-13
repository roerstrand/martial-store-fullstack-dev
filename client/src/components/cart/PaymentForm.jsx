import { useState } from "react";

const PAYMENT_METHODS = [
  { value: "card",   label: "Credit / Debit Card", icon: "/icons/Card payments.png" },
  { value: "swish",  label: "Swish",               icon: "/icons/Swish.png" },
  { value: "klarna", label: "Klarna",               icon: "/icons/Klarna.png" },
];

const SHIPPING_OPTIONS = [
  { value: "standard", label: "Standard", meta: "3–5 days", price: "5 EUR",  carrier: "PostNord" },
  { value: "express",  label: "Express",  meta: "1–2 days", price: "19 EUR", carrier: "DHL" },
  { value: "pickup",   label: "Pickup",   meta: "In store", price: "Free",   carrier: null },
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

function Field({ name, label, error, ...inputProps }) {
  return (
    <label className={`ac-field${error ? " ac-field--error" : ""}`} htmlFor={`co-${name}`}>
      <span className="ac-field__label">{label}</span>
      <input
        id={`co-${name}`}
        name={name}
        aria-invalid={!!error}
        aria-describedby={error ? `co-${name}-err` : undefined}
        {...inputProps}
      />
      {error && <span className="ac-field__err" id={`co-${name}-err`}>{error}</span>}
    </label>
  );
}

function PaymentForm({ onSubmit, initialValues = {}, onShippingChange }) {
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

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors.length)
      setErrors((prev) => prev.filter((err) => err.field !== e.target.name));
  };

  const chooseShipping = (value) => {
    setShipping(value);
    onShippingChange?.(value);
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
    const selectedOption = SHIPPING_OPTIONS.find((o) => o.value === shipping);
    onSubmit({ ...form, shipping, payment, carrier: selectedOption?.carrier ?? null });
  };

  const errorFor = (field) => errors.find((e) => e.field === field)?.msg;

  return (
    <form id="checkout-form" className="checkout-form ac-checkout__form ac-glass-frost" onSubmit={handleSubmit} noValidate>

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

      <fieldset className="ac-fieldset">
        <legend><span>1</span>Contact information</legend>
        <Field name="name" label="Full name" type="text" placeholder="Jane Fighter"
          value={form.name} onChange={handleChange} autoComplete="name" error={errorFor("name")} />
        <div className="ac-field-row ac-field-row--2">
          <Field name="email" label="Email address" type="email" placeholder="name@domain.com"
            value={form.email} onChange={handleChange} inputMode="email" autoComplete="email" error={errorFor("email")} />
          <Field name="phone" label="Phone number" type="tel" placeholder="+46 70 123 45 67"
            value={form.phone} onChange={handleChange} autoComplete="tel" error={errorFor("phone")} />
        </div>
      </fieldset>

      <fieldset className="ac-fieldset">
        <legend><span>2</span>Shipping address</legend>
        <Field name="address" label="Street address" type="text" placeholder="Street and number"
          value={form.address} onChange={handleChange} autoComplete="street-address" error={errorFor("address")} />
        <div className="ac-field-row">
          <Field name="zip" label="Postal code" type="text" placeholder="123 45"
            value={form.zip} onChange={handleChange} autoComplete="postal-code" error={errorFor("zip")} />
          <Field name="city" label="City" type="text" placeholder="Stockholm"
            value={form.city} onChange={handleChange} autoComplete="address-level2" error={errorFor("city")} />
        </div>
      </fieldset>

      <fieldset className="ac-fieldset">
        <legend><span>3</span>Shipping method</legend>
        <div className="ac-options" role="radiogroup" aria-label="Shipping method">
          {SHIPPING_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={shipping === opt.value}
              className={`ac-option${shipping === opt.value ? " is-active" : ""}`}
              onClick={() => chooseShipping(opt.value)}
            >
              <span className="ac-option__radio" />
              <span className="ac-option__body">
                <span className="ac-option__label">{opt.label}</span>
                <span className="ac-option__meta">{opt.meta}{opt.carrier ? ` · ${opt.carrier}` : ""}</span>
                <span className="ac-option__price">{opt.price}</span>
              </span>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="ac-fieldset">
        <legend><span>4</span>Payment method</legend>
        <div className="ac-options ac-options--pay" role="radiogroup" aria-label="Payment method">
          {PAYMENT_METHODS.map((m) => (
            <button
              key={m.value}
              type="button"
              role="radio"
              aria-checked={payment === m.value}
              className={`ac-option${payment === m.value ? " is-active" : ""}`}
              onClick={() => setPayment(m.value)}
            >
              <span className="ac-option__radio" />
              <span className="ac-option__body">
                <span className="ac-option__label">{m.label}</span>
              </span>
              <img src={m.icon} alt="" />
            </button>
          ))}
        </div>
      </fieldset>

    </form>
  );
}

export default PaymentForm;
