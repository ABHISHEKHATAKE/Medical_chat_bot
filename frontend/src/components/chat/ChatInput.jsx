import { useRef, useEffect, useState } from "react";
import { Send, Square, Paperclip, X, Image as ImageIcon } from "lucide-react";
import { Button } from "../ui/button.jsx";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB = 5;

export function ChatInput({ value, onChange, onSend, loading, placeholder = "Ask a medical question...", autoFocus = false, imageFile, setImageFile, onImageChange }) {
  const ref = useRef(null);
  const fileRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState("");

  const isEmpty = !value.trim() && !imageFile;
  const canSend = (!isEmpty && !loading) || (!!imageFile && !loading);

  // Generate preview when imageFile changes
  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  // Support external imageFile prop via onImageChange
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError(`Unsupported type: ${file.type}. Use JPEG, PNG, WebP.`);
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Image too large. Max ${MAX_SIZE_MB}MB.`);
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    // Check image dimensions (must be at least 2x2 for Groq)
    const img = new Image();
    img.onload = () => {
      if (img.width < 2 || img.height < 2) {
        setError("Image is too small. Please upload an image at least 2x2 pixels.");
        if (fileRef.current) fileRef.current.value = "";
        URL.revokeObjectURL(img.src);
        return;
      }
      URL.revokeObjectURL(img.src);
      if (setImageFile) setImageFile(file);
      else if (onImageChange) onImageChange(file);
      if (fileRef.current) fileRef.current.value = "";
    };
    img.onerror = () => {
      setError("Unable to read image. Please try another file.");
      if (fileRef.current) fileRef.current.value = "";
    };
    img.src = URL.createObjectURL(file);
  };

  const handleRemove = () => {
    if (setImageFile) setImageFile(null);
    else if (onImageChange) onImageChange(null);
    setError("");
    setPreviewUrl(null);
    if (fileRef.current) fileRef.current.value = "";
  };

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
    <div className="rounded-[24px] border border-[#E5E7EB] dark:border-[#3A3A3A] bg-white dark:bg-[#2F2F2F] shadow-soft dark:shadow-none p-2.5 flex flex-col gap-2">
      {imageFile && previewUrl && (
        <div className="flex items-center gap-2 p-2 rounded-xl bg-[#F8F9FA] dark:bg-[#212121] border border-[#E5E7EB] dark:border-[#3A3A3A] max-w-full">
          <img src={previewUrl} alt="Preview" className="w-12 h-12 rounded-lg object-cover border border-[#E5E7EB] dark:border-[#3A3A3A] shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium truncate dark:text-[#ECECEC] max-w-[180px] sm:max-w-[240px]">{imageFile.name}</div>
            <div className="text-[11px] text-slate-500 dark:text-[#8E8E8E]">{(imageFile.size / 1024 / 1024).toFixed(2)} MB • {imageFile.type}</div>
          </div>
          <button
            onClick={handleRemove}
            aria-label="Remove image"
            className="p-1.5 rounded-full hover:bg-white dark:hover:bg-[#3A3A3A] text-slate-500 hover:text-red-600 shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      )}
      {error && <div className="text-xs text-red-600 dark:text-red-400 px-1">{error}</div>}
      <div className="flex items-end gap-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          aria-label="Attach image"
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-[#3A3A3A] text-slate-500 dark:text-[#B4B4B4] hover:text-[#0F172A] dark:hover:text-[#ECECEC] shrink-0"
        >
          <Paperclip size={16} />
        </button>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileSelect} className="hidden" aria-hidden="true" />
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          aria-label="Message input"
          className="flex-1 resize-none bg-transparent outline-none text-sm leading-6 py-2 px-1 max-h-[160px] md:max-h-[160px] placeholder:text-[#8A8A8A] dark:placeholder:text-[#8A8A8A] dark:text-[#ECECEC] min-h-[40px] focus:outline-none focus:ring-0 focus:border-transparent"
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
    </div>
  );
}
