import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Load backend/.env then fallback to root .env (for MONGODB_URI reuse)
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config();

export const env = {
  port: parseInt(process.env.PORT || "5000", 10),
  mongodbUri: process.env.MONGODB_URI,
  aiServiceUrl: process.env.AI_SERVICE_URL || "http://localhost:8000",
  clerkSecretKey: process.env.CLERK_SECRET_KEY,
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  nodeEnv: process.env.NODE_ENV || "development",
};

if (!env.mongodbUri) console.warn("[env] MONGODB_URI missing");
if (!env.clerkSecretKey) console.warn("[env] CLERK_SECRET_KEY missing - auth will use dev bypass header x-dev-user-id");
