import env from "@web/lib/env";
import { useAuthStore } from "@web/stores/auth-store";
// import { useAuthStore } from "@web/stores/auth-store";
import axios from "axios";
import { toast } from "sonner";

export const axiosInstance = axios.create({
  baseURL: env.VITE_API_URL,
  withCredentials: true
});

axiosInstance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const AUTH_TOAST_ID = "auth";

const AUTH_ENDPOINTS = [
  "/auth/login",
  "/auth/signup",
  "/auth/verify-email",
  "/auth/resend-verification"
];

function isAuthEndpoint(url?: string) {
  if (!url) return false;
  return AUTH_ENDPOINTS.some((path) => url.includes(path));
}

axiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const url = err.config?.url;
    const isLoggedIn = !!useAuthStore.getState().token;

    if (status === 401 && isLoggedIn && !isAuthEndpoint(url)) {
      useAuthStore.getState().clear();

      toast("Session expired", {
        id: AUTH_TOAST_ID,
        description: "Please login again"
      });
    }

    return Promise.reject(err);
  }
);
