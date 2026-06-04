"use client";

// One-click "copy this whole dataset as self-describing JSON" — the reliable way to
// hand a dev page to an LLM (parse / read / instruct) instead of hoping it scrapes the
// rendered HTML. Used by /concepts and /campaigns (the Gemini cross-check move).
// The payload is the entire source JSON, stringified server-side and passed in.

import { useState } from "react";

export function CopyForLLM({ payload, label, title }: { payload: string; label?: string; title?: string }) {
  const [copied, setCopied] = useState(false);
  const kb = Math.max(1, Math.round(payload.length / 1024));

  async function copy() {
    try {
      await navigator.clipboard.writeText(payload);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = payload;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch { /* noop */ }
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button
      onClick={copy}
      title={title ?? "Copy this entire dataset as self-describing JSON — paste into an LLM to read or extend it."}
      className={`font-sans text-[12px] uppercase tracking-[0.12em] px-3 py-2 border-2 transition ${
        copied ? "border-forest bg-forest text-paper" : "border-ink text-ink hover:bg-paper-shade"
      }`}
    >
      {copied ? "Copied ✓ — paste into an LLM" : `⧉ ${label ?? "Copy JSON for LLM"} (~${kb} KB)`}
    </button>
  );
}
