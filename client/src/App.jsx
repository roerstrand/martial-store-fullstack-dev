import { lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import ErrorBoundary from "./components/ErrorBoundary";
import CartToast from "./components/CartToast";
import FavoriteToast from "./components/favorites/FavoriteToast";
import ScrollToTop from "./components/ScrollToTop";
import BackToTop from "./components/BackToTop";
import DocumentTitle from "./components/DocumentTitle";

import MainLayout from "./layouts/MainLayout";
import MinimalLayout from "./layouts/MinimalLayout";
import PrivateRoute from "./components/PrivateRoute";

import HomePage from "./pages/HomePage";
import "./styles/apex-glass.css";
import "./styles/apex-glass-ui.css";
import "./styles/accessibility.css";

const ProductListPage = lazy(() => import("./pages/products/ProductListPage"));
const ProductDetailPage = lazy(() => import("./pages/products/ProductDetailPage"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("./pages/auth/RegisterPage"));
const CartPage = lazy(() => import("./pages/cart/CartPage"));
const CheckoutPage = lazy(() => import("./pages/cart/CheckoutPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const FavoritesPage = lazy(() => import("./pages/FavoritesPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const OrderConfirmationPage = lazy(() => import("./pages/cart/OrderConfirmationPage"));
const OrderPage = lazy(() => import("./pages/cart/OrderPage"));
const MyPagesPage = lazy(() => import("./pages/MyPagesPage"));
const ArticlePage = lazy(() => import("./pages/ArticlePage"));
const ArticleListPage = lazy(() => import("./pages/ArticleListPage"));
const InfoPage = lazy(() => import("./pages/InfoPage"));
const AdminPage = lazy(() => import("./pages/admin/AdminPage"));

function App() {
  return (
    <Router>
      <ScrollToTop />
      <DocumentTitle />
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

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
      <CartToast />
      <FavoriteToast />
      <BackToTop />
    </Router>
  );
}

export default App;
