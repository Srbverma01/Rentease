import axios from "axios";

const ACCESS_TOKEN_KEY = "access";
const REFRESH_TOKEN_KEY = "refresh";
const EXPIRY_BUFFER_MS = 5000;
const ABSOLUTE_URL_PATTERN = /^https?:\/\//i;

const normalizeBaseURL = (value = "") => value.replace(/\/+$/, "");

export const resolveApiBaseURL = () => normalizeBaseURL(process.env.REACT_APP_API_BASE_URL || "");

export const resolveMediaURL = (path) => {
  if (!path) {
    return null;
  }

  if (ABSOLUTE_URL_PATTERN.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${resolveApiBaseURL()}${normalizedPath}`;
};

const decodeTokenPayload = (token) => {
  try {
    const base64 = token.split(".")[1];
    const normalized = base64.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
    const json = typeof window === "undefined"
      ? Buffer.from(padded, "base64").toString("utf-8")
      : window.atob(padded);

    return JSON.parse(json);
  } catch (error) {
    return null;
  }
};

export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

export const storeAuthTokens = ({ access, refresh }) => {
  if (access) {
    localStorage.setItem(ACCESS_TOKEN_KEY, access);
  }

  if (refresh) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  }
};

export const clearAuthTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const isTokenExpired = (token) => {
  const payload = decodeTokenPayload(token);
  if (!payload?.exp) {
    return true;
  }

  return payload.exp * 1000 <= Date.now() + EXPIRY_BUFFER_MS;
};

export const hasValidAccessToken = () => {
  const access = getAccessToken();
  return Boolean(access && !isTokenExpired(access));
};

export const hasUsableSession = () => {
  const refresh = getRefreshToken();

  if (hasValidAccessToken()) {
    return true;
  }

  return Boolean(refresh && !isTokenExpired(refresh));
};

let refreshPromise = null;

export const refreshAccessToken = async () => {
  const refresh = getRefreshToken();

  if (!refresh || isTokenExpired(refresh)) {
    clearAuthTokens();
    throw new Error("Session expired");
  }

  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${resolveApiBaseURL()}/api/token/refresh/`, { refresh })
      .then((response) => {
        storeAuthTokens({ access: response.data.access, refresh });
        return response.data.access;
      })
      .catch((error) => {
        clearAuthTokens();
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};
