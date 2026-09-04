import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { ClerkProvider } from "@clerk/clerk-react";
import { ThemeProvider } from "./hooks/useTheme.jsx";
// Auth key + mode come from config/auth.js (single source of truth).
// NOTE: Vite embeds frontend/.env at server start — restart vite after editing it.
import { CLERK_PUBLISHABLE_KEY as publishableKey, HAS_CLERK as hasClerk } from "./config/auth.js";

function Root() {
  const app = (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
  if (hasClerk) {
    return (
      <ClerkProvider publishableKey={publishableKey}>
        {app}
      </ClerkProvider>
    );
  }
  return app;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
