import React, { useEffect, useRef, useState } from "react";
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";

import API from "./api";
import "./App.css";
import { hasUsableSession, resolveMediaURL } from "./auth";
import Navbar from "./components/Navbar";
import { GuestRoute, ProtectedRoute } from "./components/ProtectedRoute";
import Hero from "./components/Hero";
import ProductCard from "./components/ProductCard";
import SiteFooter from "./components/SiteFooter";
import WhatsAppChat from "./components/WhatsAppChat";
import WhyUs from "./components/WhyUs";
import Cart from "./pages/Cart";
import ForgotPassword from "./pages/ForgotPassword";
import FooterPage from "./pages/FooterPage";
import History from "./pages/History";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";

const rentalCategories = [
  {
    id: "packages",
    title: "Packages",
    keywords: [],
  },
  {
    id: "beds",
    title: "Beds",
    keywords: ["bed", "mattress"],
  },
  {
    id: "sofas",
    title: "Sofas",
    keywords: ["sofa", "couch", "seating"],
  },
  {
    id: "wardrobes",
    title: "Wardrobe & Organizer",
    keywords: ["wardrobe", "organizer", "storage", "drawer", "chest"],
  },
  {
    id: "refrigerators",
    title: "Refrigerators & Freezers",
    keywords: ["refrigerator", "fridge", "freezer"],
  },
  {
    id: "televisions",
    title: "Televisions",
    keywords: ["tv", "television"],
  },
  {
    id: "washing-machines",
    title: "Washing Machines",
    keywords: ["washing", "washer", "laundry"],
  },
  {
    id: "air-conditioners",
    title: "Air Conditioners",
    keywords: ["air conditioner", "ac", "cooler"],
  },
  {
    id: "water-purifiers",
    title: "Water Purifiers",
    keywords: ["water purifier", "purifier", "filter"],
  },
  {
    id: "chairs",
    title: "Chairs & Stools",
    keywords: ["chair", "stool", "seat"],
  },
  {
    id: "study-tables",
    title: "Study Tables",
    keywords: ["study", "desk", "work", "table"],
  },
  {
    id: "center-tables",
    title: "Center Tables",
    keywords: ["center table", "coffee table", "dining"],
  },
];

const getProductCategory = (product) => {
  if (product.category) {
    const normalizedCategory = product.category.toLowerCase();
    const directMatch = rentalCategories.find(
      (category) => category.id === normalizedCategory || category.title.toLowerCase() === normalizedCategory
    );

    if (directMatch) {
      return directMatch;
    }
  }

  const name = (product.name || "").toLowerCase();
  return rentalCategories.find((category) =>
    category.keywords.some((keyword) => name.includes(keyword))
  );
};

