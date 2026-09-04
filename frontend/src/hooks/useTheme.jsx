import { createContext, useContext, useEffect, useState } from "react";

// Safe default so a missing Provider can never crash the whole tree
// (destructure in consumers stays valid; real values come from ThemeProvider).
const ThemeContext = createContext({ theme: "system", setTheme: () => {} });

const THEME_KEY = "medichat-theme";

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem(THEME_KEY) || localStorage.getItem("theme") || "system";
    } catch { return "system"; }
  });

  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = (t) => {
      const resolved = t === "system" ? (media.matches ? "dark" : "light") : t;
      root.classList.toggle("dark", resolved === "dark");
      root.setAttribute("data-theme", resolved);
    };
    apply(theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
      // keep legacy key in sync for inline script
      localStorage.setItem("theme", theme);
    } catch {}
    const handler = () => { if (theme === "system") apply("system"); };
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, [theme]);

  // Avoid flash: set initial theme synchronously via inline script in index.html (handled separately)
  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
