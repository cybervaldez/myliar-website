"use client";

// The community FACES zone — approved fan art for a character/item, plus the
// submission form. Wired to the codex.ts fan-art client. The canonical card
// (name-only) lives in the page's infobox; this is the badged, attributed
// community gallery, walled below the canon line. companion-wiki §7-8.

import { useEffect, useState } from "react";
import {
  fetchFanArt,
  fanArtUrl,
  submitFanArt,
  flagContent,
  codexConfigured,
  type FanArt,
  type FanArtTechnique,
} from "../../lib/codex";

const TECH_LABEL: Record<FanArtTechnique, string> = {
  hand_drawn: "✎ hand-drawn",
  ai_assisted: "⛭ AI-assisted",
  mixed: "◐ mixed",
};

// The pivot (companion-wiki §7-8): images are now OWNER-curated interpretations
// (uploaded on the keeper's desk), not community submissions. The submission
// pipeline stays in the code but DORMANT — flip this to re-open public fan-art
// submissions. The approved gallery still renders regardless.
const COMMUNITY_SUBMISSIONS_OPEN = false;

export function FanArtSection({
  targetKind,
  targetId,
  mystery = false,
}: {
  targetKind: "character" | "item";
  targetId: string;
  mystery?: boolean;
}) {
  const [art, setArt] = useState<FanArt[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let live = true;
    fetchFanArt(targetKind, targetId).then((a) => {
      if (live) {
        setArt(a);
        setLoading(false);
      }
    });
    return () => {
      live = false;
    };
  }, [targetKind, targetId]);

  const configured = codexConfigured();
  const featured = art.find((a) => a.status === "featured");
  const rest = art.filter((a) => a !== featured);

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 border-t-2 border-ink pt-3 mt-8 mb-3">
        <h2 className="font-display tracking-[0.06em] text-[16px] text-ink !m-0">
          🎨 Fan art
        </h2>
        {configured && COMMUNITY_SUBMISSIONS_OPEN && (
          <button
            onClick={() => setOpen((v) => !v)}
            className="font-display tracking-[0.1em] text-[10px] text-spot-red border border-spot-red px-2 py-1 hover:bg-spot-red hover:text-paper transition"
          >
            {open ? "CLOSE" : mystery ? "+ DRAW THE SHADOW" : "+ DREW THIS? ADD IT"}
          </button>
        )}
      </div>

      {mystery && (
        <p className="text-[12.5px] text-margin-ink italic mb-3">
          This one&apos;s sealed — only silhouette / backlit pieces, drawn from the obscured
          Field Notes above. No reveals.
        </p>
      )}

      {open && configured && COMMUNITY_SUBMISSIONS_OPEN && (
        <SubmitForm
          targetKind={targetKind}
          targetId={targetId}
          mystery={mystery}
          onDone={() => setOpen(false)}
        />
      )}

      {loading ? (
        <p className="text-[13px] text-margin-ink">Looking through the gallery…</p>
      ) : art.length === 0 ? (
        <p className="text-[13px] text-margin-ink italic">
          No one&apos;s drawn {mystery ? "the shadow" : "them"} yet. The Field Notes are right
          there.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {featured && <Piece art={featured} owners />}
          {rest.map((a) => (
            <Piece key={a.id} art={a} />
          ))}
        </div>
      )}
    </div>
  );
}

