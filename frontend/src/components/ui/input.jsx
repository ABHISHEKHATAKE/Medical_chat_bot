import { cn } from "../../lib/utils.js";
export function Input({ className, ...props }) {
  return <input className={cn("clay-input w-full px-4 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-[#16A34A]/20 placeholder:text-slate-400", className)} {...props} />;
}
