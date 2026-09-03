import { clerkMiddleware, getAuth } from "@clerk/express";
import { env } from "../config/env.js";

// Use Clerk middleware only when a real key is configured; otherwise dev bypass mode
const hasClerk = env.clerkSecretKey && env.clerkSecretKey.startsWith("sk_") && !env.clerkSecretKey.includes("placeholder");
export const clerkAuth = hasClerk ? clerkMiddleware() : (req, _res, next) => next();

// Require authenticated user - supports dev bypass via header x-dev-user-id when no Clerk key
export function requireAuth(req, res, next) {
  const hasClerk = env.clerkSecretKey && env.clerkSecretKey.startsWith("sk_") && !env.clerkSecretKey.includes("placeholder");
  // Only allow dev header when Clerk is NOT configured (local dev mode)
  if (!hasClerk) {
    const devUserId = req.headers["x-dev-user-id"];
    if (devUserId && typeof devUserId === "string" && devUserId.trim().length > 0) {
      req.auth = { userId: devUserId.trim() };
      req.userId = devUserId.trim();
      return next();
    }
    return res.status(401).json({ error: "Unauthorized - please sign in" });
  }
  const auth = getAuth(req);
  if (!auth?.userId) return res.status(401).json({ error: "Unauthorized - please sign in" });
  req.auth = auth;
  req.userId = auth.userId;
  next();
}
