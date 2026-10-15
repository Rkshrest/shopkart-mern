import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const registeredMessage = location.state?.registeredMessage;
  const logoutMessage = location.state?.logoutMessage;

  const handleChange = (e) => {
    setError("");
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email.trim() || !form.password) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/customers/login", form);
      if (response.data.success || response.status === 200) {
        navigate("/home", { state: { loginMessage: response.data.message || "Login successful! Welcome back." } });
      }
    } catch (err) {
      if (!err.response) {
        setError("Cannot connect to server. Please ensure the backend is running.");
      } else if (err.response.status === 401) {
        setError("Invalid credentials");
      } else {
        setError(err.response.data?.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="card">
        <div className="brand-header">
          <div className="brand-logo">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
          </div>
          <span className="brand-name">ShopKart</span>
        </div>

        <h1>Customer Login</h1>
        <p className="subtitle">Welcome back! Sign in to access your account</p>

        {registeredMessage && !error && (
          <div className="success-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span>{registeredMessage}</span>
          </div>
        )}

        {logoutMessage && !error && !registeredMessage && (
          <div className="success-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span>{logoutMessage}</span>
          </div>
        )}

        {error && (
          <div className="error-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="john@gmail.com"
              value={form.email}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <span className="btn-loading">
                <span className="spinner"></span> Logging in...
              </span>
            ) : (
              "Log In"
            )}
          </button>

          <p className="link-text">
            Don't have an account? <Link to="/register">Create one</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
