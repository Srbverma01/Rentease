import React, { useState } from "react";
import API from "../api";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await API.post("/api/register/", form);

      alert("Account created successfully");
      navigate("/login");
    } catch (err) {
      console.error(err.response?.data);
      setError(err.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-panel">
        <div className="auth-showcase">
          <span className="auth-pill">Get started</span>
          <h1 className="auth-title">Create your account and start building a lighter home setup.</h1>
          <p className="auth-copy">
            Register once to browse flexible monthly rentals, keep your shortlist moving, and make
            your next room plan feel much easier to execute.
          </p>

          <div className="auth-showcase-card">
            <strong>Why people start here</strong>
            <ul className="auth-benefits">
              <li>Explore furniture and appliances without buying everything up front</li>
              <li>Build a cleaner move-in plan for changing homes and growing spaces</li>
              <li>Keep product browsing and checkout steps in one experience</li>
            </ul>
          </div>
        </div>

        <div className="auth-form-panel">
          <h2 className="auth-heading">Register</h2>
          <p className="auth-subcopy">Set up your RentEase account in a minute.</p>

          <form className="auth-form" onSubmit={handleRegister}>
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
              <span>Email</span>
              <input
                className="auth-input"
                type="email"
                name="email"
                placeholder="Email address"
                value={form.email}
                onChange={handleChange}
                required
              />
            </label>

            <label className="auth-field">
              <span>Password</span>
              <input
                className="auth-input"
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </label>

            {error ? <p className="auth-error">{error}</p> : null}

            <button className="auth-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating account..." : "Register"}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account?{" "}
            <Link to="/login" className="auth-link">
              Login here
            </Link>
          </p>
          <p className="auth-footer auth-footer--tight">
            Need help later? You can reset your password using this email.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
