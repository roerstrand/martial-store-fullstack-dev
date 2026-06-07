import { useState } from "react";
import useInput from "../hooks/useInput.jsx";
import "./Pages.css";
import PageNav from "../components/PageNav";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const INFO = [
  { label: "Email",   value: "hello@apexcore.com" },
  { label: "Phone",   value: "+44 (0) 20 1234 5678" },
  { label: "Address", value: "1 Main Street\nLondon EC1A 1BB" },
  { label: "Hours",   value: "Mon – Fri  09:00 – 17:00\nWeekends  Closed" },
];

function ContactPage() {
  const name    = useInput("");
  const email   = useInput("");
  const message = useInput("");
  const [submitted, setSubmitted] = useState(false);
  const [emailError, setEmailError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email.value.trim())) {
      setEmailError("Please enter a valid email address (e.g. name@domain.com).");
      return;
    }
    setEmailError("");
    setSubmitted(true);
    name.reset();
    email.reset();
    message.reset();
    setTimeout(() => setSubmitted(false), 6000);
  };

  return (
    <div className="contact-page">
      <PageNav back="/" backLabel="Back to Home" />
      <div className="contact-hero">
        <p className="contact-hero__eyebrow">Get in touch</p>
        <h1 className="contact-hero__heading">Contact Us</h1>
        <p className="contact-hero__sub">We usually respond within 24 hours.</p>
      </div>

      <div className="contact-body">

        <aside className="contact-info">
          <p className="contact-info__heading">Apex Core HQ</p>
          <div className="contact-info__items">
            {INFO.map((item) => (
              <div key={item.label} className="contact-info__item">
                <span className="contact-info__label">{item.label}</span>
                <span className="contact-info__value">
                  {item.value.split("\n").map((line, i) => (
                    <span key={i}>{line}<br /></span>
                  ))}
                </span>
              </div>
            ))}
          </div>

          <div className="contact-info__social">
            <p className="contact-info__label">Follow us</p>
            <div className="contact-social-links">
              <a href="#" className="contact-social-link">Instagram</a>
              <a href="#" className="contact-social-link">Facebook</a>
              <a href="#" className="contact-social-link">YouTube</a>
            </div>
          </div>
        </aside>

        <section className="contact-form-wrap">
          {submitted ? (
            <div className="contact-success">
              <span className="contact-success__icon">✓</span>
              <h2 className="contact-success__heading">Message sent</h2>
              <p className="contact-success__text">Thank you — we'll be in touch shortly.</p>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="contact-form__row">
                <div className="contact-field">
                  <label className="contact-label">Name</label>
                  <input className="contact-input" type="text" placeholder="Your name" {...name} required />
                </div>
                <div className="contact-field">
                  <label className="contact-label">Email</label>
                  <input className="contact-input" type="email" placeholder="your@email.com" {...email} required />
                  {emailError && <p className="contact-field-error">{emailError}</p>}
                </div>
              </div>
              <div className="contact-field">
                <label className="contact-label">Message</label>
                <textarea className="contact-input contact-input--textarea" placeholder="How can we help you?" rows={6} {...message} required />
              </div>
              <button type="submit" className="contact-submit">Send message</button>
            </form>
          )}
        </section>

      </div>
    </div>
  );
}

export default ContactPage;
