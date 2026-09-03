import { motion } from "framer-motion";

export function UserMessage({ content, image }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
      <div className="max-w-[80%] md:max-w-[72%] rounded-2xl bg-[#0F172A] dark:bg-[#303030] text-white dark:text-[#ECECEC] px-3 py-3 text-sm leading-6 whitespace-pre-wrap break-words shadow-sm border border-transparent dark:border-[#3A3A3A] overflow-hidden">
        {image?.url && (
          <img
            src={image.url}
            alt="Uploaded"
            className="w-full max-w-[280px] max-h-[280px] rounded-xl object-cover border border-white/20 mb-2"
            loading="lazy"
          />
        )}
        {content && <div className="px-1">{content}</div>}
      </div>
    </motion.div>
  );
}
