// Community discussion + owner notes — the wiki's feedback layer (Phase 2).
// docs/design/community-discussion.md + auth-model.md. Facebook-style discussion
// on any granular area; a comment is a NOTE only when posted by an owner.
//
// Data goes through the Supabase JS client (supabaseClient.ts), so the session
// JWT rides every write and RLS applies by auth.uid() (votes one-per-user,
// owner-only note edits). Reads are public. Degrades to no-ops when unconfigured.

import parity from "../lib/parity.generated.json";
import { supabase, currentUserId, ensureSession } from "./supabaseClient";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const DATA_RUN = (parity as { version: { runId: string; contentHash: string } }).version.runId;
const DATA_VERSION = (parity as { version: { runId: string; contentHash: string } }).version.contentHash;
export const currentSnapshot = { run: DATA_RUN, version: DATA_VERSION };

// Env-based (consistent server + client → no hydration mismatch). Actual calls
// guard on supabase() being non-null (browser-only).
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
export function contentHash(text: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

// ── Reads ──────────────────────────────────────────────────────────────────
export async function fetchThread(anchor: string): Promise<Comment[]> {
  const c = supabase();
  if (!c) return [];
  const { data, error } = await c
    .from("wiki_comments_scored")
    .select("*")
    .eq("anchor", anchor)
    .eq("hidden", false)
    .order("created_at", { ascending: true });
  return error ? [] : (data as Comment[]);
}

export async function fetchBuzz(limit = 60): Promise<Comment[]> {
  const c = supabase();
  if (!c) return [];
  const { data, error } = await c
    .from("wiki_comments_scored")
    .select("*")
    .eq("hidden", false)
    .order("score", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);
  return error ? [] : (data as Comment[]);
}

export async function fetchChangelog(limit = 100): Promise<Comment[]> {
  const c = supabase();
  if (!c) return [];
  const { data, error } = await c
    .from("wiki_comments_scored")
    .select("*")
    .eq("is_note", true)
    .in("note_status", ["applied", "superseded"])
    .order("created_at", { ascending: false })
    .limit(limit);
  return error ? [] : (data as Comment[]);
}

export async function fetchMyVotes(): Promise<Set<string>> {
  const c = supabase();
  if (!c) return new Set();
  const uid = await currentUserId();
  if (!uid) return new Set();
  const { data, error } = await c
    .from("wiki_comment_votes")
    .select("comment_id")
    .eq("voter_token", uid);
  if (error) return new Set();
  return new Set((data as { comment_id: string }[]).map((r) => r.comment_id));
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

export async function postComment(n: NewComment): Promise<{ ok: boolean; error?: string }> {
  const c = supabase();
  if (!c) return { ok: false, error: "Discussion isn't configured yet." };
  const body = n.body.trim();
  if (!body) return { ok: false, error: "Write something first." };
  if (body.length > 4000) return { ok: false, error: "Too long (4000 char max)." };
  await ensureSession();
  const uid = await currentUserId();
  const owner = Boolean(n.asOwner);
  const { error } = await c.from("wiki_comments").insert({
    anchor: n.anchor,
    anchor_label: n.anchorLabel,
    parent_id: n.parentId ?? null,
    body,
    author: owner ? "owner" : (n.author?.trim() || "guest").slice(0, 60),
    author_role: owner ? "owner" : "anon",
    is_note: owner,
    note_status: owner ? "open" : null,
    owner_id: owner ? uid : null,
    user_id: uid, // attribute every comment to its author (for the profile)
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
  const { error } = await c.from("wiki_comment_votes").insert({ comment_id: commentId, voter_token: uid });
  return !error || error.code === "23505"; // 23505 = already liked (unique)
}

export async function unlike(commentId: string): Promise<boolean> {
  const c = supabase();
  if (!c) return false;
  const uid = await currentUserId();
  if (!uid) return false;
  const { error } = await c
    .from("wiki_comment_votes")
    .delete()
    .eq("comment_id", commentId)
    .eq("voter_token", uid);
  return !error;
}

// ── Owner-only edits (RLS-gated by is_wiki_owner) ──────────────────────────
async function ownerPatch(id: string, patch: Record<string, unknown>): Promise<boolean> {
  const c = supabase();
  if (!c) return false;
  const { error } = await c.from("wiki_comments").update(patch).eq("id", id);
  return !error;
}
export const setNoteStatus = (id: string, status: NoteStatus) =>
  ownerPatch(id, { note_status: status, is_note: true });
export const hideComment = (id: string) => ownerPatch(id, { hidden: true });

// ── Anchor scheme ──────────────────────────────────────────────────────────
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
  elseworldShare: (token: string) => `elseworld:share:${token}`,
};
