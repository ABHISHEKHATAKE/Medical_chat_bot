import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { chatSchema } from "../validators/chat.schema.js";
import * as ctrl from "../controllers/chat.controller.js";
const r = Router();
r.post("/", requireAuth, validate(chatSchema, "body"), ctrl.chat);
export default r;
