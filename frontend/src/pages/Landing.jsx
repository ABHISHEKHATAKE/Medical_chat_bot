import { Link } from "react-router-dom";
import { Nav } from "../components/layout/Nav.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Search, Database, Sparkles, ShieldCheck, History, Lock } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Nav />
      {/* Hero */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-10">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-medium tracking-wide px-3 py-1 rounded-full bg-[#ECFEFF] border border-[#A5F3FC] text-[#0891B2]">RAG • grounded medical answers</div>
            <h1 className="mt-4 text-[32px] sm:text-[44px] font-bold leading-[1.05] text-[#0f172a]">Medical questions,<br/>answered with context.</h1>
            <p className="mt-4 text-[16px] leading-7 text-slate-600 max-w-[560px]">Ask health questions and get clear, retrieval-augmented answers grounded in curated medical documents — not just model memory. Fast, private, and designed for education.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/chat"><Button size="lg">Start chatting</Button></Link>
              <Link to="/about" className="inline-flex h-11 px-6 items-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50">Learn more</Link>
            </div>
            <p className="mt-3 text-xs text-slate-500">Educational use only. Not a substitute for professional medical advice.</p>
          </div>
          <div className="bg-white rounded-2xl border border-[#A5F3FC] shadow-sm p-4 sm:p-5">
            <div className="text-xs font-medium text-slate-500 mb-3">Example conversation</div>
            <div className="space-y-3">
              <div className="bg-slate-50 rounded-xl px-3 py-2.5 text-sm">What causes a persistent cough?</div>
              <div className="bg-[#ECFEFF] rounded-xl px-3 py-3 text-sm leading-6">A persistent cough (lasting more than 2–3 weeks) is often caused by chronic bronchitis, asthma, allergies, COPD, or GERD. Smoking and irritants can also trigger it. If it persists, see a healthcare professional.</div>
              <div className="text-[11px] text-slate-500 border-t pt-3 mt-1">Sources • What is (are) Cough ? • Whooping Cough • Acute Bronchitis</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8">
        <h2 className="text-xl font-semibold">How it works</h2>
        <div className="mt-4 grid md:grid-cols-3 gap-4">
          {[
            {icon:Search,title:"Ask a question",desc:"Type any medical question in plain language."},
            {icon:Database,title:"Relevant retrieval",desc:"FAISS + cross-encoder reranking finds the best passages."},
            {icon:Sparkles,title:"Grounded answer",desc:"LLM generates a concise answer using only retrieved context."},
          ].map(c=>(
            <div key={c.title} className="bg-white rounded-xl border border-slate-200 p-5">
              <c.icon className="text-[#0891B2]" size={20} />
              <div className="mt-3 font-medium">{c.title}</div>
              <div className="text-sm text-slate-600 mt-1">{c.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features + RAG */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 py-4 grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold">Features</h3>
          <ul className="mt-3 grid sm:grid-cols-2 gap-3 text-sm">
            {[
              [ShieldCheck,"Medical guardrails"],
              [History,"Conversation history"],
              [Lock,"Clerk auth & private data"],
              [Database,"Source-aware responses"],
            ].map(([Icon,label])=>(
              <li key={label} className="flex items-center gap-2"><Icon size={16} className="text-[#059669]" /> {label}</li>
            ))}
          </ul>
          <div className="mt-5 text-sm text-slate-600">Documents → Retrieval → Relevant Context → AI Answer</div>
        </div>
        <div className="bg-[#164E63] text-white rounded-xl p-6">
          <div className="text-sm opacity-80">Safety</div>
          <p className="mt-2 leading-6 text-[#ECFEFF]">Medical AI provides general health information for educational purposes and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified professional.</p>
          <Link to="/safety" className="inline-flex mt-4 text-sm underline decoration-white/50 underline-offset-4">Read safety & disclaimer →</Link>
        </div>
      </section>

      <footer className="mt-10 border-t border-slate-200 py-6 text-sm text-slate-500">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 flex flex-wrap gap-4 justify-between">
          <span>© {new Date().getFullYear()} Medical AI</span>
          <span className="flex gap-4"><Link to="/about">About</Link><Link to="/safety">Safety</Link></span>
        </div>
      </footer>
    </div>
  );
}
