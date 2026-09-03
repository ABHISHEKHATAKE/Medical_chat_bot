import { useState } from "react";
import { Plus, Trash2, Pencil, MessageSquare } from "lucide-react";
import { Button } from "../ui/Button.jsx";

export function Sidebar({ conversations, activeId, onSelect, onNew, onDelete, onRename }) {
  const [editing, setEditing] = useState(null);
  const [title, setTitle] = useState("");
  const groups = (() => {
    const today = new Date().toDateString();
    const t=[], y=[];
    for(const c of conversations){ const d=new Date(c.updatedAt).toDateString(); (d===today?t:y).push(c); }
    return {today:t, yesterday:y};
  })();
  const Section = ({label, items}) => items.length?(
    <div>
      <div className="text-[11px] tracking-wide font-medium text-slate-500 px-2 py-2">{label}</div>
      <div className="space-y-1">
        {items.map(c=>(
          <div key={c._id} className={`group flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer ${activeId===c._id? "bg-[#ECFEFF] border border-[#A5F3FC]":"hover:bg-slate-50 border border-transparent"}`} onClick={()=>onSelect(c._id)}>
            <MessageSquare size={14} className="shrink-0 text-slate-400" />
            {editing===c._id ? (
              <input autoFocus value={title} onChange={e=>setTitle(e.target.value)} onBlur={()=>{onRename(c._id,title);setEditing(null);}} onKeyDown={e=>{if(e.key==="Enter"){onRename(c._id,title);setEditing(null);} if(e.key==="Escape") setEditing(null);}} className="flex-1 min-w-0 text-sm border rounded px-2 py-1" onClick={e=>e.stopPropagation()} />
            ) : (
              <span className="flex-1 truncate text-sm">{c.title}</span>
            )}
            <button aria-label="Rename" onClick={(e)=>{e.stopPropagation(); setEditing(c._id); setTitle(c.title);}} className="hidden group-hover:inline-flex p-1 rounded hover:bg-white"><Pencil size={14} /></button>
            <button aria-label="Delete" onClick={(e)=>{e.stopPropagation(); onDelete(c._id);}} className="hidden group-hover:inline-flex p-1 rounded hover:bg-white text-red-500"><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  ):null;
  return (
    <div className="flex flex-col h-full">
      <div className="p-3">
        <Button className="w-full" onClick={onNew}><Plus size={16} className="mr-2" />New chat</Button>
      </div>
      <div className="flex-1 overflow-auto px-3 pb-4 space-y-4">
        {conversations.length===0 ? <div className="text-sm text-slate-500 px-2 py-6">Your conversations will appear here.</div> : (
          <>
            <Section label="Today" items={groups.today} />
            <Section label="Earlier" items={groups.yesterday} />
          </>
        )}
      </div>
      <div className="p-3 border-t text-xs text-slate-500">Educational use only. Not medical advice.</div>
    </div>
  );
}
