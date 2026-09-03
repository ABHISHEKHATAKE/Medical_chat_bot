import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";

export function AssistantMessage({ content }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
      <div className="w-7 h-7 rounded-full bg-[#0F172A] dark:bg-[#303030] text-white dark:text-[#ECECEC] grid place-items-center shrink-0 mt-1 border border-transparent dark:border-[#3A3A3A]">
        <Sparkles size={12} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="rounded-2xl border border-transparent dark:border-transparent bg-transparent dark:bg-transparent px-1 py-1">
          <div className="markdown text-sm leading-7 text-[#0F172A] dark:text-[#ECECEC] prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
