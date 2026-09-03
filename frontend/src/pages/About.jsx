import { Nav } from "../components/layout/Nav.jsx";
export default function About(){
  return <div className="min-h-screen bg-slate-50"><Nav />
    <main className="max-w-[900px] mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-semibold">How it works</h1>
      <div className="mt-4 space-y-4 text-sm leading-6 text-slate-700 bg-white rounded-xl border p-6">
        <p>The system is a Retrieval-Augmented Generation (RAG) pipeline: medical documents are chunked (800 chars, 120 overlap, sentence-aware), embedded with <code>all-MiniLM-L6-v2</code> (normalized), stored in FAISS <code>IndexFlatIP</code>, retrieved, reranked with <code>ms-marco-MiniLM</code>, then used to prompt Groq <code>openai/gpt-oss-20b</code>.</p>
        <p>Frontend (React) → Express (Mongoose, Zod, Clerk dev bypass) → Python FastAPI <code>POST /ask</code> with session_id and question → FAISS → LLM → Express saves message → React renders markdown plus sources.</p>
        <p>MongoDB: app collections conversations and messages separate from Python conversation_context. Auth via Clerk dev bypass header.</p>
      </div>
    </main>
  </div>
}
