import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: false,
});

// Attach auth: Clerk Bearer token if available, otherwise dev header
api.interceptors.request.use(async (config) => {
  // Try Clerk token if Clerk is configured
  const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  const hasClerk = clerkKey && !clerkKey.includes("placeholder") && clerkKey.startsWith("pk_");
  if (hasClerk && window.Clerk?.session) {
    try {
      const token = await window.Clerk.session.getToken();
      if (token) config.headers["Authorization"] = `Bearer ${token}`;
    } catch {}
  }
  const devUser = localStorage.getItem("dev_user_id");
  if (devUser) config.headers["x-dev-user-id"] = devUser;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    // Let components handle 401 - don't auto-redirect to avoid logout on refresh while Clerk is loading
    return Promise.reject(error);
  }
);

export default api;
