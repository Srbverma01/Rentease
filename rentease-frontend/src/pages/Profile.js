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
    is_superuser: false,
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
  const [deletingProductId, setDeletingProductId] = useState(null);
  const [staffOrders, setStaffOrders] = useState([]);
  const [orderMessage, setOrderMessage] = useState("");
  const [orderError, setOrderError] = useState("");
  const [savingOrderId, setSavingOrderId] = useState(null);

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
                productsResponse.data.map((product) => [
                  product.id,
                  {
                    price: String(product.price ?? ""),
                    deposit: String(product.deposit ?? ""),
                    stock: String(product.stock ?? ""),
                    category: product.category || "",
                    delivery_time: product.delivery_time || "",
                    condition: product.condition || "Good",
                    featured: Boolean(product.featured),
                  },
                ])
              )
            );

            const ordersResponse = await API.get("/api/staff/orders/");
            if (!ignore) {
              setStaffOrders(ordersResponse.data);
            }
          } catch (catalogLoadError) {
            if (!ignore) {
              setCatalogError("Unable to load staff management data right now.");
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

  const handleProductDraftChange = (productId, field, value) => {
    setProductDrafts((current) => ({
      ...current,
      [productId]: {
        ...current[productId],
        [field]: value,
      },
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
    const draft = productDrafts[product.id] || {};
    const nextPrice = Number(draft.price);
    const nextDeposit = Number(draft.deposit);
    const nextStock = Number(draft.stock);

    if (
      !Number.isInteger(nextPrice) ||
      !Number.isInteger(nextDeposit) ||
      !Number.isInteger(nextStock) ||
      nextPrice < 0 ||
      nextDeposit < 0 ||
      nextStock < 0
    ) {
      setCatalogMessage("");
      setCatalogError("Enter valid whole-number price, deposit, and stock values before saving.");
      return;
    }

    setCatalogError("");
    setCatalogMessage("");
    setSavingProductId(product.id);

    try {
      const response = await API.patch(`/api/products/${product.id}/`, {
        price: nextPrice,
        deposit: nextDeposit,
        stock: nextStock,
        category: draft.category,
        delivery_time: draft.delivery_time,
        condition: draft.condition,
        featured: draft.featured,
      });

      setCatalogProducts((current) =>
        current.map((item) => (item.id === product.id ? response.data : item))
      );
      setProductDrafts((current) => ({
        ...current,
        [product.id]: {
          price: String(response.data.price ?? ""),
          deposit: String(response.data.deposit ?? ""),
          stock: String(response.data.stock ?? ""),
          category: response.data.category || "",
          delivery_time: response.data.delivery_time || "",
          condition: response.data.condition || "Good",
          featured: Boolean(response.data.featured),
        },
      }));
      setCatalogMessage(`${response.data.name} updated successfully.`);
    } catch (saveError) {
      setCatalogError(
        saveError.response?.data?.detail || "Could not save the product price right now."
      );
    } finally {
      setSavingProductId(null);
    }
  };

  const handleOrderUpdate = async (order, field, value) => {
    setOrderError("");
    setOrderMessage("");
    setSavingOrderId(order.id);

    try {
      const response = await API.patch(`/api/staff/orders/${order.id}/`, {
        [field]: value,
      });
      setStaffOrders((current) =>
        current.map((item) => (item.id === order.id ? response.data : item))
      );
      setOrderMessage(`Order #${order.id} updated.`);
    } catch (updateError) {
      setOrderError(updateError.response?.data?.error || "Could not update the order right now.");
    } finally {
      setSavingOrderId(null);
    }
  };

  const handleProductDelete = async (product) => {
    setCatalogError("");
    setCatalogMessage("");
    setDeletingProductId(product.id);

    try {
      await API.delete(`/api/products/${product.id}/`);
      setCatalogProducts((current) => current.filter((item) => item.id !== product.id));
      setProductDrafts((current) => {
        const nextDrafts = { ...current };
        delete nextDrafts[product.id];
        return nextDrafts;
      });
      setCatalogMessage(`${product.name} deleted from the catalog.`);
    } catch (deleteError) {
      setCatalogError(
        deleteError.response?.data?.detail || "Could not delete the product right now."
      );
    } finally {
      setDeletingProductId(null);
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
              <span className="section-kicker">Staff tools</span>
              <h2 className="account-card-title">Manage products from your profile.</h2>
            </div>
            <p className="account-copy">
              Staff can edit rental metadata here. Superusers can also remove catalog items.
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
                    <span>{product.category || "Uncategorized"} / {product.image ? "Photo added" : "No product photo yet"}</span>
                  </div>

                  <div className="price-editor-controls">
                    <label className="price-input-group">
                      <span>Rs</span>
                      <input
                        className="price-input"
                        type="number"
                        min="0"
                        step="1"
                        value={productDrafts[product.id]?.price ?? ""}
                        onChange={(event) =>
                          handleProductDraftChange(product.id, "price", event.target.value)
                        }
                      />
                    </label>
                    <label className="price-input-group">
                      <span>Dep</span>
                      <input
                        className="price-input"
                        type="number"
                        min="0"
                        step="1"
                        value={productDrafts[product.id]?.deposit ?? ""}
                        onChange={(event) =>
                          handleProductDraftChange(product.id, "deposit", event.target.value)
                        }
                      />
                    </label>
                    <label className="price-input-group">
                      <span>Stock</span>
                      <input
                        className="price-input"
                        type="number"
                        min="0"
                        step="1"
                        value={productDrafts[product.id]?.stock ?? ""}
                        onChange={(event) =>
                          handleProductDraftChange(product.id, "stock", event.target.value)
                        }
                      />
                    </label>
                    <input
                      className="auth-input staff-compact-input"
                      value={productDrafts[product.id]?.category ?? ""}
                      onChange={(event) =>
                        handleProductDraftChange(product.id, "category", event.target.value)
                      }
                      placeholder="Category"
                    />
                    <input
                      className="auth-input staff-compact-input"
                      value={productDrafts[product.id]?.delivery_time ?? ""}
                      onChange={(event) =>
                        handleProductDraftChange(product.id, "delivery_time", event.target.value)
                      }
                      placeholder="Delivery time"
                    />
                    <select
                      className="auth-input staff-compact-input"
                      value={productDrafts[product.id]?.condition ?? "Good"}
                      onChange={(event) =>
                        handleProductDraftChange(product.id, "condition", event.target.value)
                      }
                    >
                      <option>New</option>
                      <option>Like New</option>
                      <option>Good</option>
                      <option>Refurbished</option>
                    </select>
                    <label className="staff-check">
                      <input
                        type="checkbox"
                        checked={Boolean(productDrafts[product.id]?.featured)}
                        onChange={(event) =>
                          handleProductDraftChange(product.id, "featured", event.target.checked)
                        }
                      />
                      Featured
                    </label>

                    <button
                      className="price-save"
                      type="button"
                      onClick={() => handlePriceSave(product)}
                      disabled={savingProductId === product.id}
                    >
                      {savingProductId === product.id ? "Saving..." : "Save price"}
                    </button>

                    {profile.is_superuser ? (
                      <button
                        className="product-delete"
                        type="button"
                        onClick={() => handleProductDelete(product)}
                        disabled={deletingProductId === product.id}
                      >
                        {deletingProductId === product.id ? "Deleting..." : "Delete item"}
                      </button>
                    ) : null}
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

      {profile.is_staff ? (
        <section className="account-card catalog-pricing-card">
          <div className="catalog-pricing-head">
            <div>
              <span className="section-kicker">Orders</span>
              <h2 className="account-card-title">Manage order and payment status.</h2>
            </div>
          </div>

          {orderMessage ? <p className="account-success">{orderMessage}</p> : null}
          {orderError ? <p className="auth-error">{orderError}</p> : null}

          {staffOrders.length ? (
            <div className="history-stack">
              {staffOrders.map((order) => (
                <article className="history-card" key={order.id}>
                  <div className="history-card-top">
                    <div>
                      <span className="section-kicker">Order #{order.id}</span>
                      <h3>{order.customer_name || "Customer"} / Rs {order.total_price}</h3>
                    </div>
                    <strong>{order.payment_status}</strong>
                  </div>
                  <p className="account-copy">
                    {order.phone} / {order.address}, {order.city} {order.pincode}
                  </p>
                  <div className="price-editor-controls">
                    <select
                      className="auth-input staff-compact-input"
                      value={order.status}
                      disabled={savingOrderId === order.id}
                      onChange={(event) => handleOrderUpdate(order, "status", event.target.value)}
                    >
                      {["Placed", "Processing", "Out for Delivery", "Delivered", "Completed", "Cancelled", "Returned"].map((statusOption) => (
                        <option key={statusOption}>{statusOption}</option>
                      ))}
                    </select>
                    <select
                      className="auth-input staff-compact-input"
                      value={order.payment_status}
                      disabled={savingOrderId === order.id}
                      onChange={(event) =>
                        handleOrderUpdate(order, "payment_status", event.target.value)
                      }
                    >
                      {["Pending", "Paid", "Failed", "Refunded"].map((statusOption) => (
                        <option key={statusOption}>{statusOption}</option>
                      ))}
                    </select>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="account-copy">No orders have been placed yet.</p>
          )}
        </section>
      ) : null}
    </div>
  );
}

export default Profile;
