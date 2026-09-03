export function errorMiddleware(err, req, res, _next) {
  console.error("[error]", err);
  // Multer file size / type errors
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ error: `Image too large. Max ${process.env.MAX_IMAGE_SIZE_MB || 5}MB allowed.` });
  }
  if (err.message && err.message.includes("Unsupported image type")) {
    return res.status(400).json({ error: err.message });
  }
  const status = err.status || 500;
  // Hide internal stack traces, return clean message
  const message = status === 500 ? "Internal server error" : err.message || "Internal server error";
  res.status(status).json({ error: message });
}
export function notFound(req, res) {
  res.status(404).json({ error: "Not found" });
}
