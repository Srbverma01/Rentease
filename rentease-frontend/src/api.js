import axios from "axios";

import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  isTokenExpired,
  refreshAccessToken,
  resolveApiBaseURL,
} from "./auth";

const API = axios.create({
  baseURL: resolveApiBaseURL(),
});

API.interceptors.request.use(async (req) => {
  const access = getAccessToken();
  const refresh = getRefreshToken();

  if (access && !isTokenExpired(access)) {
    req.headers.Authorization = `Bearer ${access}`;
    return req;
  }

  if (refresh) {
    try {
      const nextAccess = await refreshAccessToken();
      req.headers.Authorization = `Bearer ${nextAccess}`;
    } catch (error) {
      clearAuthTokens();
    }
  }

  return req;
});

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      getRefreshToken()
    ) {
      originalRequest._retry = true;

      try {
        const nextAccess = await refreshAccessToken();
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${nextAccess}`;
        return API(originalRequest);
      } catch (refreshError) {
        clearAuthTokens();
      }
    }

    return Promise.reject(error);
  }
);

export default API;
