"use client";
// THE LAYOUT SWITCHER — pick-and-choose the wide-viewport layout (column · shell · dashboard). Sets
// data-aud-layout on <html> (CSS does the rest) + persists to localStorage. A fixed control, any page.
import { useEffect, useState } from "react";

const MODES: [string, string, string][] = [
  ["column", "▭", "column"],
  ["shell", "▥", "shell"],
  ["dashboard", "▦", "dashboard"],
];

export default function LayoutSwitcher() {
  const [mode, setMode] = useState("column");
  useEffect(() => {
    const m = localStorage.getItem("audLayout") || "column";
    setMode(m);
    document.documentElement.dataset.audLayout = m;
  }, []);
  const pick = (m: string) => {
    setMode(m);
    localStorage.setItem("audLayout", m);
    document.documentElement.dataset.audLayout = m;
  };
  return (
    <div style={{ position: "fixed", right: 10, bottom: 10, zIndex: 90, display: "flex", gap: 3, alignItems: "center", background: "var(--paper)", border: "2px solid var(--ink)", padding: 4, boxShadow: "3px 3px 0 rgba(0,0,0,.22)" }}>
      <span style={{ color: "var(--margin-ink)", fontSize: 8.5, fontWeight: 700, letterSpacing: ".06em", padding: "0 3px", fontFamily: "var(--theme-body)" }}>LAYOUT</span>
      {MODES.map(([m, icon, label]) => {
        const on = mode === m;
        return (
          <button key={m} onClick={() => pick(m)} title={label} style={{ cursor: "pointer", border: `1.5px solid ${on ? "var(--forest)" : "var(--ink-soft)"}`, background: on ? "var(--paper-shade)" : "transparent", color: on ? "var(--forest)" : "var(--margin-ink)", fontWeight: 700, padding: "3px 7px", fontSize: 10, display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 12 }}>{icon}</span>{label}
          </button>
        );
      })}
    </div>
  );
}
