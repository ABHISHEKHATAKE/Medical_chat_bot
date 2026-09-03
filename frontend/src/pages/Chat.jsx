import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Sidebar } from "../components/chat/Sidebar.jsx";
import { MessageBubble } from "../components/chat/MessageBubble.jsx";
import { Button } from "../components/ui/Button.jsx";
import * as api from "../services/conversation.api.js";
import { HeartPulse, Send, Loader2, Menu, X } from "lucide-react";

const SUGGESTED = [
  "What are common symptoms of diabetes?",
  "What causes a persistent cough?",
  "What are common symptoms of anemia?",
];

export default function Chat() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [drawer, setDrawer] = useState(false);
  const listRef = useRef(null);

  const fetchConvs = async () => {
    const data = await api.listConversations();
    setConversations(data);
  };
  const fetchMessages = async (id) => {
    if(!id){ setMessages([]); return; }
    const data = await api.getMessages(id);
    setMessages(data);
  };

  useEffect(()=>{ fetchConvs(); }, []);
  useEffect(()=>{ fetchMessages(conversationId); }, [conversationId]);
  useEffect(()=>{ listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }); }, [messages, loading]);

  const ensureConversation = async () => {
    if(conversationId) return conversationId;
    const c = await api.createConversation();
    await fetchConvs();
    navigate(`/chat/${c._id}`);
    return c._id;
  };

  const send = async (text) => {
    const msg = (text ?? input).trim();
    if(!msg || loading) return;
    setError("");
    setInput("");
    const id = await ensureConversation();
    // optimistic user
    const tmpUser = { _id: "tmp-u", role: "user", content: msg };
    setMessages(m => [...m, tmpUser]);
    setLoading(true);
    try{
      const res = await api.sendChat(id, msg);
      await fetchMessages(id);
      await fetchConvs();
    } catch(e){
      const msgTxt = e.response?.data?.error || e.message || "Something went wrong. Please try again.";
      setError(msgTxt);
      // remove optimistic if failed? keep it
    } finally { setLoading(false); }
  };

  const onNew = async () => { navigate("/chat"); setMessages([]); };
  const onSelect = (id) => { navigate(`/chat/${id}`); setDrawer(false); };
  const onDelete = async (id) => { await api.deleteConversation(id); if(id===conversationId) navigate("/chat"); fetchConvs(); fetchMessages(conversationId===id?null:conversationId); };
  const onRename = async (id, title) => { if(!title.trim()) return; await api.updateConversation(id, title.trim()); fetchConvs(); };

  return (
    <div className="h-[100dvh] flex bg-[#F8FAFC]">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex w-[300px] shrink-0 bg-white border-r border-slate-200 flex-col">
        <div className="h-[56px] flex items-center gap-2 px-4 border-b">
          <span className="w-7 h-7 rounded-lg bg-[#0891B2] text-white grid place-items-center"><HeartPulse size={16} /></span>
          <span className="font-semibold text-sm">Medical AI</span>
        </div>
        <Sidebar conversations={conversations} activeId={conversationId} onSelect={onSelect} onNew={onNew} onDelete={onDelete} onRename={onRename} />
      </aside>
      {/* Drawer mobile */}
      {drawer && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="flex-1 bg-black/30" onClick={()=>setDrawer(false)} />
          <div className="w-[300px] bg-white h-full flex flex-col">
            <div className="h-[56px] flex items-center justify-between px-4 border-b">
              <span className="font-semibold text-sm">Chats</span>
              <button aria-label="Close" onClick={()=>setDrawer(false)} className="p-2 -mr-2"><X size={18} /></button>
            </div>
            <Sidebar conversations={conversations} activeId={conversationId} onSelect={onSelect} onNew={onNew} onDelete={onDelete} onRename={onRename} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-[56px] flex items-center justify-between px-4 bg-white border-b border-slate-200">
          <div className="flex items-center gap-2">
            <button className="lg:hidden p-2 -ml-2" onClick={()=>setDrawer(true)} aria-label="Open menu"><Menu size={20} /></button>
            <span className="text-sm font-medium">Chat</span>
          </div>
          <div className="text-xs text-slate-500 hidden sm:block">Educational only — not medical advice</div>
        </header>

        <div ref={listRef} className="flex-1 overflow-auto">
          <div className="max-w-[860px] mx-auto px-4 sm:px-6 py-6 space-y-4">
            {!conversationId && messages.length===0 && (
              <div className="text-center py-10">
                <div className="w-12 h-12 rounded-2xl bg-[#ECFEFF] border border-[#A5F3FC] grid place-items-center mx-auto text-[#0891B2]"><HeartPulse /></div>
                <h2 className="mt-4 text-[22px] font-semibold">How can I help you today?</h2>
                <p className="mt-2 text-sm text-slate-600">Ask any medical question. Answers are grounded in retrieved context.</p>
                <div className="mt-6 grid gap-2 max-w-[560px] mx-auto text-left">
                  {SUGGESTED.map(s=>(
                    <button key={s} onClick={()=>send(s)} className="text-left px-4 py-3 bg-white border border-slate-200 rounded-xl hover:border-[#A5F3FC] hover:bg-[#ECFEFF]/50 text-sm">{s}</button>
                  ))}
                </div>
              </div>
            )}
            {messages.map(m=>(
              <MessageBubble key={m._id} role={m.role} content={m.content} sources={m.sources} />
            ))}
            {loading && <div className="flex gap-3 items-center text-sm text-slate-500"><Loader2 className="animate-spin" size={16} /> AI is thinking...</div>}
            {error && <div className="bg-red-50 border border-red-200 text-sm text-red-700 rounded-xl px-4 py-3 flex items-center justify-between"><span>{error}</span><Button variant="outline" size="sm" onClick={()=>send(messages[messages.length-1]?.content||"")}>Retry</Button></div>}
          </div>
        </div>

        <div className="border-t bg-white">
          <div className="max-w-[860px] mx-auto px-4 sm:px-6 py-3">
            <div className="flex items-end gap-2 bg-white border border-slate-200 rounded-2xl px-3 py-2 focus-within:border-[#0891B2] focus-within:ring-2 focus-within:ring-[#0891B2]/20">
              <textarea
                aria-label="Ask a question"
                placeholder="Ask a medical question..."
                value={input}
                onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>{ if(e.key==="Enter" && !e.shiftKey){ e.preventDefault(); send(); } }}
                rows={1}
                className="flex-1 resize-none bg-transparent outline-none text-sm leading-6 max-h-[120px] py-1.5"
              />
              <Button size="icon" aria-label="Send" disabled={!input.trim() || loading} onClick={()=>send()} className="rounded-xl"><Send size={16} /></Button>
            </div>
            <div className="text-[11px] text-slate-500 text-center mt-2">Medical AI provides general health information for educational purposes and is not a substitute for professional medical advice.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
