import React, { useState } from "react";
import API from "../api";
import { Link, useLocation, useNavigate } from "react-router-dom";

function Login() {
  const [form, setForm] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const res = await API.post("/api/token/", {
        username: form.username,
        password: form.password,
      });

      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);

      alert("Login successful");
      navigate(location.state?.from?.pathname || "/home", { replace: true });
    } catch (err) {
      console.error("Login error:", err.response?.data);
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else if (err.request) {
        setError("Cannot reach the server right now. Please try again in a moment.");
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-panel">
        <div className="auth-showcase">
          <span className="auth-pill">Welcome back</span>
          <h1 className="auth-title">Return to a calmer way to furnish your space.</h1>
          <p className="auth-copy">
            Sign in to revisit your rental picks, manage your cart, and continue building a home
            that feels polished without the heavy upfront spend.
          </p>

          <div className="auth-showcase-card">
            <strong>Inside your account</strong>
            <ul className="auth-benefits">
              <li>Browse the latest rental-ready furniture and essentials</li>
              <li>Save time when planning your next move or room refresh</li>
              <li>Keep your cart and login flow in one place</li>
            </ul>
          </div>
        </div>

        <div className="auth-form-panel">
          <h2 className="auth-heading">Login</h2>
          <p className="auth-subcopy">Use your RentEase details to continue.</p>

          <form className="auth-form" onSubmit={handleLogin}>
            <label className="auth-field">
              <span>Username</span>
              <input
                className="auth-input"
                type="text"
                name="username"
                placeholder="Username"
                value={form.username}
                onChange={handleChange}
                required
              />
            </label>

            <label className="auth-field">
              <span>Password</span>
              <div className="auth-password-wrap">
                <input
                  className="auth-input auth-input--password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <button
                  className="auth-password-toggle"
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "View"}
                </button>
              </div>
            </label>

            {error ? <p className="auth-error">{error}</p> : null}

            <button className="auth-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Login"}
            </button>
          </form>

          <p className="auth-footer">
            Need an account?{" "}
            <Link to="/register" className="auth-link">
              Create one here
            </Link>
          </p>
          <p className="auth-footer auth-footer--tight">
            Forgot your password?{" "}
            <Link to="/forgot-password" className="auth-link">
              Reset it here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
