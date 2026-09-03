import axios from "axios";
import { env } from "../config/env.js";

const client = axios.create({
  baseURL: env.aiServiceUrl,
  timeout: 60000,
  headers: { "Content-Type": "application/json" },
});

export async function askRag({ sessionId, question, imageUrl }) {
  try {
    const payload = { session_id: sessionId, question };
    if (imageUrl) payload.image_url = imageUrl;
    const res = await client.post("/ask", payload);
    // Python returns {answer, used_context, sources, image_analysis}
    return {
      answer: res.data.answer,
      used_context: res.data.used_context,
      sources: res.data.sources || [],
      imageAnalysis: res.data.image_analysis || null,
    };
  } catch (e) {
    if (e.response) {
      const status = e.response.status;
      const detail = e.response.data?.detail || e.response.data?.error || JSON.stringify(e.response.data);
      const err = new Error(detail);
      err.status = status === 400 ? 400 : 502;
      err.detail = detail;
      throw err;
    }
    if (e.code === "ECONNREFUSED" || e.code === "ETIMEDOUT") {
      const err = new Error("Medical AI service is temporarily unavailable. Please try again.");
      err.status = 503;
      throw err;
    }
    throw e;
  }
}

export async function healthCheck() {
  const res = await client.get("/health");
  return res.data;
}
