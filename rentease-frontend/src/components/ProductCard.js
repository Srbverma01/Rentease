import React from "react";

import { resolveMediaURL } from "../auth";

const ProductCard = ({ product, addToCart }) => {
  const imageUrl = resolveMediaURL(product.image);
  const placeholderCode = product.name ? product.name.slice(0, 2).toUpperCase() : "RE";

  return (
    <article className="product-card">
      <div className="product-media">
        <span className="product-badge">Monthly rental</span>

        {imageUrl ? (
          <img src={imageUrl} alt={product.name} />
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
          Designed for flexible living, easy upgrades, and rooms that still feel thoughtfully put
          together.
        </p>

        <button className="product-button" onClick={() => addToCart?.(product)} type="button">
          Add to cart
        </button>
      </div>
    </article>
  );
};

export default ProductCard;
