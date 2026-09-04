import api from "./api.js";

// Auth (Clerk Bearer / dev header) is attached by the api.js interceptor.
// Only latitude/longitude ever leave the browser — never stored server-side.
export const getNearbyHospitals = (lat, lng, radius) => {
  const params = new URLSearchParams({ lat: String(lat), lng: String(lng) });
  if (radius) params.set("radius", String(radius));
  return api.get(`/api/hospitals/nearby?${params.toString()}`).then((r) => r.data);
};
