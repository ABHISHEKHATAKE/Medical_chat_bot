import { MapPin, Phone, Globe, Clock, Navigation, Siren } from "lucide-react";

export function HospitalCard({ hospital, selected, onSelect }) {
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${hospital.latitude},${hospital.longitude}`;
  return (
    <article
      onClick={() => onSelect && onSelect(hospital.id)}
      className={`rounded-2xl border bg-white dark:bg-[#212121] p-4 shadow-soft cursor-pointer transition-colors ${
        selected
          ? "border-[#16A34A] dark:border-[#16A34A]"
          : "border-[#E5E7EB] dark:border-[#3A3A3A] hover:border-[#0F172A]/30 dark:hover:border-white/20"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-sm dark:text-[#ECECEC]">{hospital.name}</h3>
        <span className="shrink-0 rounded-full bg-[#F1F5F9] dark:bg-[#2A2A2A] px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300">
          {hospital.distance} km away
        </span>
      </div>

      <dl className="mt-2 space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
        {hospital.address && (
          <div className="flex items-start gap-2">
            <MapPin size={14} className="mt-0.5 shrink-0 text-slate-400" aria-hidden="true" />
            <dd>{hospital.address}</dd>
          </div>
        )}
        {hospital.phone && (
          <div className="flex items-center gap-2">
            <Phone size={14} className="shrink-0 text-slate-400" aria-hidden="true" />
            <dd>{hospital.phone}</dd>
          </div>
        )}
        {hospital.openingHours && (
          <div className="flex items-start gap-2">
            <Clock size={14} className="mt-0.5 shrink-0 text-slate-400" aria-hidden="true" />
            <dd>{hospital.openingHours}</dd>
          </div>
        )}
        {hospital.emergency && (
          <div className="flex items-center gap-2">
            <Siren size={14} className="shrink-0 text-red-500" aria-hidden="true" />
            <dd className="font-medium text-red-600 dark:text-red-400">Emergency services available</dd>
          </div>
        )}
      </dl>

      <div className="mt-3 flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full bg-[#0F172A] dark:bg-white px-3 py-1.5 text-xs font-medium text-white dark:text-[#0F172A] hover:bg-[#1E293B]"
        >
          <Navigation size={12} /> Directions
        </a>
        {hospital.phone && (
          <a
            href={`tel:${hospital.phone.replace(/\s+/g, "")}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#E5E7EB] dark:border-[#3A3A3A] bg-white dark:bg-[#1E293B] px-3 py-1.5 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Phone size={12} /> Call
          </a>
        )}
        {hospital.website && (
          <a
            href={hospital.website.startsWith("http") ? hospital.website : `https://${hospital.website}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-[#E5E7EB] dark:border-[#3A3A3A] bg-white dark:bg-[#1E293B] px-3 py-1.5 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Globe size={12} /> Website
          </a>
        )}
      </div>
    </article>
  );
}
