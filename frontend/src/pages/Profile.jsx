import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Stethoscope, LogOut } from "lucide-react";
import { Button } from "../components/ui/button.jsx";
import { clearDevUserId } from "../hooks/useDevAuth.js";

export default function Profile(){
  const navigate = useNavigate();
  const devUser = localStorage.getItem("dev_user_id");
  return (
    <div className="orbita-outer">
      <div className="orbita-app">
        <header className="h-[56px] flex items-center px-6 border-b border-[#E5E7EB] bg-white">
          <Link to="/" className="flex items-center gap-2 font-semibold"><span className="w-8 h-8 rounded-lg bg-[#0F172A] text-white grid place-items-center"><Stethoscope size={16} /></span> MediLearn</Link>
        </header>
        <main className="max-w-[720px] mx-auto px-4 sm:px-6 py-10">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-soft">
            <h1 className="text-xl font-bold">Profile</h1>
            <p className="text-sm text-slate-600 mt-1">Authentication via Clerk. In dev mode, user is <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">x-dev-user-id</code> from localStorage.</p>
            <div className="mt-4 p-3 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] text-sm"><span className="font-medium">Current user:</span> {devUser || "Not signed in (Clerk mode)"}</div>
            <div className="mt-4 flex gap-2">
              <input id="devId" placeholder="dev_user_id" className="flex-1 border border-[#E5E7EB] rounded-full px-4 py-2 text-sm outline-none focus:border-[#0F172A]" defaultValue={devUser||"test-user-123"} />
              <Button onClick={()=>{const v=document.getElementById('devId').value; localStorage.setItem('dev_user_id',v); alert('saved '+v)}} className="rounded-full">Save</Button>
              <Button variant="outline" className="rounded-full gap-2" onClick={()=>{clearDevUserId(); navigate("/sign-in");}}><LogOut size={14} /> Sign out</Button>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
