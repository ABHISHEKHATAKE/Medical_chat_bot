import { findNearbyHospitals } from "../services/hospital.service.js";

export async function nearbyHospitals(req, res, next) {
  try {
    // Validated by validate(nearbyHospitalsQuerySchema, "query"): numbers in range.
    const { lat, lng, radius } = req.query;
    // req.userId is set by requireAuth (Clerk user). Never trust client identity.
    // Coordinates are used only for this search — never persisted to MongoDB.
    const rateLimitKey = req.userId || req.ip;
    const data = await findNearbyHospitals({ lat, lng, radiusM: radius, rateLimitKey });
    res.json(data);
  } catch (e) {
    next(e);
  }
}
