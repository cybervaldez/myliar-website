// The Codex data layer — community discussion + owner notes + flags (the DISCUSS path).
// docs/design/companion-wiki.md. Talks to the codex_* backend (migrations 0014–0017)
// through the Supabase JS client (../wiki/supabaseClient), so the session JWT rides
// every write and RLS applies by auth.uid(). Reads are public; degrades to no-ops
// when unconfigured. Replaces the old wiki_* layer (app/wiki/comments.ts).

import parity from "./parity.generated.json";
import { supabase, currentUserId, ensureSession, amIOwner } from "../wiki/supabaseClient";

export { ensureSession, amIOwner, currentUserId };

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const DATA_RUN = (parity as { version: { runId: string; contentHash: string } }).version.runId;
const DATA_VERSION = (parity as { version: { runId: string; contentHash: string } }).version.contentHash;
export const currentSnapshot = { run: DATA_RUN, version: DATA_VERSION };

/** Env-based so server + client agree (no hydration mismatch); calls still guard
 *  on supabase() being non-null (browser-only). */
export function codexConfigured(): boolean {
  return Boolean(URL && ANON);
}

// ── Comment / note types ─────────────────────────────────────────────────────
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
  flag_count: number;
  score: number;
}

// ── Stable content hash (FNV-1a 32-bit) — staleness marker for versioned areas ──
export function contentHash(text: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

export function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
}

// ── Anchor scheme — which entity a comment/flag hangs on ────────────────────
// Product policy (companion-wiki §9): comments live on REFERENCE surfaces only
// (item / trophy / realm / theme / story / manual). Character pages get owner-notes
// only, no open threads — enforced in the UI, not the schema.
export const anchors = {
  character: (id: string) => `character:${id}`,
  item: (nameOrId: string) => `item:${slugify(nameOrId)}`,
  trophy: (id: string) => `trophy:${id}`,
  realm: (id: string) => `realm:${id}`,
  theme: (id: string) => `theme:${id}`,
  mechanics: () => `manual:mechanics`,
  lexicon: () => `manual:lexicon`,
  atlas: () => `realm:courtyard`,
  elseworld: (band: string) => `elseworld:${band}`,
  elseworldShare: (token: string) => `elseworld:share:${token}`,
  arcIndex: () => `arc:index`,
  arcDay: (day: number) => `arc:day-${day}`,
  arcEvent: (day: number, eventId: string) => `arc:day-${day}:event:${eventId}`,
  arcReply: (day: number, eventId: string, choiceId: string) =>
    `arc:day-${day}:event:${eventId}:reply:${choiceId}`,
  arcMemory: (day: number, eventId: string, idx: number) =>
    `arc:day-${day}:event:${eventId}:memory:${idx}`,
};

