import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Button } from "./button.jsx";

export function Dialog({ open, onOpenChange, children }) {
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (e.key === "Escape") onOpenChange(false); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open, onOpenChange]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => onOpenChange(false)} aria-hidden="true" />
      <div role="dialog" aria-modal="true" className="relative w-full max-w-md rounded-2xl border border-[#E5E7EB] dark:border-[#334155] bg-white dark:bg-[#1E293B] shadow-xl p-6">
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ children, className = "" }) {
  return <div className={`mb-4 ${className}`}>{children}</div>;
}
export function DialogTitle({ children }) {
  return <h2 className="text-base font-semibold">{children}</h2>;
}
export function DialogDescription({ children }) {
  return <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{children}</p>;
}
export function DialogFooter({ children }) {
  return <div className="mt-6 flex justify-end gap-2">{children}</div>;
}
