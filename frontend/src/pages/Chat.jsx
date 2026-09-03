import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import { Search, Plus, MessageSquare, Trash2, LogOut, Stethoscope } from "lucide-react";
import { Button } from "../components/ui/button.jsx";
import { ChatContainer } from "../components/chat/ChatContainer.jsx";
import { AppShell } from "../components/layout/AppShell.jsx";
import * as api from "../services/conversation.api.js";
import { clearDevUserId, isClerkConfigured, isDevAuthenticated } from "../hooks/useDevAuth.js";
import { setClerkTokenGetter } from "../services/api.js";

export default function Chat() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const clerkMode = isClerkConfigured();
  let clerkAuth = { isLoaded: true, isSignedIn: false, getToken: async () => null };
  let clerkUserData = { isLoaded: true, user: null };
  try {
    clerkAuth = useAuth();
    clerkUserData = useUser();
  } catch {}
  const isClerkLoaded = clerkMode ? !!(clerkAuth.isLoaded && clerkUserData.isLoaded) : true;
  const isAuthed = clerkMode ? (isClerkLoaded ? !!clerkAuth.isSignedIn : false) : isDevAuthenticated();
  const clerkUser = clerkMode ? clerkUserData.user : null;

  // Register Clerk token getter for api.js interceptor
  useEffect(() => {
    if (clerkMode && clerkAuth.getToken) {
      setClerkTokenGetter(async () => await clerkAuth.getToken());
    } else if (!clerkMode) {
      setClerkTokenGetter(null);
    }
  }, [clerkMode, clerkAuth.getToken]);

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("sidebarCollapsed") === "true");
  const [query, setQuery] = useState("");
  const listRef = useRef(null);
  // Synchronous send lock (loading state updates async, so double-Enter could
  // create two conversations). sendTargetRef tracks which thread a send owns
  // so the auto-fetch effect doesn't wipe the optimistic message.
  const sendingRef = useRef(false);
  const sendTargetRef = useRef(null);
  const convIdRef = useRef(conversationId);
  useEffect(() => { convIdRef.current = conversationId; }, [conversationId]);

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
  useEffect(() => {
    // Skip auto-fetch while our own send owns this thread — the explicit
    // fetchMessages(id) after sendChat covers it. Without this, navigating
    // from / to /chat/:id wipes the optimistic message (server is still empty).
    if (sendingRef.current && sendTargetRef.current === conversationId) return;
    fetchMessages(conversationId);
  }, [conversationId, fetchMessages]);

  const ensureConversation = async (pendingTitle) => {
    // Already inside a thread: stay here, never create/navigate.
    if (conversationId) return conversationId;
    // On / (new chat): create once, navigate immediately, refresh list in background.
    const c = await api.createConversation();
    navigate(`/chat/${c._id}`);
    const optimisticTitle = (pendingTitle || "").slice(0, 60) || "New conversation";
    setConversations(prev => {
      if (prev.some(x => x._id === c._id)) return prev;
      return [{ ...c, title: optimisticTitle }, ...prev];
    });
    fetchConvs();
    return c._id;
  };

  const send = async (text, overrideImage) => {
    const msg = (text ?? input).trim();
    // Use overrideImage if provided, otherwise use state imageFile
    const fileToSend = overrideImage !== undefined ? overrideImage : imageFile;
    const hasImage = !!fileToSend;
    const hasMessage = msg.length > 0;
    if ((!hasMessage && !hasImage) || loading || sendingRef.current) return;
    if (!isAuthed) {
      // For image+text, we can't easily persist image in sessionStorage, so just save text
      sessionStorage.setItem("pendingPrompt", msg);
      navigate("/sign-in");
      return;
    }
    setError("");
    sendingRef.current = true;
    const displayText = msg || (hasImage ? "Shared an image" : "");
    let id;
    try {
      id = await ensureConversation(displayText);
    } catch (e) {
      sendingRef.current = false;
      setError(e.response?.data?.error || e.message || "Something went wrong.");
      if (e.response?.status === 401) navigate("/sign-in");
      return;
    }
    sendTargetRef.current = id;
    // Create optimistic message with image preview if present
    const tmpImage = hasImage ? { url: URL.createObjectURL(fileToSend), publicId: "pending", mimeType: fileToSend.type } : null;
    const tmp = {
      _id: `tmp-${Date.now()}`,
      role: "user",
      content: displayText,
      image: tmpImage,
      createdAt: new Date().toISOString(),
    };
    setMessages(m => [...m, tmp]);
    setInput("");
    setImageFile(null);
    setLoading(true);
    try {
      await api.sendChat(id, msg, fileToSend);
      // Only refresh the thread the user is still viewing; otherwise the
      // auto-fetch effect for the newly selected thread already handles it.
      if (convIdRef.current === id || !convIdRef.current) {
        await fetchMessages(id);
      }
      await fetchConvs();
    } catch (e) {
      // Refresh from server so Retry uses the real Cloudinary URL
      // (not the revoked blob preview) for image messages.
      try {
        if (convIdRef.current === id || !convIdRef.current) {
          await fetchMessages(id);
        }
      } catch {}
      setError(e.response?.data?.error || e.message || "Something went wrong.");
      if (e.response?.status === 401) navigate("/sign-in");
    } finally {
      setLoading(false);
      sendingRef.current = false;
      sendTargetRef.current = null;
      // Revoke object URL to avoid memory leak
      if (tmpImage?.url && tmpImage.url.startsWith("blob:")) URL.revokeObjectURL(tmpImage.url);
    }
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

  const handleRetry = async () => {
    if (loading || sendingRef.current) return;
    // Find the last user message that had a real Cloudinary image (retry reuses URL, no re-upload)
    const lastUserMsg = [...messages].reverse().find(m => m.role === "user");
    const retryImageUrl = lastUserMsg?.image?.url?.startsWith("https://res.cloudinary.com/")
      ? lastUserMsg.image.url
      : null;
    if (retryImageUrl) {
      try {
        setError("");
        setLoading(true);
        sendingRef.current = true;
        sendTargetRef.current = conversationId;
        await api.sendChatRetry(conversationId, lastUserMsg.content, retryImageUrl);
        await fetchMessages(conversationId);
        await fetchConvs();
        setError("");
      } catch (e) {
        setError(e.response?.data?.error || e.message || "Something went wrong.");
      } finally {
        setLoading(false);
        sendingRef.current = false;
        sendTargetRef.current = null;
      }
      return;
    }
    // Fallback to text-only retry
    const lastContent = [...messages].reverse().find(m => m.role === "user")?.content || "";
    send(lastContent);
  };

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
        onRetry={handleRetry}
        input={input}
        setInput={setInput}
        listRef={listRef}
        imageFile={imageFile}
        setImageFile={setImageFile}
      />
    </AppShell>
  );
}
