"use client";

// Anchored notes thread for a wiki entity. Shows existing non-declined
// notes (with kind + status + any /writers-room reply) and a low-friction
// submission form. Anonymous. Client component — reads/writes Supabase at
// runtime. Degrades to a quiet "coming soon" card when unconfigured, so
// every page can include it unconditionally.

import { useEffect, useState } from "react";
import {
  fetchNotes,
  insertNote,
  notesConfigured,
  NOTE_KINDS,
  type Note,
  type NoteKind,
  type NoteStatus,
} from "../notes";

const STATUS_STYLE: Record<NoteStatus, string> = {
  open: "border-margin-ink text-margin-ink",
  applied: "border-forest text-forest",
  declined: "border-spot-red text-spot-red",
  discuss: "border-ink text-ink",
};
const STATUS_LABEL: Record<NoteStatus, string> = {
  open: "OPEN",
  applied: "APPLIED",
  declined: "DECLINED",
  discuss: "DISCUSSING",
};
const KIND_LABEL: Record<NoteKind, string> = {
  question: "QUESTION",
  disagree: "DISAGREE",
  suggest: "SUGGEST",
  praise: "PRAISE",
};

export function NotesThread({
  anchor,
  anchorLabel,
}: {
  anchor: string;
  anchorLabel: string;
}) {
  const configured = notesConfigured();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(configured);
  const [kind, setKind] = useState<NoteKind>("question");
  const [body, setBody] = useState("");
  const [author, setAuthor] = useState("");
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!configured) return;
    let alive = true;
    fetchNotes(anchor).then((n) => {
      if (alive) {
        setNotes(n);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, [anchor, configured]);

  async function submit() {
    if (sending) return;
    setSending(true);
    setMsg(null);
    const res = await insertNote({ anchor, anchorLabel, kind, body, author });
    setSending(false);
    if (res.ok) {
      setBody("");
      setMsg("Saved. A reviewer will read it — thanks.");
      const refreshed = await fetchNotes(anchor);
      setNotes(refreshed);
    } else {
      setMsg(res.error ?? "Couldn't save.");
    }
  }

  return (
    <div className="mt-12 border-t-2 border-ink pt-6">
      <div className="font-display tracking-[0.16em] text-[12px] text-spot-red mb-1">
        ▸ COMMUNITY NOTES
      </div>
      <p className="text-[13px] text-margin-ink italic mb-4 leading-[1.5]">
        Spot something off, disagree with a call, or have a better idea? Leave a
        note on <span className="not-italic font-display tracking-[0.08em] text-[11px]">{anchorLabel}</span>.
        These are <strong>suggestions</strong> — the writers&apos; room reads
        them and applies or replies. Not the final word.
      </p>

      {!configured ? (
        <div className="border border-margin-ink/50 bg-paper p-4 text-[13px] text-margin-ink italic">
          Community notes are coming soon — the backend isn&apos;t wired up on
          this deploy yet.
        </div>
      ) : (
        <>
          {/* Existing notes */}
          {loading ? (
            <div className="text-[13px] text-margin-ink italic">loading notes…</div>
          ) : notes.length === 0 ? (
            <div className="text-[13px] text-margin-ink italic mb-4">
              No notes here yet. Be the first.
            </div>
          ) : (
            <div className="space-y-2 mb-5">
              {notes.map((n) => (
                <div key={n.id} className="border-[1.5px] border-ink bg-paper-shade p-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-display tracking-[0.12em] text-[9px] text-forest">
                      {KIND_LABEL[n.kind]}
                    </span>
                    <span
                      className={`font-display tracking-[0.1em] text-[8.5px] px-1.5 py-0.5 border ${STATUS_STYLE[n.status]}`}
                    >
                      {STATUS_LABEL[n.status]}
                    </span>
                    <span className="font-body italic text-[11px] text-margin-ink ml-auto">
                      {n.author}
                    </span>
                  </div>
                  <p className="text-[14px] text-ink mt-1.5 leading-[1.45] whitespace-pre-wrap">
                    {n.body}
                  </p>
                  {n.resolution && (
                    <div className="mt-2 border-l-2 border-forest pl-3">
                      <div className="font-display tracking-[0.12em] text-[8.5px] text-forest mb-0.5">
                        WRITERS&apos; ROOM
                      </div>
                      <p className="text-[13px] italic text-ink-soft leading-[1.45]">
                        {n.resolution}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Submission form */}
          <div className="border-2 border-ink bg-paper p-4">
            <div className="flex flex-wrap gap-1.5 mb-3">
              {NOTE_KINDS.map((k) => (
                <button
                  key={k.kind}
                  type="button"
                  onClick={() => setKind(k.kind)}
                  title={k.hint}
                  className={`font-display tracking-[0.1em] text-[10px] px-2.5 py-1 border-2 transition cursor-pointer ${
                    kind === k.kind
                      ? "border-ink bg-ink text-paper"
                      : "border-ink bg-paper text-ink hover:bg-paper-shade"
                  }`}
                >
                  {k.label.toUpperCase()}
                </button>
              ))}
            </div>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={NOTE_KINDS.find((k) => k.kind === kind)?.hint}
              rows={3}
              maxLength={4000}
              className="w-full border border-ink bg-paper-shade p-2.5 text-[14px] text-ink font-body resize-y focus:outline-none focus:border-forest"
            />
            <div className="flex items-center gap-2 mt-2">
              <input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="name (optional)"
                maxLength={60}
                className="flex-1 border border-ink bg-paper-shade px-2.5 py-1.5 text-[13px] text-ink font-body focus:outline-none focus:border-forest"
              />
              <button
                type="button"
                onClick={submit}
                disabled={sending || body.trim().length === 0}
                className="font-display tracking-[0.14em] text-[11px] text-white bg-forest px-4 py-2 border-2 border-ink hover:bg-[#1f3a1d] transition cursor-pointer disabled:opacity-50"
              >
                {sending ? "SAVING…" : "LEAVE NOTE"}
              </button>
            </div>
            {msg && (
              <p className="text-[12.5px] italic text-forest mt-2">{msg}</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
