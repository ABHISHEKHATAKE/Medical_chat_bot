import { useRef, useEffect } from "react";
import { Send, Square } from "lucide-react";
import { Button } from "../ui/button.jsx";

export function ChatInput({ value, onChange, onSend, loading, placeholder = "Ask a medical question...", autoFocus = false }) {
  const ref = useRef(null);
  const isEmpty = !value.trim();
  const canSend = !isEmpty && !loading;

  // Auto-resize with max height
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    const max = window.innerWidth < 768 ? 120 : 160;
    const next = Math.min(el.scrollHeight, max);
    el.style.height = next + "px";
    el.style.overflowY = el.scrollHeight > max ? "auto" : "hidden";
  }, [value]);

  useEffect(() => {
    if (autoFocus && ref.current) ref.current.focus();
  }, [autoFocus]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (canSend) onSend();
    }
  };

  const handleSend = () => {
    if (canSend) onSend();
  };

  return (
    <div className="rounded-[24px] border border-[#E5E7EB] dark:border-[#3A3A3A] bg-white dark:bg-[#2F2F2F] shadow-soft dark:shadow-none p-2.5 flex items-end gap-2">
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={1}
        aria-label="Message input"
        className="flex-1 resize-none bg-transparent outline-none text-sm leading-6 py-2 px-3 max-h-[160px] md:max-h-[160px] placeholder:text-[#8A8A8A] dark:placeholder:text-[#8A8A8A] dark:text-[#ECECEC] min-h-[40px] focus:outline-none focus:ring-0 focus:border-transparent"
        style={{ scrollbarWidth: "thin" }}
      />
      <Button
        size="sm"
        aria-label={loading ? "Stop generation" : "Send message"}
        disabled={!canSend && !loading}
        onClick={handleSend}
        className="rounded-full h-9 w-9 p-0 shrink-0 mb-0.5 disabled:opacity-40"
      >
        {loading ? <Square size={14} className="fill-white" /> : <Send size={14} />}
      </Button>
    </div>
  );
}
