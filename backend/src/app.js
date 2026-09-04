import express from "express";
import cors from "cors";
import { clerkAuth } from "./middleware/auth.middleware.js";
import { errorMiddleware, notFound } from "./middleware/error.middleware.js";
import conversationRoutes from "./routes/conversation.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import hospitalRoutes from "./routes/hospital.routes.js";
import { env } from "./config/env.js";

const app = express();
app.use(cors({ origin: env.frontendUrl, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(clerkAuth);

app.get("/health", (req, res) => res.json({ status: "ok", aiService: env.aiServiceUrl }));
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/conversations", conversationRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/hospitals", hospitalRoutes);

app.use(notFound);
app.use(errorMiddleware);
export default app;
