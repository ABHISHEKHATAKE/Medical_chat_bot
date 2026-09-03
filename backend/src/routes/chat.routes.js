import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { chatSchema, allowedMimeTypes } from "../validators/chat.schema.js";
import * as ctrl from "../controllers/chat.controller.js";
import { env } from "../config/env.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: (env.maxImageSizeMB || 5) * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error(`Unsupported image type: ${file.mimetype}. Allowed: ${allowedMimeTypes.join(", ")}`));
  },
});

const r = Router();
// Multipart/form-data with optional image, then validation (validates text fields after multer populates req.body)
r.post("/", requireAuth, upload.single("image"), validate(chatSchema, "body"), ctrl.chat);
export default r;
