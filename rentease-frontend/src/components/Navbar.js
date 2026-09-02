import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import renteaseLogo from "../assets/rentease-logo.png";
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
  const [locationLabel, setLocationLabel] = useState("Set location");
  const [isLocating, setIsLocating] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isLoggedIn = hasUsableSession();
  const isAuthPage = authPages.includes(location.pathname) || location.pathname.startsWith("/reset-password/");

  const navLinks = useMemo(() => (isLoggedIn ? memberLinks : []), [isLoggedIn]);

  const closeMenu = () => setIsOpen(false);
  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    clearAuthTokens();
    window.dispatchEvent(new Event("rentease-auth-changed"));
    closeMenu();
    navigate("/login", { replace: true });
  };

  const formatCoordinates = ({ latitude, longitude }) =>
    `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;

  const fetchLocationName = async ({ latitude, longitude }) => {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
    );

    if (!response.ok) {
      throw new Error("Location lookup failed");
    }

    const data = await response.json();
    const address = data.address || {};
    return (
      address.city ||
      address.town ||
      address.village ||
      address.suburb ||
      address.county ||
      data.display_name?.split(",")[0]
    );
  };

  const handleLocationClick = () => {
    if (!navigator.geolocation || isLocating) {
      setLocationLabel(navigator.geolocation ? locationLabel : "Location unavailable");
      return;
    }

    setIsLocating(true);
    setLocationLabel("Detecting...");

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const placeName = await fetchLocationName(coords);
          setLocationLabel(placeName || formatCoordinates(coords));
        } catch (error) {
          console.error("Location name lookup failed:", error);
          setLocationLabel(formatCoordinates(coords));
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error("Location permission failed:", error);
        setLocationLabel(error.code === error.PERMISSION_DENIED ? "Permission denied" : "Try again");
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 300000,
        timeout: 10000,
      }
    );
  };

  return (
    <header className="site-navbar">
      <div className="nav-inner">
        <div className="brand-area">
          <Link to={isLoggedIn ? "/home" : "/login"} className="brand-lockup" onClick={closeMenu}>
            <span className="brand-mark">
              <img src={renteaseLogo} alt="RentEase logo" />
            </span>
            <span className="brand-copy">
              <span className="brand-title">RentEase</span>
              <span className="brand-tagline">Curated monthly living</span>
            </span>
          </Link>
          <button
            className="location-button"
            type="button"
            onClick={handleLocationClick}
            disabled={isLocating}
          >
            <span className="location-pin" aria-hidden="true" />
            {locationLabel}
          </button>
        </div>

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
