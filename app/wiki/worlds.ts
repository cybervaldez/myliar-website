// Community Elseworld gallery data (docs/design/community-elseworld-gallery.md).
// Reads the public view (elseworld_public — live/featured, safe columns only;
// no device_hash/moderation). Owner can re-triage (feature/remove) via the
// is_wiki_owner-gated update policy. Surfaces player-generated worlds for the
// UGC→buzz→canon funnel.

import { supabase } from "./supabaseClient";

export interface PublicWorld {
  share_token: string;
  character_name: string;
  character_class: string;
  character_archetype: string;
  character_persona: string;
  character_quirk: string;
  character_specialty: string;
  character_gender: string;
  intro_cold_open: string;
  intro_first_voice: string;
  choice_engage: string;
  choice_observe: string;
  choice_decline: string;
  vibe_band: string;
  imports_count: number;
  triage_status: "live" | "featured";
  created_at: string;
}

export type WorldStatus = "live" | "featured" | "removed";

export async function fetchPublicWorlds(limit = 120): Promise<PublicWorld[]> {
  const c = supabase();
  if (!c) return [];
  const { data, error } = await c
    .from("elseworld_public")
    .select("*")
    // 'featured' sorts before 'live' (alphabetical), so featured pins to the top;
    // then most-imported, then newest.
    .order("triage_status", { ascending: true })
    .order("imports_count", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);
  return error ? [] : (data as PublicWorld[]);
}

/** Owner-only (RLS-gated by is_wiki_owner): feature / unfeature / remove a world. */
export async function setWorldStatus(token: string, status: WorldStatus): Promise<boolean> {
  const c = supabase();
  if (!c) return false;
  const { error } = await c
    .from("elseworld_shares")
    .update({ triage_status: status })
    .eq("share_token", token);
  return !error;
}
