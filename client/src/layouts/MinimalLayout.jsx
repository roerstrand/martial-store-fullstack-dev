import { Outlet, Link, useMatch } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoriteContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function MinimalLayout() {
  const [cart] = useCart();
  const [, favorites] = useFavorites();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const favCount = favorites.length;

  const onProductsPage  = !!useMatch("/products");
  const onProductDetail = !!useMatch("/products/:productId");
  const showCartBar = cartCount > 0 && (onProductsPage || onProductDetail);

  return (
    <div className="app">
      <Navbar variant="light" />

      {showCartBar && (
        <div className="ml-cart-bar">
          <Link to="/favorites" className="ac-btn ac-btn--outline">
            Favorites{favCount > 0 ? ` (${favCount})` : ""}
          </Link>
          <Link to="/cart" className="ac-btn ac-btn--ink">View Cart ({cartCount})</Link>
          <Link to="/checkout" className="ac-btn ac-btn--primary">Checkout ›</Link>
        </div>
      )}

      <main className="content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default MinimalLayout;
