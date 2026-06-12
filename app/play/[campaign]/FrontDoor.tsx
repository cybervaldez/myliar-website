"use client";

// The Campaign FRONT DOOR (docs/design/front-door-interaction.md) — the pre-campaign
// screen. PREVIEW what's inside (the cast's ROLES revealed as the hook; deeper unlocks
// ???; NO "X/N" count) + the PREFERENCE GATE (who you play as · your name · how names
// show · the vibe), each with a no-spoiler "what this changes" note, hard-LOCKED into
// the run URL on START. IDENTITY REFRAME ("who do you want to play as?") + the
// ambiguous-NAME shortcut (a neutral name sidesteps the gender question) + an HONEST
// vibe (a quiet shape on the worlds you build, never the written story).

import { useState } from "react";
import Link from "next/link";
import LeadInBoard, { type LeadInData, type CastLite } from "./LeadInBoard";

type Taxonomy = {
  campaignType?: string; relationshipCategory?: string; romanceEnabled?: boolean;
  intensity?: string; tone?: string; tropes?: string[];
};
export type FrontDoorProps = {
  campaign: string; title: string; tagline: string; dayUnit: string;
  daysCount: number; firstDay: number; firstDayTitle?: string; seed: string;
  gift: string; whatYouGet: string[]; openingHook: string; taxonomy: Taxonomy;
  castTitles: string[]; castSampleName: string; // the cast ROLES (the hook) + a name for the display example
  castNames?: string[]; // cast + story-significant names — filters preset COLLISIONS; free-typed matches get the gentle note
  leadIn?: LeadInData | null; // the motif-driven Scene Board opening (convergent-origins.md)
  leadInCast?: CastLite[]; // cast id/name/titles — the Scene Board resolves the helper name + Day-1 title
  locked?: { id: string; vibe: string; td: string; nm: string; hf?: string } | null;
  resume?: string | null;
};

// A TEXT setting, not an identity declaration: the pronoun is rendered into the prose
// (subject + the verb agreement — "they go" vs "he goes"), shown live in a sample line.
type IdOpt = { key: string; label: string; subj: string; verb: string };
const ID_OPTS: IdOpt[] = [
  { key: "he", label: "He / him", subj: "he", verb: "goes" },
  { key: "she", label: "She / her", subj: "she", verb: "goes" },
  { key: "they", label: "They / them", subj: "they", verb: "go" },
  { key: "name", label: "Name only", subj: "", verb: "goes" },
];
// Deliberately gender-AMBIGUOUS — a neutral name lifts the gender-politics friction:
// the name never forces a read, so it + the pronouns are the player's to set freely.
const NAME_OPTS = ["Alex", "Sam", "Jordan", "Riley", "Quinn", "Sky", "Casey", "Avery"];
const TD_OPTS = [
  { key: "title", label: "Title", ex: (n: string, t: string) => t },
  { key: "both", label: "Name + Title", ex: (n: string, t: string) => `${n}, ${t}` },
  { key: "name", label: "Just the name", ex: (n: string, t: string) => n },
];
// The 6 real cultural-vibe bands (lib/player_prefs.dart) — a SILENT shape on
// live-generated content, never the authored story. Each shows what it actually tints.
const VIBE_OPTS: { key: string; label: string; note: string; sample: string }[] = [
  { key: "surprise-me", label: "Surprise me", note: "the game picks the shape", sample: "rolled fresh for each world you build" },
  { key: "golden-age-fantasy", label: "Lantern & quest", note: "old iron, swords-and-lanterns", sample: "oak benches, a lantern guttering, a quest-board by the door" },
  { key: "80s-fantasy-and-cyber", label: "Neon & steel", note: "synth-quest, chrome", sample: "a neon sign buzzing over the bar, chrome stools, a deal in the back" },
  { key: "90s-anime-and-fantasy", label: "Main-character energy", note: "bold lines, electric", sample: "a rival nursing a drink in the corner booth, the air crackling" },
  { key: "isekai-and-party-rpg", label: "Party up", note: "level-and-loot, quests", sample: "an NPC with a (!) over their head, your party claiming a table" },
  { key: "cottagecore-and-cozy", label: "Cozy & warm", note: "low-stakes, slow", sample: "mismatched mugs, someone knitting by the fire, bread cooling on the sill" },
];

