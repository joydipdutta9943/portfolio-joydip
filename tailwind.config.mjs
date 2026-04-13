/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0f",
        surface: "#0f0f14",
        "surface-raised": "#15151d",
        foreground: "#fafafa",
        muted: "#a1a1aa",
        subtle: "#52525b",
        "accent-from": "#7c5cff",
        "accent-via": "#3b82f6",
        "accent-to": "#06b6d4",
      },
      fontFamily: {
        display: ['"Inter Tight"', "Inter", "sans-serif"],
        sans: ["Inter", '"Helvetica Neue"', "sans-serif"],
        mono: ['"JetBrains Mono"', '"Fira Code"', "monospace"],
      },
    },
  },
  plugins: [],
};