function Piece({ art, owners = false }: { art: FanArt; owners?: boolean }) {
  const [flagged, setFlagged] = useState(false);
  return (
    <figure className={`m-0 border-2 ${owners ? "border-spot-red" : "border-ink"} bg-paper-shade`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={fanArtUrl(art.image_path)}
        alt={`Fan art by ${art.artist_name}`}
        className="block w-full aspect-square object-cover"
        loading="lazy"
      />
      <figcaption className="bg-ink text-paper font-display tracking-[0.04em] text-[9px] px-1.5 py-1 flex items-center justify-between gap-1">
        <span className="truncate">
          {owners && <span className="text-paper">★ </span>}
          {art.artist_url ? (
            <a href={art.artist_url} target="_blank" rel="noopener noreferrer" className="!text-paper underline">
              {art.artist_name}
            </a>
          ) : (
            art.artist_name
          )}
        </span>
        <span className="shrink-0 opacity-80">{TECH_LABEL[art.technique]}</span>
      </figcaption>
      <button
        onClick={async () => {
          if (await flagContent("fan_art", art.id)) setFlagged(true);
        }}
        className="w-full text-[9px] text-margin-ink hover:text-spot-red py-0.5"
        title="Report this"
      >
        {flagged ? "reported ✓" : "⚑ report"}
      </button>
    </figure>
  );
}

function SubmitForm({
  targetKind,
  targetId,
  mystery,
  onDone,
}: {
  targetKind: "character" | "item";
  targetId: string;
  mystery: boolean;
  onDone: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [artistName, setArtistName] = useState("");
  const [artistUrl, setArtistUrl] = useState("");
  const [technique, setTechnique] = useState<FanArtTechnique>("hand_drawn");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function submit() {
    if (!file) return setMsg("Pick an image first.");
    setBusy(true);
    setMsg(null);
    const r = await submitFanArt({
      targetKind,
      targetId,
      derivedFrom: mystery ? "mysteryAppearance" : "appearance",
      isSpoiler: mystery,
      file,
      artistName,
      artistUrl: artistUrl || undefined,
      technique,
      consent,
    });
    setBusy(false);
    if (r.ok) {
      setMsg("Submitted — it shows up here once it's approved.");
      setTimeout(onDone, 1800);
    } else {
      setMsg(r.error ?? "Something went wrong.");
    }
  }

  const label = "font-display tracking-[0.08em] text-[10px] text-margin-ink block mb-1";
  const input = "w-full border border-ink bg-paper px-2 py-1.5 text-[13px] mb-3";

  return (
    <div className="border-2 border-spot-red bg-paper p-4 mb-4">
      <p className="text-[12.5px] text-ink-soft leading-[1.5] mb-3">
        Drawn from the Field Notes? Add it. The owner reviews submissions before they go
        public + into the app, credited to you. You keep ownership — this is a display
        license for fan work. AI-assisted is welcome, just label it honestly.
      </p>
      <label className={label}>IMAGE (png/jpg/webp, ≤5MB)</label>
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className={input}
      />
      <label className={label}>CREDIT AS</label>
      <input
        value={artistName}
        onChange={(e) => setArtistName(e.target.value)}
        placeholder="your name / handle"
        maxLength={60}
        className={input}
      />
      <label className={label}>LINK (optional — portfolio / socials)</label>
      <input
        value={artistUrl}
        onChange={(e) => setArtistUrl(e.target.value)}
        placeholder="https://…"
        maxLength={200}
        className={input}
      />
      <label className={label}>TECHNIQUE</label>
      <select
        value={technique}
        onChange={(e) => setTechnique(e.target.value as FanArtTechnique)}
        className={input}
      >
        <option value="hand_drawn">Hand-drawn</option>
        <option value="ai_assisted">AI-assisted</option>
        <option value="mixed">Mixed</option>
      </select>
      <label className="flex items-start gap-2 text-[12px] text-ink-soft mb-3 cursor-pointer">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5" />
        <span>
          It&apos;s my work (or I have the right to share it), shown as fan art with credit. I
          can ask for it to be removed.
        </span>
      </label>
      <button
        onClick={submit}
        disabled={busy}
        className="font-display tracking-[0.1em] text-[11px] bg-ink text-paper px-3 py-1.5 hover:bg-spot-red transition disabled:opacity-50"
      >
        {busy ? "SENDING…" : "SUBMIT"}
      </button>
      {msg && <p className="text-[12px] text-spot-red mt-2">{msg}</p>}
    </div>
  );
}