function Chip({ children }: { children: React.ReactNode }) {
  return <span style={{ fontFamily: "var(--theme-body)", fontSize: 11, letterSpacing: ".04em", textTransform: "uppercase", border: "1.5px solid var(--ink-soft)", padding: "2px 8px", color: "var(--ink-soft)" }}>{children}</span>;
}
function Mystery({ label }: { label: string }) {
  return (
    <div style={{ border: "2px dashed var(--ink-soft)", padding: "10px 9px", textAlign: "center", color: "var(--margin-ink)", background: "var(--paper-shade)", minWidth: 78 }}>
      <div style={{ fontFamily: "var(--theme-display)", fontSize: 18, lineHeight: 1 }}>???</div>
      <div style={{ fontSize: 10, marginTop: 4, fontStyle: "italic" }}>{label}</div>
    </div>
  );
}
function Role({ title }: { title: string }) {
  return (
    <div style={{ border: "2px solid var(--ink-soft)", padding: "10px 11px", textAlign: "center", background: "var(--paper)", minWidth: 78 }}>
      <div style={{ fontFamily: "var(--theme-display)", fontSize: 13, lineHeight: 1.15, color: "var(--ink)" }}>{title}</div>
      <div style={{ fontSize: 10, marginTop: 4, fontStyle: "italic", color: "var(--margin-ink)" }}>name + story: ???</div>
    </div>
  );
}
function GateHead({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <>
      <h2 style={{ fontFamily: "var(--theme-display)", fontSize: 14, letterSpacing: ".1em", color: "var(--margin-ink)", margin: "16px 0 4px" }}>{children}</h2>
      {sub && <p style={{ fontSize: 12, color: "var(--margin-ink)", margin: "0 0 10px", fontStyle: "italic" }}>{sub}</p>}
    </>
  );
}
function pillStyle(on: boolean, sm = false): React.CSSProperties {
  return {
    fontFamily: "var(--theme-body)", fontSize: sm ? 13 : 14, padding: sm ? "6px 12px" : "7px 13px", cursor: "pointer",
    border: "2px solid var(--ink-soft)", background: on ? "var(--forest)" : "transparent", color: on ? "var(--paper)" : "var(--ink)",
  };
}

