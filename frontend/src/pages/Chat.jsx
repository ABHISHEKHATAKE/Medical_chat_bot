import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import { Search, Plus, MessageSquare, Trash2, LogOut, Stethoscope } from "lucide-react";
import { Button } from "../components/ui/button.jsx";
import { ChatContainer } from "../components/chat/ChatContainer.jsx";
import { AppShell } from "../components/layout/AppShell.jsx";
import * as api from "../services/conversation.api.js";
import { clearDevUserId, isClerkConfigured, isDevAuthenticated } from "../hooks/useDevAuth.js";

export default function Chat() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const clerkMode = isClerkConfigured();
  let clerkAuth = { isLoaded: true, isSignedIn: false };
  let clerkUserData = { isLoaded: true, user: null };
  try {
    clerkAuth = useAuth();
    clerkUserData = useUser();
  } catch {}
  const isClerkLoaded = clerkMode ? !!(clerkAuth.isLoaded && clerkUserData.isLoaded) : true;
  const isAuthed = clerkMode ? (isClerkLoaded ? !!clerkAuth.isSignedIn : false) : isDevAuthenticated();
  const clerkUser = clerkMode ? clerkUserData.user : null;

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("sidebarCollapsed") === "true");
  const [query, setQuery] = useState("");
  const listRef = useRef(null);

  useEffect(() => { localStorage.setItem("sidebarCollapsed", String(collapsed)); }, [collapsed]);

  useEffect(() => {
    const pending = sessionStorage.getItem("pendingPrompt");
    if (pending && isAuthed) {
      sessionStorage.removeItem("pendingPrompt");
      setInput(pending);
    }
  }, [isAuthed]);

  const fetchConvs = useCallback(async () => {
    try {
      const data = await api.listConversations();
      setConversations(data);
    } catch {
      setConversations([]);
    }
  }, []);

  const fetchMessages = useCallback(async (id) => {
    if (!id) { setMessages([]); return; }
    try {
      const data = await api.getMessages(id);
      setMessages(data);
    } catch {
      setMessages([]);
    }
  }, []);

  useEffect(() => { if (isAuthed) fetchConvs(); else setConversations([]); }, [isAuthed, fetchConvs]);
  useEffect(() => { fetchMessages(conversationId); }, [conversationId, fetchMessages]);

  const ensureConversation = async () => {
    if (conversationId) return conversationId;
    const c = await api.createConversation();
    await fetchConvs();
    navigate(`/chat/${c._id}`);
    return c._id;
  };

  const send = async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    if (!isAuthed) {
      sessionStorage.setItem("pendingPrompt", msg);
      navigate("/sign-in");
      return;
    }
    setError(""); setInput("");
    const id = await ensureConversation();
    const tmp = { _id: `tmp-${Date.now()}`, role: "user", content: msg, createdAt: new Date().toISOString() };
    setMessages(m => [...m, tmp]);
    setLoading(true);
    try {
      await api.sendChat(id, msg);
      await fetchMessages(id);
      await fetchConvs();
    } catch (e) {
      setError(e.response?.data?.error || e.message || "Something went wrong.");
      if (e.response?.status === 401) navigate("/sign-in");
    } finally { setLoading(false); }
  };

  const onNew = async () => { navigate("/"); setMessages([]); setDrawerOpen(false); };
  const onSelect = (id) => { navigate(`/chat/${id}`); setDrawerOpen(false); };
  const onDelete = async (id) => {
    if (!confirm("Delete conversation? This will permanently delete the conversation and its messages.")) return;
    await api.deleteConversation(id);
    if (id === conversationId) navigate("/");
    fetchConvs();
  };
  const onRename = async (id, newTitle) => {
    await api.updateConversation(id, newTitle);
    fetchConvs();
  };
  const handleLogout = async () => {
    if (clerkMode && window.Clerk?.signOut) {
      await window.Clerk.signOut();
      navigate("/sign-in");
    } else {
      clearDevUserId();
      navigate("/sign-in");
    }
  };

  const filtered = conversations.filter(c => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    // Support multi-term search: all terms must be present in title
    const terms = q.split(/\s+/).filter(Boolean);
    const title = c.title.toLowerCase();
    return terms.every(term => title.includes(term));
  });

  // Keyboard: Escape closes drawer
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") setDrawerOpen(false); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, []);

  if (clerkMode && !isClerkLoaded) {
    return (
      <div className="orbita-outer">
        <div className="orbita-app flex items-center justify-center" style={{ height: "calc(100vh - 24px)" }}>
          <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-slate-300 dark:border-slate-600 border-t-[#0F172A] dark:border-t-white rounded-full animate-spin" /> Loading...
          </div>
        </div>
      </div>
    );
  }

  const headerActions = isAuthed ? (
    <button onClick={onNew} className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E5E7EB] dark:border-[#334155] bg-white dark:bg-[#1E293B] text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800">New chat</button>
  ) : (
    <button onClick={() => navigate("/sign-in")} className="px-4 py-1.5 rounded-full bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] text-sm font-medium">Sign in</button>
  );

  return (
    <AppShell
      header={headerActions}
      conversations={filtered}
      activeId={conversationId}
      onSelect={onSelect}
      onDelete={onDelete}
      onRename={onRename}
      onNewChat={onNew}
      query={query}
      setQuery={setQuery}
      drawerOpen={drawerOpen}
      setDrawerOpen={setDrawerOpen}
      collapsed={collapsed}
      setCollapsed={setCollapsed}
      clerkUser={clerkUser}
      isClerkMode={clerkMode}
      isAuthed={isAuthed}
      onLogout={handleLogout}
    >
      <ChatContainer
        messages={messages}
        loading={loading}
        error={error}
        onSend={send}
        onRetry={() => send(messages[messages.length - 1]?.content || "")}
        input={input}
        setInput={setInput}
        listRef={listRef}
      />
    </AppShell>
  );
}
