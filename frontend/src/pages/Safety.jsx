import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Stethoscope, ShieldCheck } from "lucide-react";

export default function Safety(){
  return (
    <div className="orbita-outer">
      <div className="orbita-app">
        <header className="h-[56px] flex items-center px-6 border-b border-[#E5E7EB] bg-white">
          <Link to="/" className="flex items-center gap-2 font-semibold"><span className="w-8 h-8 rounded-lg bg-[#0F172A] text-white grid place-items-center"><Stethoscope size={16} /></span> MediLearn</Link>
          <nav className="ml-auto flex gap-2 text-sm"><Link to="/" className="px-3 py-1.5 hover:bg-slate-50 rounded-full">Home</Link><Link to="/about" className="px-3 py-1.5 hover:bg-slate-50 rounded-full">About</Link></nav>
        </header>
        <main className="max-w-[900px] mx-auto px-4 sm:px-6 py-10">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-bold flex items-center gap-2"><ShieldCheck className="text-[#16A34A]" /> Safety & Medical Disclaimer</h1>
            <div className="mt-4 rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-soft text-sm leading-6 text-slate-700 space-y-3">
              <p><strong>Educational only.</strong> Medical AI provides general health information for educational purposes and is not a substitute for professional medical advice, diagnosis, or treatment.</p>
              <p>• Do not use for emergencies. If you think you have a medical emergency, call emergency services.</p>
              <p>• Always seek advice from a qualified healthcare professional for diagnosis and treatment.</p>
              <p>• Answers are grounded in retrieved documents but may be incomplete; sources are shown below each response.</p>
              <p>• Guardrails block non-medical queries (400 response). Conversation data is private per Clerk user.</p>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
