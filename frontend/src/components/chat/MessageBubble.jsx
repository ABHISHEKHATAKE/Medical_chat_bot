import ReactMarkdown from "react-markdown";
import { Copy, ThumbsUp, ThumbsDown, ChevronDown } from "lucide-react";
import { useState } from "react";

export function MessageBubble({ role, content, sources }) {
  const isUser = role==="user";
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  if (isUser) return <div className="flex justify-end"><div className="max-w-[80%] rounded-2xl bg-[#0891B2] text-white px-4 py-2.5 text-sm leading-6 whitespace-pre-wrap break-words">{content}</div></div>;
  return (
    <div className="flex gap-3">
      <div className="w-7 h-7 rounded-full bg-[#ECFEFF] border border-[#A5F3FC] grid place-items-center text-[11px] font-semibold text-[#0891B2] shrink-0">AI</div>
      <div className="flex-1 min-w-0">
        <div className="bg-white rounded-2xl border border-slate-200 px-4 py-3">
          <div className="markdown text-sm leading-6 text-slate-800"><ReactMarkdown>{content}</ReactMarkdown></div>
          {sources && sources.length>0 && (
            <div className="mt-3 border-t pt-3">
              <button onClick={()=>setOpen(v=>!v)} className="flex items-center gap-1 text-xs font-medium text-slate-600"><ChevronDown size={14} className={`${open?"rotate-180":""} transition`} /> Sources • {sources.length}</button>
              {open && <ul className="mt-2 space-y-1 text-xs text-slate-600 list-disc pl-4">{sources.map((s,i)=><li key={i} className="break-words">{s}</li>)}</ul>}
            </div>
          )}
          <div className="mt-3 flex items-center gap-1">
            <button aria-label="Copy" onClick={async()=>{await navigator.clipboard.writeText(content); setCopied(true); setTimeout(()=>setCopied(false),1500);}} className="p-1.5 rounded hover:bg-slate-100"><Copy size={14} /></button>
            <span className="text-xs text-slate-400 ml-1">{copied?"Copied":""}</span>
            <span className="ml-auto flex gap-1"><button aria-label="Helpful" className="p-1.5 rounded hover:bg-slate-100"><ThumbsUp size={14} /></button><button aria-label="Not helpful" className="p-1.5 rounded hover:bg-slate-100"><ThumbsDown size={14} /></button></span>
          </div>
        </div>
      </div>
    </div>
  );
}
