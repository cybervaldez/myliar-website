// Supabase browser client + auth helpers for the wiki (Phase 2 — accounts).
// docs/design/auth-model.md. Every visitor gets a session (anonymous sign-in on
// first visit → a real auth.uid()); they can upgrade in place to Google
// (linkIdentity keeps the same uid + data). Owner = a uid in wiki_owners.
//
// Browser-only (auth persists in localStorage). Degrades to no-ops when env
// vars are missing, so the wiki still builds/deploys without credentials.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let _client: SupabaseClient | null = null;

export function supabase(): SupabaseClient | null {
  if (!URL || !ANON) return null;
  if (typeof window === "undefined") return null; // auth needs the browser
  _client ??= createClient(URL, ANON, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
  return _client;
}

/** Ensure a session exists — anonymous sign-in if none — so every visitor has a
 *  uid for votes/attribution. Returns the uid (or null if unconfigured/disabled). */
export async function ensureSession(): Promise<string | null> {
  const c = supabase();
  if (!c) return null;
  const { data } = await c.auth.getSession();
  if (data.session) return data.session.user.id;
  const { data: anon, error } = await c.auth.signInAnonymously();
  if (error) return null; // anonymous sign-ins not enabled yet
  return anon.user?.id ?? null;
}

export async function currentUserId(): Promise<string | null> {
  const c = supabase();
  if (!c) return null;
  const { data } = await c.auth.getSession();
  return data.session?.user.id ?? null;
}

/** Display name for a SIGNED-IN (non-anonymous) user, else null (a guest). */
export async function currentDisplayName(): Promise<string | null> {
  const c = supabase();
  if (!c) return null;
  const { data } = await c.auth.getUser();
  const u = data.user;
  if (!u || u.is_anonymous) return null;
  return (
    (u.user_metadata?.full_name as string | undefined) ||
    (u.user_metadata?.name as string | undefined) ||
    u.email ||
    null
  );
}

/** Sign in with Google. If currently an anonymous guest, LINK Google to the same
 *  uid (upgrade-in-place — keeps their comments/likes). Requires "Manual linking"
 *  enabled in Supabase Auth settings for the anonymous→OAuth path. */
export async function signInWithGoogle(): Promise<void> {
  const c = supabase();
  if (!c) return;
  const redirectTo = typeof window !== "undefined" ? window.location.href : undefined;
  const { data } = await c.auth.getUser();
  if (data.user?.is_anonymous) {
    await c.auth.linkIdentity({ provider: "google", options: { redirectTo } });
  } else {
    await c.auth.signInWithOAuth({ provider: "google", options: { redirectTo } });
  }
}

export async function signOut(): Promise<void> {
  await supabase()?.auth.signOut();
}

/** UI-only owner check (server still enforces writes via RLS). */
export async function amIOwner(): Promise<boolean> {
  const c = supabase();
  if (!c) return false;
  const { data, error } = await c.rpc("am_i_owner");
  return !error && data === true;
}
