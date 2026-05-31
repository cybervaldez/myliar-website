"use client";

// The decision log: every RESOLVED note across the wiki, newest first.
// applied = a suggestion that became canon; superseded = a note the canon
// already moved past. Client component — queries Supabase at runtime.

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  fetchChangelog,
  commentsConfigured,
  type Comment,
  type NoteStatus,
} from "../comments";

const STATUS_STYLE: Record<string, string> = {
  applied: "border-forest text-forest",
  superseded: "border-margin-ink text-margin-ink",
};

// Resolve a note anchor to the wiki page it belongs to (best-effort).
function anchorHref(anchor: string): string | null {
  const [kind, ...rest] = anchor.split(":");
  const id = rest.join(":");
  switch (kind) {
    case "character":
      return `/wiki/characters/${id}`;
    case "elseworld":
      return `/wiki/elseworlds/${id}`;
    case "mechanics":
      return "/wiki/mechanics";
    case "atlas":
      return "/wiki/atlas";
    case "arc":
      return id === "index" ? "/wiki/arc" : `/wiki/arc/${id.replace("day-", "")}`;
    default:
      return null; // app:feedback and unknown anchors have no wiki page
  }
}

function fmtDate(s: string | null): string {
  if (!s) return "";
  return new Date(s).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function ChangelogList() {
  const configured = commentsConfigured();
  const [notes, setNotes] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(configured);

  useEffect(() => {
    if (!configured) return;
    let alive = true;
    fetchChangelog().then((n) => {
      if (alive) {
        setNotes(n);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, [configured]);

  if (!configured) {
    return (
      <div className="border border-margin-ink/50 bg-paper p-4 text-[13px] text-margin-ink italic">
        The changelog comes online once community notes are wired up on this deploy.
      </div>
    );
  }
  if (loading) {
    return <div className="text-[13px] text-margin-ink italic">loading the decision log…</div>;
  }
  if (notes.length === 0) {
    return (
      <div className="text-[13px] text-margin-ink italic">
        No resolved changes yet. As notes get approved or superseded, they log here.
      </div>
    );
  }

  return (
    <ol className="list-none p-0 m-0 space-y-3">
      {notes.map((n) => {
        const href = anchorHref(n.anchor);
        const st: NoteStatus = n.note_status ?? "open";
        const struck = st === "superseded";
        return (
          <li key={n.id} className="border-[1.5px] border-ink bg-paper-shade p-4">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span
                className={`font-display tracking-[0.1em] text-[8.5px] px-1.5 py-0.5 border ${STATUS_STYLE[st] ?? "border-ink text-ink"}`}
              >
                {st.toUpperCase()}
              </span>
              {href ? (
                <Link href={href} className="font-display tracking-[0.1em] text-[11px] text-spot-red !border-b-0">
                  {n.anchor_label ?? n.anchor}
                </Link>
              ) : (
                <span className="font-display tracking-[0.1em] text-[11px] text-margin-ink">
                  {n.anchor_label ?? n.anchor}
                </span>
              )}
              <span className="font-body italic text-[10px] text-margin-ink ml-auto">
                {fmtDate(n.created_at)}
              </span>
            </div>
            <p
              className={`text-[13.5px] leading-[1.45] ${struck ? "text-margin-ink line-through decoration-margin-ink/60" : "text-ink"}`}
            >
              {n.body}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
