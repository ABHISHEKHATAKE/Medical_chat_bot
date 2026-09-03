import { Nav } from "../components/layout/Nav.jsx";
export default function Profile(){
  return <div className="min-h-screen bg-slate-50"><Nav />
    <main className="max-w-[720px] mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-xl font-semibold">Profile</h1>
      <div className="mt-4 bg-white rounded-xl border p-6 text-sm text-slate-600">
        <p>Authentication via Clerk. In dev mode, user is <code>x-dev-user-id</code> from localStorage.</p>
        <div className="mt-4 flex gap-2">
          <input id="devId" placeholder="dev_user_id" className="border rounded px-3 py-2 text-sm flex-1" defaultValue={localStorage.getItem("dev_user_id")||"test-user-123"} />
          <button onClick={()=>{const v=document.getElementById('devId').value; localStorage.setItem('dev_user_id',v); alert('saved '+v)}} className="px-4 py-2 bg-[#0891B2] text-white rounded">Save</button>
        </div>
      </div>
    </main>
  </div>
}
