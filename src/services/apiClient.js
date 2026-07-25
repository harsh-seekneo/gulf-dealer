import axios from "axios";

import { API_BASE_URL, API_WITH_CREDENTIALS } from "../config/env";
import { API_ENDPOINTS } from "../constant/apiEndpoints";
import {
  getAccessToken,
  removeAccessToken,
  setAccessToken,
} from "../utils/tokenStorage";
import { redirectToUserLogin } from "../utils/authRedirect";

const authSkipEndpoints = [
  API_ENDPOINTS.AUTH.LOGOUT,
  API_ENDPOINTS.AUTH.REFRESH_TOKEN,
];

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: API_WITH_CREDENTIALS,
  headers: {
    "Content-Type": "application/json",
  },
});

export const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: API_WITH_CREDENTIALS,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let refreshSubscribers = [];
let sessionValidationPromise = null;

const shouldSkipRefresh = (url = "") =>
  authSkipEndpoints.some((endpoint) => url.includes(endpoint));

const addRefreshSubscriber = (callback) => {
  refreshSubscribers.push(callback);
};

const notifyRefreshSubscribers = (token) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

const rejectRefreshSubscribers = (error) => {
  refreshSubscribers.forEach((callback) => callback(null, error));
  refreshSubscribers = [];
};

const redirectToLogin = () => {
  removeAccessToken();
  redirectToUserLogin();
};

const validateSessionBeforeRequest = async () => {
  if (!sessionValidationPromise) {
    sessionValidationPromise = refreshClient
      .post(API_ENDPOINTS.AUTH.REFRESH_TOKEN)
      .then((response) => {
        const newAccessToken = response.data?.data?.accessToken;

        if (!newAccessToken) {
          throw new Error("Access token missing after refresh");
        }

        setAccessToken(newAccessToken);
        return newAccessToken;
      })
      .finally(() => {
        sessionValidationPromise = null;
      });
  }

  return sessionValidationPromise;
};

apiClient.interceptors.request.use(async (config) => {
  let accessToken = getAccessToken();

  if (!shouldSkipRefresh(config.url)) {
    try {
      accessToken = await validateSessionBeforeRequest();
    } catch (error) {
      removeAccessToken();
      redirectToUserLogin();
      return Promise.reject(error);
    }
  }

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (
      !originalRequest ||
      status !== 401 ||
      originalRequest._retry ||
      shouldSkipRefresh(originalRequest.url)
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        addRefreshSubscriber((token, refreshError) => {
          if (refreshError || !token) {
            reject(refreshError || error);
            return;
          }

          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(apiClient(originalRequest));
        });
      });
    }

    isRefreshing = true;

    try {
      const refreshResponse = await refreshClient.post(
        API_ENDPOINTS.AUTH.REFRESH_TOKEN,
      );
      const newAccessToken = refreshResponse.data?.data?.accessToken;

      if (!newAccessToken) {
        throw new Error("Access token missing after refresh");
      }

      setAccessToken(newAccessToken);
      notifyRefreshSubscribers(newAccessToken);
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return apiClient(originalRequest);
    } catch (refreshError) {
      rejectRefreshSubscribers(refreshError);
      redirectToLogin();

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default apiClient;
