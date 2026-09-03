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
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
        <header className="h-[64px] flex items-center px-6 border-b bg-white">
          <Link to="/" className="flex items-center gap-2"><span className="w-8 h-8 rounded-lg bg-[#0891B2] text-white grid place-items-center"><HeartPulse size={18} /></span><span className="font-semibold">Medical AI</span></Link>
        </header>
        <div className="flex-1 grid place-items-center p-6">
          <ClerkSignUp afterSignInUrl="/chat" afterSignUpUrl="/chat" />
        </div>
      </div>
    );
  }

  const handle = (e) => {
    e.preventDefault();
    const id = (email.trim() || name.trim() || "new-user").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-_@.]/g, "");
    const finalId = id.includes("@") ? id : `${id}@dev.local`;
    setDevUserId(finalId);
    navigate("/chat", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <header className="h-[64px] flex items-center px-6 border-b bg-white">
        <Link to="/" className="flex items-center gap-2"><span className="w-8 h-8 rounded-lg bg-[#0891B2] text-white grid place-items-center"><HeartPulse size={18} /></span><span className="font-semibold text-[#164E63]">Medical AI</span></Link>
      </header>
      <div className="flex-1 grid place-items-center p-4">
        <form onSubmit={handle} className="w-full max-w-[420px] bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <h1 className="text-xl font-semibold">Create account</h1>
          <p className="text-sm text-slate-600 mt-1">Dev mode — create a local account to start chatting. Production uses Clerk.</p>
          <div className="mt-6 space-y-3">
            <div>
              <label className="text-sm font-medium">Email</label>
              <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" type="email" required className="mt-1 w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#0891B2] focus:ring-2 focus:ring-[#0891B2]/20" />
            </div>
            <div>
              <label className="text-sm font-medium">Name</label>
              <input value={name} onChange={e=>setName(e.target.value)} placeholder="Alex" className="mt-1 w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#0891B2] focus:ring-2 focus:ring-[#0891B2]/20" />
            </div>
            <Button type="submit" className="w-full" size="lg">Create account</Button>
            <p className="text-xs text-center">Already have an account? <Link to="/sign-in" className="text-[#0891B2] underline">Sign in</Link></p>
          </div>
        </form>
      </div>
    </div>
  );
}
