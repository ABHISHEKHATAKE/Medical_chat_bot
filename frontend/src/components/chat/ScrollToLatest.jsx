import { ArrowDown } from "lucide-react";
import { Button } from "../ui/button.jsx";

export function ScrollToLatest({ visible, onClick }) {
  if (!visible) return null;
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
      <Button
        size="sm"
        variant="outline"
        onClick={onClick}
        className="rounded-full shadow-medium bg-white dark:bg-[#1E293B] gap-1.5"
        aria-label="Jump to latest messages"
      >
        <ArrowDown size={14} /> Latest
      </Button>
    </div>
  );
}
