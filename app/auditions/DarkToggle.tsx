"use client";
// THE DARK-MODE TOGGLE — flips :root[data-mode] between light/dark (the Parchment pack's candlelit vars live in
// globals.css). Persists to localStorage; the pre-paint script in layout.tsx reads it back so there's no flash.
import { useEffect, useState } from "react";

export default function DarkToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => { setDark(document.documentElement.dataset.mode === "dark"); }, []);
  const toggle = () => {
    const m = dark ? "light" : "dark";
    document.documentElement.dataset.mode = m;
    try { localStorage.setItem("aud-mode", m); } catch { /* private mode */ }
    setDark(!dark);
  };
  return (
    <button onClick={toggle} className="aud-darktoggle" aria-label="Toggle dark mode" title={dark ? "Switch to light" : "Switch to dark"}>
      {dark ? "☀" : "☾"}
    </button>
  );
}
