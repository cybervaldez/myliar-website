// Shared UGC helpers for /play multiplayer (the Chaotic Line + the Path Cohort).
// docs/design/community-discussion.md.

// A per-visitor anonymous token (localStorage) — the privacy class of a vote token,
// no account/PII. Counts distinct players + attributes anon submissions/reactions.
export function visitorToken(): string {
  if (typeof window === "undefined") return "anon";
  try {
    let t = localStorage.getItem("play_visitor_token");
    if (!t) { t = (globalThis.crypto?.randomUUID?.() ?? String(Math.random()).slice(2)); localStorage.setItem("play_visitor_token", t); }
    return t;
  } catch { return "anon"; }
}

// The reaction set. Score is for HIDING bad content, never ranking (anti-creep floor) —
// weights match the scored SQL view (migration 0021). 'report' is a separate button.
export const REACTIONS: { emoji: string; weight: number }[] = [
  { emoji: "❤️", weight: 2 },
  { emoji: "😂", weight: 1 },
  { emoji: "🤔", weight: 1 },
  { emoji: "💀", weight: -2 },
];

// CLIENT-SIDE content gate — a STUB blocking the most egregious hate/slur categories so
// the worst never posts. Trivially bypassed; the REQUIRED real filter is server-side
// (keyword + AI moderation in an Edge Function) before any public launch — Gemini #5.
// Mild profanity is allowed on purpose ("say the worst line" is fun-transgressive); this
// targets hate speech, not swears.
const BLOCKED = [
  // hate/slur stems (normalized match). Keep minimal; the server filter is the real one.
  "nigger", "faggot", "retard", "kike", "chink", "spic", "tranny",
];
export function isBlockedContent(text: string): boolean {
  const norm = text.toLowerCase().replace(/[^a-z]/g, "");
  return BLOCKED.some((w) => norm.includes(w));
}

// Per-campaign genre MOTIF copy for the Chaotic Line UGC surface (dry comedy, belonging
// not surveillance). campaignKey: "corner" (Wingman) | else (Life Ops / default).
export function chaoticMotif(campaignKey: string) {
  const corner = campaignKey === "corner";
  return {
    seeOthers: corner ? "tape from other corners ↗" : "see how others played it ↗",
    modalTitle: corner ? "Tape from other corners" : "How others played it",
    empty: corner ? "Empty corner. Throw the first one." : "No one's dared this line yet. Set the tone.",
    lockIn: corner ? "throw it ▸" : "lock in your line ▸",
    inputHint: corner
      ? "edit it to make it yours (and share it); leave it to throw the scripted one."
      : "edit it to make it yours (and share it); leave it as-is to play the scripted line.",
    reported: "this line was reported.",
  };
}
