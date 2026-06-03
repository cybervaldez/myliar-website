"use client";

// Community Elseworld gallery — player-generated worlds (from elseworld_public),
// each browseable + importable (show the share code) + discussable. Owner can
// feature/remove. Plain, text-first. docs/design/community-elseworld-gallery.md.

import { useEffect, useState } from "react";
import { fetchPublicWorlds, setWorldStatus, type PublicWorld } from "../../worlds";
import { ensureSession, amIOwner } from "../../supabaseClient";
import { codexConfigured, anchors, contentHash } from "../../../lib/codex";
import { DiscussionThread } from "../../_components/DiscussionThread";

function worldHash(w: PublicWorld): string {
  return contentHash(
    `${w.character_name}${w.character_persona}${w.intro_cold_open}${w.intro_first_voice}`,
  );
}

export function WorldGallery() {
  const configured = codexConfigured();
  const [worlds, setWorlds] = useState<PublicWorld[]>([]);
  const [loading, setLoading] = useState(configured);
  const [owner, setOwner] = useState(false);

  async function refresh() {
    const w = await fetchPublicWorlds();
    setWorlds(w);
    setLoading(false);
  }

  useEffect(() => {
    ensureSession().then(() => amIOwner().then(setOwner));
    if (configured) refresh();
    else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configured]);

  if (!configured) {
    return (
      <div className="border border-margin-ink/50 bg-paper p-4 text-[13px] text-margin-ink italic">
        The community gallery comes online once the backend is wired on this deploy.
      </div>
    );
  }
  if (loading) return <div className="text-[13px] text-margin-ink italic">loading worlds…</div>;
  if (worlds.length === 0) {
    return (
      <div className="text-[13px] text-margin-ink italic">
        No shared worlds yet. When players share an Elseworld from the app, it lands here.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {worlds.map((w) => (
        <WorldCard key={w.share_token} w={w} owner={owner} onChange={refresh} />
      ))}
    </div>
  );
}

function WorldCard({ w, owner, onChange }: { w: PublicWorld; owner: boolean; onChange: () => void }) {
  const [copied, setCopied] = useState(false);
  const featured = w.triage_status === "featured";

  async function copy() {
    try {
      await navigator.clipboard.writeText(w.share_token);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — the code is visible anyway */
    }
  }

  return (
    <div className={`border-2 ${featured ? "border-spot-red" : "border-ink"} bg-paper-shade p-4`}>
      <div className="flex items-center gap-2 flex-wrap mb-1">
        {featured && (
          <span className="font-display tracking-[0.1em] text-[9px] text-spot-red border border-spot-red px-1.5 py-0.5">
            ★ FEATURED
          </span>
        )}
        <span className="font-display tracking-[0.06em] text-[15px] text-ink">{w.character_name}</span>
        <span className="font-body text-[12px] text-margin-ink">
          {w.character_class} · {w.character_archetype}
        </span>
        <span className="font-display tracking-[0.1em] text-[9px] text-forest ml-auto">
          {w.vibe_band.replace(/-/g, " ").toUpperCase()}
        </span>
      </div>

      <p className="font-body text-[14px] text-ink leading-[1.5] mt-1">{w.intro_cold_open}</p>
      <p className="font-body italic text-[13px] text-ink-soft leading-[1.45] mt-1.5">
        “{w.intro_first_voice}”
      </p>

      <div className="flex flex-wrap gap-1.5 mt-2.5">
        {[w.choice_engage, w.choice_observe, w.choice_decline].map((c, i) => (
          <span key={i} className="font-display tracking-[0.04em] text-[10px] text-ink border border-margin-ink/60 px-2 py-1">
            {c}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-3 mt-3 text-[11px] text-margin-ink flex-wrap">
        <span title="imports">↓ {w.imports_count} imported</span>
        <span className="flex items-center gap-1.5">
          <span className="font-display tracking-[0.06em]">IMPORT CODE</span>
          <code className="font-mono text-[12px] text-ink bg-paper px-1.5 py-0.5 border border-margin-ink/60">
            {w.share_token}
          </code>
          <button type="button" onClick={copy} className="cursor-pointer underline hover:text-ink">
            {copied ? "copied" : "copy"}
          </button>
          <span className="italic">— paste in-app to meet them</span>
        </span>
        {owner && (
          <span className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={async () => { await setWorldStatus(w.share_token, featured ? "live" : "featured"); onChange(); }}
              className="cursor-pointer underline hover:text-spot-red"
            >
              {featured ? "unfeature" : "feature"}
            </button>
            <button
              type="button"
              onClick={async () => { await setWorldStatus(w.share_token, "removed"); onChange(); }}
              className="cursor-pointer underline hover:text-spot-red"
            >
              remove
            </button>
          </span>
        )}
      </div>

      <DiscussionThread
        anchor={anchors.elseworldShare(w.share_token)}
        anchorLabel={`Elseworld · ${w.character_name}`}
        currentHash={worldHash(w)}
      />
    </div>
  );
}
