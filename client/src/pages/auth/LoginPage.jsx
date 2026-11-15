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
      login(data.user);
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

        <div role="alert">
          {error && <div className="auth-error" id="login-error">{error}</div>}
        </div>

        <form className="auth-form" onSubmit={handleLogin}>
          <label htmlFor="login-username" className="auth-label">Username</label>
          <input
            id="login-username"
            className="apex-input"
            type="text"
            placeholder="Username"
            autoComplete="username"
            aria-describedby={error ? "login-error" : undefined}
            {...username.inputProps}
            required
          />
          <label htmlFor="login-password" className="auth-label">Password</label>
          <input
            id="login-password"
            className="apex-input"
            type="password"
            placeholder="Password"
            autoComplete="current-password"
            aria-describedby={error ? "login-error" : undefined}
            {...password.inputProps}
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
