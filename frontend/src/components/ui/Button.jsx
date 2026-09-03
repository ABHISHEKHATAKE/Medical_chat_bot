export function Button({ variant="primary", size="md", className="", ...props }) {
  const base = "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none rounded-lg";
  const variants = {
    primary: "bg-[#0891B2] text-white hover:bg-[#0e7490] shadow-sm",
    ghost: "hover:bg-slate-100 text-slate-700",
    outline: "border border-[#A5F3FC] bg-white hover:bg-slate-50",
  };
  const sizes = { sm:"h-8 px-3 text-sm", md:"h-9 px-4 text-sm", lg:"h-11 px-6 text-base", icon:"h-9 w-9" };
  return <button className={`${base} ${variants[variant]||variants.primary} ${sizes[size]||sizes.md} ${className}`} {...props} />;
}
