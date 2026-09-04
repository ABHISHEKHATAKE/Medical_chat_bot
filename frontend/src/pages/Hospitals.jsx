import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import { AppShell } from "../components/layout/AppShell.jsx";
import { NearbyHospitals } from "../components/hospitals/NearbyHospitals.jsx";
import * as api from "../services/conversation.api.js";
import { clearDevUserId, isClerkConfigured, isDevAuthenticated } from "../hooks/useDevAuth.js";
import { setClerkTokenGetter } from "../services/api.js";

// Hospital finder page. Reuses the chat AppShell (sidebar + header chrome)
// but never touches the chat workflow: no messages, no Python calls.
export default function Hospitals() {
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

  useEffect(() => {
    if (clerkMode && clerkAuth.getToken) {
      setClerkTokenGetter(async () => await clerkAuth.getToken());
    } else if (!clerkMode) {
      setClerkTokenGetter(null);
    }
  }, [clerkMode, clerkAuth.getToken]);

  const [conversations, setConversations] = useState([]);
  const [query, setQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("sidebarCollapsed") === "true");

  useEffect(() => { localStorage.setItem("sidebarCollapsed", String(collapsed)); }, [collapsed]);

  const fetchConvs = useCallback(async () => {
    try {
      const data = await api.listConversations();
      setConversations(data);
    } catch {
      setConversations([]);
    }
  }, []);

  useEffect(() => { if (isAuthed) fetchConvs(); else setConversations([]); }, [isAuthed, fetchConvs]);

  const onSelect = (id) => { navigate(`/chat/${id}`); setDrawerOpen(false); };
  const onDelete = async (id) => {
    if (!confirm("Delete conversation? This will permanently delete the conversation and its messages.")) return;
    await api.deleteConversation(id);
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
    const terms = q.split(/\s+/).filter(Boolean);
    const title = c.title.toLowerCase();
    return terms.every(term => title.includes(term));
  });

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

  // Same gate as chat: coordinates only ever leave the browser for signed-in users.
  if (!isAuthed) {
    return (
      <AppShell
        header={
          <button onClick={() => navigate("/sign-in")} className="px-4 py-1.5 rounded-full bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] text-sm font-medium">Sign in</button>
        }
        conversations={[]}
        activeId={null}
        onSelect={onSelect}
        onDelete={onDelete}
        onRename={onRename}
        onNewChat={() => navigate("/")}
        query={query}
        setQuery={setQuery}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        clerkUser={null}
        isClerkMode={clerkMode}
        isAuthed={false}
        onLogout={handleLogout}
      >
        <div className="flex-1 overflow-auto">
          <div className="mx-auto max-w-[560px] px-4 py-16 text-center">
            <h1 className="text-xl font-bold dark:text-[#ECECEC]">Sign in to find nearby hospitals</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Your location is only used for the search and is never stored.</p>
            <button onClick={() => navigate("/sign-in")} className="mt-6 rounded-full bg-[#0F172A] dark:bg-white px-6 py-2.5 text-sm font-medium text-white dark:text-[#0F172A]">Sign in</button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      header={
        <button onClick={() => navigate("/")} className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E5E7EB] dark:border-[#334155] bg-white dark:bg-[#1E293B] text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800">Back to chat</button>
      }
      conversations={filtered}
      activeId={null}
      onSelect={onSelect}
      onDelete={onDelete}
      onRename={onRename}
      onNewChat={() => navigate("/")}
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
      <div className="flex-1 overflow-auto">
        <NearbyHospitals />
      </div>
    </AppShell>
  );
}
