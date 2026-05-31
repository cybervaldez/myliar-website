// Community discussion + owner notes — the wiki's feedback layer.
// docs/design/community-discussion.md. Facebook-style discussion on any
// granular area; a comment is a NOTE only when posted by the owner (the one
// Supabase-Auth'd account). Replaces notes.ts (clean-slate).
//
// Transport is plain fetch — PostgREST for data, GoTrue REST for owner auth
// (no SDK). Anonymous public; owner signs in via magic link. Degrades to
// no-ops when the env vars are unset so the wiki still builds without creds.

import parity from "../lib/parity.generated.json";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const DATA_RUN = (parity as { version: { runId: string; contentHash: string } }).version.runId;
const DATA_VERSION = (parity as { version: { runId: string; contentHash: string } }).version.contentHash;
export const currentSnapshot = { run: DATA_RUN, version: DATA_VERSION };

export function commentsConfigured(): boolean {
  return Boolean(URL && ANON);
}

export type NoteStatus = "open" | "applied" | "declined" | "discuss" | "superseded";

export interface Comment {
  id: string;
  created_at: string;
  anchor: string;
  anchor_label: string | null;
  content_hash: string | null;
  data_run: string | null;
  data_version: string | null;
  parent_id: string | null;
  body: string;
  author: string;
  author_role: "anon" | "owner";
  is_note: boolean;
  note_status: NoteStatus | null;
  score: number;
}

// ── Stable content hash (FNV-1a 32-bit) ──────────────────────────────────
// Computed from the area's CURRENT text wherever a thread is rendered, stamped
// onto each new comment, and compared on read to flag stale ("earlier version")
// comments per-area — finer than the whole-snapshot data_version.
export function contentHash(text: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

// ── Per-visitor vote token (localStorage) ─────────────────────────────────
export function voterToken(): string {
  if (typeof window === "undefined") return "ssr";
  let t = localStorage.getItem("wiki_voter_token");
  if (!t) {
    t = crypto.randomUUID();
    localStorage.setItem("wiki_voter_token", t);
  }
  return t;
}

// ── Owner session (GoTrue magic link) ─────────────────────────────────────
// The owner requests a magic link; the redirect lands back with the access
// token in the URL hash, which we stash. Owner-scoped calls send it as Bearer.
function ownerToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("wiki_owner_token");
}
export function isOwner(): boolean {
  return ownerToken() !== null;
}

/** Call once on load: capture a token Supabase put in the URL hash after a
 *  magic-link redirect, then clean the URL. */
export function captureOwnerSession(): void {
  if (typeof window === "undefined") return;
  const hash = window.location.hash;
  if (hash.includes("access_token=")) {
    const p = new URLSearchParams(hash.slice(1));
    const token = p.get("access_token");
    if (token) {
      localStorage.setItem("wiki_owner_token", token);
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }
}

export async function signInOwner(email: string): Promise<{ ok: boolean; error?: string }> {
  if (!commentsConfigured()) return { ok: false, error: "Not configured." };
  try {
    const res = await fetch(`${URL}/auth/v1/otp`, {
      method: "POST",
      headers: { apikey: ANON as string, "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        options: { email_redirect_to: typeof window !== "undefined" ? window.location.href : undefined },
      }),
    });
    if (!res.ok) return { ok: false, error: `Couldn't send link (${res.status}).` };
    return { ok: true };
  } catch {
    return { ok: false, error: "Network error." };
  }
}

export function signOutOwner(): void {
  if (typeof window !== "undefined") localStorage.removeItem("wiki_owner_token");
}

function headers(owner = false) {
  const tok = owner ? ownerToken() : null;
  return {
    apikey: ANON as string,
    Authorization: `Bearer ${tok ?? ANON}`,
    "Content-Type": "application/json",
  };
}

// ── Reads ──────────────────────────────────────────────────────────────────
export async function fetchThread(anchor: string): Promise<Comment[]> {
  if (!commentsConfigured()) return [];
  const q = new URLSearchParams({
    anchor: `eq.${anchor}`,
    hidden: "eq.false",
    order: "created_at.asc",
    select: "*",
  });
  try {
    const res = await fetch(`${URL}/rest/v1/wiki_comments_scored?${q}`, {
      headers: headers(),
      cache: "no-store",
    });
    if (!res.ok) return [];
    return (await res.json()) as Comment[];
  } catch {
    return [];
  }
}

/** Most-liked / most-discussed comments across the whole wiki (the buzz page). */
export async function fetchBuzz(limit = 60): Promise<Comment[]> {
  if (!commentsConfigured()) return [];
  const q = new URLSearchParams({
    hidden: "eq.false",
    order: "score.desc,created_at.desc",
    limit: String(limit),
    select: "*",
  });
  try {
    const res = await fetch(`${URL}/rest/v1/wiki_comments_scored?${q}`, {
      headers: headers(),
      cache: "no-store",
    });
    if (!res.ok) return [];
    return (await res.json()) as Comment[];
  } catch {
    return [];
  }
}

/** The decision log: resolved OWNER notes, newest first (the changelog). */
export async function fetchChangelog(limit = 100): Promise<Comment[]> {
  if (!commentsConfigured()) return [];
  const q = new URLSearchParams({
    is_note: "eq.true",
    note_status: "in.(applied,superseded)",
    order: "created_at.desc",
    limit: String(limit),
    select: "*",
  });
  try {
    const res = await fetch(`${URL}/rest/v1/wiki_comments_scored?${q}`, {
      headers: headers(),
      cache: "no-store",
    });
    if (!res.ok) return [];
    return (await res.json()) as Comment[];
  } catch {
    return [];
  }
}

