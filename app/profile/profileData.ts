// Web companion profile data — a signed-in user's OWN data across surfaces
// (docs/design/guest-claim.md). All reads are gated by the user's auth.uid():
// cloud_saves (self-read RLS, 0003), wiki comments/votes (uid), own Elseworld
// shares (self-read RLS, 0013). Works once the player has claimed in-app with
// the same Google/Apple account (app uid = web uid).

import { supabase, currentUserId } from "../wiki/supabaseClient";

export interface SaveSummary {
  currentDay: number;
  globalStats: Record<string, number>;
  characterRelScores: Record<string, number>;
  metCharacterIds: string[];
  inventoryCount: number;
  updatedAt: string | null;
}

export async function fetchMySave(): Promise<SaveSummary | null> {
  const c = supabase();
  if (!c) return null;
  // RLS limits the row to auth.uid() = user_id, so no filter needed.
  const { data, error } = await c.from("cloud_saves").select("payload, updated_at").maybeSingle();
  if (error || !data) return null;
  const p = (data.payload ?? {}) as Record<string, unknown>;
  return {
    currentDay: Number(p.currentDay ?? 0),
    globalStats: (p.globalStats as Record<string, number>) ?? {},
    characterRelScores: (p.characterRelScores as Record<string, number>) ?? {},
    metCharacterIds: (p.metCharacterIds as string[]) ?? [],
    inventoryCount: Array.isArray(p.inventory) ? (p.inventory as unknown[]).length : 0,
    updatedAt: (data.updated_at as string) ?? null,
  };
}

export interface MyActivity {
  comments: number;
  likes: number;
}

export async function fetchMyActivity(): Promise<MyActivity> {
  const c = supabase();
  if (!c) return { comments: 0, likes: 0 };
  const uid = await currentUserId();
  if (!uid) return { comments: 0, likes: 0 };
  const cm = await c.from("wiki_comments").select("id", { count: "exact", head: true }).eq("user_id", uid);
  const lk = await c.from("wiki_comment_votes").select("comment_id", { count: "exact", head: true }).eq("voter_token", uid);
  return { comments: cm.count ?? 0, likes: lk.count ?? 0 };
}

export interface MyWorld {
  share_token: string;
  character_name: string;
  vibe_band: string;
  imports_count: number;
  triage_status: string;
  created_at: string;
}

export async function fetchMyWorlds(): Promise<MyWorld[]> {
  const c = supabase();
  if (!c) return [];
  const uid = await currentUserId();
  if (!uid) return [];
  const { data, error } = await c
    .from("elseworld_shares")
    .select("share_token, character_name, vibe_band, imports_count, triage_status, created_at")
    .eq("created_by_user_id", uid)
    .order("created_at", { ascending: false });
  return error ? [] : (data as MyWorld[]);
}

/** REL tier name for a score, given the canonical ladder (passed from parity). */
export function relTierName(score: number, thresholds: number[], names: string[]): string {
  for (let i = 0; i < thresholds.length; i++) {
    if (score < thresholds[i]) return names[i];
  }
  return names[names.length - 1];
}
