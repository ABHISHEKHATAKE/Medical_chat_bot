import { z } from "zod";

// Query params arrive as strings; coerce to numbers, then bound-check.
// Radius is optional (meters); server clamps it to a sane range.
export const nearbyHospitalsQuerySchema = z.object({
  lat: z.coerce
    .number({ invalid_type_error: "Latitude must be a number." })
    .min(-90, "Latitude must be between -90 and 90.")
    .max(90, "Latitude must be between -90 and 90."),
  lng: z.coerce
    .number({ invalid_type_error: "Longitude must be a number." })
    .min(-180, "Longitude must be between -180 and 180.")
    .max(180, "Longitude must be between -180 and 180."),
  radius: z.coerce
    .number({ invalid_type_error: "Radius must be a number." })
    .min(500, "Radius must be at least 500 meters.")
    .max(20000, "Radius must be at most 20000 meters.")
    .optional(),
});
