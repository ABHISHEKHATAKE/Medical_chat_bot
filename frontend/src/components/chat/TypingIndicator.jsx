import { motion } from "framer-motion";

export function TypingIndicator() {
  return (
    <div className="flex gap-3" aria-live="polite" aria-label="AI is thinking">
      <div className="w-7 h-7 rounded-full bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] grid place-items-center shrink-0 mt-1">
        <span className="w-2 h-2 bg-white dark:bg-[#0F172A] rounded-full animate-pulse" />
      </div>
      <div className="rounded-2xl border border-[#E5E7EB] dark:border-[#334155] bg-white dark:bg-[#1E293B] px-4 py-3 shadow-soft">
        <div className="flex items-center gap-1.5">
          <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0 }} className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500" />
          <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500" />
          <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500" />
        </div>
      </div>
    </div>
  );
}
