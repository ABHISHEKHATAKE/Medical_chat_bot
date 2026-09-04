import { Link, useNavigate } from "react-router-dom";
import { HeartPulse, Menu } from "lucide-react";
import { Button } from "../ui/Button.jsx";
import { HAS_CLERK } from "../../config/auth.js";

export function Nav({ onMenu }) {
  const navigate = useNavigate();
  const clerkMode = HAS_CLERK; // single source of truth: config/auth.js
  const devUser = localStorage.getItem("dev_user_id");
  const handleLogout = () => {
    localStorage.removeItem("dev_user_id");
    navigate("/sign-in");
  };
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-[#A5F3FC]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-[64px] flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onMenu && <button aria-label="Open menu" onClick={onMenu} className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-slate-100"><Menu size={20} /></button>}
          <Link to="/" className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-[#0891B2] text-white grid place-items-center"><HeartPulse size={18} /></span>
            <span className="font-heading font-semibold text-[17px] tracking-tight text-[#164E63]">Medical AI</span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-1 text-sm">
          <Link to="/about" className="px-3 py-2 rounded-lg hover:bg-slate-50">How it works</Link>
          <Link to="/safety" className="px-3 py-2 rounded-lg hover:bg-slate-50">Safety</Link>
        </nav>
        <div className="flex items-center gap-2">
          {clerkMode ? (
            <>
              <Link to="/sign-in" className="hidden sm:inline-flex text-sm px-3 py-2">Sign in</Link>
              <Button size="sm" onClick={()=>navigate("/sign-up")}>Get started</Button>
            </>
          ) : devUser ? (
            <>
              <span className="hidden sm:inline text-xs text-slate-500 max-w-[160px] truncate">{devUser}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>Sign out</Button>
              <Button size="sm" onClick={()=>navigate("/chat")}>Chat</Button>
            </>
          ) : (
            <>
              <Link to="/sign-in" className="hidden sm:inline-flex text-sm px-3 py-2">Sign in</Link>
              <Button size="sm" onClick={()=>navigate("/sign-up")}>Get started</Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
