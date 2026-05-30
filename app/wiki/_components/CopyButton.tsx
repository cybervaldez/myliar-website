"use client";

import { useState } from "react";

// Tiny clipboard button for the paste-ready generation prompts. Client
// component (needs navigator.clipboard); shows a brief "copied" state.
export function CopyButton({ text, label = "COPY" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1400);
        } catch {
          /* clipboard blocked — user can still select the text */
        }
      }}
      className="font-display tracking-[0.14em] text-[10px] px-2.5 py-1 border border-ink bg-paper hover:bg-paper-shade transition cursor-pointer text-ink"
    >
      {done ? "COPIED ✓" : label}
    </button>
  );
}
