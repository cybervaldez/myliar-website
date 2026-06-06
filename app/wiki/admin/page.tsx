"use client";

// The keeper's desk — owner-only fan-art approval queue. Gated by amIOwner()
// (UI gate; writes are RLS-enforced by is_codex_owner regardless). Approve /
// feature / remove a pending submission. companion-wiki §7 (moderation v0:
// owner-approval + user-flag + removal; no third-party pre-filter yet).

import { useCallback, useEffect, useRef, useState } from "react";
import { amIOwner, signInWithGoogle, currentDisplayName } from "../supabaseClient";
import {
  fetchFanArtQueue,
  moderateFanArt,
  fanArtUrl,
  fetchFlags,
  dismissFlag,
  hideComment,
  codexConfigured,
  uploadOwnerImage,
  fetchOwnerImages,
  deleteOwnerImage,
  characterTargets,
  type FanArt,
  type FanArtStatus,
  type Flag,
} from "../../lib/codex";

const TECH: Record<string, string> = {
  hand_drawn: "✎ hand-drawn",
  ai_assisted: "⛭ AI-assisted",
  mixed: "◐ mixed",
};

export default function AdminPage() {
  const [owner, setOwner] = useState<boolean | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [queue, setQueue] = useState<FanArt[]>([]);
  const [flags, setFlags] = useState<Flag[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const o = await amIOwner();
    setOwner(o);
    setName(await currentDisplayName());
    if (o) {
      setQueue(await fetchFanArtQueue());
      setFlags(await fetchFlags());
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function act(id: string, status: FanArtStatus) {
    setBusyId(id);
    const ok = await moderateFanArt(id, status);
    setBusyId(null);
    if (ok) setQueue((q) => q.filter((a) => a.id !== id));
  }

  async function dropFlag(id: string) {
    setBusyId(id);
    if (await dismissFlag(id)) setFlags((f) => f.filter((x) => x.id !== id));
    setBusyId(null);
  }

  // Act on the flagged target (remove the art / hide the comment), then clear the flag.
  async function resolveFlag(flag: Flag) {
    setBusyId(flag.id);
    if (flag.target_kind === "fan_art") {
      await moderateFanArt(flag.target_id, "removed");
      setQueue((q) => q.filter((a) => a.id !== flag.target_id));
    } else if (flag.target_kind === "comment") {
      await hideComment(flag.target_id);
    }
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
      <OwnerUpload />
      <p className="text-ink-soft leading-[1.6] mb-1">
        Pending fan art — {queue.length} waiting. Approve to make it public + in-app
        (credited); feature to pin it as the owner&apos;s pick; remove to reject.
      </p>
      <p className="text-[12px] text-margin-ink mb-6">
        Signed in as {name}. There&apos;s no auto-filter yet — eyes on each piece.
      </p>

      {queue.length === 0 ? (
        <p className="text-margin-ink italic">Nothing waiting. The wall&apos;s clean.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {queue.map((a) => (
            <div key={a.id} className="border-2 border-ink bg-paper-shade">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={fanArtUrl(a.image_path)}
                alt={`Submission by ${a.artist_name}`}
                className="block w-full max-h-[320px] object-contain bg-paper"
              />
              <div className="p-3 text-[12.5px]">
                <div className="flex items-baseline justify-between gap-2 mb-1">
                  <span className="font-display tracking-[0.04em] text-ink">
                    {a.target_kind}:{a.target_id}
                  </span>
                  <span className="text-margin-ink">{TECH[a.technique] ?? a.technique}</span>
                </div>
                <div className="text-ink-soft mb-1">
                  by{" "}
                  {a.artist_url ? (
                    <a href={a.artist_url} target="_blank" rel="noopener noreferrer" className="text-forest">
                      {a.artist_name}
                    </a>
                  ) : (
                    a.artist_name
                  )}
                  {a.is_spoiler && <span className="text-spot-red ml-2">· SPOILER ({a.derived_from})</span>}
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    disabled={busyId === a.id}
                    onClick={() => act(a.id, "approved")}
                    className="font-display tracking-[0.08em] text-[10px] bg-forest text-paper px-2 py-1 hover:opacity-80 disabled:opacity-50"
                  >
                    APPROVE
                  </button>
                  <button
                    disabled={busyId === a.id}
                    onClick={() => act(a.id, "featured")}
                    className="font-display tracking-[0.08em] text-[10px] border border-spot-red text-spot-red px-2 py-1 hover:bg-spot-red hover:text-paper disabled:opacity-50"
                  >
                    ★ FEATURE
                  </button>
                  <button
                    disabled={busyId === a.id}
                    onClick={() => act(a.id, "removed")}
                    className="font-display tracking-[0.08em] text-[10px] border border-ink text-margin-ink px-2 py-1 hover:bg-ink hover:text-paper disabled:opacity-50 ml-auto"
                  >
                    REMOVE
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {flags.length > 0 && (
        <>
          <div className="border-t-2 border-ink mt-10 pt-3 mb-3">
            <h2 className="font-display tracking-[0.06em] text-[16px] text-ink !m-0">
              ⚑ Reports ({flags.length})
            </h2>
          </div>
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
                  {(f.target_kind === "fan_art" || f.target_kind === "comment") && (
                    <button
                      disabled={busyId === f.id}
                      onClick={() => resolveFlag(f)}
                      className="font-display tracking-[0.08em] text-[10px] border border-spot-red text-spot-red px-2 py-1 hover:bg-spot-red hover:text-paper disabled:opacity-50"
                    >
                      {f.target_kind === "fan_art" ? "REMOVE ART" : "HIDE"}
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
        </>
      )}
    </Shell>
  );
}

// The owner's IMAGE INTERPRETATIONS uploader. Characters stay name-only in-game;
// these are the owner-curated "takes" that show as a captioned gallery in the
// in-app character sheet. Publishes directly (no review queue) — RLS-gated to the
// owner. companion-wiki §7-8 (the owner-curated pivot).
function OwnerUpload() {
  const targets = characterTargets();
  const [targetId, setTargetId] = useState(targets[0]?.id ?? "");
  const [caption, setCaption] = useState("");
  const [mystery, setMystery] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [existing, setExisting] = useState<FanArt[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const selected = targets.find((t) => t.id === targetId);

  const loadExisting = useCallback(async (id: string) => {
    setExisting(await fetchOwnerImages("character", id));
  }, []);

  useEffect(() => {
    if (targetId) loadExisting(targetId);
  }, [targetId, loadExisting]);

  // A mystery character defaults to a silhouette (mysteryAppearance) upload.
  useEffect(() => {
    setMystery(Boolean(selected?.mystery));
  }, [selected?.mystery]);

  async function upload() {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setMsg("Pick an image first.");
      return;
    }
    setBusy(true);
    setMsg(null);
    const res = await uploadOwnerImage({
      targetKind: "character",
      targetId,
      file,
      caption: caption || undefined,
      derivedFrom: mystery ? "mysteryAppearance" : "appearance",
      isSpoiler: mystery,
    });
    setBusy(false);
    if (res.ok) {
      setMsg("Uploaded — live in the character sheet.");
      setCaption("");
      if (fileRef.current) fileRef.current.value = "";
      loadExisting(targetId);
    } else {
      setMsg(res.error ?? "Upload failed.");
    }
  }

  async function remove(a: FanArt) {
    setBusy(true);
    if (await deleteOwnerImage(a.id, a.image_path)) {
      setExisting((xs) => xs.filter((x) => x.id !== a.id));
    }
    setBusy(false);
  }

  return (
    <div className="border-2 border-ink bg-paper-shade p-4 mb-8">
      <h2 className="font-display tracking-[0.06em] text-[16px] text-ink !m-0 mb-1">
        ▣ Upload an interpretation
      </h2>
      <p className="text-[12px] text-margin-ink mb-3 leading-[1.5]">
        Characters stay name-only in the game — these are your curated takes, shown as a
        captioned gallery in the character sheet. Published live; no review needed.
      </p>
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-[12px] text-ink-soft">
          <div className="font-display tracking-[0.06em] text-[10px] text-margin-ink mb-1">CHARACTER</div>
          <select
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            className="border border-ink bg-paper px-2 py-1 text-[12.5px] text-ink"
          >
            {targets.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-[12px] text-ink-soft">
          <div className="font-display tracking-[0.06em] text-[10px] text-margin-ink mb-1">CAPTION (optional)</div>
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value.slice(0, 80))}
            placeholder="noir take · cozy · 80s anime"
            className="border border-ink bg-paper px-2 py-1 text-[12.5px] text-ink w-[200px]"
          />
        </label>
        <label className="text-[12px] text-ink-soft">
          <div className="font-display tracking-[0.06em] text-[10px] text-margin-ink mb-1">IMAGE</div>
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="text-[11px] max-w-[180px]" />
        </label>
        <label className="flex items-center gap-1.5 text-[12px] text-ink-soft pb-1.5">
          <input type="checkbox" checked={mystery} onChange={(e) => setMystery(e.target.checked)} />
          mystery silhouette
        </label>
        <button
          disabled={busy}
          onClick={upload}
          className="font-display tracking-[0.08em] text-[11px] bg-ink text-paper px-3 py-1.5 hover:bg-forest transition disabled:opacity-50"
        >
          {busy ? "UPLOADING…" : "UPLOAD"}
        </button>
      </div>
      {msg && <p className="text-[12px] text-forest mt-2">{msg}</p>}
      {existing.length > 0 && (
        <div className="mt-4">
          <div className="font-display tracking-[0.06em] text-[10px] text-margin-ink mb-2">
            {existing.length} interpretation{existing.length === 1 ? "" : "s"} for {selected?.label}
          </div>
          <div className="flex flex-wrap gap-3">
            {existing.map((a) => (
              <div key={a.id} className="w-[120px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={fanArtUrl(a.image_path)}
                  alt={a.caption ?? "interpretation"}
                  className="block w-[120px] h-[100px] object-cover border border-ink bg-paper"
                />
                <div className="flex items-center justify-between gap-1 mt-1">
                  <span className="text-[10px] text-margin-ink truncate">{a.caption ?? "—"}</span>
                  <button
                    disabled={busy}
                    onClick={() => remove(a)}
                    className="font-display tracking-[0.06em] text-[9px] text-spot-red hover:underline disabled:opacity-50 shrink-0"
                  >
                    DELETE
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
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
      <p className="italic text-[12px] text-margin-ink mt-1 mb-6">Fan-art approval queue.</p>
      {children}
    </div>
  );
}
