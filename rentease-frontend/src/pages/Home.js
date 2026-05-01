import React, { useEffect, useState } from "react";
import API from "../api";
import ProductCard from "../components/ProductCard";

function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    API.get("/api/products/")
      .then((res) => setProducts(res.data))
      .catch((err) => console.log(err));
  }, []);

  return (
    <div>

      {/* Hero Section */}
      <div className="hero">
        <h1>Rent Anything. Anytime. Anywhere 🚀</h1>
        <p>Find the best rental products at unbeatable prices</p>
        <button className="hero-btn">Explore Now</button>
        </div>
      {/* Product Section */}
      <div className="container">
        <h2>Latest Products</h2>

        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

    </div>
  );
}

export default Home;