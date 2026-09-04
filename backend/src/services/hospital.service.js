import axios from "axios";
import { env } from "../config/env.js";

const DEFAULT_RADIUS_M = 5000;
const MAX_RESULTS = 10;
const CACHE_TTL_MS = 5 * 60 * 1000;
// Simple per-user sliding-window limiter: 10 Overpass calls / minute / user.
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 10;

// In-memory result cache: key -> { expiresAt, data }. Short TTL only,
// so reopening the page or retrying doesn't hammer the public Overpass API.
const cache = new Map();
// In-memory rate-limit buckets: key -> [timestamps]
const buckets = new Map();

function checkRateLimit(key) {
  const now = Date.now();
  const hits = (buckets.get(key) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (hits.length >= RATE_LIMIT_MAX) {
    const err = new Error("Too many hospital searches. Please wait a minute and try again.");
    err.status = 429;
    throw err;
  }
  hits.push(now);
  buckets.set(key, hits);
}

function haversineKm(lat1, lng1, lat2, lng2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function buildOverpassQuery(lat, lng, radiusM) {
  // `nwr` searches nodes, ways AND relations in one spatial pass (cheaper
  // than three separate around-queries). `out center tags 20` bounds cost:
  // coordinates for ways/relations come via their center, capped at 20 hits
  // (we only ever return the closest 10).
  return `[out:json][timeout:25];
nwr["amenity"="hospital"](around:${radiusM},${lat},${lng});
out center tags 20;`;
}

function addressFromTags(tags) {
  const parts = [
    tags["addr:housenumber"] && tags["addr:street"]
      ? `${tags["addr:housenumber"]} ${tags["addr:street"]}`
      : tags["addr:street"],
    tags["addr:suburb"] || tags["addr:neighbourhood"],
    tags["addr:city"] || tags["addr:town"] || tags["addr:village"],
    tags["addr:state"],
    tags["addr:postcode"],
    tags["addr:country"],
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : null;
}

function normalizeElement(el, userLat, userLng) {
  const tags = el.tags || {};
  // Nodes carry lat/lon directly; ways/relations come back with a center.
  const latitude = typeof el.lat === "number" ? el.lat : el.center?.lat;
  const longitude = typeof el.lon === "number" ? el.lon : el.center?.lon;
  if (typeof latitude !== "number" || typeof longitude !== "number") return null;

  const hospital = {
    id: `${el.type}/${el.id}`,
    name: tags.name || "Unnamed Hospital",
    latitude,
    longitude,
    distance: Math.round(haversineKm(userLat, userLng, latitude, longitude) * 10) / 10,
  };
  // Only include fields that actually exist — never "undefined"/empty labels.
  const address = addressFromTags(tags);
  if (address) hospital.address = address;
  const phone = tags.phone || tags["contact:phone"];
  if (phone) hospital.phone = phone;
  const website = tags.website || tags["contact:website"];
  if (website) hospital.website = website;
  if (tags.opening_hours) hospital.openingHours = tags.opening_hours;
  if (tags.emergency === "yes") hospital.emergency = true;
  return hospital;
}

export async function findNearbyHospitals({ lat, lng, radiusM, rateLimitKey }) {
  const radius = radiusM || env.hospitalSearchRadius || DEFAULT_RADIUS_M;
  if (rateLimitKey) checkRateLimit(rateLimitKey);

  const cacheKey = `${lat.toFixed(3)},${lng.toFixed(3)},${radius}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.data;

  // Public mirrors require a meaningful User-Agent (axios' default gets
  // rate-limited), and the main endpoint can refuse clients outright (406),
  // so try the configured primary first, then the fallback mirror.
  const endpoints = [env.overpassApiUrl, "https://overpass.kumi.systems/api/interpreter"].filter(
    (u, i, arr) => u && arr.indexOf(u) === i
  );
  const query = buildOverpassQuery(lat, lng, radius);
  let res = null;
  let lastError = null;
  for (const endpoint of endpoints) {
    try {
      res = await axios.post(endpoint, new URLSearchParams({ data: query }).toString(), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "MediChat/1.0 (medical chatbot hospital finder)",
        },
        timeout: 30000,
      });
      break;
    } catch (e) {
      lastError = e;
      console.error(`[hospitals] Overpass ${endpoint} failed:`, e.response?.status || e.code || e.message);
    }
  }
  if (!res) {
    const e = lastError;
    if (e?.response) {
      const err = new Error("Hospital search service returned an error. Please try again later.");
      err.status = 502;
      throw err;
    }
    const err = new Error("Unable to reach the hospital search service. Please try again later.");
    err.status = 503;
    throw err;
  }

  const elements = res.data?.elements || [];
  const hospitals = elements
    .map((el) => normalizeElement(el, lat, lng))
    .filter(Boolean)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, MAX_RESULTS);

  const data = {
    success: true,
    userLocation: { latitude: lat, longitude: lng },
    hospitals,
  };
  cache.set(cacheKey, { expiresAt: Date.now() + CACHE_TTL_MS, data });
  return data;
}

// Exported for unit testing without HTTP.
export const __testables = { haversineKm, normalizeElement, buildOverpassQuery };