export default function FrontDoor(props: FrontDoorProps) {
  const { campaign, title, tagline, dayUnit, daysCount, firstDay, firstDayTitle, seed, gift, whatYouGet, openingHook, taxonomy, castTitles, castSampleName, castNames, leadIn, leadInCast, locked, resume } = props;
  const romance = !!taxonomy.romanceEnabled;
  // Don't offer a name that collides with a CAST member (e.g. "Sam" in Life Ops → "Sam told Sam").
  const nameOpts = NAME_OPTS.filter((n) => !(castNames ?? []).some((c) => c.toLowerCase() === n.toLowerCase()));
  const [id, setId] = useState(locked?.id ?? "");
  const [vibe, setVibe] = useState(locked?.vibe ?? "");
  const [td, setTd] = useState(locked?.td ?? "");
  const [hf, setHf] = useState(locked?.hf ?? ""); // the "what are you here for?" flag id (the gate-intake beat)
  const [nm, setNm] = useState(locked?.nm ?? "");
  const sel = ID_OPTS.find((o) => o.key === id);
  const selVibe = VIBE_OPTS.find((v) => v.key === vibe);
  const exName = castSampleName || "Sloane"; // the CAST example for "how names show" (a coach + their title)
  const exTitle = castTitles[0] || "the Coach";
  const sampleName = nm || "Alex"; // the PLAYER name for the pronoun prose sample
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const speaker = cap(castTitles[0] || "your coach");
  const curOpt = sel ?? ID_OPTS[3]; // default to name-only for the live preview
  // A NAME is not a drop-in for a pronoun: "There goes Sky" flips word order vs "There he goes",
  // and a name takes a SINGULAR verb. See docs/design/research-identity-templating.md §grammar.
  const refClause = curOpt.key === "name" ? `There goes ${sampleName}` : `There ${curOpt.subj} ${curOpt.verb}`;
  const startHref = `/play/${campaign}/${firstDay}?seed=${seed}`
    + (id ? `&id=${id}` : "") + (nm ? `&nm=${encodeURIComponent(nm)}` : "") + (td ? `&td=${td}` : "") + (vibe ? `&vibe=${vibe}` : "") + (hf ? `&hf=${hf}` : "");
  const unit = dayUnit.toLowerCase();

  // ── THE FRONT DOOR IS THE SKETCH (frontdoor-ux-variations.html, owner-locked): when a
  // lead-in exists, the board IS the whole door — every pref collected IN-GAME (name = the
  // badge · pronoun = the identity beat · names-show = the titleAsk beat · path = who you
  // walk toward). The cover/preview marketing lives on the /play browser cards now (§2:
  // "opening-first; the marketing is gone"); the vibe seed moves off the front door
  // (a quiet optional setting — the ?vibe run param stays supported). ──
  if (!locked && leadIn) {
    return (
      <section style={{ fontFamily: "var(--theme-body)" }}>
        {/* the prelude is the hook INTO this door (prelude-stories.md §PLAYER-FACING) */}
        <p style={{ fontSize: 12, margin: "0 0 10px", textAlign: "right" }}>
          <Link href={`/play/${campaign}/prelude`} style={{ color: "var(--margin-ink)", fontStyle: "italic" }}>📖 how it begins — the night before you ›</Link>
        </p>
        <LeadInBoard
          leadIn={leadIn} cast={leadInCast ?? []} startHref={startHref}
          reservedNames={castNames ?? []}
          dayUnit={dayUnit} firstDayTitle={firstDayTitle}
          pron={id || null} onPron={(k) => setId(k)}
          nm={nm} onNm={(v) => setNm(v)}
          onTd={(k) => setTd(k)}
          onHf={(flag) => setHf(flag)}
        />
      </section>
    );
  }

  return (
    <section style={{ fontFamily: "var(--theme-body)" }}>
      {/* COVER — the promise (the no-lead-in fallback + the locked/resume surface) */}
      <div style={{ border: "2px solid var(--ink)", padding: "18px 18px 16px", background: "var(--paper)", marginBottom: 18 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
          {taxonomy.campaignType && <Chip>{taxonomy.campaignType}</Chip>}
          {romance && taxonomy.relationshipCategory && <Chip>{taxonomy.relationshipCategory}</Chip>}
          {taxonomy.intensity && <Chip>{taxonomy.intensity}</Chip>}
          {taxonomy.tone && <Chip>{taxonomy.tone}</Chip>}
        </div>
        <h1 style={{ fontFamily: "var(--theme-display)", fontSize: 30, margin: "0 0 2px" }}>{title}</h1>
        <p style={{ color: "var(--spot-red)", fontSize: 13, margin: "0 0 10px" }}>{tagline}</p>
        {openingHook && <p style={{ lineHeight: 1.6, fontSize: 15, margin: "0 0 12px" }}>{openingHook}</p>}
        {whatYouGet && whatYouGet.length > 0 ? (
          <div>
            <div style={{ fontFamily: "var(--theme-display)", fontSize: 11, letterSpacing: ".14em", color: "var(--spot-red)", marginBottom: 6 }}>WHAT YOU&apos;LL GET</div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {whatYouGet.map((b, i) => (
                <li key={i} style={{ display: "flex", gap: 9, alignItems: "flex-start", marginBottom: 7, lineHeight: 1.45, fontSize: 14 }}>
                  <span style={{ color: "var(--spot-red)", flex: "none", fontWeight: 700 }}>▸</span><span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : gift ? <p style={{ lineHeight: 1.5, fontSize: 13, color: "var(--ink-soft)", margin: 0 }}><b>What you get:</b> {gift}</p> : null}
      </div>

      {/* PREVIEW — the cast ROLES revealed (the hook); deeper unlocks ???; NO count (anti-FOMO) */}
      <h2 style={{ fontFamily: "var(--theme-display)", fontSize: 14, letterSpacing: ".1em", color: "var(--margin-ink)", margin: "0 0 8px" }}>WHAT WAITS INSIDE</h2>
      <p style={{ fontSize: 12, color: "var(--margin-ink)", margin: "0 0 10px", fontStyle: "italic" }}>
        A {daysCount}-{unit} story. You know the ROLES going in; everything else fills in as you play — the horizon, not a checklist.
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 22 }}>
        {castTitles.map((t, i) => <Role key={i} title={t} />)}
        <Mystery label="a title earned" />
        <Mystery label="a keepsake" />
        {romance && <Mystery label="where it goes" />}
        <Mystery label="more ahead" />
      </div>

      {locked ? (
        <div style={{ border: "2px solid var(--ink-soft)", padding: "14px 16px", background: "var(--paper-shade)", marginBottom: 18 }}>
          <div style={{ fontSize: 11, letterSpacing: ".12em", color: "var(--spot-red)", marginBottom: 6 }}>LOCKED FOR THIS RUN</div>
          <p style={{ margin: 0, fontSize: 14 }}>
            {locked.nm ? <><b>{locked.nm}</b> · </> : null}
            {ID_OPTS.find((o) => o.key === locked.id)?.label ?? "name-only"}
            {locked.td ? <> · names shown as <b>{TD_OPTS.find((t) => t.key === locked.td)?.label}</b></> : null}
            {locked.vibe ? <> · vibe <b>{VIBE_OPTS.find((v) => v.key === locked.vibe)?.label ?? locked.vibe}</b></> : null}{locked.hf ? <> · here for <b>&ldquo;{leadIn?.hereForOptions?.find((o) => o.flag === locked.hf)?.line ?? "your answer at the gate"}&rdquo;</b></> : null}.
          </p>
          <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--ink-soft)" }}>Preferences are fixed once a run starts (so the mechanics don’t break). Reset to change them.</p>
        </div>
      ) : (
        <>
          <GateHead sub="Names that fit anyone — your name never picks your gender for you, so it stays yours to set.">YOUR NAME</GateHead>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            {nameOpts.map((n) => <button key={n} onClick={() => setNm(n)} style={pillStyle(nm === n, true)}>{n}</button>)}
            <input value={nameOpts.includes(nm) ? "" : nm} onChange={(e) => setNm(e.target.value)} placeholder="or your own…" maxLength={20}
              style={{ fontFamily: "var(--theme-body)", fontSize: 13, padding: "6px 10px", border: "2px solid var(--ink-soft)", background: "var(--paper)", color: "var(--ink)", width: 120 }} />
          </div>
          {nm && <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--ink-soft)", fontStyle: "italic" }}>↳ They greet you by it: “Good to see you, {nm}.”</p>}

          <GateHead sub="Sets how the cast and the narration speak of you — pick a pronoun and the sample below changes to match. Prefer name-only? That works too.">HOW THE STORY REFERS TO YOU</GateHead>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {ID_OPTS.map((o) => <button key={o.key} onClick={() => setId(o.key)} style={pillStyle(id === o.key)}>{o.label}</button>)}
          </div>
          <div style={{ margin: "10px 0 0", border: "2px solid var(--ink-soft)", background: "var(--paper-shade)", padding: "10px 12px" }}>
            <div style={{ fontFamily: "var(--theme-display)", fontSize: 10, letterSpacing: ".14em", color: "var(--spot-red)", marginBottom: 5 }}>SAME SCENE — YOUR WORDS{!id ? " · default: name-only" : ""}</div>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>{speaker}, watching you go: <i>“{refClause} — didn’t even wait for me.”</i></p>
            <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--ink-soft)" }}>The cast uses it consistently — dialogue and narration alike. (They also earn their own nicknames for you as you play — yours to discover.)</p>
            {romance && <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--ink-soft)" }}>Romance, if you steer toward it, is set in the story — never by a label here.</p>}
          </div>

          <GateHead sub="How the cast’s names + titles read to you — they all earn evocative titles.">HOW SHOULD NAMES SHOW?</GateHead>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            {TD_OPTS.map((t) => <button key={t.key} onClick={() => setTd(t.key)} style={pillStyle(td === t.key, true)}>{t.label}</button>)}
            {td && <span style={{ fontSize: 13, color: "var(--ink-soft)", fontStyle: "italic" }}>↳ e.g. “{TD_OPTS.find((t) => t.key === td)!.ex(exName, exTitle)}”</span>}
          </div>

          <GateHead sub="A quiet shape on the worlds you BUILD + the game’s live-written atmosphere — never the written campaign, never the coaches’ locked voices, and the game never names it. Optional.">THE WORLD’S FLAVOR</GateHead>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {VIBE_OPTS.map((v) => <button key={v.key} onClick={() => setVibe(v.key)} style={pillStyle(vibe === v.key, true)}>{v.label}</button>)}
          </div>
          {selVibe && <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--ink-soft)" }}>↳ {selVibe.note}. A built world’s tavern might read: <i>“{selVibe.sample}.”</i></p>}
        </>
      )}

      {/* COMMIT — three cases: RESUME/RESET (returning) · the lead-in Scene Board (the diegetic
          opening IS the commit: lean in, pick a monologue → BEGIN) · or the plain START. */}
      {locked && resume ? (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", borderTop: "2px solid var(--ink-soft)", paddingTop: 16, marginTop: 22 }}>
          <Link href={`/play/${campaign}/${resume}`} style={{ fontFamily: "var(--theme-display)", fontSize: 16, padding: "10px 20px", background: "var(--forest)", color: "var(--paper)", textDecoration: "none", border: "2px solid var(--ink)" }}>▶ RESUME</Link>
          <Link href={`/play/${campaign}`} style={{ fontFamily: "var(--theme-body)", fontSize: 14, padding: "9px 16px", color: "var(--spot-red)", textDecoration: "none", border: "2px solid var(--ink-soft)" }}>↺ RESET (new run, edit prefs)</Link>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", borderTop: "2px solid var(--ink-soft)", paddingTop: 16, marginTop: 22 }}>
          <Link href={startHref} style={{ fontFamily: "var(--theme-display)", fontSize: 16, padding: "10px 22px", background: "var(--forest)", color: "var(--paper)", textDecoration: "none", border: "2px solid var(--ink)" }}>▶ START — lock it in</Link>
          <span style={{ fontSize: 12, color: "var(--margin-ink)", fontStyle: "italic" }}>{id || nm || td || vibe ? "your picks lock for this run; Home returns here, Reset starts over." : "or just start — name-only, neutral."}</span>
        </div>
      )}
    </section>
  );
}
