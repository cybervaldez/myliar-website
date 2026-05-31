"use client";

// Community discussion on a granular anchor (docs/design/community-discussion.md).
// Deliberately plain — "old-beta-Facebook": small text, thin rules, focus on the
// words, no chrome. Anyone can comment + like + reply (1 level). The owner (signed
// in) can post NOTES and resolve them. Comments stamped against a content hash so
// stale ones (the area changed since) get a quiet "earlier version" label.

import { useEffect, useState } from "react";
import {
  fetchThread,
  fetchMyVotes,
  postComment,
  like,
  unlike,
  setNoteStatus,
  hideComment,
  currentSnapshot,
  type Comment,
  type NoteStatus,
} from "../comments";
import { ensureSession, amIOwner } from "../supabaseClient";

const STATUS: NoteStatus[] = ["open", "applied", "declined", "discuss", "superseded"];

function when(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function DiscussionThread({
  anchor,
  anchorLabel,
  currentHash,
  defaultOpen = false,
}: {
  anchor: string;
  anchorLabel: string;
  currentHash?: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [loaded, setLoaded] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [votes, setVotes] = useState<Set<string>>(new Set());
  const [owner, setOwner] = useState(false);

  useEffect(() => {
    // Give every visitor a session (anon) so votes/attribution work, then learn
    // whether they're an owner (server still enforces).
    ensureSession().then(() => amIOwner().then(setOwner));
  }, []);

  async function refresh() {
    const [c, v] = await Promise.all([fetchThread(anchor), fetchMyVotes()]);
    setComments(c);
    setVotes(v);
    setLoaded(true);
  }

  useEffect(() => {
    if (open && !loaded) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const tops = comments.filter((c) => !c.parent_id);
  const repliesOf = (id: string) => comments.filter((c) => c.parent_id === id);
  const totalLikes = comments.reduce((s, c) => s + c.score, 0);

  async function toggleLike(c: Comment) {
    const liked = votes.has(c.id);
    // optimistic
    setVotes((s) => {
      const n = new Set(s);
      if (liked) n.delete(c.id);
      else n.add(c.id);
      return n;
    });
    setComments((cs) => cs.map((x) => (x.id === c.id ? { ...x, score: x.score + (liked ? -1 : 1) } : x)));
    const ok = liked ? await unlike(c.id) : await like(c.id);
    if (!ok) refresh(); // reconcile on failure
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="font-display tracking-[0.12em] text-[10px] text-margin-ink hover:text-ink cursor-pointer"
      >
        💬 {loaded ? comments.length : ""} DISCUSS{totalLikes > 0 ? ` · ▲ ${totalLikes}` : ""} {open ? "▾" : "▸"}
      </button>

      {open && (
        <div className="mt-2 border-l border-margin-ink/40 pl-3">
          {!loaded ? (
            <div className="text-[12px] text-margin-ink italic">loading…</div>
          ) : (
            <>
              {tops.length === 0 && (
                <div className="text-[12px] text-margin-ink italic mb-2">No comments yet.</div>
              )}
              {tops.map((c) => (
                <CommentRow
                  key={c.id}
                  c={c}
                  replies={repliesOf(c.id)}
                  votes={votes}
                  owner={owner}
                  currentHash={currentHash}
                  onLike={toggleLike}
                  anchor={anchor}
                  anchorLabel={anchorLabel}
                  onChange={refresh}
                />
              ))}
              <Composer anchor={anchor} anchorLabel={anchorLabel} currentHash={currentHash} owner={owner} onPosted={refresh} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

function CommentRow({
  c,
  replies,
  votes,
  owner,
  currentHash,
  onLike,
  anchor,
  anchorLabel,
  onChange,
}: {
  c: Comment;
  replies: Comment[];
  votes: Set<string>;
  owner: boolean;
  currentHash?: string;
  onLike: (c: Comment) => void;
  anchor: string;
  anchorLabel: string;
  onChange: () => void;
}) {
  const [replying, setReplying] = useState(false);
  const stale = currentHash && c.content_hash && c.content_hash !== currentHash;

  return (
    <div className="mb-2.5">
      <div className="text-[13px] text-ink leading-[1.45] whitespace-pre-wrap">
        {c.is_note && (
          <span className="font-display tracking-[0.1em] text-[8.5px] text-spot-red border border-spot-red px-1 py-0.5 mr-1.5 align-middle">
            NOTE{c.note_status ? ` · ${c.note_status.toUpperCase()}` : ""}
          </span>
        )}
        {c.body}
      </div>
      <div className="flex items-center gap-2.5 mt-0.5 text-[10.5px] text-margin-ink">
        <span className="font-display tracking-[0.06em]">{c.author_role === "owner" ? "★ owner" : c.author}</span>
        <span>{when(c.created_at)}</span>
        <button
          type="button"
          onClick={() => onLike(c)}
          className={`cursor-pointer hover:text-ink ${votes.has(c.id) ? "text-spot-red" : ""}`}
        >
          ▲ {c.score}
        </button>
        <button type="button" onClick={() => setReplying((r) => !r)} className="cursor-pointer hover:text-ink">
          reply
        </button>
        {stale && (
          <span title={`Commented on ${c.data_run} · ${c.data_version}; this line has changed since.`}>
            ↺ earlier version
          </span>
        )}
        {owner && <OwnerControls c={c} onChange={onChange} />}
      </div>

      {replies.length > 0 && (
        <div className="ml-4 mt-1.5 border-l border-margin-ink/30 pl-3">
          {replies.map((r) => (
            <CommentRow
              key={r.id}
              c={r}
              replies={[]}
              votes={votes}
              owner={owner}
              currentHash={currentHash}
              onLike={onLike}
              anchor={anchor}
              anchorLabel={anchorLabel}
              onChange={onChange}
            />
          ))}
        </div>
      )}

      {replying && (
        <div className="ml-4 mt-1.5">
          <Composer
            anchor={anchor}
            anchorLabel={anchorLabel}
            currentHash={currentHash}
            owner={owner}
            parentId={c.id}
            onPosted={() => {
              setReplying(false);
              onChange();
            }}
          />
        </div>
      )}
    </div>
  );
}

function OwnerControls({ c, onChange }: { c: Comment; onChange: () => void }) {
  return (
    <span className="flex items-center gap-1.5">
      <select
        defaultValue={c.note_status ?? "open"}
        onChange={async (e) => {
          await setNoteStatus(c.id, e.target.value as NoteStatus);
          onChange();
        }}
        className="bg-paper border border-margin-ink text-[10px] text-ink"
        title="set note status (owner)"
      >
        {STATUS.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <button
        type="button"
        onClick={async () => {
          await hideComment(c.id);
          onChange();
        }}
        className="cursor-pointer hover:text-spot-red"
        title="hide (owner)"
      >
        hide
      </button>
    </span>
  );
}

function Composer({
  anchor,
  anchorLabel,
  currentHash,
  owner,
  parentId,
  onPosted,
}: {
  anchor: string;
  anchorLabel: string;
  currentHash?: string;
  owner: boolean;
  parentId?: string;
  onPosted: () => void;
}) {
  const [body, setBody] = useState("");
  const [author, setAuthor] = useState("");
  const [asOwner, setAsOwner] = useState(owner);
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function send() {
    if (sending || !body.trim()) return;
    setSending(true);
    setErr(null);
    const res = await postComment({ anchor, anchorLabel, body, author, parentId, contentHash: currentHash, asOwner });
    setSending(false);
    if (res.ok) {
      setBody("");
      onPosted();
    } else {
      setErr(res.error ?? "Couldn't post.");
    }
  }

  return (
    <div className="mt-1.5">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={parentId ? "reply…" : "add to the discussion…"
        }
        rows={2}
        maxLength={4000}
        className="w-full border border-margin-ink/60 bg-paper p-2 text-[13px] text-ink font-body resize-y focus:outline-none focus:border-forest"
      />
      <div className="flex items-center gap-2 mt-1">
        {!asOwner && (
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="name (optional)"
            maxLength={60}
            className="flex-1 border border-margin-ink/60 bg-paper px-2 py-1 text-[12px] text-ink font-body focus:outline-none focus:border-forest"
          />
        )}
        {owner && (
          <label className="text-[10.5px] text-spot-red flex items-center gap-1 cursor-pointer">
            <input type="checkbox" checked={asOwner} onChange={(e) => setAsOwner(e.target.checked)} />
            as note
          </label>
        )}
        <button
          type="button"
          onClick={send}
          disabled={sending || !body.trim()}
          className="font-display tracking-[0.1em] text-[10px] text-white bg-forest px-3 py-1.5 border border-ink hover:bg-[#1f3a1d] transition cursor-pointer disabled:opacity-50"
        >
          {sending ? "…" : "POST"}
        </button>
      </div>
      {err && <p className="text-[11px] italic text-spot-red mt-1">{err}</p>}
    </div>
  );
}
