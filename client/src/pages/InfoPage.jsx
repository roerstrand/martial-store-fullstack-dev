import { useParams, Link } from "react-router-dom";
import "./Pages.css";
import PageNav from "../components/PageNav";

const INFO_CONTENT = {
  about: {
    title: "About Us",
    sections: [
      {
        heading: "Our origin",
        body: "Apex Core was founded by martial artists, for martial artists. We got tired of compromising on gear that doesn't hold up — and decided to do something about it. Every product we sell is tested and approved by active practitioners.",
      },
      {
        heading: "Our vision",
        body: "To be the go-to destination for serious martial artists. We believe the right equipment makes a difference — not just in performance, but in safety and longevity.",
      },
      {
        heading: "Quality above all",
        body: "We carefully select every product we carry. Nothing is sold without passing our quality control. If you're not satisfied — neither are we.",
      },
    ],
  },
  shipping: {
    title: "Shipping",
    sections: [
      {
        heading: "Delivery times",
        body: "Standard delivery: 2–5 business days. Express (1–2 days) available at checkout. Orders placed before 2 PM ship the same day.",
      },
      {
        heading: "Shipping rates",
        body: "Free shipping on orders over  EUR99. Below that:  EUR4.99 standard,  EUR9.99 express. We ship across Europe.",
      },
      {
        heading: "Tracking",
        body: "You'll receive a tracking number by email as soon as your order is dispatched. Log in under My Pages to check your order status in real time.",
      },
      {
        heading: "International orders",
        body: "We ship to all EU countries. Delivery time 5–10 business days. Any customs charges are the responsibility of the recipient.",
      },
    ],
  },
  returns: {
    title: "Returns & Exchanges",
    sections: [
      {
        heading: "30-day returns",
        body: "We offer 30-day returns on all products. Items must be unused, in original packaging, and in undamaged condition.",
      },
      {
        heading: "How to return",
        body: "1. Log in to My Pages and select your order.\n2. Choose the items you want to return.\n3. Print the return label (sent to your email).\n4. Drop the package at your nearest carrier location.",
      },
      {
        heading: "Refunds",
        body: "Refunds are issued to your original payment method within 5–10 business days after we receive and approve the return.",
      },
      {
        heading: "Defective items",
        body: "Received a defective item? Contact us at support@apexcore.com with a photo of the fault — we'll sort it out immediately.",
      },
    ],
  },
  faq: {
    title: "FAQ",
    sections: [
      {
        heading: "How do I choose the right size?",
        body: "Each product page has a size guide specific to that product. As a general rule — when in doubt, size up. Martial arts gear fits better with a little room.",
      },
      {
        heading: "Can I change my order?",
        body: "Contact us within 1 hour of placing your order at support@apexcore.com. If the order hasn't shipped yet, we can modify or cancel it.",
      },
      {
        heading: "What payment methods do you accept?",
        body: "We accept Visa, Mastercard, Klarna (invoice, instalment), and Swish.",
      },
      {
        heading: "Do you sell to clubs and gyms?",
        body: "Yes! We offer volume discounts for clubs and gyms buying gear in bulk. Contact us at b2b@apexcore.com for a quote.",
      },
      {
        heading: "How long does the gear last?",
        body: "It depends on use and maintenance. Gloves used daily should be replaced every 1–2 years.",
      },
    ],
  },
  contact: {
    title: "Contact",
    sections: [
      {
        heading: "Customer support",
        body: "Email: support@apexcore.com\nResponse time: within 24 hours on weekdays\nHours: Mon–Fri 9 AM – 5 PM",
      },
      {
        heading: "B2B & Partnerships",
        body: "Email: b2b@apexcore.com\nFor wholesale, club agreements, and sponsorship enquiries.",
      },
      {
        heading: "Press & Media",
        body: "Email: press@apexcore.com\nPress materials and product images available on request.",
      },
      {
        heading: "Address",
        body: "Apex Core\n1 Fight Street\nLondon EC1A 1BB",
      },
    ],
  },
};

function InfoPage() {
  const { slug } = useParams();
  const page = INFO_CONTENT[slug];

  if (!page) return <p className="loading">Page not found.</p>;

  return (
    <div className="info-page">
      <PageNav back="/" backLabel="Back to Home" />
      <div className="info-page__header">
        <h1>{page.title}</h1>
      </div>
      <div className="info-page__body">
        {page.sections.map((s, i) => (
          <div key={i} className="info-page__section">
            <h2>{s.heading}</h2>
            {s.body.split("\n").map((line, j) => (
              <p key={j}>{line}</p>
            ))}
          </div>
        ))}
        <Link to="/" className="auth-btn-secondary" style={{ display: "inline-flex", marginTop: "2rem" }}>
          ‹ BACK
        </Link>
      </div>
    </div>
  );
}

export default InfoPage;