// ── Comment reads ────────────────────────────────────────────────────────────
async function readComments(
  build: (q: ReturnType<NonNullable<ReturnType<typeof supabase>>["from"]>) => unknown,
): Promise<Comment[]> {
  const c = supabase();
  if (!c) return [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = (await (build(c.from("codex_comment_scored")) as any)) as {
    data: Comment[] | null;
    error: unknown;
  };
  return error || !data ? [] : data;
}

export const fetchThread = (anchor: string) =>
  readComments((q) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (q as any).select("*").eq("anchor", anchor).eq("hidden", false).order("created_at", { ascending: true }),
  );

export const fetchBuzz = (limit = 60) =>
  readComments((q) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (q as any)
      .select("*")
      .eq("hidden", false)
      .order("score", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit),
  );

export const fetchChangelog = (limit = 100) =>
  readComments((q) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (q as any)
      .select("*")
      .eq("is_note", true)
      .in("note_status", ["applied", "superseded"])
      .order("created_at", { ascending: false })
      .limit(limit),
  );

export async function fetchMyVotes(): Promise<Set<string>> {
  const c = supabase();
  if (!c) return new Set();
  const uid = await currentUserId();
  if (!uid) return new Set();
  const { data, error } = await c.from("codex_comment_vote").select("comment_id").eq("voter_token", uid);
  if (error) return new Set();
  return new Set((data as { comment_id: string }[]).map((r) => r.comment_id));
}

// ── Comment writes ───────────────────────────────────────────────────────────
export interface NewComment {
  anchor: string;
  anchorLabel: string;
  body: string;
  author?: string;
  parentId?: string | null;
  contentHash?: string;
  asOwner?: boolean;
}

export async function postComment(n: NewComment): Promise<{ ok: boolean; error?: string }> {
  const c = supabase();
  if (!c) return { ok: false, error: "Discussion isn't configured yet." };
  const body = n.body.trim();
  if (!body) return { ok: false, error: "Write something first." };
  if (body.length > 4000) return { ok: false, error: "Too long (4000 char max)." };
  await ensureSession();
  const uid = await currentUserId();
  const owner = Boolean(n.asOwner);
  const { error } = await c.from("codex_comment").insert({
    anchor: n.anchor,
    anchor_label: n.anchorLabel,
    parent_id: n.parentId ?? null,
    body,
    author: owner ? "owner" : (n.author?.trim() || "guest").slice(0, 60),
    author_role: owner ? "owner" : "anon",
    is_note: owner,
    note_status: owner ? "open" : null,
    owner_id: owner ? uid : null,
    user_id: uid,
    content_hash: n.contentHash ?? null,
    data_run: DATA_RUN,
    data_version: DATA_VERSION,
  });
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function like(commentId: string): Promise<boolean> {
  const c = supabase();
  if (!c) return false;
  const uid = await ensureSession();
  if (!uid) return false;
  const { error } = await c.from("codex_comment_vote").insert({ comment_id: commentId, voter_token: uid });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return !error || (error as any).code === "23505"; // already liked (unique)
}

export async function unlike(commentId: string): Promise<boolean> {
  const c = supabase();
  if (!c) return false;
  const uid = await currentUserId();
  if (!uid) return false;
  const { error } = await c.from("codex_comment_vote").delete().eq("comment_id", commentId).eq("voter_token", uid);
  return !error;
}

// ── Owner-only comment edits (RLS-gated by is_codex_owner) ───────────────────
async function ownerPatch(id: string, patch: Record<string, unknown>): Promise<boolean> {
  const c = supabase();
  if (!c) return false;
  const { error } = await c.from("codex_comment").update(patch).eq("id", id);
  return !error;
}
export const setNoteStatus = (id: string, status: NoteStatus) =>
  ownerPatch(id, { note_status: status, is_note: true });
export const hideComment = (id: string) => ownerPatch(id, { hidden: true });

// ── Flags — anyone may report any community content; owner reads the queue ───
export type FlagTarget = "comment" | "elseworld";
export async function flagContent(targetKind: FlagTarget, targetId: string, reason?: string): Promise<boolean> {
  const c = supabase();
  if (!c) return false;
  const uid = await currentUserId();
  const { error } = await c
    .from("codex_flag")
    .insert({ target_kind: targetKind, target_id: targetId, reason: reason?.slice(0, 500) ?? null, reporter: uid });
  return !error;
}

export interface Flag {
  id: string;
  created_at: string;
  target_kind: FlagTarget;
  target_id: string;
  reason: string | null;
}

/** Owner: the report queue (RLS: owner-read). */
export async function fetchFlags(): Promise<Flag[]> {
  const c = supabase();
  if (!c) return [];
  const { data, error } = await c.from("codex_flag").select("*").order("created_at", { ascending: false });
  return error || !data ? [] : (data as Flag[]);
}

/** Owner: clear a handled report (RLS: owner-delete, migration 0018). */
export async function dismissFlag(id: string): Promise<boolean> {
  const c = supabase();
  if (!c) return false;
  const { error } = await c.from("codex_flag").delete().eq("id", id);
  return !error;
}
