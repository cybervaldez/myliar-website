"use client";

// The companion profile — a signed-in player's own progress + activity on the
// web. Sign-in gate (Google/Apple) for guests; private self-view otherwise.
// docs/design/guest-claim.md.

import { useEffect, useState } from "react";
import {
  ensureSession,
  currentUser,
  signInWithGoogle,
  signInWithApple,
  signOut,
  type AccountUser,
} from "../wiki/supabaseClient";
import { codexConfigured } from "../lib/codex";
import {
  fetchMySave,
  fetchMyActivity,
  fetchMyWorlds,
  relTierName,
  type SaveSummary,
  type MyActivity,
  type MyWorld,
} from "./profileData";

const STATS = ["STR", "INT", "GLD", "CHR"];

export function ProfilePanel({
  relTiers,
  squad,
}: {
  relTiers: { thresholds: number[]; names: string[] };
  squad: { id: string; name: string }[];
}) {
  const configured = codexConfigured();
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<AccountUser | null>(null);
  const [save, setSave] = useState<SaveSummary | null>(null);
  const [activity, setActivity] = useState<MyActivity>({ comments: 0, likes: 0 });
  const [worlds, setWorlds] = useState<MyWorld[]>([]);

  useEffect(() => {
    (async () => {
      await ensureSession();
      const u = await currentUser();
      setUser(u);
      if (u) {
        const [s, a, w] = await Promise.all([fetchMySave(), fetchMyActivity(), fetchMyWorlds()]);
        setSave(s);
        setActivity(a);
        setWorlds(w);
      }
      setReady(true);
    })();
  }, []);

  if (!configured) {
    return <p className="text-[13px] text-margin-ink italic">Accounts aren&apos;t configured on this deploy yet.</p>;
  }
  if (!ready) return <p className="text-[13px] text-margin-ink italic">loading…</p>;

  if (!user) {
    return (
      <div className="border-2 border-ink bg-paper-shade p-5 max-w-md">
        <div className="font-display tracking-[0.1em] text-[13px] text-ink mb-2">SIGN IN</div>
        <p className="text-[13px] text-ink-soft leading-[1.5] mb-4">
          Sign in with the same account you use in the app to see your progress, your
          comments, and the worlds you&apos;ve shared — your companion.
        </p>
        <div className="flex gap-2">
          <button onClick={() => signInWithGoogle()} className="font-display tracking-[0.1em] text-[11px] text-white bg-forest px-4 py-2 border-2 border-ink hover:bg-[#1f3a1d] cursor-pointer">
            GOOGLE
          </button>
          <button onClick={() => signInWithApple()} className="font-display tracking-[0.1em] text-[11px] text-paper bg-ink px-4 py-2 border-2 border-ink hover:opacity-90 cursor-pointer">
             APPLE
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Account */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="font-display tracking-[0.06em] text-[15px] text-ink">{user.name ?? user.email ?? "You"}</span>
        {user.email && <span className="text-[12px] text-margin-ink">{user.email}</span>}
        <button onClick={async () => { await signOut(); location.reload(); }} className="ml-auto text-[11px] text-margin-ink underline hover:text-ink cursor-pointer">
          sign out
        </button>
      </div>

      {/* Progress (from the app's cloud save) */}
      <section className="border-2 border-ink bg-paper-shade p-4">
        <div className="font-display tracking-[0.12em] text-[11px] text-spot-red mb-2">▸ YOUR PROGRESS</div>
        {!save ? (
          <p className="text-[13px] text-ink-soft italic leading-[1.5]">
            No app progress synced to this account yet. Open the app and sign in with{" "}
            <span className="not-italic font-display text-[11px]">{user.email ?? "this account"}</span> to
            link your play — it&apos;ll show up here.
          </p>
        ) : (
          <>
            <div className="flex items-center gap-3 flex-wrap mb-3">
              <span className="font-display tracking-[0.08em] text-[13px] text-ink">DAY {save.currentDay}</span>
              <span className="text-[11px] text-margin-ink">· {save.inventoryCount} items</span>
              {save.updatedAt && (
                <span className="ml-auto text-[10px] text-margin-ink">synced {new Date(save.updatedAt).toLocaleDateString()}</span>
              )}
            </div>
            <div className="flex gap-4 mb-3">
              {STATS.map((s) => (
                <span key={s} className="font-display tracking-[0.06em] text-[12px] text-forest">
                  {s} {save.globalStats[s] ?? 0}
                </span>
              ))}
            </div>
            <div className="space-y-1">
              {squad
                .filter((ch) => save.metCharacterIds.includes(ch.id) || (save.characterRelScores[ch.id] ?? 0) > 0)
                .map((ch) => {
                  const score = save.characterRelScores[ch.id] ?? 0;
                  return (
                    <div key={ch.id} className="flex items-center gap-2 text-[12px]">
                      <span className="font-display tracking-[0.06em] text-ink w-14">{ch.name}</span>
                      <span className="text-forest">{relTierName(score, relTiers.thresholds, relTiers.names)}</span>
                      <span className="text-margin-ink ml-auto">REL {score}</span>
                    </div>
                  );
                })}
            </div>
          </>
        )}
      </section>

      {/* Wiki activity */}
      <section className="border-[1.5px] border-ink bg-paper p-4">
        <div className="font-display tracking-[0.12em] text-[11px] text-forest mb-2">▸ WIKI ACTIVITY</div>
        <div className="flex gap-5 text-[13px] text-ink">
          <span><b className="font-display">{activity.comments}</b> comments</span>
          <span><b className="font-display">{activity.likes}</b> likes given</span>
        </div>
      </section>

      {/* Shared worlds */}
      <section className="border-[1.5px] border-ink bg-paper p-4">
        <div className="font-display tracking-[0.12em] text-[11px] text-forest mb-2">▸ WORLDS YOU&apos;VE SHARED</div>
        {worlds.length === 0 ? (
          <p className="text-[13px] text-margin-ink italic">None yet. Share an Elseworld from the app and it lands in the community gallery.</p>
        ) : (
          <ul className="list-none p-0 m-0 space-y-1.5">
            {worlds.map((w) => (
              <li key={w.share_token} className="flex items-center gap-2 text-[12px] flex-wrap">
                <span className="font-display tracking-[0.06em] text-ink">{w.character_name}</span>
                <span className="text-margin-ink">{w.vibe_band.replace(/-/g, " ")}</span>
                {w.triage_status === "featured" && <span className="text-spot-red font-display text-[9px]">★ FEATURED</span>}
                {w.triage_status === "removed" && <span className="text-margin-ink text-[9px]">(removed)</span>}
                <span className="ml-auto text-margin-ink">↓ {w.imports_count} · <code className="font-mono text-[11px]">{w.share_token}</code></span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
