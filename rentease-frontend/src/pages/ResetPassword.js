import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import API from "../api";

function ResetPassword() {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await API.post("/api/password-reset/confirm/", {
        uid,
        token,
        password,
      });
      setMessage(response.data.message);
      setTimeout(() => navigate("/login"), 1200);
    } catch (submitError) {
      setError(submitError.response?.data?.error || "Could not reset your password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="auth-panel auth-panel--single">
        <div className="auth-form-panel">
          <h2 className="auth-heading">Reset password</h2>
          <p className="auth-subcopy">Choose a new password for your RentEase account.</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="auth-field">
              <span>New password</span>
              <input
                className="auth-input"
                type="password"
                placeholder="New password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </label>

            <label className="auth-field">
              <span>Confirm password</span>
              <input
                className="auth-input"
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
              />
            </label>

            {message ? <p className="account-success">{message}</p> : null}
            {error ? <p className="auth-error">{error}</p> : null}

            <button className="auth-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Reset password"}
            </button>
          </form>

          <p className="auth-footer">
            Need to return?{" "}
            <Link to="/login" className="auth-link">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
