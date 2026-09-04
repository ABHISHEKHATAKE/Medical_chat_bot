import { useState } from "react";
import { Hospital as HospitalIcon, Loader2, MapPinOff, SearchX, AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "../ui/button.jsx";
import { getNearbyHospitals } from "../../services/hospital.api.js";
import { HospitalMap } from "./HospitalMap.jsx";
import { HospitalCard } from "./HospitalCard.jsx";

const RADIUS_STEPS = [5000, 10000, 20000];

function locateOnce() {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("unsupported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: 15000,
      maximumAge: 60000,
    });
  });
}

function friendlyError(err) {
  // Never expose raw backend/Overpass errors.
  const msg = err?.response?.data?.error || "";
  if (err?.response?.status === 429) return "Too many searches. Please wait a minute and try again.";
  if (err?.response?.status === 400) return "That location looks invalid. Please try again.";
  if (msg) return msg;
  return "Unable to find nearby hospitals right now. Please try again later.";
}

export function NearbyHospitals() {
  const [status, setStatus] = useState("idle"); // idle|locating|searching|done|denied|unavailable|empty|error
  const [error, setError] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [radius, setRadius] = useState(RADIUS_STEPS[0]);
  const [selectedId, setSelectedId] = useState(null);

  const searchAt = async (lat, lng, searchRadius) => {
    setStatus("searching");
    setError("");
    try {
      const data = await getNearbyHospitals(lat, lng, searchRadius);
      setUserLocation(data.userLocation);
      setHospitals(data.hospitals || []);
      setSelectedId(null);
      setStatus((data.hospitals || []).length > 0 ? "done" : "empty");
    } catch (e) {
      setError(friendlyError(e));
      setStatus("error");
    }
  };

  const handleFind = async (searchRadius = RADIUS_STEPS[0]) => {
    setRadius(searchRadius);
    setStatus("locating");
    setError("");
    try {
      const pos = await locateOnce();
      await searchAt(pos.coords.latitude, pos.coords.longitude, searchRadius);
    } catch (geoErr) {
      // GeolocationPositionError.code: 1 = denied, 2 = unavailable, 3 = timeout
      if (geoErr?.message === "unsupported" || geoErr?.code === 2 || geoErr?.code === 3) {
        setStatus("unavailable");
      } else {
        setStatus("denied");
      }
    }
  };

  const expandSearch = () => {
    const next = RADIUS_STEPS.find((r) => r > radius) || RADIUS_STEPS[RADIUS_STEPS.length - 1];
    if (userLocation) {
      setRadius(next);
      searchAt(userLocation.latitude, userLocation.longitude, next);
    } else {
      handleFind(next);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[960px] px-4 py-6 sm:px-6">
      {(status === "idle" || status === "denied" || status === "unavailable") && hospitals.length === 0 && (
        <div className="mx-auto max-w-[560px] py-10 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white dark:bg-[#212121] border border-[#E5E7EB] dark:border-[#3A3A3A] shadow-soft">
            <HospitalIcon size={24} className="text-[#16A34A]" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight dark:text-[#ECECEC]">Find Nearby Hospitals</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Share your location once to see hospitals near you on a map. Your coordinates are only used for this search.
          </p>
          <Button
            size="lg"
            className="mt-6 gap-2 rounded-full"
            disabled={status === "locating"}
            onClick={() => handleFind(RADIUS_STEPS[0])}
            aria-label="Find nearby hospitals (requests your location)"
          >
            {status === "locating" ? (
              <><Loader2 size={16} className="animate-spin" /> Getting your location…</>
            ) : (
              <><HospitalIcon size={16} /> Find Nearby Hospitals</>
            )}
          </Button>
          {status === "denied" && (
            <p role="alert" className="mx-auto mt-4 max-w-[440px] rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
              Location access was denied. Please allow location access in your browser settings and try again.
            </p>
          )}
          {status === "unavailable" && (
            <div role="alert" className="mx-auto mt-4 max-w-[440px] rounded-xl border border-[#E5E7EB] dark:border-[#3A3A3A] bg-white dark:bg-[#212121] px-4 py-3 text-sm">
              <p className="flex items-center justify-center gap-2 font-medium"><MapPinOff size={14} /> Unable to determine your location. Please try again.</p>
              <Button variant="outline" size="sm" className="mt-3 rounded-full" onClick={() => handleFind(RADIUS_STEPS[0])}>Retry</Button>
            </div>
          )}
        </div>
      )}

      {status === "searching" && (
        <div className="py-16 text-center" role="status" aria-live="polite">
          <Loader2 size={28} className="mx-auto animate-spin text-slate-400" />
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Finding nearby hospitals…</p>
        </div>
      )}

      {status === "error" && (
        <div className="mx-auto max-w-[560px] py-10 text-center" role="alert">
          <AlertTriangle size={28} className="mx-auto text-red-500" />
          <p className="mt-3 text-sm font-medium dark:text-[#ECECEC]">{error}</p>
          <Button size="sm" variant="outline" className="mt-4 gap-2 rounded-full" onClick={() => handleFind(radius)}>
            <RotateCcw size={14} /> Try again
          </Button>
        </div>
      )}

      {(status === "done" || status === "empty") && userLocation && (
        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-xl font-bold tracking-tight dark:text-[#ECECEC]">
              {hospitals.length > 0
                ? `${hospitals.length} hospital${hospitals.length > 1 ? "s" : ""} near you`
                : "No hospitals found"}
            </h1>
            <Button size="sm" variant="outline" className="gap-2 rounded-full" onClick={() => handleFind(radius)}>
              <RotateCcw size={14} /> Refresh
            </Button>
          </div>

          {hospitals.length > 0 ? (
            <div className="flex flex-col gap-4 lg:flex-row">
              <div className="lg:w-[55%]">
                <HospitalMap
                  userLocation={userLocation}
                  hospitals={hospitals}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                />
              </div>
              <div className="space-y-3 lg:w-[45%] lg:max-h-[520px] lg:overflow-auto lg:pr-1">
                {hospitals.map((h) => (
                  <HospitalCard key={h.id} hospital={h} selected={h.id === selectedId} onSelect={setSelectedId} />
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-[#E5E7EB] dark:border-[#3A3A3A] bg-white dark:bg-[#212121] p-8 text-center">
              <SearchX size={28} className="mx-auto text-slate-400" />
              <p className="mt-3 text-sm font-medium dark:text-[#ECECEC]">No hospitals were found within {(radius / 1000).toFixed(0)} km.</p>
              {radius < RADIUS_STEPS[RADIUS_STEPS.length - 1] ? (
                <Button size="sm" className="mt-4 rounded-full" onClick={expandSearch}>
                  Expand search to {(RADIUS_STEPS.find((r) => r > radius) / 1000).toFixed(0)} km
                </Button>
              ) : (
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Try again later — new facilities are added to OpenStreetMap regularly.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