const mapCartItem = (item) => ({
  id: item.product,
  cartItemId: item.id,
  name: item.product_name,
  price: item.price,
  image: item.image,
  deposit: item.deposit || 0,
  stock: item.stock || 0,
  qty: item.quantity,
});

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingCart, setIsLoadingCart] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const catalogSectionRef = useRef(null);
  const categorySectionRefs = useRef({});

  const loadCart = async () => {
    if (!hasUsableSession()) {
      setCart([]);
      return;
    }

    setIsLoadingCart(true);

    try {
      const response = await API.get("/api/cart/");
      setCart(response.data.items.map(mapCartItem));
    } catch (error) {
      setCart([]);
    } finally {
      setIsLoadingCart(false);
    }
  };

  useEffect(() => {
    API.get("/api/products/")
      .then((res) => {
        setProducts(res.data);
      })
      .catch(() => {})
      .finally(() => setIsLoadingProducts(false));
  }, []);

  useEffect(() => {
    loadCart();

    const handleAuthChange = () => loadCart();
    window.addEventListener("rentease-auth-changed", handleAuthChange);

    return () => {
      window.removeEventListener("rentease-auth-changed", handleAuthChange);
    };
  }, []);

  const updateCartFromResponse = (response) => {
    setCart(response.data.items.map(mapCartItem));
  };

  const addToCart = async (product) => {
    const response = await API.post("/api/cart/items/", {
      product: product.id,
      quantity: 1,
    });
    updateCartFromResponse(response);
  };

  const removeFromCart = async (product) => {
    const response = await API.delete(`/api/cart/items/${product.id}/`);
    updateCartFromResponse(response);
  };

  const decreaseQty = async (product) => {
    if (product.qty <= 1) {
      removeFromCart(product);
    } else {
      const response = await API.patch(`/api/cart/items/${product.id}/`, {
        quantity: product.qty - 1,
      });
      updateCartFromResponse(response);
    }
  };

  const clearCart = async () => {
    const response = await API.delete("/api/cart/");
    updateCartFromResponse(response);
  };

  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.qty,
    0
  );
  const cartCount = cart.reduce((count, item) => count + item.qty, 0);
  const categorizedProducts = rentalCategories.map((category) => ({
    ...category,
    products: products.filter((product) => getProductCategory(product)?.id === category.id),
  }));
  const activeCategory =
    selectedCategoryId === "all"
      ? null
      : categorizedProducts.find((category) => category.id === selectedCategoryId);
  const activeFeaturedProduct =
    (activeCategory?.products || products).find((product) => product.image) || products[0];
  const activeFeaturedImage = resolveMediaURL(activeFeaturedProduct?.image);
  const visibleCategoryGroups = categorizedProducts.filter(
    (category) => category.id === "packages" || category.products.length > 0
  );

  const scrollToCategory = (categoryId) => {
    setSelectedCategoryId(categoryId);

    window.requestAnimationFrame(() => {
      const target =
        categoryId === "all" ? catalogSectionRef.current : categorySectionRefs.current[categoryId];

      target?.scrollIntoView({
        behavior: "smooth",
        block: categoryId === "all" ? "start" : "center",
      });
    });
  };

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
          <Route path="/about-us" element={<FooterPage />} />
          <Route path="/benefits" element={<FooterPage />} />
          <Route path="/careers" element={<FooterPage />} />
          <Route path="/contact" element={<FooterPage />} />
          <Route path="/sitemap" element={<FooterPage />} />
          <Route path="/business" element={<FooterPage />} />
          <Route path="/blog" element={<FooterPage />} />
          <Route path="/support" element={<FooterPage />} />
          <Route path="/documents-required" element={<FooterPage />} />
          <Route path="/annual-returns" element={<FooterPage />} />
          <Route path="/investor-relations" element={<FooterPage />} />
          <Route path="/shipping-policy" element={<FooterPage />} />
          <Route path="/cancellation-return" element={<FooterPage />} />
          <Route path="/privacy-policy" element={<FooterPage />} />
          <Route path="/rental-terms" element={<FooterPage />} />
          <Route path="/referral-terms" element={<FooterPage />} />
          <Route path="/download/:downloadSlug" element={<FooterPage />} />
          <Route path="/social/:socialSlug" element={<FooterPage />} />
          <Route path="/browse/:browseSlug" element={<FooterPage />} />

          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <main className="page-surface">
                  <Hero />
                  <WhyUs />

                  <section className="section-shell catalog-shell" id="catalog" ref={catalogSectionRef}>
                    <div className="category-explorer">
                      <div className="category-feature">
                        <div className="category-feature-card">
                          {activeFeaturedImage ? (
                            <img src={activeFeaturedImage} alt={activeFeaturedProduct.name} />
                          ) : (
                            <div className="category-feature-placeholder">RentEase</div>
                          )}
                          <button
                            className="category-feature-action"
                            type="button"
                            onClick={() => scrollToCategory(activeCategory?.id || "sofas")}
                          >
                            Explore {activeCategory?.title || "categories"} <span aria-hidden="true">-&gt;</span>
                          </button>
                        </div>
                      </div>

                      <div className="category-explorer-body">
                        <div className="catalog-head">
                          <div className="section-head">
                            <span className="section-kicker">Ready To Rent</span>
                            <h2 className="section-title">
                              Explore <span>our Top Categories</span>
                            </h2>
                            <p className="section-subtitle">
                              Browse by category, then add the right rental items to your cart.
                            </p>
                          </div>

                          <div className="catalog-tag">
                            {isLoadingCart ? "Syncing cart..." : `${cartCount} item(s) in cart`}
                          </div>
                        </div>

                        <div className="category-tile-grid" aria-label="Explore rental categories">
                          <button
                            className={selectedCategoryId === "all" ? "category-tile is-active" : "category-tile"}
                            type="button"
                            onClick={() => scrollToCategory("all")}
                            aria-pressed={selectedCategoryId === "all"}
                          >
                            <span className="category-tile-image">All</span>
                            <strong>All Categories</strong>
                          </button>

                          {categorizedProducts.map((category) => {
                            const categoryImage = resolveMediaURL(
                              category.products.find((product) => product.image)?.image
                            );

                            return (
                              <button
                                className={
                                  selectedCategoryId === category.id
                                    ? "category-tile is-active"
                                    : "category-tile"
                                }
                                key={category.id}
                                type="button"
                                onClick={() => scrollToCategory(category.id)}
                                aria-pressed={selectedCategoryId === category.id}
                              >
                                <span className="category-tile-image">
                                  {categoryImage ? (
                                    <img src={categoryImage} alt="" />
                                  ) : (
                                    category.title.slice(0, 2)
                                  )}
                                </span>
                                <strong>{category.title}</strong>
                              </button>
                            );
                          })}
                        </div>

                        <button
                          className="view-more-categories"
                          type="button"
                          onClick={() => scrollToCategory("all")}
                        >
                          View More categories <span aria-hidden="true">v</span>
                        </button>
                      </div>
                    </div>

                    {isLoadingProducts ? (
                      <div className="catalog-empty">
                        <h3>Loading the latest rental collection...</h3>
                        <p className="section-subtitle">
                          We are pulling in the newest products from your catalog right now.
                        </p>
                      </div>
                    ) : visibleCategoryGroups.length > 0 ? (
                      <div className="category-product-groups">
                        {visibleCategoryGroups.map((category) => (
                          <section
                            className="category-product-group"
                            key={category.id}
                            ref={(element) => {
                              categorySectionRefs.current[category.id] = element;
                            }}
                          >
                            <div className="category-product-head">
                              <h3>{category.title}</h3>
                              <span>{category.products.length} item(s)</span>
                            </div>

                            {category.products.length ? (
                              <div className="catalog-grid">
                                {category.products.map((product) => (
                                  <ProductCard
                                    key={product.id}
                                    product={product}
                                    addToCart={addToCart}
                                    isInCart={cart.some((item) => item.id === product.id)}
                                  />
                                ))}
                              </div>
                            ) : (
                              <div className="catalog-empty catalog-empty--compact">
                                <h3>No package items yet.</h3>
                              </div>
                            )}
                          </section>
                        ))}
                      </div>
                    ) : (
                      <div className="catalog-empty">
                        <h3>No products are available in this category yet.</h3>
                        <p className="section-subtitle">
                          Choose another category or add more products from the backend.
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
      <SiteFooter />
      <WhatsAppChat />
    </Router>
  );
}

export default App;
