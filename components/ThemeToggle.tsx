"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const v = localStorage.getItem("theme");
    const d = v === "dark" || (!v && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", d);
    queueMicrotask(() => setDark(d));
  }, []);
  function toggle() {
    const d = !dark;
    setDark(d);
    document.documentElement.classList.toggle("dark", d);
    localStorage.setItem("theme", d ? "dark" : "light");
  }
  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-border/40"
    >
      {dark ? "☀ Light" : "☾ Dark"}
    </button>
  );
}