/** Which comment ids this visitor has already liked (so ▲ can show toggled). */
export async function fetchMyVotes(): Promise<Set<string>> {
  if (!commentsConfigured()) return new Set();
  const q = new URLSearchParams({
    voter_token: `eq.${voterToken()}`,
    select: "comment_id",
  });
  try {
    const res = await fetch(`${URL}/rest/v1/wiki_comment_votes?${q}`, {
      headers: headers(),
      cache: "no-store",
    });
    if (!res.ok) return new Set();
    const rows = (await res.json()) as { comment_id: string }[];
    return new Set(rows.map((r) => r.comment_id));
  } catch {
    return new Set();
  }
}

// ── Writes ───────────────────────────────────────────────────────────────
export interface NewComment {
  anchor: string;
  anchorLabel: string;
  body: string;
  author?: string;
  parentId?: string | null;
  contentHash?: string;
  asOwner?: boolean;
}

export async function postComment(c: NewComment): Promise<{ ok: boolean; error?: string }> {
  if (!commentsConfigured()) return { ok: false, error: "Discussion isn't configured yet." };
  const body = c.body.trim();
  if (!body) return { ok: false, error: "Write something first." };
  if (body.length > 4000) return { ok: false, error: "Too long (4000 char max)." };
  const owner = Boolean(c.asOwner && isOwner());
  try {
    const res = await fetch(`${URL}/rest/v1/wiki_comments`, {
      method: "POST",
      headers: { ...headers(owner), Prefer: "return=minimal" },
      body: JSON.stringify({
        anchor: c.anchor,
        anchor_label: c.anchorLabel,
        parent_id: c.parentId ?? null,
        body,
        author: owner ? "owner" : (c.author?.trim() || "anon").slice(0, 60),
        author_role: owner ? "owner" : "anon",
        is_note: owner,
        note_status: owner ? "open" : null,
        content_hash: c.contentHash ?? null,
        data_run: DATA_RUN,
        data_version: DATA_VERSION,
      }),
    });
    if (!res.ok) return { ok: false, error: `Couldn't post (${res.status}).` };
    return { ok: true };
  } catch {
    return { ok: false, error: "Network error — try again." };
  }
}

export async function like(commentId: string): Promise<boolean> {
  if (!commentsConfigured()) return false;
  try {
    const res = await fetch(`${URL}/rest/v1/wiki_comment_votes`, {
      method: "POST",
      headers: { ...headers(), Prefer: "return=minimal" },
      body: JSON.stringify({ comment_id: commentId, voter_token: voterToken() }),
    });
    return res.ok || res.status === 409; // 409 = already liked (unique)
  } catch {
    return false;
  }
}

export async function unlike(commentId: string): Promise<boolean> {
  if (!commentsConfigured()) return false;
  const q = new URLSearchParams({
    comment_id: `eq.${commentId}`,
    voter_token: `eq.${voterToken()}`,
  });
  try {
    const res = await fetch(`${URL}/rest/v1/wiki_comment_votes?${q}`, {
      method: "DELETE",
      headers: { ...headers(), Prefer: "return=minimal" },
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ── Owner-only edits (RLS-gated) ───────────────────────────────────────────
async function ownerPatch(id: string, patch: Record<string, unknown>): Promise<boolean> {
  if (!commentsConfigured() || !isOwner()) return false;
  try {
    const res = await fetch(`${URL}/rest/v1/wiki_comments?id=eq.${id}`, {
      method: "PATCH",
      headers: { ...headers(true), Prefer: "return=minimal" },
      body: JSON.stringify(patch),
    });
    return res.ok;
  } catch {
    return false;
  }
}
export const setNoteStatus = (id: string, status: NoteStatus) => ownerPatch(id, { note_status: status, is_note: true });
export const hideComment = (id: string) => ownerPatch(id, { hidden: true });

// ── Anchor scheme ──────────────────────────────────────────────────────────
// As granular as the content gets — events, replies, memory lines, items,
// achievements — plus page-entity catch-alls. Anchors stay STABLE (so a thread
// survives small edits); the content_hash carries staleness instead (a moved
// anchor would orphan the discussion). Items/achievements anchor by a stable
// slug/id so discussion AGGREGATES wherever that entity appears.
export function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
}

export const anchors = {
  character: (id: string) => `character:${id}`,
  mechanics: () => `mechanics:page`,
  elseworld: (band: string) => `elseworld:${band}`,
  atlas: () => `atlas:courtyard`,
  arcIndex: () => `arc:index`,
  arcDay: (day: number) => `arc:day-${day}`,
  arcEvent: (day: number, eventId: string) => `arc:day-${day}:event:${eventId}`,
  arcReply: (day: number, eventId: string, choiceId: string) =>
    `arc:day-${day}:event:${eventId}:reply:${choiceId}`,
  arcMemory: (day: number, eventId: string, idx: number) =>
    `arc:day-${day}:event:${eventId}:memory:${idx}`,
  item: (nameOrId: string) => `item:${slugify(nameOrId)}`,
  achievement: (id: string) => `achievement:${id}`,
};
