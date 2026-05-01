import { useEffect, useState } from "react";

import API from "../api";

function Profile() {
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    date_joined: "",
    is_staff: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [productDrafts, setProductDrafts] = useState({});
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);
  const [catalogMessage, setCatalogMessage] = useState("");
  const [catalogError, setCatalogError] = useState("");
  const [savingProductId, setSavingProductId] = useState(null);

  useEffect(() => {
    let ignore = false;

    const loadProfile = async () => {
      try {
        const profileResponse = await API.get("/api/profile/");
        if (ignore) {
          return;
        }

        setProfile(profileResponse.data);

        if (profileResponse.data.is_staff) {
          setIsLoadingCatalog(true);

          try {
            const productsResponse = await API.get("/api/products/");
            if (ignore) {
              return;
            }

            setCatalogProducts(productsResponse.data);
            setProductDrafts(
              Object.fromEntries(
                productsResponse.data.map((product) => [product.id, String(product.price ?? "")])
              )
            );
          } catch (catalogLoadError) {
            if (!ignore) {
              setCatalogError("Unable to load catalog prices right now.");
            }
          } finally {
            if (!ignore) {
              setIsLoadingCatalog(false);
            }
          }
        }
      } catch (profileLoadError) {
        if (!ignore) {
          setError("Unable to load your profile right now.");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      ignore = true;
    };
  }, []);

  const handleChange = (event) => {
    setProfile((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleProductPriceChange = (productId, value) => {
    setProductDrafts((current) => ({
      ...current,
      [productId]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    setIsSaving(true);

    try {
      const response = await API.patch("/api/profile/", {
        email: profile.email,
        first_name: profile.first_name,
        last_name: profile.last_name,
      });
      setProfile(response.data);
      setMessage("Profile updated successfully.");
    } catch (submitError) {
      setError("Could not save your profile changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePriceSave = async (product) => {
    const nextPrice = Number(productDrafts[product.id]);

    if (!Number.isInteger(nextPrice) || nextPrice < 0) {
      setCatalogMessage("");
      setCatalogError("Enter a valid whole-number price before saving.");
      return;
    }

    setCatalogError("");
    setCatalogMessage("");
    setSavingProductId(product.id);

    try {
      const response = await API.patch(`/api/products/${product.id}/`, {
        price: nextPrice,
      });

      setCatalogProducts((current) =>
        current.map((item) => (item.id === product.id ? response.data : item))
      );
      setProductDrafts((current) => ({
        ...current,
        [product.id]: String(response.data.price),
      }));
      setCatalogMessage(`${response.data.name} price updated successfully.`);
    } catch (saveError) {
      setCatalogError(
        saveError.response?.data?.detail || "Could not save the product price right now."
      );
    } finally {
      setSavingProductId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="page-shell">
        <div className="account-card">
          <h1 className="section-title">Loading your profile...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="page-header">
        <span className="section-kicker">Profile</span>
        <h1 className="section-title">Manage your account details.</h1>
        <p className="section-subtitle">
          Keep your contact details updated so login recovery and account management stay simple.
        </p>
      </div>

      <div className="account-grid">
        <section className="account-card">
          <h2 className="account-card-title">Account info</h2>
          <form className="account-form" onSubmit={handleSubmit}>
            <label className="auth-field">
              <span>Username</span>
              <input className="auth-input" value={profile.username} disabled readOnly />
            </label>

            <label className="auth-field">
              <span>Email</span>
              <input
                className="auth-input"
                type="email"
                name="email"
                placeholder="Email address"
                value={profile.email || ""}
                onChange={handleChange}
              />
            </label>

            <label className="auth-field">
              <span>First name</span>
              <input
                className="auth-input"
                type="text"
                name="first_name"
                placeholder="First name"
                value={profile.first_name || ""}
                onChange={handleChange}
              />
            </label>

            <label className="auth-field">
              <span>Last name</span>
              <input
                className="auth-input"
                type="text"
                name="last_name"
                placeholder="Last name"
                value={profile.last_name || ""}
                onChange={handleChange}
              />
            </label>

            {message ? <p className="account-success">{message}</p> : null}
            {error ? <p className="auth-error">{error}</p> : null}

            <button className="auth-submit" type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save changes"}
            </button>
          </form>
        </section>

        <aside className="account-card account-card--side">
          <h2 className="account-card-title">Security</h2>
          <p className="account-copy">
            Password reset links are sent to the email saved on your account.
          </p>
          <div className="account-meta-list">
            <div className="account-meta-row">
              <span>Member since</span>
              <strong>
                {profile.date_joined
                  ? new Date(profile.date_joined).toLocaleDateString()
                  : "Recently"}
              </strong>
            </div>
            <div className="account-meta-row">
              <span>Recovery email</span>
              <strong>{profile.email || "Add your email"}</strong>
            </div>
          </div>
        </aside>
      </div>

      {profile.is_staff ? (
        <section className="account-card catalog-pricing-card">
          <div className="catalog-pricing-head">
            <div>
              <span className="section-kicker">Catalog pricing</span>
              <h2 className="account-card-title">Edit product prices from the frontend.</h2>
            </div>
            <p className="account-copy">
              This staff-only panel lets you adjust catalog pricing without opening Django admin.
            </p>
          </div>

          {catalogMessage ? <p className="account-success">{catalogMessage}</p> : null}
          {catalogError ? <p className="auth-error">{catalogError}</p> : null}

          {isLoadingCatalog ? (
            <p className="account-copy">Loading your product catalog...</p>
          ) : catalogProducts.length ? (
            <div className="price-editor-list">
              {catalogProducts.map((product) => (
                <article key={product.id} className="price-editor-row">
                  <div className="price-editor-copy">
                    <strong>{product.name}</strong>
                    <span>{product.image ? "Photo added" : "No product photo yet"}</span>
                  </div>

                  <div className="price-editor-controls">
                    <label className="price-input-group">
                      <span>Rs</span>
                      <input
                        className="price-input"
                        type="number"
                        min="0"
                        step="1"
                        value={productDrafts[product.id] ?? ""}
                        onChange={(event) =>
                          handleProductPriceChange(product.id, event.target.value)
                        }
                      />
                    </label>

                    <button
                      className="price-save"
                      type="button"
                      onClick={() => handlePriceSave(product)}
                      disabled={savingProductId === product.id}
                    >
                      {savingProductId === product.id ? "Saving..." : "Save price"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="account-copy">
              No products are in the catalog yet. Add one first and it will appear here.
            </p>
          )}
        </section>
      ) : null}
    </div>
  );
}

export default Profile;
