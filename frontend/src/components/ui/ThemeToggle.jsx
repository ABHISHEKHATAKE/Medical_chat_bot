import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "../../hooks/useTheme.jsx";
import { useState, useRef, useEffect } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const k = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", h);
    document.addEventListener("keydown", k);
    return () => { document.removeEventListener("mousedown", h); document.removeEventListener("keydown", k); };
  }, []);

  const Icon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;

  return (
    <div className="relative" ref={ref}>
      <button
        aria-label="Toggle theme"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
        className="w-8 h-8 rounded-full border border-[#E5E7EB] dark:border-[#334155] bg-white dark:bg-[#1E293B] grid place-items-center hover:bg-slate-50 dark:hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-[#0F172A] dark:focus-visible:ring-white/20"
      >
        <Icon size={14} />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full mt-2 w-36 rounded-xl border border-[#E5E7EB] dark:border-[#334155] bg-white dark:bg-[#1E293B] shadow-xl p-1 z-50 animate-in fade-in slide-in-from-top-1">
          {[
            { id: "light", label: "Light", icon: Sun },
            { id: "dark", label: "Dark", icon: Moon },
            { id: "system", label: "System", icon: Monitor },
          ].map(o => (
            <button
              key={o.id}
              role="menuitemradio"
              aria-checked={theme === o.id}
              onClick={() => { setTheme(o.id); setOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-left hover:bg-slate-100 dark:hover:bg-slate-800 ${theme === o.id ? "bg-slate-100 dark:bg-slate-800 font-medium" : ""}`}
            >
              <o.icon size={14} /> {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
