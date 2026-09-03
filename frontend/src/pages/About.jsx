import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Stethoscope } from "lucide-react";

export default function About(){
  return (
    <div className="orbita-outer">
      <div className="orbita-app">
        <header className="h-[56px] flex items-center px-6 border-b border-[#E5E7EB] bg-white">
          <Link to="/" className="flex items-center gap-2 font-semibold"><span className="w-8 h-8 rounded-lg bg-[#0F172A] text-white grid place-items-center"><Stethoscope size={16} /></span> MediLearn</Link>
          <nav className="ml-auto flex gap-2 text-sm"><Link to="/" className="px-3 py-1.5 hover:bg-slate-50 rounded-full">Home</Link><Link to="/safety" className="px-3 py-1.5 hover:bg-slate-50 rounded-full">Safety</Link></nav>
        </header>
        <main className="max-w-[900px] mx-auto px-4 sm:px-6 py-10">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-bold">How it works</h1>
            <div className="mt-4 space-y-4 text-sm leading-6 text-slate-700 rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-soft">
              <p>The system is a Retrieval-Augmented Generation (RAG) pipeline: medical documents are chunked (800 chars, 120 overlap, sentence-aware), embedded with <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">all-MiniLM-L6-v2</code> (normalized), stored in FAISS <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">IndexFlatIP</code>, retrieved, reranked with <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">ms-marco-MiniLM</code>, then used to prompt Groq <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">openai/gpt-oss-20b</code>.</p>
              <p>Frontend (React + assistant-ui + shadcn + framer-motion) → Express (Mongoose, Zod, Clerk) → Python FastAPI <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">POST /ask</code> → FAISS → LLM → Express saves message → React renders markdown + sources.</p>
              <p>MongoDB: app collections <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">conversations</code>, <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">messages</code> separate from Python <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">conversation_context</code>. Auth via Clerk (dev bypass when no keys).</p>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
