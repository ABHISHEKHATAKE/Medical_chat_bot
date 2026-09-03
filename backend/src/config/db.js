import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDB() {
  if (!env.mongodbUri) throw new Error("MONGODB_URI required");
  mongoose.set("strictQuery", true);
  await mongoose.connect(env.mongodbUri);
  console.log("[db] MongoDB connected");
}
