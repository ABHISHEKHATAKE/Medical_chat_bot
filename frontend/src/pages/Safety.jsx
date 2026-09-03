import { Nav } from "../components/layout/Nav.jsx";
export default function Safety(){
  return <div className="min-h-screen bg-slate-50"><Nav />
    <main className="max-w-[900px] mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-semibold">Safety & Medical Disclaimer</h1>
      <div className="mt-4 bg-white rounded-xl border p-6 text-sm leading-6 text-slate-700 space-y-3">
        <p><strong>Educational only.</strong> Medical AI provides general health information for educational purposes and is not a substitute for professional medical advice, diagnosis, or treatment.</p>
        <p>• Do not use for emergencies. If you think you have a medical emergency, call emergency services.</p>
        <p>• Always seek advice from a qualified healthcare professional for diagnosis and treatment.</p>
        <p>• Answers are grounded in retrieved documents but may be incomplete; sources are shown below each response.</p>
        <p>• Guardrails block non-medical queries (400 response). Conversation data is private per Clerk user; never shared across users.</p>
      </div>
    </main>
  </div>
}
