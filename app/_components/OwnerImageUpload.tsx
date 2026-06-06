"use client";

// Owner image-interpretations uploader — the tooling-suite home for character
// likenesses (moved here from the wiki keeper's desk; the user prefers it on the
// dev tooling pages). Characters stay name-only in-game; these are the owner-
// curated "takes" shown as a captioned gallery in the in-app character sheet.
// Publishes live (no review queue) — RLS-gated to is_codex_owner(). Self-contained:
// it does its own owner-auth gate so any tooling page can drop it in.
// companion-wiki §7-8 (the owner-curated pivot).

import { useCallback, useEffect, useRef, useState } from "react";
import { amIOwner, signInWithGoogle, currentDisplayName } from "../wiki/supabaseClient";
import {
  uploadOwnerImage,
  fetchOwnerImages,
  deleteOwnerImage,
  characterTargets,
  fanArtUrl,
  codexConfigured,
  type FanArt,
} from "../lib/codex";

export function OwnerImageUpload() {
  const [owner, setOwner] = useState<boolean | null>(null);
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setOwner(await amIOwner());
      setName(await currentDisplayName());
    })();
  }, []);

  if (!codexConfigured()) {
    return <p className="text-margin-ink italic">The backend isn&apos;t configured here.</p>;
  }
  if (owner === null) {
    return <p className="text-margin-ink">Checking the keys…</p>;
  }
  if (!owner) {
    return (
      <div className="border-2 border-ink bg-paper-shade p-4">
        <p className="text-ink-soft leading-[1.6] mb-3">
          {name ? `Signed in as ${name}, but uploading` : "Uploading"} interpretations is
          owner-only. If that&apos;s you, sign in with the owner account.
        </p>
        <button
          onClick={() => signInWithGoogle()}
          className="font-display tracking-[0.1em] text-[11px] bg-ink text-paper px-3 py-1.5 hover:bg-spot-red transition"
        >
          SIGN IN WITH GOOGLE
        </button>
      </div>
    );
  }
  return <UploadForm />;
}

function UploadForm() {
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
    <div className="border-2 border-ink bg-paper-shade p-4">
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
