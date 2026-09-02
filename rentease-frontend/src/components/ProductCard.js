import React from "react";
import { Link } from "react-router-dom";

import { resolveMediaURL } from "../auth";

const ProductCard = ({
  product,
  addToCart,
  isInCart = false,
}) => {
  const imageUrl = resolveMediaURL(product.image);
  const placeholderCode = product.name ? product.name.slice(0, 2).toUpperCase() : "RE";

  return (
    <article className="product-card">
      <div className="product-media">
        <span className="product-badge">Monthly rental</span>

        {imageUrl ? (
          <img className="product-image" src={imageUrl} alt={product.name} />
        ) : (
          <div className="product-placeholder">
            <strong>{placeholderCode}</strong>
            <span>Styled and maintained</span>
          </div>
        )}
      </div>

      <div className="product-body">
        <div className="product-topline">
          <div>
            <p className="product-kicker">Ready for your space</p>
            <h3 className="product-name">{product.name}</h3>
          </div>

          <span className="product-price">Rs {product.price}</span>
        </div>

        <p className="product-note">
          {product.description ||
            "Designed for flexible living, easy upgrades, and rooms that still feel thoughtfully put together."}
        </p>

        <div className="product-meta-grid">
          <span>{product.condition || "Good"}</span>
          <span>{product.delivery_time || "3-5 days"}</span>
          <span>Deposit Rs {product.deposit || product.price}</span>
          <span>{product.stock > 0 ? `${product.stock} available` : "Out of stock"}</span>
        </div>

        <div className="product-actions">
          {isInCart ? (
            <Link className="product-button product-button--view" to="/cart">
              View cart
            </Link>
          ) : (
            <button
              className="product-button"
              onClick={() => addToCart?.(product)}
              type="button"
              disabled={product.stock < 1}
            >
              {product.stock < 1 ? "Out of stock" : "Add to cart"}
            </button>
          )}

        </div>
      </div>
    </article>
  );
};

export default ProductCard;
