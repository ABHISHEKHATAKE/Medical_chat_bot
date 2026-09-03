import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import About from "./pages/About.jsx";
import Safety from "./pages/Safety.jsx";
import Chat from "./pages/Chat.jsx";
import Profile from "./pages/Profile.jsx";
import SignIn from "./pages/SignIn.jsx";
import SignUp from "./pages/SignUp.jsx";
import { isClerkConfigured, isDevAuthenticated } from "./hooks/useDevAuth.js";
import { useAuth as useClerkAuth, SignedIn, SignedOut } from "@clerk/clerk-react";

function ProtectedRoute({ children }) {
  const clerkMode = isClerkConfigured();
  if (clerkMode) {
    // Clerk mode: use Clerk auth
    return (
      <>
        <SignedIn>{children}</SignedIn>
        <SignedOut><Navigate to="/sign-in" replace /></SignedOut>
      </>
    );
  }
  // Dev mode: check localStorage
  if (!isDevAuthenticated()) return <Navigate to="/sign-in" replace />;
  return children;
}

export default function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<About />} />
        <Route path="/safety" element={<Safety />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/chat/:conversationId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="*" element={<div className="p-10 text-center">Not found</div>} />
      </Routes>
    </BrowserRouter>
  );
}
