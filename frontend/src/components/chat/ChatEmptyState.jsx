import { motion } from "framer-motion";
import { Button } from "../ui/button.jsx";

const EXAMPLES = [
  "What are common symptoms of diabetes?",
  "What causes a persistent cough?",
  "What are common symptoms of anemia?",
];

export function ChatEmptyState({ onSend, onSelectExample }) {
  const handle = (text) => {
    if (onSelectExample) onSelectExample(text);
    else onSend(text);
  };
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="min-h-[60vh] flex flex-col items-center justify-center py-8">
      <div className="w-full max-w-[560px]">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight">How can I help you today?</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Ask a health-related question to get started.</p>
        </div>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-2">
          {EXAMPLES.map((s, i) => (
            <motion.button
              key={s}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              onClick={() => handle(s)}
              className="text-left text-xs p-3 rounded-xl border border-[#E5E7EB] dark:border-[#334155] bg-white dark:bg-[#1E293B] hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-[#0F172A]/20 dark:hover:border-white/20 transition-colors"
            >
              {s}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
