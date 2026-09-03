import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  // Clerk token will be injected via hook; fallback dev header for local without Clerk
  const devUser = localStorage.getItem("dev_user_id");
  if (devUser) config.headers["x-dev-user-id"] = devUser;
  return config;
});

export default api;
