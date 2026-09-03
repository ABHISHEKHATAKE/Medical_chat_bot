import { useRef, useState, useEffect } from "react";
import { ChatInput } from "./ChatInput.jsx";
import { TypingIndicator } from "./TypingIndicator.jsx";
import { ScrollToLatest } from "./ScrollToLatest.jsx";
import { UserMessage } from "./UserMessage.jsx";
import { AssistantMessage } from "./AssistantMessage.jsx";
import { ChatEmptyState } from "./ChatEmptyState.jsx";

export function ChatContainer({ messages, loading, error, onSend, onRetry, input, setInput, listRef }) {
  const containerRef = useRef(null);
  const [showJump, setShowJump] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const scrollRef = listRef || containerRef;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
      setIsAtBottom(nearBottom);
      setShowJump(!nearBottom && messages.length > 2);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [messages.length, scrollRef]);

  useEffect(() => {
    if (isAtBottom) {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    } else if (messages.length > 0) {
      // show jump button when new message arrives while scrolled up
      setShowJump(true);
    }
  }, [messages, loading, isAtBottom, scrollRef]);

  const jumpToLatest = () => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    setShowJump(false);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 min-w-0 bg-[#F8F9FA] dark:bg-[#212121] relative">
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-auto overscroll-contain">
        <div className="max-w-[720px] mx-auto px-4 sm:px-6 py-6">
          {messages.length === 0 ? (
            <ChatEmptyState onSend={onSend} onSelectExample={onSend} />
          ) : (
            <div className="space-y-4">
              {messages.map((m) =>
                m.role === "user" ? (
                  <UserMessage key={m._id} content={m.content} />
                ) : (
                  <AssistantMessage key={m._id} content={m.content} sources={m.sources} />
                )
              )}
              {loading && <TypingIndicator />}
              {error && (
                <div className="rounded-xl border border-[#3A3A3A] dark:border-[#3A3A3A] bg-[#2A2A2A] dark:bg-[#2A2A2A] text-sm text-[#ECECEC] p-3 flex justify-between items-center gap-3">
                  <span className="flex-1">{error}</span>
                  <button onClick={onRetry} className="px-3 py-1.5 rounded-full bg-white dark:bg-[#303030] border border-[#3A3A3A] text-xs font-medium hover:bg-slate-50 dark:hover:bg-[#3A3A3A] text-[#0F172A] dark:text-[#ECECEC]">Retry</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <ScrollToLatest visible={showJump} onClick={jumpToLatest} />

      <div className="shrink-0 sticky bottom-0 z-10 bg-[#F8F9FA] dark:bg-[#212121] p-3 sm:p-4 border-t border-transparent dark:border-[#212121]">
        <div className="max-w-[720px] mx-auto">
          <ChatInput
            value={input}
            onChange={setInput}
            onSend={() => onSend()}
            loading={loading}
            placeholder={messages.length === 0 ? "Ask a medical question..." : "Ask a follow-up..."}
          />
          <p className="text-[11px] text-[#8E8E8E] dark:text-[#8E8E8E] text-center mt-2">Medical AI provides general health information and is not a substitute for professional medical advice.</p>
        </div>
      </div>
    </div>
  );
}
