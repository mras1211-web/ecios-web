import type { Config } from "tailwindcss";

// ECIOS design tokens — "Vantage Point" identity.
// Rationale: a consulting firm's whole value proposition is elevation —
// seeing an organization's terrain from above to find the path up. The
// palette and the topographic-contour signature motif (see AuthShell)
// both come from that idea, not a generic dashboard default.
const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#161B22",
          900: "#0F1319",
          800: "#161B22",
          700: "#1F2630",
          600: "#2B3340",
        },
        summit: {
          DEFAULT: "#16324F", // deep vantage-blue, primary brand
          50: "#EAF0F5",
          100: "#CBDAE6",
          400: "#2B5478",
          600: "#16324F",
          700: "#102338",
        },
        brass: {
          DEFAULT: "#B08D57", // executive brass accent — not terracotta, not neon
          100: "#EFE4D2",
          400: "#C6A472",
          600: "#B08D57",
          700: "#8C6E41",
        },
        paper: "#F6F4EF",
        line: "#E4E0D6",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        sm: "3px",
        DEFAULT: "5px",
        md: "6px",
        lg: "8px",
      },
    },
  },
  plugins: [],
};

export default config;
