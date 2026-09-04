import { useState, useEffect } from "react";
import { Search, Plus, MessageSquare, Trash2, LogOut, Stethoscope, PanelLeftClose, PanelLeftOpen, X, Menu, Hospital } from "lucide-react";
import { Button } from "../ui/button.jsx";
import { ThemeToggle } from "../ui/ThemeToggle.jsx";

export function AppShell({ sidebar, header, children, onNewChat, onHospitals, conversations, activeId, onSelect, onDelete, onRename, query, setQuery, drawerOpen, setDrawerOpen, collapsed, setCollapsed, clerkUser, isClerkMode, onLogout, isAuthed }) {
  const [renameTarget, setRenameTarget] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  const clearSearch = () => setQuery("");
  const hasQuery = query.trim().length > 0;
  const isFilteredEmpty = hasQuery && conversations.length === 0;

  return (
    <div className="orbita-outer">
      <div className="orbita-app flex overflow-hidden" style={{ height: "calc(100vh - 24px)" }}>
        {/* Desktop sidebar */}
        <div className={`${collapsed ? "w-[56px]" : "w-[280px]"} hidden lg:flex shrink-0 border-r border-[#E5E7EB] dark:border-[#3A3A3A] flex-col bg-white dark:bg-[#171717] transition-all duration-200`}>
          <div className="h-[56px] flex items-center gap-2 px-3 border-b border-[#E5E7EB] dark:border-[#3A3A3A] shrink-0">
            <span className="w-8 h-8 rounded-lg bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] grid place-items-center shrink-0"><Stethoscope size={16} /></span>
            {!collapsed && <span className="font-semibold text-sm dark:text-[#ECECEC] flex-1">MediChat</span>}
            <button onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} className="ml-auto p-1.5 hover:bg-slate-100 dark:hover:bg-[#252525] rounded-lg hidden lg:grid place-items-center">
              {collapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
            </button>
          </div>
          <div className="flex flex-col flex-1 min-h-0 bg-white dark:bg-[#171717]">
            {collapsed ? (
              <div className="flex flex-col items-center py-3 gap-2">
                <button onClick={() => setCollapsed(false)} aria-label="New chat" className="w-9 h-9 rounded-xl bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] grid place-items-center"><Plus size={16} /></button>
                <button aria-label="Search chats" onClick={() => setCollapsed(false)} className="w-9 h-9 rounded-xl hover:bg-slate-100 dark:hover:bg-[#252525] grid place-items-center text-slate-500"><Search size={16} /></button>
                {onHospitals && (
                  <button aria-label="Find nearby hospitals" onClick={onHospitals} className="w-9 h-9 rounded-xl hover:bg-slate-100 dark:hover:bg-[#252525] grid place-items-center text-slate-500"><Hospital size={16} /></button>
                )}
              </div>
            ) : (
              <>
                <div className="p-3">
                  <button onClick={onNewChat} className="w-full justify-center gap-2 rounded-full bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] hover:bg-[#1E293B] dark:hover:bg-slate-100 inline-flex items-center h-9 px-4 text-sm font-medium"> <Plus size={14} /> New chat</button>
                  <div className="mt-3 relative">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
                    <input
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      placeholder="Search chats"
                      aria-label="Search conversations"
                      className="w-full pl-9 pr-8 py-2 text-sm bg-[#F8F9FA] dark:bg-[#2F2F2F] border border-[#E5E7EB] dark:border-[#3A3A3A] rounded-full outline-none focus:border-[#0F172A] dark:focus:border-slate-500 dark:text-[#ECECEC]"
                    />
                    {query && (
                      <button
                        onClick={clearSearch}
                        aria-label="Clear search"
                        className="absolute right-2 top-1.5 p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex-1 overflow-auto px-2 pb-2">
                  {conversations.length === 0 ? (
                    <div className="text-sm text-slate-400 dark:text-[#8E8E8E] px-2 py-8 text-center">
                      {hasQuery ? (
                        <>No results for <span className="font-medium text-slate-600 dark:text-slate-300">"{query.trim()}"</span></>
                      ) : (
                        <>No conversations yet.<br />Start typing below.</>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {conversations.map(c => (
                        <div
                          key={c._id}
                          onClick={() => onSelect(c._id)}
                          title={c.title}
                          className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer text-sm border ${activeId === c._id ? "bg-[#F1F5F9] dark:bg-[#2A2A2A] border-[#E5E7EB] dark:border-[#3A3A3A] font-medium" : "border-transparent hover:bg-[#F8F9FA] dark:hover:bg-[#252525] hover:border-[#E5E7EB] dark:hover:border-[#334155]"}`}
                        >
                          <MessageSquare size={14} className="shrink-0 text-slate-400" />
                          <span className="flex-1 truncate">{c.title}</span>
                          <div className="hidden group-hover:flex items-center gap-1">
                            <button aria-label={`Rename ${c.title}`} onClick={e => { e.stopPropagation(); setRenameTarget(c); setRenameValue(c.title); }} className="p-1 hover:bg-white dark:hover:bg-[#252525] rounded-lg"><Plus size={12} className="rotate-45" /></button>
                            <button aria-label={`Delete ${c.title}`} onClick={e => { e.stopPropagation(); onDelete(c._id); }} className="p-1 hover:bg-white dark:hover:bg-[#252525] rounded-lg text-red-500"><Trash2 size={12} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {onHospitals && (
                  <div className="px-2 pb-2">
                    <button
                      onClick={onHospitals}
                      aria-label="Find nearby hospitals (requests your location)"
                      className="flex w-full items-center gap-2 rounded-xl border border-[#E5E7EB] dark:border-[#3A3A3A] bg-[#F8F9FA] dark:bg-[#1E293B] px-3 py-2.5 text-sm font-medium hover:bg-[#EEF2FF] dark:hover:bg-[#252525]"
                    >
                      <Hospital size={14} className="shrink-0 text-[#16A34A]" aria-hidden="true" />
                      <span className="flex-1 truncate text-left">Find Nearby Hospitals</span>
                    </button>
                  </div>
                )}
              </>
            )}
            <div className="p-3 border-t border-[#E5E7EB] dark:border-[#3A3A3A] flex items-center gap-2">
              {collapsed ? (
                <button onClick={() => setCollapsed(false)} aria-label="Expand sidebar" className="w-full p-2 hover:bg-slate-100 dark:hover:bg-[#252525] rounded-xl grid place-items-center"><PanelLeftOpen size={16} /></button>
              ) : (
                <>
                  {clerkUser?.imageUrl ? (
                    <img src={clerkUser.imageUrl} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-[#E5E7EB] dark:border-[#3A3A3A]" />
                  ) : clerkUser ? (
                    <div className="w-8 h-8 rounded-full bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] grid place-items-center text-xs font-bold">
                      {(clerkUser.firstName?.[0] || clerkUser.username?.[0] || "U").toUpperCase()}
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] grid place-items-center text-xs font-bold">G</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate dark:text-[#ECECEC]">{clerkUser ? (clerkUser.fullName || clerkUser.username || "User") : "Guest"}</div>
                    <div className="text-[11px] text-slate-500 dark:text-[#B4B4B4] truncate">{clerkUser ? "Free plan" : "Sign in to sync"}</div>
                  </div>
                  {isAuthed && (
                    <button onClick={onLogout} aria-label="Sign out" className="p-2 hover:bg-slate-100 dark:hover:bg-[#252525] rounded-full"><LogOut size={14} /></button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile drawer */}
        {drawerOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="flex-1 bg-black/20 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} aria-hidden="true" />
            <div className="w-[300px] bg-white dark:bg-[#171717] h-full flex flex-col border-r border-[#E5E7EB] dark:border-[#3A3A3A] shadow-xl">
              <div className="h-[56px] flex items-center justify-between px-4 border-b border-[#E5E7EB] dark:border-[#3A3A3A]">
                <span className="font-semibold text-sm dark:text-[#ECECEC]">Chats</span>
                <button onClick={() => setDrawerOpen(false)} aria-label="Close sidebar" className="p-2 -mr-2 hover:bg-slate-100 dark:hover:bg-[#252525] rounded-lg"><X size={18} /></button>
              </div>
              <div className="flex flex-col flex-1 min-h-0 bg-white dark:bg-[#171717]">
                <div className="p-3">
                  <button onClick={() => { onNewChat(); setDrawerOpen(false); }} className="w-full justify-center gap-2 rounded-full bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] hover:bg-[#1E293B] dark:hover:bg-slate-100 inline-flex items-center h-9 px-4 text-sm font-medium"><Plus size={14} /> New chat</button>
                  <div className="mt-3 relative">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
                    <input
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      placeholder="Search chats"
                      aria-label="Search conversations"
                      className="w-full pl-9 pr-8 py-2 text-sm bg-[#F8F9FA] dark:bg-[#2F2F2F] border border-[#E5E7EB] dark:border-[#3A3A3A] rounded-full outline-none focus:border-[#0F172A] dark:focus:border-slate-500 dark:text-[#ECECEC]"
                    />
                    {query && (
                      <button onClick={clearSearch} aria-label="Clear search" className="absolute right-2 top-1.5 p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400">
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex-1 overflow-auto px-2 pb-2">
                  {conversations.length === 0 ? (
                    <div className="text-sm text-slate-400 dark:text-[#8E8E8E] px-2 py-8 text-center">
                      {hasQuery ? (
                        <>No results for <span className="font-medium text-slate-600 dark:text-slate-300">"{query.trim()}"</span></>
                      ) : (
                        <>No conversations yet.<br />Start typing below.</>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {conversations.map(c => (
                        <div
                          key={c._id}
                          onClick={() => onSelect(c._id)}
                          title={c.title}
                          className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer text-sm border ${activeId === c._id ? "bg-[#F1F5F9] dark:bg-[#2A2A2A] border-[#E5E7EB] dark:border-[#3A3A3A] font-medium" : "border-transparent hover:bg-[#F8F9FA] dark:hover:bg-[#252525] hover:border-[#E5E7EB] dark:hover:border-[#334155]"}`}
                        >
                          <MessageSquare size={14} className="shrink-0 text-slate-400" />
                          <span className="flex-1 truncate">{c.title}</span>
                          <div className="hidden group-hover:flex items-center gap-1">
                            <button aria-label={`Rename ${c.title}`} onClick={e => { e.stopPropagation(); setRenameTarget(c); setRenameValue(c.title); }} className="p-1 hover:bg-white dark:hover:bg-[#252525] rounded-lg"><Plus size={12} className="rotate-45" /></button>
                            <button aria-label={`Delete ${c.title}`} onClick={e => { e.stopPropagation(); onDelete(c._id); }} className="p-1 hover:bg-white dark:hover:bg-[#252525] rounded-lg text-red-500"><Trash2 size={12} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {onHospitals && (
                  <div className="px-2 pb-2">
                    <button
                      onClick={() => { onHospitals(); setDrawerOpen(false); }}
                      aria-label="Find nearby hospitals (requests your location)"
                      className="flex w-full items-center gap-2 rounded-xl border border-[#E5E7EB] dark:border-[#3A3A3A] bg-[#F8F9FA] dark:bg-[#1E293B] px-3 py-2.5 text-sm font-medium hover:bg-[#EEF2FF] dark:hover:bg-[#252525]"
                    >
                      <Hospital size={14} className="shrink-0 text-[#16A34A]" aria-hidden="true" />
                      <span className="flex-1 truncate text-left">Find Nearby Hospitals</span>
                    </button>
                  </div>
                )}
                <div className="p-3 border-t border-[#E5E7EB] dark:border-[#3A3A3A] flex items-center gap-2">
                  {clerkUser?.imageUrl ? (
                    <img src={clerkUser.imageUrl} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-[#E5E7EB] dark:border-[#3A3A3A]" />
                  ) : clerkUser ? (
                    <div className="w-8 h-8 rounded-full bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] grid place-items-center text-xs font-bold">
                      {(clerkUser.firstName?.[0] || clerkUser.username?.[0] || "U").toUpperCase()}
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] grid place-items-center text-xs font-bold">G</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate dark:text-[#ECECEC]">{clerkUser ? (clerkUser.fullName || clerkUser.username || "User") : "Guest"}</div>
                    <div className="text-[11px] text-slate-500 dark:text-[#B4B4B4] truncate">{clerkUser ? "Free plan" : "Sign in to sync"}</div>
                  </div>
                  {isAuthed && (
                    <button onClick={onLogout} aria-label="Sign out" className="p-2 hover:bg-slate-100 dark:hover:bg-[#252525] rounded-full"><LogOut size={14} /></button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#F8F9FA] dark:bg-[#212121]">
          <header className="h-[56px] flex items-center justify-between px-4 bg-white dark:bg-[#212121] border-b border-[#E5E7EB] dark:border-[#3A3A3A] shrink-0">
            <div className="flex items-center gap-2">
              <button className="lg:hidden p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-[#252525] rounded-lg" onClick={() => setDrawerOpen(true)} aria-label="Open sidebar"><Menu size={18} /></button>
              <span className="font-semibold text-sm hidden sm:inline dark:text-[#ECECEC]">MediChat</span>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              {header}
            </div>
          </header>
          {children}
        </div>
      </div>

      {/* Rename dialog */}
      {renameTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setRenameTarget(null)} />
          <div className="relative w-full max-w-md rounded-2xl border border-[#E5E7EB] dark:border-[#3A3A3A] bg-white dark:bg-[#2A2A2A] p-6 shadow-xl">
            <h2 className="font-semibold">Rename conversation</h2>
            <input
              value={renameValue}
              onChange={e => setRenameValue(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && renameValue.trim()) { onRename(renameTarget._id, renameValue.trim()); setRenameTarget(null); } if (e.key === "Escape") setRenameTarget(null); }}
              placeholder="Conversation title"
              autoFocus
              className="mt-3 w-full px-3 py-2 rounded-xl border border-[#E5E7EB] dark:border-[#3A3A3A] bg-white dark:bg-[#171717] outline-none focus:border-[#0F172A] dark:focus:border-white text-sm dark:text-[#ECECEC]"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setRenameTarget(null)} className="px-4 py-2 rounded-full border border-[#E5E7EB] dark:border-[#3A3A3A] text-sm">Cancel</button>
              <button
                disabled={!renameValue.trim()}
                onClick={() => { onRename(renameTarget._id, renameValue.trim()); setRenameTarget(null); }}
                className="px-4 py-2 rounded-full bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] text-sm font-medium disabled:opacity-40"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
