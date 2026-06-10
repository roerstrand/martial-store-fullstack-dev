import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import ErrorBoundary from "./components/ErrorBoundary";
import CartToast from "./components/CartToast";
import FavoriteToast from "./components/favorites/FavoriteToast";
import ScrollToTop from "./components/ScrollToTop";

import MainLayout from "./layouts/MainLayout";
import MinimalLayout from "./layouts/MinimalLayout";
import PrivateRoute from "./components/PrivateRoute";

import HomePage from "./pages/HomePage";
import ProductListPage from "./pages/products/ProductListPage";
import ProductDetailPage from "./pages/products/ProductDetailPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import CartPage from "./pages/cart/CartPage";
import CheckoutPage from "./pages/cart/CheckoutPage";
import ContactPage from "./pages/ContactPage";
import FavoritesPage from "./pages/FavoritesPage";
import NotFoundPage from "./pages/NotFoundPage";
import OrderConfirmationPage from "./pages/cart/OrderConfirmationPage";
import OrderPage from "./pages/cart/OrderPage";
import MyPagesPage from "./pages/MyPagesPage";
import ArticlePage from "./pages/ArticlePage";
import ArticleListPage from "./pages/ArticleListPage";
import InfoPage from "./pages/InfoPage";
import AdminPage from "./pages/admin/AdminPage";

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
        </Route>

        <Route element={<MinimalLayout />}>
          <Route path="/products" element={<ErrorBoundary><ProductListPage /></ErrorBoundary>} />
          <Route path="/products/:productId" element={<ErrorBoundary><ProductDetailPage /></ErrorBoundary>} />
          <Route path="/login" element={<ErrorBoundary><LoginPage /></ErrorBoundary>} />
          <Route path="/register" element={<ErrorBoundary><RegisterPage /></ErrorBoundary>} />
          <Route path="/cart" element={<ErrorBoundary><CartPage /></ErrorBoundary>} />
          <Route path="/contact" element={<ErrorBoundary><ContactPage /></ErrorBoundary>} />
          <Route path="/articles" element={<ErrorBoundary><ArticleListPage /></ErrorBoundary>} />
          <Route path="/articles/:id" element={<ErrorBoundary><ArticlePage /></ErrorBoundary>} />
          <Route path="/favorites" element={<ErrorBoundary><FavoritesPage /></ErrorBoundary>} />
          <Route path="/info/:slug" element={<ErrorBoundary><InfoPage /></ErrorBoundary>} />
          <Route path="/checkout" element={<ErrorBoundary><CheckoutPage /></ErrorBoundary>} />
          <Route path="/confirmation" element={<ErrorBoundary><OrderConfirmationPage /></ErrorBoundary>} />

          <Route element={<PrivateRoute />}>
            <Route path="/orders/:orderId" element={<ErrorBoundary><OrderPage /></ErrorBoundary>} />
            <Route path="/my-pages" element={<ErrorBoundary><MyPagesPage /></ErrorBoundary>} />
            <Route path="/admin" element={<ErrorBoundary><AdminPage /></ErrorBoundary>} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <CartToast />
      <FavoriteToast />
    </Router>
  );
}

export default App;
