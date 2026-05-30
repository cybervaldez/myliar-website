// Triage workflow — reads OPEN community notes from Supabase, adjudicates
// each through the /writers-room lens against the real canon, writes a
// status + reply back, and DRAFTS the payload edit for human approval.
//
// IT NEVER COMMITS TO CANON. /writers-room + the human are final. The
// workflow produces verdicts, replies, and a digest of recommended
// applies with ready-to-paste diffs; you ratify before anything touches
// the run-005 payloads.
//
// RUN (after the table exists and there are notes):
//   - set env: SUPABASE_URL, SUPABASE_SERVICE_KEY  (service role — server
//     side only, NEVER the anon key, NEVER committed)
//   - Workflow({ scriptPath: "website/scripts/triage-notes.workflow.mjs" })
//
// The Workflow script sandbox has no network; all Supabase I/O happens
// inside agents (they have Bash + repo access). Agents read the framing
// doc + the anchored canon (e.g. the run-005 payload for an arc note) so
// the frame-check + RPG-motif blend gates apply.

export const meta = {
  name: "triage-notes",
  description: "Adjudicate community wiki notes via /writers-room; reply + draft edits for approval",
  phases: [
    { title: "Fetch", detail: "pull open notes from Supabase" },
    { title: "Adjudicate", detail: "one /writers-room verdict per note" },
    { title: "Write back", detail: "set status + reply in Supabase" },
    { title: "Digest", detail: "human-facing list of recommended applies" },
  ],
};

const NOTE_SCHEMA = {
  type: "object",
  properties: {
    notes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          anchor: { type: "string" },
          anchor_label: { type: "string" },
          kind: { type: "string" },
          body: { type: "string" },
          author: { type: "string" },
          data_run: { type: "string" },
          data_version: { type: "string" },
          staleSnapshot: { type: "boolean" },
        },
        required: ["id", "anchor", "kind", "body"],
      },
    },
  },
  required: ["notes"],
};

const VERDICT_SCHEMA = {
  type: "object",
  properties: {
    noteId: { type: "string" },
    verdict: { type: "string", enum: ["apply", "decline", "discuss"] },
    reply: { type: "string", description: "short reply to the contributor, in plain voice" },
    rationale: { type: "string", description: "why — cites the frame/blend gate or canon" },
    draftEdit: {
      type: "string",
      description: "if apply: the concrete payload change (file + field + before/after). empty otherwise.",
    },
  },
  required: ["noteId", "verdict", "reply", "rationale"],
};

// ── Phase 1: fetch open notes ────────────────────────────────────────
phase("Fetch");
const fetched = await agent(
  `Fetch all OPEN community notes from Supabase. Run this exact request with Bash:
     curl -s "$SUPABASE_URL/rest/v1/wiki_notes?status=eq.open&order=created_at.asc&select=id,anchor,anchor_label,kind,body,author,data_run,data_version" \\
       -H "apikey: $SUPABASE_SERVICE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_KEY"
   ALSO read the CURRENT data snapshot from website/app/lib/parity.generated.json (the
   .version.contentHash field). For each note, compare its data_version to the current
   contentHash: if they differ, the note was written against an OLDER snapshot and the
   canon may have changed since — note this in the staleSnapshot field so adjudication can
   verify the issue still applies. Return { notes: [...] } with each note carrying
   data_run, data_version, and staleSnapshot (boolean).
   If the env vars are unset or the request fails, return { notes: [] } and say so.`,
  { schema: NOTE_SCHEMA, label: "fetch:open-notes", phase: "Fetch" },
);

const notes = (fetched?.notes ?? []).filter(Boolean);
if (notes.length === 0) {
  log("No open notes to triage. Done.");
  return { triaged: 0, applies: [] };
}
log(`${notes.length} open note(s) to triage.`);

// ── Phases 2+3: adjudicate each, then write the result back ──────────
// Pipeline: each note is adjudicated, then its verdict is written back —
// no barrier, so note B writes back while note C is still being judged.
const results = await pipeline(
  notes,
  (n) =>
    agent(
      `You are the /writers-room adjudicating a community note on the canon. The note is a
       SUGGESTION; you are the final say. Read:
         - docs/design/rpg-framing.md (frame-check: banned words; RPG-motif blend gate)
         - the canon the note anchors to. The anchor is "${n.anchor}":
             character:<id>  -> lib/characters.dart or lib/sam.dart
             arc:day-<N>     -> the run-005 payload for that day (assets/payloads/run-005/)
             mechanics:page  -> lib/game_state.dart (REL), lib/payloads/daily_story.dart (rarities)
             elseworld:<band>-> lib/elseworld_vibes.dart
             atlas:courtyard -> assets/realm-maps/phone-realm.txt
       The note (${n.kind}) from ${n.author || "anon"} says:
         """${n.body}"""
       ${n.staleSnapshot ? `IMPORTANT: this note was written against an OLDER data snapshot
       (${n.data_run} · ${n.data_version}) than the current wiki. Verify the issue still
       exists in the CURRENT canon — if the content has already changed/been fixed, decline
       with a short note that it's been superseded.` : ""}
       Decide: apply (it improves the canon and passes frame + blend), decline (wrong / off-frame /
       breaks a gate — say which), or discuss (worth a human conversation, not auto-decidable).
       Write a short, kind reply to the contributor. If apply, draft the exact payload edit
       (file + field + before→after). Do NOT edit any files — only describe the edit.`,
      { schema: VERDICT_SCHEMA, label: `judge:${n.anchor}`, phase: "Adjudicate" },
    ),
  (verdict, n) => {
    if (!verdict) return null;
    // Write status + reply back. 'apply' stays as 'discuss' in Supabase
    // until a human ratifies — the workflow recommends, never finalizes
    // an apply. decline/discuss are written as-is.
    const statusToWrite = verdict.verdict === "decline" ? "declined" : "discuss";
    const reply = (verdict.reply || "").replace(/"/g, '\\"');
    return agent(
      `Write the triage result back to Supabase for note id ${n.id}. Run with Bash
       (json-escape the reply text):
         curl -s -X PATCH "$SUPABASE_URL/rest/v1/wiki_notes?id=eq.${n.id}" \\
           -H "apikey: $SUPABASE_SERVICE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \\
           -H "Content-Type: application/json" -H "Prefer: return=minimal" \\
           -d '{"status":"${statusToWrite}","resolution":"${reply}","resolved_at":"now()"}'
       Confirm the HTTP status. Return a one-line summary of what you wrote.`,
      { label: `writeback:${n.id}`, phase: "Write back" },
    ).then(() => ({ note: n, verdict }));
  },
);

// ── Phase 4: digest of recommended applies (for human ratification) ──
phase("Digest");
const applies = results
  .filter(Boolean)
  .filter((r) => r.verdict.verdict === "apply")
  .map((r) => ({
    anchor: r.note.anchor,
    label: r.note.anchor_label,
    note: r.note.body,
    reply: r.verdict.reply,
    draftEdit: r.verdict.draftEdit || "",
  }));

log(`Triaged ${results.filter(Boolean).length} note(s); ${applies.length} recommended for APPLY (await your ratification).`);

return {
  triaged: results.filter(Boolean).length,
  applies,
  note: "APPLY items are written to Supabase as 'discuss' and listed here with draft edits — ratify before touching the run-005 payloads. /writers-room is final.",
};
