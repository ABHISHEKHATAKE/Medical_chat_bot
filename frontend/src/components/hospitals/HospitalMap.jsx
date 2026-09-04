import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

function FitBounds({ userLocation, hospitals }) {
  const map = useMap();
  useEffect(() => {
    const points = [];
    if (userLocation) points.push([userLocation.latitude, userLocation.longitude]);
    hospitals.forEach((h) => points.push([h.latitude, h.longitude]));
    if (points.length > 0) {
      map.fitBounds(L.latLngBounds(points), { padding: [40, 40] });
    }
  }, [map, userLocation, hospitals]);
  return null;
}

function pinIcon(selected) {
  return L.divIcon({
    className: "",
    html: `<div style="width:${selected ? 30 : 24}px;height:${selected ? 30 : 24}px;border-radius:9999px;
      background:${selected ? "#16A34A" : "#0F172A"};
      border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35);
      display:grid;place-items:center;color:#fff;font-size:13px;font-weight:700;">H</div>`,
    iconSize: [selected ? 30 : 24, selected ? 30 : 24],
    iconAnchor: [selected ? 15 : 12, selected ? 15 : 12],
  });
}

const userIcon = L.divIcon({
  className: "",
  html: `<div style="width:18px;height:18px;border-radius:9999px;background:#2563EB;
    border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35);"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

export function HospitalMap({ userLocation, hospitals, selectedId, onSelect }) {
  if (!userLocation) return null;
  return (
    <div className="relative z-0 overflow-hidden rounded-2xl border border-[#E5E7EB] dark:border-[#3A3A3A]">
      <MapContainer
        center={[userLocation.latitude, userLocation.longitude]}
        zoom={13}
        scrollWheelZoom
        className="h-[300px] w-full sm:h-[360px] lg:h-[420px]"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds userLocation={userLocation} hospitals={hospitals} />
        <Marker position={[userLocation.latitude, userLocation.longitude]} icon={userIcon}>
          <Popup>You are here</Popup>
        </Marker>
        {hospitals.map((h) => (
          <Marker
            key={h.id}
            position={[h.latitude, h.longitude]}
            icon={pinIcon(h.id === selectedId)}
            eventHandlers={{ click: () => onSelect && onSelect(h.id) }}
          >
            <Popup>
              <strong>{h.name}</strong>
              <br />
              {h.distance} km away
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
