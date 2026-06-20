"use client";

// Codex theme picker — the user-facing Display Theme control (Phase 1 of
// docs/design/theme-system.md). Sets data-pack / data-mode on <html> (font is
// theme-driven — Auto only, as of 2026-06-13); CSS in globals.css re-skins the
// whole site. Persists to the `codex-skin` key the layout.tsx no-FOUC script reads.

import { useEffect, useState } from "react";

// Website side is Parchment & Ink only (2026-06-20) — Vibrant/DOS were pulled from the website switcher
// for design focus; the GAME's campaigns still apply their packs programmatically (PlayRunner), untouched.
const PACKS: [string, string][] = [
  ["parchment", "Parchment & Ink"],
];
const MODES: [string, string][] = [
  ["light", "☀ Light"],
  ["dark", "🌙 Dark"],
];

// Font is Auto only (the others were removed 2026-06-13 — choice-overload for zero
// positioning value; the theme + mode toggles carry the look). `font` stays in the
// skin shape for back-compat with stored skins, always "".
type Skin = { pack: string; mode: string; font: string };

export default function ThemePicker() {
  const [open, setOpen] = useState(false);
  const [skin, setSkin] = useState<Skin>({ pack: "parchment", mode: "light", font: "" });

  useEffect(() => {
    const r = document.documentElement;
    // Clear any stored non-Auto font so old skins don't keep a removed face.
    if (r.dataset.font) delete r.dataset.font;
    setSkin({
      pack: r.dataset.pack || "parchment",
      mode: r.dataset.mode || "light",
      font: "",
    });
  }, []);

  function apply(next: Partial<Skin>) {
    const v = { ...skin, ...next, font: "" };
    const r = document.documentElement;
    r.dataset.pack = v.pack;
    r.dataset.mode = v.mode;
    delete r.dataset.font;
    setSkin(v);
    try {
      localStorage.setItem("codex-skin", JSON.stringify(v));
    } catch {
      /* ignore */
    }
  }

  const chip = (active: boolean) =>
    `px-2.5 py-1 text-[12px] border-[1.5px] cursor-pointer transition ${
      active
        ? "bg-forest text-paper border-ink"
        : "bg-paper text-ink-soft border-margin-ink hover:border-ink"
    }`;

  return (
    <div className="fixed bottom-4 right-4 z-50 font-sans">
      {open && (
        <div className="mb-2 w-[230px] border-2 border-ink bg-paper-shade p-3 shadow-[4px_4px_0_0_rgba(0,0,0,0.2)]">
          <Group label="Theme">
            {PACKS.map(([v, l]) => (
              <button key={v} className={chip(skin.pack === v)} onClick={() => apply({ pack: v })}>
                {l}
              </button>
            ))}
          </Group>
          <Group label="Mode">
            {MODES.map(([v, l]) => (
              <button key={v} className={chip(skin.mode === v)} onClick={() => apply({ mode: v })}>
                {l}
              </button>
            ))}
          </Group>
          <p className="mt-1 text-[10px] text-margin-ink leading-snug">
            The look only — the words never change.
          </p>
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Theme settings"
        className="border-2 border-ink bg-paper px-3 py-2 text-[12px] font-bold tracking-wide text-ink shadow-[3px_3px_0_0_rgba(0,0,0,0.2)] hover:bg-paper-shade"
      >
        {open ? "✕ THEME" : "✦ THEME"}
      </button>
    </div>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-2.5">
      <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-forest">{label}</div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}
