import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import API from "../api";
import { resolveMediaURL } from "../auth";

const Cart = ({
  cart,
  addToCart,
  decreaseQty,
  removeFromCart,
  totalPrice = 0,
  clearCart,
}) => {
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const itemCount = cart.reduce((count, item) => count + item.qty, 0);

  const handleCheckout = async () => {
    setCheckoutError("");
    setIsCheckingOut(true);

    try {
      await API.post("/api/checkout/", {
        items: cart.map((item) => ({
          id: item.id,
          qty: item.qty,
        })),
      });

      if (typeof clearCart === "function") {
        clearCart();
      }

      navigate("/history");
    } catch (error) {
      setCheckoutError(
        error.response?.data?.error || "Checkout could not be completed right now."
      );
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="cart-shell">
      {cart.length === 0 ? (
        <div className="cart-empty">
          <span className="section-kicker">Your Cart</span>
          <h1 className="section-title">Your cart is empty right now.</h1>
          <p className="section-subtitle">
            Browse the catalog and save the pieces that fit your next room setup.
          </p>
          <Link to="/home#catalog" className="cart-secondary">
            Explore rentals
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-list">
            <div className="section-head">
              <span className="section-kicker">Your Cart</span>
              <h1 className="section-title">Everything you need for a more finished space.</h1>
              <p className="section-subtitle">
                Review quantities, keep your favorite pieces together, and move toward checkout when
                the room plan feels right.
              </p>
            </div>

            {cart.map((item) => {
              const imageUrl = resolveMediaURL(item.image);
              const placeholderCode = item.name ? item.name.slice(0, 2).toUpperCase() : "RE";

              return (
                <article key={item.id} className="cart-item">
                  <div className="cart-item-media">
                    {imageUrl ? (
                      <img src={imageUrl} alt={item.name} />
                    ) : (
                      <div className="cart-item-placeholder">{placeholderCode}</div>
                    )}
                  </div>

                  <div className="cart-item-body">
                    <div className="cart-item-top">
                      <div>
                        <span className="section-kicker">Monthly rental</span>
                        <h2 className="cart-item-title">{item.name}</h2>
                        <p className="cart-meta">
                          A flexible pick for practical living, room upgrades, and easy moves.
                        </p>
                      </div>

                      <span className="cart-price">Rs {item.price * item.qty}</span>
                    </div>

                    <div className="cart-row">
                      <div className="cart-stepper">
                        <button className="stepper-button" onClick={() => decreaseQty(item)} type="button">
                          -
                        </button>
                        <span className="cart-qty">{item.qty}</span>
                        <button className="stepper-button" onClick={() => addToCart(item)} type="button">
                          +
                        </button>
                      </div>

                      <div className="cart-row">
                        <span className="cart-meta">Rs {item.price} per month</span>
                        <button className="cart-remove" onClick={() => removeFromCart(item)} type="button">
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <aside className="cart-summary">
            <h2 className="cart-summary-title">Order summary</h2>
            <p className="cart-summary-copy">
              A quick look at your current monthly rental selection before checkout.
            </p>

            <div className="cart-summary-row">
              <span>Items</span>
              <strong>{itemCount}</strong>
            </div>
            <div className="cart-summary-row">
              <span>Monthly subtotal</span>
              <strong>Rs {totalPrice}</strong>
            </div>
            <div className="cart-summary-row">
              <span>Support</span>
              <strong>Included</strong>
            </div>

            <div className="cart-summary-total">
              <span>Total</span>
              <span>Rs {totalPrice}</span>
            </div>

            {checkoutError ? <p className="auth-error">{checkoutError}</p> : null}

            <div className="cart-summary-stack">
              <button
                className="cart-checkout"
                type="button"
                onClick={handleCheckout}
                disabled={isCheckingOut}
              >
                {isCheckingOut ? "Processing..." : "Proceed to checkout"}
              </button>
              <Link to="/home#catalog" className="cart-secondary">
                Continue browsing
              </Link>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default Cart;
