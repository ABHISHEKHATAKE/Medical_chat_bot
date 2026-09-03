/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0891B2",
        "on-primary": "#FFFFFF",
        secondary: "#22D3EE",
        accent: "#059669",
        background: "#ECFEFF",
        foreground: "#164E63",
        card: "#FFFFFF",
        muted: "#E8F1F6",
        "muted-foreground": "#64748B",
        border: "#A5F3FC",
        ring: "#0891B2",
        destructive: "#DC2626",
      },
      fontFamily: {
        heading: ['Figtree', 'sans-serif'],
        body: ['Noto Sans', 'sans-serif'],
      },
      borderRadius: {
        xl: "12px",
        lg: "10px",
      },
    },
  },
  plugins: [],
};
