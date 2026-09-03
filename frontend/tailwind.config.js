/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0F172A",
        "primary-light": "#1E293B",
        secondary: "#F8F9FA",
        accent: "#10A37F",
        "accent-hover": "#0D8F70",
        background: "#09090B",
        foreground: "#0F172A",
        card: "#FFFFFF",
        muted: "#F1F5F9",
        "muted-foreground": "#64748B",
        border: "#E5E7EB",
        "border-soft": "#E2E8F0",
        ring: "#0F172A",
        destructive: "#DC2626",
        // Dark palette (user provided)
        "dark-bg": "#212121",
        "dark-sidebar": "#171717",
        "dark-header": "#212121",
        "dark-input": "#2F2F2F",
        "dark-input-hover": "#3A3A3A",
        "dark-user": "#303030",
        "dark-card": "#2A2A2A",
        "dark-card-hover": "#333333",
        "dark-border": "#3A3A3A",
        "dark-text": "#ECECEC",
        "dark-text-secondary": "#B4B4B4",
        "dark-muted": "#8E8E8E",
        "dark-placeholder": "#8A8A8A",
        "dark-icon": "#B4B4B4",
        "dark-selected": "#2A2A2A",
        "dark-hover": "#252525",
      },
      fontFamily: {
        heading: ['Inter', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        xl: "12px",
        lg: "10px",
        "2xl": "16px",
        "3xl": "20px",
      },
      boxShadow: {
        soft: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)",
        medium: "0 4px 12px rgba(0,0,0,0.08)",
      }
    },
  },
  plugins: [],
};
