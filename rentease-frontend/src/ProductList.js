import React, { useEffect, useState } from "react";

import API from "./api";

function ProductList() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    API.get("/api/products/").then((response) => setProducts(response.data));
  }, []);

  return (
    <div>
      <h2>Products</h2>
      {products.map(p => (
        <div key={p.id}>
          <h3>{p.name}</h3>
          <p>Rent: Rs {p.price}</p>
        </div>
      ))}
    </div>
  );
}

export default ProductList;
