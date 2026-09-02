import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

jest.mock("./api", () => ({
  __esModule: true,
  default: {
    get: jest.fn(() => Promise.resolve({ data: {} })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
    patch: jest.fn(() => Promise.resolve({ data: {} })),
    delete: jest.fn(() => Promise.resolve({ data: {} })),
    interceptors: {
      request: {
        use: jest.fn(),
      },
    },
  },
}));

jest.mock("./auth", () => ({
  __esModule: true,
  resolveMediaURL: (path) => path || null,
  hasUsableSession: () => false,
}));

jest.mock(
  "react-router-dom",
  () => ({
    __esModule: true,
    BrowserRouter: ({ children }) => <>{children}</>,
    Routes: ({ children }) => <>{children}</>,
    Route: ({ element }) => element,
    Navigate: () => null,
    Link: ({ children, to, ...props }) => (
      <a href={to} {...props}>
        {children}
      </a>
    ),
    useLocation: () => ({ state: null, pathname: "/login" }),
    useNavigate: () => jest.fn(),
    useParams: () => ({}),
  }),
  { virtual: true }
);

import Login from "./pages/Login";
import ProductCard from "./components/ProductCard";
import Cart from "./pages/Cart";
import API from "./api";

test("renders login form", () => {
  render(<Login />);
  expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument();
});

test("product card renders rental metadata and add action", () => {
  const addToCart = jest.fn();

  render(
    <ProductCard
      product={{
        id: 1,
        name: "Study Desk",
        price: 1200,
        deposit: 800,
        stock: 2,
        condition: "Like New",
        delivery_time: "Tomorrow",
      }}
      addToCart={addToCart}
    />
  );

  expect(screen.getByText(/deposit rs 800/i)).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: /add to cart/i }));
  expect(addToCart).toHaveBeenCalledTimes(1);
});

test("cart checkout sends delivery and payment details", async () => {
  render(
    <Cart
      cart={[{ id: 1, name: "Study Desk", price: 1200, deposit: 800, qty: 1 }]}
      addToCart={jest.fn()}
      decreaseQty={jest.fn()}
      removeFromCart={jest.fn()}
      totalPrice={1200}
      clearCart={jest.fn()}
    />
  );

  fireEvent.change(screen.getByPlaceholderText(/your name/i), {
    target: { value: "Member User", name: "fullName" },
  });
  fireEvent.change(screen.getByPlaceholderText(/mobile number/i), {
    target: { value: "9999999999", name: "phone" },
  });
  fireEvent.change(screen.getByPlaceholderText(/house number/i), {
    target: { value: "12 Main Street", name: "address" },
  });
  fireEvent.change(screen.getByPlaceholderText(/452001/i), {
    target: { value: "452001", name: "pincode" },
  });
  fireEvent.click(screen.getByRole("button", { name: /proceed to checkout/i }));

  await waitFor(() => expect(API.post).toHaveBeenCalledWith(
    "/api/checkout/",
    expect.objectContaining({
      payment_method: "mock_upi",
      refundable_deposit: 800,
    })
  ));
});
