import { useState } from "react";
import { Link } from "react-router-dom";

import API from "../api";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [resetLink, setResetLink] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setError("");
    setResetLink("");

    try {
      const response = await API.post("/api/password-reset/request/", { email });
      setMessage(response.data.message);
      setResetLink(response.data.reset_link || "");
    } catch (submitError) {
      setError(submitError.response?.data?.error || "Could not send reset instructions.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="auth-panel auth-panel--single">
        <div className="auth-form-panel">
          <h2 className="auth-heading">Forgot password</h2>
          <p className="auth-subcopy">
            Enter the email saved on your account and we will send reset instructions.
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="auth-field">
              <span>Email</span>
              <input
                className="auth-input"
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>

            {message ? <p className="account-success">{message}</p> : null}
            {error ? <p className="auth-error">{error}</p> : null}

            {resetLink ? (
              <div className="debug-link-card">
                <span className="section-kicker">Development shortcut</span>
                <a href={resetLink}>{resetLink}</a>
              </div>
            ) : null}

            <button className="auth-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send reset link"}
            </button>
          </form>

          <p className="auth-footer">
            Remembered your password?{" "}
            <Link to="/login" className="auth-link">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
