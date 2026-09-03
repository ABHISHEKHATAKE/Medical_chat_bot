import { cn } from "../../lib/utils.js";
export function Badge({ className, variant="default", ...props }) {
  const variants = {
    default: "bg-[#DCFCE7] text-[#166534] border-[#0F172A]",
    secondary: "bg-[#DBEAFE] text-[#1E3A8A] border-[#0F172A]",
    outline: "bg-white text-slate-600 border-slate-200",
  };
  return <span className={cn("inline-flex items-center rounded-full border-2 px-3 py-1 text-xs font-semibold", variants[variant], className)} {...props} />;
}
