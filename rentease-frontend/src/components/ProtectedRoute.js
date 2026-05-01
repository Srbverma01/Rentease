import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { hasUsableSession, hasValidAccessToken, refreshAccessToken } from "../auth";

const SessionLoader = () => (
  <div className="session-state">
    <div className="session-card">
      <span className="section-kicker">Checking session</span>
      <h1 className="section-title">Getting your account ready...</h1>
      <p className="section-subtitle">
        We are validating your saved login so protected pages stay secure.
      </p>
    </div>
  </div>
);

export function ProtectedRoute({ children }) {
  const location = useLocation();
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let isMounted = true;

    const validateSession = async () => {
      if (!hasUsableSession()) {
        if (isMounted) {
          setStatus("denied");
        }
        return;
      }

      if (!hasValidAccessToken()) {
        try {
          await refreshAccessToken();
        } catch (error) {
          // Session validity is rechecked below.
        }
      }

      if (isMounted) {
        setStatus(hasUsableSession() ? "allowed" : "denied");
      }
    };

    validateSession();

    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  if (status === "loading") {
    return <SessionLoader />;
  }

  if (status === "denied") {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

export function GuestRoute({ children }) {
  if (hasUsableSession()) {
    return <Navigate to="/home" replace />;
  }

  return children;
}
