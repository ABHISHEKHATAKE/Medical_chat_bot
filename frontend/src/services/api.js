import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: false,
});

// Attach auth: Clerk Bearer token if available, otherwise dev header
// We store a getter for the Clerk token that is set from React components when Clerk is ready
let clerkGetToken = null;
export function setClerkTokenGetter(getter) {
  clerkGetToken = getter;
}

api.interceptors.request.use(async (config) => {
  const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  const hasClerk = clerkKey && !clerkKey.includes("placeholder") && clerkKey.startsWith("pk_");

  // In Clerk mode, only send Authorization header, not dev header
  if (hasClerk) {
    let token = null;
    // Try the injected getter first (from useAuth), then fallback to window.Clerk
    if (clerkGetToken) {
      try {
        token = await clerkGetToken();
      } catch {}
    }
    if (!token && window.Clerk?.session) {
      try {
        token = await window.Clerk.session.getToken();
      } catch {}
    }
    // Fallback already handled via window.Clerk.session.getToken() above, no template needed

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
      return config;
    }
    // If Clerk is configured but no token yet (still loading), don't fall back to dev header
    // Let the request go without auth and let the backend return 401 - the UI will handle it
    // But don't send stale dev header that might confuse the backend
    return config;
  }

  // Dev mode: send x-dev-user-id
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
