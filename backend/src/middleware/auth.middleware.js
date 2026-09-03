import { clerkMiddleware, getAuth } from "@clerk/express";
import { env } from "../config/env.js";

// Use Clerk middleware only when a real key is configured; otherwise dev bypass mode
const hasClerk = env.clerkSecretKey && env.clerkSecretKey.startsWith("sk_") && !env.clerkSecretKey.includes("placeholder");
export const clerkAuth = hasClerk ? clerkMiddleware() : (req, _res, next) => next();

// Require authenticated user - supports dev bypass via header x-dev-user-id when no Clerk key
export function requireAuth(req, res, next) {
  // Dev bypass for local testing without Clerk keys: send header x-dev-user-id
  const devUserId = req.headers["x-dev-user-id"];
  if (devUserId && typeof devUserId === "string") {
    req.auth = { userId: devUserId };
    req.userId = devUserId;
    return next();
  }
  const auth = getAuth(req);
  if (!auth?.userId) return res.status(401).json({ error: "Unauthorized" });
  req.auth = auth;
  req.userId = auth.userId;
  next();
}
