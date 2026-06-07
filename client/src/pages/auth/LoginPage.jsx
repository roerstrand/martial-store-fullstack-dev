import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../Pages.css";
import useInput from "../../hooks/useInput.jsx";
import { login as loginService } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

function LoginPage() {
  const username = useInput("");
  const password = useInput("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [, , login] = useAuth();
  const from = location.state?.from?.pathname || "/";

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginService({
        username: username.value,
        password: password.value,
      });
      login(data.user, data.token);
      navigate(from, { replace: true });
    } catch (err) {
      if (!err.response) {
        setError("Cannot connect to server. Is the backend running?");
      } else {
        setError(err.response.data?.message || `Error ${err.response.status}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Login</h1>
        <p className="auth-tagline">Welcome back, warrior</p>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleLogin} autoComplete="off">
          <input
            className="apex-input"
            type="text"
            placeholder="Username"
            autoComplete="username"
            {...username}
            required
          />
          <input
            className="apex-input"
            type="password"
            placeholder="Password"
            autoComplete="current-password"
            {...password}
            required
          />
          <button type="submit" className="auth-btn-primary" disabled={loading}>
            {loading ? "LOGGING IN..." : "LOGIN ›"}
          </button>
          <Link to="/register" className="auth-btn-secondary">
            REGISTER ›
          </Link>
          <Link to="/" className="auth-btn-secondary">
            BACK TO HOME ›
          </Link>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
