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
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
  maxImageSizeMB: parseInt(process.env.MAX_IMAGE_SIZE_MB || "5", 10),
  overpassApiUrl: process.env.OVERPASS_API_URL || "https://overpass-api.de/api/interpreter",
  hospitalSearchRadius: parseInt(process.env.HOSPITAL_SEARCH_RADIUS || "5000", 10) || 5000,
};

if (!env.mongodbUri) console.warn("[env] MONGODB_URI missing");
if (!env.clerkSecretKey) {
  console.warn("[env] CLERK_SECRET_KEY missing - auth will use dev bypass header x-dev-user-id");
} else if (!env.clerkSecretKey.startsWith("sk_") || env.clerkSecretKey.includes("placeholder")) {
  console.warn("[env] CLERK_SECRET_KEY looks like a placeholder - auth will use dev bypass header x-dev-user-id. Set a real sk_ key and RESTART node to use Clerk.");
} else {
  console.info("[env] Clerk auth mode active (secret key present).");
}
