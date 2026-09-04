import app from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";

connectDB().then(() => {
  const secret = env.clerkSecretKey || "";
  const clerkMode = secret.startsWith("sk_") && !secret.includes("placeholder");
  console.log(`[backend] auth mode: ${clerkMode ? "clerk" : "DEV-BYPASS (x-dev-user-id header)"}`);
  app.listen(env.port, () => console.log(`[backend] listening on http://localhost:${env.port}`));
}).catch(e => { console.error(e); process.exit(1); });
