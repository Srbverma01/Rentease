import React from "react";
import { render, screen } from "@testing-library/react";

jest.mock("./api", () => ({
  __esModule: true,
  default: {
    post: jest.fn(() => Promise.resolve({ data: {} })),
    interceptors: {
      request: {
        use: jest.fn(),
      },
    },
  },
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

test("renders login form", () => {
  render(<Login />);
  expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument();
});
