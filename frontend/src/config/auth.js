// Single source of truth for frontend auth mode.
//
// IMPORTANT: Vite embeds import.meta.env.* into the JS bundle when the dev
// server starts (or at `npm run build` time). Editing frontend/.env afterwards
// has NO effect until you restart vite (Ctrl+C, then `npm run dev` again).
// If the key below is missing/placeholder, the app silently falls back to the
// local dev login form instead of Clerk - that is the "different login page".

export const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "";

export const HAS_CLERK =
  CLERK_PUBLISHABLE_KEY.length > 0 &&
  !CLERK_PUBLISHABLE_KEY.includes("placeholder") &&
  CLERK_PUBLISHABLE_KEY.startsWith("pk_");

export const AUTH_MODE = HAS_CLERK ? "clerk" : "dev";

// Backwards-compatible helper used across pages and hooks.
export function isClerkConfigured() {
  return HAS_CLERK;
}

if (!HAS_CLERK) {
  // Visible in DevTools console so a wrong login page is never a mystery.
  console.warn(
    "[auth] Clerk publishable key missing or placeholder - running in DEV login mode. " +
      "Set VITE_CLERK_PUBLISHABLE_KEY in frontend/.env and RESTART vite to use Clerk."
  );
} else {
  console.info("[auth] Clerk mode active.");
}
