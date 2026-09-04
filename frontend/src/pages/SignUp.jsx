import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { SignUp as ClerkSignUp } from "@clerk/clerk-react";
import { HeartPulse } from "lucide-react";
import { Button } from "../components/ui/Button.jsx";
import { isClerkConfigured, setDevUserId } from "../hooks/useDevAuth.js";

export default function SignUp() {
  const navigate = useNavigate();
  const clerkMode = isClerkConfigured();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  if (clerkMode) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#171717] flex flex-col">
        <header className="h-[56px] flex items-center px-6 border-b border-[#E5E7EB] dark:border-[#3A3A3A] bg-white dark:bg-[#212121]">
          <Link to="/" className="flex items-center gap-2"><span className="w-8 h-8 rounded-lg bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] grid place-items-center"><HeartPulse size={16} /></span><span className="font-semibold text-sm dark:text-[#ECECEC]">MediChat</span></Link>
        </header>
        <div className="flex-1 grid place-items-center p-6">
          <ClerkSignUp fallbackRedirectUrl="/" forceRedirectUrl="/" />
        </div>
      </div>
    );
  }

  const handle = (e) => {
    e.preventDefault();
    const id = (email.trim() || name.trim() || "new-user").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-_@.]/g, "");
    const finalId = id.includes("@") ? id : `${id}@dev.local`;
    setDevUserId(finalId);
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#171717] flex flex-col">
      <header className="h-[56px] flex items-center px-6 border-b border-[#E5E7EB] dark:border-[#3A3A3A] bg-white dark:bg-[#212121]">
        <Link to="/" className="flex items-center gap-2"><span className="w-8 h-8 rounded-lg bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] grid place-items-center"><HeartPulse size={16} /></span><span className="font-semibold text-sm dark:text-[#ECECEC]">MediChat</span></Link>
      </header>
      <div className="flex-1 grid place-items-center p-4">
        <form onSubmit={handle} className="w-full max-w-[420px] bg-white dark:bg-[#2A2A2A] rounded-2xl border border-slate-200 dark:border-[#3A3A3A] p-6 sm:p-8 shadow-sm">
          <div role="status" className="mb-4 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950 px-3 py-2 text-xs font-semibold text-amber-800 dark:text-amber-200">DEV SIGN-UP — Clerk key not loaded. This is NOT the Clerk sign-up. Set VITE_CLERK_PUBLISHABLE_KEY and restart vite for the real flow.</div>
          <h1 className="text-xl font-semibold dark:text-[#ECECEC]">Create account</h1>
          <p className="text-sm text-slate-600 dark:text-[#B4B4B4] mt-1">Dev mode — create a local account to start chatting. Production uses Clerk.</p>
          <div className="mt-6 space-y-3">
            <div>
              <label className="text-sm font-medium dark:text-[#ECECEC]">Email</label>
              <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" type="email" required className="mt-1 w-full border border-slate-200 dark:border-[#3A3A3A] dark:bg-[#212121] dark:text-[#ECECEC] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#0F172A] dark:focus:border-[#3A3A3A] focus:ring-2 focus:ring-[#0F172A]/10 dark:focus:ring-white/10" />
            </div>
            <div>
              <label className="text-sm font-medium dark:text-[#ECECEC]">Name</label>
              <input value={name} onChange={e=>setName(e.target.value)} placeholder="Alex" className="mt-1 w-full border border-slate-200 dark:border-[#3A3A3A] dark:bg-[#212121] dark:text-[#ECECEC] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#0F172A] dark:focus:border-[#3A3A3A] focus:ring-2 focus:ring-[#0F172A]/10 dark:focus:ring-white/10" />
            </div>
            <Button type="submit" className="w-full" size="lg">Create account</Button>
            <p className="text-xs text-center dark:text-[#B4B4B4]">Already have an account? <Link to="/sign-in" className="text-[#10A37F] underline">Sign in</Link></p>
          </div>
        </form>
      </div>
    </div>
  );
}
