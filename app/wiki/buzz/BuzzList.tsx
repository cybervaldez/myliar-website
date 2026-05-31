"use client";

// The buzz view — most-liked / most-discussed comments across the whole wiki,
// so you can see which line has heat (and whether that heat is current).
// Also holds the owner sign-in (magic link) — the one privileged account whose
// comments are notes. Plain, text-first.

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  fetchBuzz,
  commentsConfigured,
  captureOwnerSession,
  isOwner,
  signInOwner,
  signOutOwner,
  currentSnapshot,
  type Comment,
} from "../comments";

function anchorHref(anchor: string): string | null {
  const [kind, ...rest] = anchor.split(":");
  const id = rest.join(":");
  switch (kind) {
    case "character": return `/wiki/characters/${id}`;
    case "elseworld": return `/wiki/elseworlds/${id}`;
    case "mechanics": return "/wiki/mechanics";
    case "atlas": return "/wiki/atlas";
    case "arc": {
      const day = id.match(/^day-(\d+)/);
      return day ? `/wiki/arc/${day[1]}` : "/wiki/arc";
    }
    default: return null;
  }
}

export function BuzzList() {
  const configured = commentsConfigured();
  const [items, setItems] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(configured);

  useEffect(() => {
    captureOwnerSession();
    if (!configured) return;
    let alive = true;
    fetchBuzz().then((c) => {
      if (alive) {
        setItems(c);
        setLoading(false);
      }
    });
    return () => { alive = false; };
  }, [configured]);

  return (
    <>
      <OwnerBar />
      {!configured ? (
        <div className="border border-margin-ink/50 bg-paper p-4 text-[13px] text-margin-ink italic">
          The buzz view comes online once discussion is wired up on this deploy.
        </div>
      ) : loading ? (
        <div className="text-[13px] text-margin-ink italic">loading the buzz…</div>
      ) : items.length === 0 ? (
        <div className="text-[13px] text-margin-ink italic">
          No discussion yet. The most-liked comments will surface here.
        </div>
      ) : (
        <ol className="list-none p-0 m-0 space-y-2.5">
          {items.map((c) => {
            const href = anchorHref(c.anchor);
            const stale = c.data_version && c.data_version !== currentSnapshot.version;
            return (
              <li key={c.id} className="border-[1.5px] border-ink bg-paper-shade p-3">
                <div className="flex items-center gap-2.5 text-[10.5px] text-margin-ink mb-1">
                  <span className="font-display tracking-[0.08em] text-spot-red">▲ {c.score}</span>
                  {c.is_note && (
                    <span className="font-display tracking-[0.1em] text-[8.5px] text-spot-red border border-spot-red px-1">
                      NOTE{c.note_status ? ` · ${c.note_status.toUpperCase()}` : ""}
                    </span>
                  )}
                  {href ? (
                    <Link href={href} className="font-display tracking-[0.08em] text-[10.5px] text-forest">
                      {c.anchor_label ?? c.anchor}
                    </Link>
                  ) : (
                    <span className="font-display tracking-[0.08em]">{c.anchor_label ?? c.anchor}</span>
                  )}
                  <span className="ml-auto">{c.author_role === "owner" ? "★ owner" : c.author}</span>
                  {stale && <span title="commented on an earlier version">↺</span>}
                </div>
                <p className="text-[13.5px] text-ink leading-[1.45] whitespace-pre-wrap">{c.body}</p>
              </li>
            );
          })}
        </ol>
      )}
    </>
  );
}

function OwnerBar() {
  const [owner, setOwner] = useState(false);
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => { setOwner(isOwner()); }, []);

  return (
    <div className="border border-margin-ink/40 bg-paper p-2.5 mb-5 text-[11px] text-margin-ink flex items-center gap-2 flex-wrap">
      {owner ? (
        <>
          <span className="text-spot-red font-display tracking-[0.1em]">★ SIGNED IN AS OWNER</span>
          <button
            type="button"
            className="ml-auto cursor-pointer hover:text-ink underline"
            onClick={() => { signOutOwner(); setOwner(false); }}
          >
            sign out
          </button>
        </>
      ) : (
        <>
          <span className="font-display tracking-[0.1em]">OWNER</span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="owner email"
            className="border border-margin-ink/60 bg-paper-shade px-2 py-1 text-[12px] text-ink font-body focus:outline-none focus:border-forest"
          />
          <button
            type="button"
            className="cursor-pointer underline hover:text-ink"
            onClick={async () => {
              const r = await signInOwner(email);
              setMsg(r.ok ? "Magic link sent — open it on this device." : r.error ?? "Couldn't send.");
            }}
          >
            send magic link
          </button>
          {msg && <span className="italic">{msg}</span>}
        </>
      )}
    </div>
  );
}
