import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Users, Award, Clock, Play, Target, Star, Layers, GraduationCap, Stethoscope, HeartPulse, ShieldCheck, ArrowRight, Sparkles, Search, Zap } from "lucide-react";
import { Button } from "../components/ui/button.jsx";
import { Card, CardContent } from "../components/ui/card.jsx";

export default function Landing() {
  return (
    <div className="orbita-outer">
      <div className="orbita-app">
        {/* Header - Orbita style */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-[#E5E7EB]">
          <div className="max-w-[1120px] mx-auto px-4 sm:px-6 h-[56px] flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-[#0F172A] text-white grid place-items-center"><Stethoscope size={16} /></span>
              <span className="font-semibold text-[16px] tracking-tight">MediLearn</span>
              <span className="hidden sm:inline text-[10px] font-bold tracking-widest bg-[#EEF2FF] text-[#4F46E5] border border-[#C7D2FE] rounded-full px-2 py-0.5">BETA</span>
            </Link>
            <nav className="hidden md:flex items-center gap-1 text-sm">
              <Link to="/about" className="px-3 py-1.5 rounded-full hover:bg-slate-50 font-medium">How it works</Link>
              <a href="#courses" className="px-3 py-1.5 rounded-full hover:bg-slate-50 font-medium">Topics</a>
              <Link to="/safety" className="px-3 py-1.5 rounded-full hover:bg-slate-50 font-medium">Safety</Link>
            </nav>
            <div className="flex items-center gap-2">
              <Link to="/sign-in" className="hidden sm:inline text-sm font-medium px-3 py-1.5">Log In</Link>
              <Link to="/sign-up"><Button size="sm" className="rounded-full">Start Free</Button></Link>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="max-w-[1120px] mx-auto px-4 sm:px-6 pt-10 pb-8">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-8 lg:gap-10 items-center">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide px-3 py-1.5 rounded-full bg-[#DCFCE7] border border-[#BBF7D0] text-[#166534]">
                <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" /> New: AI-Powered Medical Learning
              </div>
              <h1 className="mt-4 font-bold text-[36px] sm:text-[48px] leading-[0.95] tracking-tight">
                Learn Anything,<br />
                <span className="text-[#16A34A]">Anytime,</span><br />
                Anywhere!
              </h1>
              <p className="mt-4 text-[15px] leading-7 text-slate-600 max-w-[520px]">Join thousands of learners accessing grounded medical answers — retrieval-augmented, source-aware, and built for education.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/sign-up"><Button size="lg" className="gap-2 rounded-full">Start Learning Free <ArrowRight size={16} /></Button></Link>
                <a href="#courses"><Button variant="outline" size="lg" className="rounded-full">Browse Topics</Button></a>
              </div>
              <div className="mt-8 flex gap-8">
                <div><div className="font-bold text-xl tracking-tight">10K+</div><div className="text-xs text-slate-500 font-medium">Medical Q&As</div></div>
                <div><div className="font-bold text-xl tracking-tight">2M+</div><div className="text-xs text-slate-500 font-medium">Learners</div></div>
                <div><div className="font-bold text-xl tracking-tight">500+</div><div className="text-xs text-slate-500 font-medium">Topics</div></div>
              </div>
            </motion.div>

            {/* Progress tracking demo - Orbita soft card */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }} className="relative">
              <div className="rounded-[20px] border border-[#E5E7EB] bg-white shadow-medium p-6 relative">
                <div className="flex items-start gap-3">
                  <span className="w-10 h-10 rounded-xl bg-[#DBEAFE] grid place-items-center shrink-0"><Play size={16} className="ml-0.5 text-[#1E3A8A]" /></span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">Human Anatomy</div>
                    <div className="text-xs text-slate-500">12 lessons • 4h 30m</div>
                  </div>
                  <span className="text-xs font-bold text-[#16A34A]">65%</span>
                </div>
                <div className="mt-5 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: "65%" }} transition={{ duration: 1, delay: 0.6 }} className="h-full rounded-full bg-[#16A34A]" />
                </div>
                <div className="mt-5">
                  <Link to="/chat" className="block"><Button className="w-full rounded-full">Continue Learning</Button></Link>
                </div>
                {/* subtle inner highlight */}
                <div className="absolute -z-10 inset-0 rounded-[20px] bg-gradient-to-b from-white to-slate-50/50" />
              </div>
              {/* Floating badges - soft */}
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.7 }} className="absolute -top-3 -right-2 w-10 h-10 rounded-xl bg-white border border-[#E5E7EB] shadow-soft grid place-items-center">
                <Target size={18} className="text-[#F97316]" />
              </motion.div>
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.8 }} className="absolute top-[58%] -right-3 w-8 h-8 rounded-full bg-white border border-[#E5E7EB] shadow-soft grid place-items-center">
                <Star size={14} className="text-[#F59E0B] fill-[#F59E0B]" />
              </motion.div>
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.75 }} className="absolute -bottom-2 left-4 w-10 h-10 rounded-xl bg-white border border-[#E5E7EB] shadow-soft grid place-items-center">
                <Layers size={16} className="text-[#4F46E5]" />
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Course catalog preview */}
        <section id="courses" className="bg-[#F8F9FA] border-y border-[#E5E7EB] py-10">
          <div className="max-w-[1120px] mx-auto px-4 sm:px-6">
            <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
              <div className="inline-flex text-xs font-semibold tracking-widest bg-white border border-[#E5E7EB] rounded-full px-3 py-1">Popular Topics</div>
              <h2 className="mt-3 font-bold text-[26px] sm:text-[30px] tracking-tight">Explore Top-Rated Courses</h2>
              <p className="mt-2 text-sm text-slate-600 max-w-[520px] mx-auto">Curated medical topics grounded in trusted documents. Tap any card to start a conversation.</p>
            </motion.div>
            <div className="mt-8 grid md:grid-cols-3 gap-5">
              {[
                { title: "Cardiology Basics", lessons: "8 lessons", time: "3h 10m", color: "bg-[#FEE2E2] text-[#991B1B]", icon: HeartPulse, progress: 80 },
                { title: "Pharmacology", lessons: "12 lessons", time: "4h 30m", color: "bg-[#DBEAFE] text-[#1E3A8A]", icon: GraduationCap, progress: 45 },
                { title: "Emergency Care", lessons: "6 lessons", time: "2h 15m", color: "bg-[#DCFCE7] text-[#166534]", icon: ShieldCheck, progress: 30 },
              ].map((c, i) => (
                <motion.div key={c.title} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <Link to="/chat" className="block rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-soft hover:shadow-medium hover:-translate-y-0.5 transition-all">
                    <div className={`w-11 h-11 rounded-xl ${c.color} grid place-items-center`}><c.icon size={18} /></div>
                    <div className="mt-4 font-semibold text-sm">{c.title}</div>
                    <div className="text-xs text-slate-500">{c.lessons} • {c.time}</div>
                    <div className="mt-4 h-1.5 rounded-full bg-slate-100 overflow-hidden"><div className="h-full bg-[#0F172A]" style={{ width: `${c.progress}%` }} /></div>
                    <div className="mt-2 text-xs font-medium text-slate-500">{c.progress}% completed</div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works - 3 steps */}
        <section className="max-w-[1120px] mx-auto px-4 sm:px-6 py-10">
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { step: "01", title: "Ask anything", desc: "Type a medical question in plain language.", icon: Search, bg: "bg-[#FEF3C7]" },
              { step: "02", title: "We retrieve", desc: "FAISS + cross-encoder finds the best passages.", icon: Layers, bg: "bg-[#DBEAFE]" },
              { step: "03", title: "Grounded answer", desc: "LLM answers using only retrieved context.", icon: Sparkles, bg: "bg-[#DCFCE7]" },
            ].map((s, i) => (
              <motion.div key={s.step} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                <Card className="p-6 hover:shadow-medium transition-shadow">
                  <div className="flex items-center gap-3">
                    <span className={`w-9 h-9 rounded-xl ${s.bg} grid place-items-center`}><s.icon size={16} /></span>
                    <span className="text-xs font-bold tracking-widest text-slate-400">{s.step}</span>
                  </div>
                  <div className="mt-4 font-semibold text-sm">{s.title}</div>
                  <div className="text-sm text-slate-600 mt-1 leading-6">{s.desc}</div>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="max-w-[1120px] mx-auto px-4 sm:px-6 pb-10">
          <Card className="bg-[#F8F9FA] border-[#E5E7EB] p-6 sm:p-8">
            <div className="flex items-center gap-2 text-sm font-semibold"><Star size={16} className="text-[#F59E0B] fill-[#F59E0B]" /> Loved by learners</div>
            <div className="mt-4 grid md:grid-cols-3 gap-4">
              {[
                { name: "Aisha K.", role: "Nursing student", text: "Finally an AI that cites its sources. I use it for revision every night." },
                { name: "Rohan P.", role: "MBBS Year 2", text: "The grounded answers feel trustworthy. No more hallucinations." },
                { name: "Sara M.", role: "Pharmacist", text: "Great for quick refreshers during ward rounds. Quick and clear." },
              ].map((t, i) => (
                <motion.div key={t.name} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                  <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-soft">
                    <div className="text-sm leading-6">“{t.text}”</div>
                    <div className="mt-3 text-xs font-semibold">{t.name} <span className="font-normal text-slate-500">• {t.role}</span></div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </section>

        {/* Enrollment CTA */}
        <section className="max-w-[1120px] mx-auto px-4 sm:px-6 pb-10">
          <motion.div initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="rounded-[20px] bg-[#0F172A] text-white p-8 sm:p-10 text-center">
            <h2 className="font-bold text-[24px] sm:text-[30px] tracking-tight">Ready to start learning?</h2>
            <p className="mt-2 text-white/80 text-sm max-w-[520px] mx-auto">Create a free account and start a medical conversation. Educational use only — not a substitute for professional advice.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link to="/sign-up"><Button variant="outline" size="lg" className="rounded-full bg-white text-[#0F172A] border-white hover:bg-slate-50">Start Free</Button></Link>
              <Link to="/chat"><Button variant="ghost" size="lg" className="rounded-full text-white hover:bg-white/10 border border-white/20">Try chat →</Button></Link>
            </div>
          </motion.div>
        </section>

        <footer className="border-t border-[#E5E7EB] bg-white">
          <div className="max-w-[1120px] mx-auto px-4 sm:px-6 py-6 flex flex-wrap gap-4 justify-between text-sm text-slate-500">
            <span>© {new Date().getFullYear()} MediLearn • Medical AI</span>
            <span className="flex gap-4"><Link to="/about" className="hover:text-[#0F172A]">About</Link><Link to="/safety" className="hover:text-[#0F172A]">Safety</Link><Link to="/profile" className="hover:text-[#0F172A]">Profile</Link></span>
          </div>
        </footer>
      </div>
    </div>
  );
}
