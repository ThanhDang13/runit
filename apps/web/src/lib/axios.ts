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

axiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().clear();
      toast("Session expired", {
        id: AUTH_TOAST_ID,
        description: "Please login again"
      });
    }
    return Promise.reject(err);
  }
);
