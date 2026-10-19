"use client";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => setDark(document.documentElement.classList.contains("dark")), []);
  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    document.cookie = `theme=${next ? "dark" : "light"}; path=/; max-age=31536000; samesite=lax`;
  }
  return (
    <button onClick={toggle} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="rounded-lg p-2 hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
