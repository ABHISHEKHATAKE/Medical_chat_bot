import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { ClerkProvider } from "@clerk/clerk-react";

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const hasClerk = publishableKey && !publishableKey.includes("placeholder") && publishableKey.startsWith("pk_");

function Root() {
  if (hasClerk) {
    return (
      <ClerkProvider publishableKey={publishableKey}>
        <App />
      </ClerkProvider>
    );
  }
  return <App />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
