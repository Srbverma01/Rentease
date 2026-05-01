import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";

import API from "./api";
import "./App.css";
import { hasUsableSession } from "./auth";
import Navbar from "./components/Navbar";
import { GuestRoute, ProtectedRoute } from "./components/ProtectedRoute";
import Categories from "./components/Categories";
import Hero from "./components/Hero";
import ProductCard from "./components/ProductCard";
import WhyUs from "./components/WhyUs";
import Cart from "./pages/Cart";
import ForgotPassword from "./pages/ForgotPassword";
import History from "./pages/History";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  useEffect(() => {
    API.get("/api/products/")
      .then((res) => {
        setProducts(res.data);
      })
      .catch((err) => console.log(err))
      .finally(() => setIsLoadingProducts(false));
  }, []);

  const addToCart = (product) => {
    const exist = cart.find((item) => item.id === product.id);

    if (exist) {
      setCart(
        cart.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        )
      );
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const removeFromCart = (product) => {
    setCart(cart.filter((item) => item.id !== product.id));
  };

  const decreaseQty = (product) => {
    const exist = cart.find((item) => item.id === product.id);

    if (exist.qty === 1) {
      removeFromCart(product);
    } else {
      setCart(
        cart.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty - 1 } : item
        )
      );
    }
  };

  const clearCart = () => setCart([]);

  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.qty,
    0
  );
  const cartCount = cart.reduce((count, item) => count + item.qty, 0);

  return (
    <Router>
      <Navbar cartCount={cartCount} />

      <Routes>
        <Route
          path="/"
          element={<Navigate to={hasUsableSession() ? "/home" : "/login"} replace />}
        />
        <Route
          path="/login"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <Register />
            </GuestRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <GuestRoute>
              <ForgotPassword />
            </GuestRoute>
          }
        />
        <Route
          path="/reset-password/:uid/:token"
          element={
            <GuestRoute>
              <ResetPassword />
            </GuestRoute>
          }
        />

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <main className="page-surface">
                <Hero />
                <Categories />
                <WhyUs />

                <section className="section-shell catalog-shell" id="catalog">
                  <div className="catalog-head">
                    <div className="section-head">
                      <span className="section-kicker">Ready To Rent</span>
                      <h2 className="section-title">Explore pieces that elevate the everyday.</h2>
                      <p className="section-subtitle">
                        Mix statement furniture, practical appliances, and work-from-home essentials
                        without the stress of buying everything at once.
                      </p>
                    </div>

                    <div className="catalog-tag">{cartCount} item(s) in cart</div>
                  </div>

                  {isLoadingProducts ? (
                    <div className="catalog-empty">
                      <h3>Loading the latest rental collection...</h3>
                      <p className="section-subtitle">
                        We are pulling in the newest products from your catalog right now.
                      </p>
                    </div>
                  ) : products.length > 0 ? (
                    <div className="catalog-grid">
                      {products.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          addToCart={addToCart}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="catalog-empty">
                      <h3>No products are available yet.</h3>
                      <p className="section-subtitle">
                        Add products from the backend and they will appear here automatically.
                      </p>
                    </div>
                  )}
                </section>
              </main>
            </ProtectedRoute>
          }
        />

        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart
                cart={cart}
                addToCart={addToCart}
                decreaseQty={decreaseQty}
                removeFromCart={removeFromCart}
                totalPrice={totalPrice}
                clearCart={clearCart}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
