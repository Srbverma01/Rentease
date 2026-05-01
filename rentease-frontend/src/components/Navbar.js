import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { clearAuthTokens, hasUsableSession } from "../auth";

const guestLinks = [{ label: "Create account", to: "/register", className: "nav-chip" }];
const memberLinks = [
  { label: "Browse", to: "/home" },
  { label: "History", to: "/history" },
  { label: "Profile", to: "/profile" },
];

const authPages = ["/login", "/register", "/forgot-password"];

const Navbar = ({ cartCount = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isLoggedIn = hasUsableSession();
  const isAuthPage = authPages.includes(location.pathname) || location.pathname.startsWith("/reset-password/");

  const navLinks = useMemo(() => (isLoggedIn ? memberLinks : []), [isLoggedIn]);

  const closeMenu = () => setIsOpen(false);
  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    clearAuthTokens();
    closeMenu();
    navigate("/login", { replace: true });
  };

  return (
    <header className="site-navbar">
      <div className="nav-inner">
        <Link to={isLoggedIn ? "/home" : "/login"} className="brand-lockup" onClick={closeMenu}>
          <span className="brand-mark">R</span>
          <span className="brand-copy">
            <span className="brand-title">RentEase</span>
            <span className="brand-tagline">Curated monthly living</span>
          </span>
        </Link>

        {isLoggedIn && !isAuthPage ? (
          <label className="nav-search" aria-label="Search products">
            <span>Search</span>
            <input type="text" placeholder="Desks, sofas, lamps, appliances" />
          </label>
        ) : (
          <div />
        )}

        <nav className="nav-links" aria-label="Primary navigation">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className={isActive(link.to) ? "nav-link--active" : ""}
              onClick={closeMenu}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="nav-actions">
          {isLoggedIn ? (
            <>
              <Link to="/cart" className="nav-chip--ghost" onClick={closeMenu}>
                Cart <span className="nav-count">{cartCount}</span>
              </Link>
              <button type="button" className="nav-chip--ghost nav-button" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-chip--ghost" onClick={closeMenu}>
                Login
              </Link>
              {guestLinks.map((link) => (
                <Link key={link.label} to={link.to} className={link.className} onClick={closeMenu}>
                  {link.label}
                </Link>
              ))}
            </>
          )}
        </div>

        <button onClick={() => setIsOpen(!isOpen)} className="nav-toggle" type="button">
          {isOpen ? "Close" : "Menu"}
        </button>
      </div>

      {isOpen ? (
        <div className="mobile-panel">
          <div className="mobile-links">
            {isLoggedIn ? (
              <>
                {memberLinks.map((link) => (
                  <Link key={link.label} to={link.to} onClick={closeMenu}>
                    {link.label}
                  </Link>
                ))}
                <Link to="/cart" onClick={closeMenu}>
                  Cart ({cartCount})
                </Link>
                <button type="button" className="mobile-action-button" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={closeMenu}>
                  Login
                </Link>
                <Link to="/register" onClick={closeMenu}>
                  Create account
                </Link>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
};

export default Navbar;
