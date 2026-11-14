import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <section className="ac-notfound">
      <div className="ac-notfound__panel ac-glass-frost">
        <p className="ac-eyebrow">Error 404</p>
        <h1 className="ac-notfound__code">404</h1>
        <h2 className="ac-h2">Page not found</h2>
        <p className="ac-lead">We could not find the page you are looking for.</p>
        <div className="ac-notfound__ctas">
          <Link to="/" className="ac-btn ac-btn--primary ac-btn--lg">Back to home</Link>
          <Link to="/products" className="ac-btn ac-btn--outline ac-btn--lg">All products</Link>
        </div>
      </div>
    </section>
  );
}

export default NotFoundPage;
