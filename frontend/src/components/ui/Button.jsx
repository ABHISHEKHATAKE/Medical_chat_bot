import { cn } from "../../lib/utils.js";

const variants = {
  default: "bg-[#0F172A] text-white hover:bg-[#1E293B] shadow-sm",
  primary: "bg-[#0F172A] text-white hover:bg-[#1E293B] shadow-sm",
  outline: "bg-white text-[#0F172A] border border-[#E5E7EB] hover:bg-slate-50",
  ghost: "bg-transparent hover:bg-slate-100 text-[#0F172A]",
  secondary: "bg-[#F1F5F9] text-[#0F172A] hover:bg-[#E2E8F0]",
};

const sizes = {
  default: "h-9 px-4 py-2 text-sm font-medium",
  sm: "h-8 px-3 text-sm",
  lg: "h-10 px-6 text-sm",
  icon: "h-9 w-9 p-0",
};

export function Button({ variant = "default", size = "default", className, children, ...props }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F172A] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
