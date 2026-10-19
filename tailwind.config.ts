import type { Config } from "tailwindcss";
const v = (n: string) => `rgb(var(--${n}) / <alpha-value>)`;
export default {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: v("background"), foreground: v("foreground"), card: v("card"),
        muted: v("muted"), "muted-foreground": v("muted-foreground"), border: v("border"),
        primary: v("primary"), "primary-hover": v("primary-hover"), "primary-foreground": v("primary-foreground"),
        link: v("link"), secondary: v("secondary"), accent: v("accent"), danger: v("danger"),
      },
      fontFamily: { sans: ["var(--font-inter)", "var(--font-ethiopic)", "system-ui", "sans-serif"] },
    },
  },
} satisfies Config;
