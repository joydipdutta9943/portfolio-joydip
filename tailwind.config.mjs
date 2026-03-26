/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        background: "#09090b", // Deep charcoal / Pitch black
        foreground: "#fafafa", // High contrast white
        muted: "#a1a1aa", // Soft gray for body
        accent: "#4ade80", // Terminal green accent
      },
      fontFamily: {
        sans: ["Inter", "Geist", "sans-serif"],
        mono: ['"JetBrains Mono"', '"Geist Mono"', '"Fira Code"', "monospace"],
      },
      backgroundImage: {
        "dot-pattern": "radial-gradient(circle, #27272a 1px, transparent 1px)",
      },
      backgroundSize: {
        "dot-pattern": "24px 24px",
      },
    },
  },
  plugins: [],
};
