"use client";

// The keeper's desk — owner-only moderation for the DISCUSS path. Gated by
// amIOwner() (UI gate; writes are RLS-enforced by is_codex_owner regardless).
// Reviews user reports (flags) on comments + shared Elseworlds and acts on them.
// companion-wiki §7 (moderation v0: owner-approval + user-flag + removal).
//
// (The fan-art approval queue lived here until 2026-06-13; the fan-art pipeline
// was retired — community is the Discuss path now. See fan-art-pipeline.md.)

import { useCallback, useEffect, useState } from "react";
import { amIOwner, signInWithGoogle, currentDisplayName } from "../supabaseClient";
import {
  fetchFlags,
  dismissFlag,
  hideComment,
  codexConfigured,
  type Flag,
} from "../../lib/codex";

export default function AdminPage() {
  const [owner, setOwner] = useState<boolean | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [flags, setFlags] = useState<Flag[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const o = await amIOwner();
    setOwner(o);
    setName(await currentDisplayName());
    if (o) setFlags(await fetchFlags());
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function dropFlag(id: string) {
    setBusyId(id);
    if (await dismissFlag(id)) setFlags((f) => f.filter((x) => x.id !== id));
    setBusyId(null);
  }

  // Act on the flagged target (hide the comment), then clear the flag.
  async function resolveFlag(flag: Flag) {
    setBusyId(flag.id);
    if (flag.target_kind === "comment") await hideComment(flag.target_id);
    await dismissFlag(flag.id);
    setFlags((f) => f.filter((x) => x.id !== flag.id));
    setBusyId(null);
  }

  if (!codexConfigured()) {
    return <Shell><p className="text-margin-ink">The backend isn&apos;t configured here.</p></Shell>;
  }
  if (loading) {
    return <Shell><p className="text-margin-ink">Checking the keys…</p></Shell>;
  }
  if (!owner) {
    return (
      <Shell>
        <p className="text-ink-soft leading-[1.6] mb-4">
          {name ? `Signed in as ${name}, but this` : "This"} desk is for the keeper. If
          that&apos;s you, sign in with the owner account.
        </p>
        <button
          onClick={() => signInWithGoogle()}
          className="font-display tracking-[0.1em] text-[11px] bg-ink text-paper px-3 py-1.5 hover:bg-spot-red transition"
        >
          SIGN IN WITH GOOGLE
        </button>
      </Shell>
    );
  }

  return (
    <Shell>
      <p className="text-ink-soft leading-[1.6] mb-1">
        Reports from the discussion + shared-Elseworld layer — {flags.length} waiting.
        Hide the offending comment, or dismiss the report.
      </p>
      <p className="text-[12px] text-margin-ink mb-6">
        Signed in as {name}. There&apos;s no auto-filter yet — eyes on each one.
      </p>

      {flags.length === 0 ? (
        <p className="text-margin-ink italic">Nothing waiting. The wall&apos;s clean.</p>
      ) : (
        <div className="space-y-2">
          {flags.map((f) => (
            <div
              key={f.id}
              className="border border-ink bg-paper-shade p-3 text-[12.5px] flex items-start justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="font-display tracking-[0.04em] text-ink">
                  {f.target_kind} · {f.target_id}
                </div>
                {f.reason && <div className="text-ink-soft italic mt-0.5">&ldquo;{f.reason}&rdquo;</div>}
              </div>
              <div className="flex gap-2 shrink-0">
                {f.target_kind === "comment" && (
                  <button
                    disabled={busyId === f.id}
                    onClick={() => resolveFlag(f)}
                    className="font-display tracking-[0.08em] text-[10px] border border-spot-red text-spot-red px-2 py-1 hover:bg-spot-red hover:text-paper disabled:opacity-50"
                  >
                    HIDE
                  </button>
                )}
                <button
                  disabled={busyId === f.id}
                  onClick={() => dropFlag(f.id)}
                  className="font-display tracking-[0.08em] text-[10px] border border-ink text-margin-ink px-2 py-1 hover:bg-ink hover:text-paper disabled:opacity-50"
                >
                  DISMISS
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="wiki-prose">
      <div className="border-b-2 border-ink pb-1 mb-1">
        <h1 className="font-display text-[28px] sm:text-[34px] leading-tight text-ink !m-0">
          The Keeper&apos;s Desk
        </h1>
      </div>
      <p className="italic text-[12px] text-margin-ink mt-1 mb-6">Reports &amp; moderation.</p>
      {children}
    </div>
  );
}
