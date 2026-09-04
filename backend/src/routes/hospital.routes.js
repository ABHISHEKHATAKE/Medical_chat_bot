import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { nearbyHospitalsQuerySchema } from "../validators/hospital.schema.js";
import * as ctrl from "../controllers/hospital.controller.js";

const r = Router();
// Same protection as the rest of the app: Clerk user required (or dev header in dev mode).
r.get("/nearby", requireAuth, validate(nearbyHospitalsQuerySchema, "query"), ctrl.nearbyHospitals);
export default r;
