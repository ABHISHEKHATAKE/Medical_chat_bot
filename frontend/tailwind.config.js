/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0F172A",
        "primary-light": "#1E293B",
        secondary: "#F8F9FA",
        accent: "#16A34A",
        background: "#09090B",
        foreground: "#0F172A",
        card: "#FFFFFF",
        muted: "#F1F5F9",
        "muted-foreground": "#64748B",
        border: "#E5E7EB",
        "border-soft": "#E2E8F0",
        ring: "#0F172A",
        destructive: "#DC2626",
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
