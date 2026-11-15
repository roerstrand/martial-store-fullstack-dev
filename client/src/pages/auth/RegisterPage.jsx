import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../Pages.css";
import useInput from "../../hooks/useInput.jsx";
import { register } from "../../services/authService";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function RegisterPage() {
  const username = useInput("");
  const email = useInput("");
  const password = useInput("");
  const repeatPassword = useInput("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!EMAIL_RE.test(email.value.trim())) {
      setError("Please enter a valid email address (e.g. name@domain.com).");
      return;
    }
    if (password.value !== repeatPassword.value) {
      setError("Passwords do not match.");
      return;
    }
    if (password.value.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      await register({ name: username.value, email: email.value, password: password.value });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Create Account</h1>
        <p className="auth-tagline">Join the Apex Core family</p>

        <div role="alert">
          {error && <div className="auth-error" id="register-error">{error}</div>}
        </div>

        <form className="auth-form" onSubmit={handleRegister}>
          <label htmlFor="register-username" className="auth-label">Username</label>
          <input id="register-username" className="apex-input" type="text" placeholder="Username" autoComplete="username" {...username.inputProps} required />
          <label htmlFor="register-email" className="auth-label">Email</label>
          <input id="register-email" className="apex-input" type="email" placeholder="name@domain.com" autoComplete="email" aria-describedby={error ? "register-error" : undefined} {...email.inputProps} required />
          <label htmlFor="register-password" className="auth-label">Password</label>
          <input id="register-password" className="apex-input" type="password" placeholder="At least 6 characters" autoComplete="new-password" aria-describedby="register-password-hint" {...password.inputProps} required />
          <span id="register-password-hint" className="ac-visually-hidden">At least 6 characters.</span>
          <label htmlFor="register-repeat" className="auth-label">Repeat password</label>
          <input id="register-repeat" className="apex-input" type="password" placeholder="Repeat password" autoComplete="new-password" {...repeatPassword.inputProps} required />
          <button type="submit" className="auth-btn-primary" disabled={loading}>
            {loading ? "CREATING..." : "REGISTER ›"}
          </button>
          <Link to="/" className="auth-btn-secondary">BACK TO HOME ›</Link>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
