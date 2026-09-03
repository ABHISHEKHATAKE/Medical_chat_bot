import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import About from "./pages/About.jsx";
import Safety from "./pages/Safety.jsx";
import Chat from "./pages/Chat.jsx";
import Profile from "./pages/Profile.jsx";

function DevGuard({ children }){
  // In production with Clerk, wrap with <SignedIn>. For now allow dev header mode.
  return children;
}

export default function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<About />} />
        <Route path="/safety" element={<Safety />} />
        <Route path="/sign-in" element={<Navigate to="/chat" replace />} />
        <Route path="/sign-up" element={<Navigate to="/chat" replace />} />
        <Route path="/chat" element={<DevGuard><Chat /></DevGuard>} />
        <Route path="/chat/:conversationId" element={<DevGuard><Chat /></DevGuard>} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<div className="p-10 text-center">Not found</div>} />
      </Routes>
    </BrowserRouter>
  );
}
