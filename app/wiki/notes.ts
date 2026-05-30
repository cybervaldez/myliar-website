// Community notes — the feedback layer on the read-only wiki.
//
// Anchored notes with a resolve lifecycle (comment-feel front, ticket-
// spine back). Each note attaches to a specific wiki entity and carries
// open → applied/declined/discuss + a reply. Stored in Supabase
// (`wiki_notes`), SEPARATE from the canon: notes are suggestions, never
// truth. A note that gets APPLIED becomes a change to the app's payload
// (by you + /writers-room), then parity re-syncs. The website never
// writes to the app — it only collects feedback here.
//
// Transport is plain fetch to Supabase PostgREST (no SDK dependency).
// Anonymous, gated by RLS (insert open-only; read non-declined). If the
// env vars aren't set, every function degrades to a no-op so the wiki
// still builds + deploys without credentials.

import parity from "../lib/parity.generated.json";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// The data snapshot the wiki is currently showing. Stamped onto every
// note so triage can tell whether a note refers to current canon or an
// older snapshot the game has since moved past.
const DATA_RUN = (parity as { version: { runId: string; contentHash: string } }).version.runId;
const DATA_VERSION = (parity as { version: { runId: string; contentHash: string } }).version.contentHash;
export const currentSnapshot = { run: DATA_RUN, version: DATA_VERSION };

export function notesConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON);
}

export type NoteKind = "question" | "disagree" | "suggest" | "praise";
// 'superseded' = was valid but the canon already changed (stale snapshot);
// kept visible as history, distinct from 'declined' (rejected/spam, hidden).
export type NoteStatus = "open" | "applied" | "declined" | "discuss" | "superseded";

export interface Note {
  id: string;
  created_at: string;
  anchor: string;
  anchor_label: string | null;
  kind: NoteKind;
  body: string;
  author: string;
  status: NoteStatus;
  resolution: string | null;
  resolved_at: string | null;
  data_run: string | null;
  data_version: string | null;
  source: "community" | "app";
  private: boolean;
}

export const NOTE_KINDS: { kind: NoteKind; label: string; hint: string }[] = [
  { kind: "question", label: "Question", hint: "something here doesn't make sense to me" },
  { kind: "disagree", label: "Disagree", hint: "I don't think this is right" },
  { kind: "suggest", label: "Suggest", hint: "here's a change I'd make" },
  { kind: "praise", label: "Praise", hint: "this works — keep it" },
];

function headers() {
  return {
    apikey: SUPABASE_ANON as string,
    Authorization: `Bearer ${SUPABASE_ANON}`,
    "Content-Type": "application/json",
  };
}

// Fetch the non-declined notes for one anchor, oldest first.
export async function fetchNotes(anchor: string): Promise<Note[]> {
  if (!notesConfigured()) return [];
  const q = new URLSearchParams({
    anchor: `eq.${anchor}`,
    status: "neq.declined",
    order: "created_at.asc",
    select: "*",
  });
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/wiki_notes?${q}`, {
      headers: headers(),
      cache: "no-store",
    });
    if (!res.ok) return [];
    return (await res.json()) as Note[];
  } catch {
    return [];
  }
}

// The decision log for /wiki/changelog — every RESOLVED note across the wiki
// (applied = canon changed; superseded = obsoleted by a later canon change),
// newest first. 'discuss'/'declined'/private are excluded.
export async function fetchChangelog(limit = 100): Promise<Note[]> {
  if (!notesConfigured()) return [];
  const q = new URLSearchParams({
    status: "in.(applied,superseded)",
    resolved_at: "not.is.null",
    order: "resolved_at.desc",
    limit: String(limit),
    select: "*",
  });
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/wiki_notes?${q}`, {
      headers: headers(),
      cache: "no-store",
    });
    if (!res.ok) return [];
    return (await res.json()) as Note[];
  } catch {
    return [];
  }
}

export interface NewNote {
  anchor: string;
  anchorLabel: string;
  kind: NoteKind;
  body: string;
  author?: string;
}

// Insert an anonymous open note. RLS forces status=open server-side.
export async function insertNote(n: NewNote): Promise<{ ok: boolean; error?: string }> {
  if (!notesConfigured()) return { ok: false, error: "Notes are not configured yet." };
  const body = n.body.trim();
  if (body.length === 0) return { ok: false, error: "Write something first." };
  if (body.length > 4000) return { ok: false, error: "Too long (4000 char max)." };
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/wiki_notes`, {
      method: "POST",
      headers: { ...headers(), Prefer: "return=minimal" },
      body: JSON.stringify({
        anchor: n.anchor,
        anchor_label: n.anchorLabel,
        kind: n.kind,
        body,
        author: (n.author?.trim() || "anon").slice(0, 60),
        // Stamp the data snapshot this note was written against.
        data_run: DATA_RUN,
        data_version: DATA_VERSION,
      }),
    });
    if (!res.ok) {
      return { ok: false, error: `Couldn't save (${res.status}).` };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Network error — try again." };
  }
}

// ── Anchor scheme ────────────────────────────────────────────────────
// Stable string per entity, so a note ties to the exact thing it's about
// and the triage workflow can group by it. v1 anchors at the page-entity
// level; finer (per-event / per-item) anchors can extend the scheme.
export const anchors = {
  character: (id: string) => `character:${id}`,
  mechanics: () => `mechanics:page`,
  elseworld: (band: string) => `elseworld:${band}`,
  atlas: () => `atlas:courtyard`,
  arcIndex: () => `arc:index`,
  arcDay: (day: number) => `arc:day-${day}`,
};
