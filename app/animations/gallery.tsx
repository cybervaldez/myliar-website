"use client";

import { VMLine, RedPenLine, StraightRead, VoiceRow, EmotionGallery, EmoLine } from "../lib/voice-motion";

// Animation sandbox — web prototypes of the game's motion. Tweak here (fast
// iteration), then translate the curve + duration to Flutter. Each card lists
// the spec so the port is mechanical. Uses the site theme tokens, so the
// theme picker re-skins these too.
//
// Organized by the MECHANIC / SCREEN the motion belongs to, so a given surface
// (bottom bar, narration, the post-action result) collects all its candidate
// treatments in one place.

import { createContext, useContext, useEffect, useState } from "react";

function prefersReduced(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Slug for a section anchor id — strips HTML entities + the ★NEW decoration.
function slugify(title: string): string {
  return (
    title
      .replace(/&[a-z]+;/g, " ")
      .replace(/★.*$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "section"
  );
}

// Jump-to-section nav — a floating button + panel with scroll-spy. Reads the
// rendered sections from the DOM (no manual registry to keep in sync).
function JumpNav() {
  const [open, setOpen] = useState(false);
  const [sections, setSections] = useState<{ id: string; label: string }[]>([]);
  const [active, setActive] = useState("");
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("section.adk-section[id]"));
    setSections(
      els.map((el) => ({
        id: el.id,
        label:
          (el.querySelector(".adk-sec-title")?.textContent ?? el.id)
            .replace(/\s*★.*$/, "")
            .trim() || el.id,
      })),
    );
    const obs = new IntersectionObserver(
      (entries) => {
        const vis = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive((vis[0].target as HTMLElement).id);
      },
      { rootMargin: "-12% 0px -75% 0px" },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
  if (sections.length === 0) return null;
  const activeLabel = sections.find((s) => s.id === active)?.label ?? "Jump to section";
  return (
    <>
      <button className="adk-jump-fab" onClick={() => setOpen((o) => !o)} aria-label="Jump to section">
        <span className="adk-jump-fab-i">{open ? "✕" : "☰"}</span>
        <span className="adk-jump-fab-l">{activeLabel}</span>
      </button>
      {open && (
        <>
          <div className="adk-jump-scrim" onClick={() => setOpen(false)} />
          <nav className="adk-jump-panel" aria-label="Sections">
            <div className="adk-jump-hd">JUMP TO SECTION · {sections.length}</div>
            {sections.map((s, i) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={`adk-jump-link${s.id === active ? " adk-jump-on" : ""}`}
                onClick={() => setOpen(false)}
              >
                <span className="adk-jump-n">{i + 1}</span>
                {s.label}
              </a>
            ))}
          </nav>
        </>
      )}
    </>
  );
}

function Demo({ title, spec, flutter, children, stack }: {
  title: string; spec: string; flutter: string; children: React.ReactNode; stack?: boolean;
}) {
  const [k, setK] = useState(0);
  return (
    <div className="adk-card">
      <div className="adk-head">
        <b>{title}</b>
        <button className="adk-replay" onClick={() => setK((x) => x + 1)}>▶ replay</button>
      </div>
      {/* stack = vertical, full-width, left-aligned (dialogue lines, not centered art) */}
      <div className={stack ? "adk-stage adk-stage-stack" : "adk-stage"} key={k}>{children}</div>
      <div className="adk-spec">{spec}</div>
      <div className="adk-flutter">Flutter: {flutter}</div>
    </div>
  );
}

function Section({ title, note, children, list }: {
  title: string; note?: string; children: React.ReactNode; list?: boolean;
}) {
  return (
    <section className="adk-section" id={slugify(title)}>
      <h2 className="adk-sec-title">{title}</h2>
      {note && <p className="adk-sec-note">{note}</p>}
      {/* list = full-width single column (the text-heavy dialogue-motion demos need
          the horizontal room); default = the auto-fill card grid. */}
      <div className={list ? "adk-list" : "adk-grid"}>{children}</div>
    </section>
  );
}

// ── Themed text reveals ────────────────────────────────────────────────────

// DOS: a terminal types the line out, character by character, cursor trailing.
export function Typewriter({ text }: { text: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (prefersReduced()) { setN(text.length); return; }
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setN(i);
      if (i >= text.length) clearInterval(id);
    }, 40);
    return () => clearInterval(id);
  }, [text]);
  return (
    <span className="adk-tw">
      {text.slice(0, n)}
      <span className="adk-cursor">▌</span>
    </span>
  );
}

// (The old Vibrant SAY/SHOUT/WHISPER reveal components were folded into the
// EMOTION layer — voice-motion.tsx EMO/EmoLine — during the 2026-06-13 dialogue-
// motion consolidation. Their richer successors live in the merged section's L3.)

// ── Character intro — name reveal + earned-title selection ──────────────────
// REVEALS the locked name + the clearest title, then the player picks how to be
// shown them (Title / Name+Title / Just Name). Names are LOCKED (no rename); the
// flavored titles are EARNED — so this same reveal is reused as the "new title
// unlocked" reward (TitleUnlock). Parchment register: staged fade-up, page still.
function CharacterIntro() {
  const [stage, setStage] = useState(0); // 0 → 1 name → 2 +title → 3 chips
  const [mode, setMode] = useState<"both" | "title" | "name">("both");
  useEffect(() => {
    if (prefersReduced()) { setStage(3); return; }
    const t = [
      setTimeout(() => setStage(1), 150),
      setTimeout(() => setStage(2), 750),
      setTimeout(() => setStage(3), 1350),
    ];
    return () => t.forEach(clearTimeout);
  }, []);
  const name = "HANA";
  const title = "the Drillmaster"; // the CLEAR intro title; flavored ones are earned later
  return (
    <div className="adk-introstage">
      <div className="adk-intro-card">
        {stage >= 1 && <div className="adk-intro-name adk-fadeup">{mode === "title" ? title : name}</div>}
        {stage >= 2 && mode === "both" && <div className="adk-intro-title adk-fadeup">{title}</div>}
      </div>
      <div className={`adk-intro-chips ${stage >= 3 ? "adk-fadeup" : "adk-hide"}`}>
        <span className="adk-chip-label">address as</span>
        {([["both", "Name + Title"], ["title", "Title"], ["name", "Just Name"]] as const).map(([m, l]) => (
          <button key={m} className={`adk-chip ${mode === m ? "on" : ""}`} onClick={() => setMode(m)}>{l}</button>
        ))}
      </div>
    </div>
  );
}

// The same reveal, reused as the EARNED-title reward (REL tier-up / achievement).
export function TitleUnlock() {
  const cc = useCampaignCopy();
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (prefersReduced()) { setShown(true); return; }
    const t = setTimeout(() => setShown(true), 300);
    return () => clearTimeout(t);
  }, []);
  if (!shown) return <div className="adk-introstage" />;
  return (
    <div className="adk-introstage">
      <div className="adk-stamp">
        <div className="adk-stamp-eye">★ NEW TITLE EARNED · INSIDE-ORBIT</div>
        <div className="adk-stamp-title">&ldquo;{cc.titleEarned}&rdquo;</div>
      </div>
      <div className="adk-intro-chips adk-fadeup" style={{ marginTop: 8 }}>
        <span className="adk-chip-label">switch to it, or stay on</span>
        <button className="adk-chip on">Just {cc.bpmCoach}</button>
      </div>
    </div>
  );
}

// The Unspoken payoff — the full-REL reward STACK revealed as a staged bundle
// (story-engine §2): intimate title + Passive + legendary keepsake + mutual mode.
// Bigger than a title pop. Shown for the Reader (title-only — still nameless).
function FullRelReward() {
  const cc = useCampaignCopy();
  const [s, setS] = useState(0);
  useEffect(() => {
    if (prefersReduced()) { setS(4); return; }
    const t = [
      setTimeout(() => setS(1), 200),
      setTimeout(() => setS(2), 1000),
      setTimeout(() => setS(3), 1700),
      setTimeout(() => setS(4), 2400),
    ];
    return () => t.forEach(clearTimeout);
  }, []);
  return (
    <div className="adk-rewardstage">
      <div className="adk-reward-eye">★ UNSPOKEN · FULL BOND</div>
      {s >= 1 && <div className="adk-reward-name adk-fadeup">{cc.relTitleFrom} &rarr; <i>{cc.relTitleTo}</i></div>}
      {s >= 2 && <div className="adk-reward-row adk-fadeup"><span className="adk-reward-tag">PASSIVE</span>{cc.relPassive}</div>}
      {s >= 3 && <div className="adk-reward-row adk-fadeup"><span className="adk-reward-tag legendary">LEGENDARY</span>keepsake: <i>{cc.relKeepsake}</i></div>}
      {s >= 4 && <div className="adk-reward-row adk-fadeup"><span className="adk-reward-tag mutual">MUTUAL</span>{cc.relMutual}</div>}
    </div>
  );
}

// ── The TRICHOTOMY CHOICE — the most universal mechanic (EVERY beat) ──────────
// 3 roles (logical / passive / chaotic) stagger in → pick (here: the chaotic, which
// carries the 🎲 crit / can escalate to the battle) → the others recede, the reaction
// reveals + a stat floats up. Copy is per-campaign (CampaignCtx) so the core beat
// re-skins like everything else. Reduced-motion → the resolved end-state, no stagger.
// Spec: docs/design/cross-campaign-mechanics.md §A.1.
export function ChoiceCard() {
  const cc = useCampaignCopy();
  const [s, setS] = useState(0); // 0 prompt · 1 options in · 2 chaotic picked · 3 reaction + float
  useEffect(() => {
    if (prefersReduced()) { setS(3); return; }
    const t = [
      setTimeout(() => setS(1), 250),
      setTimeout(() => setS(2), 1300),
      setTimeout(() => setS(3), 1950),
    ];
    return () => t.forEach(clearTimeout);
  }, []);
  const picked = s >= 2;
  const opt = (role: string, label: string, chaotic = false) => (
    <div className={`adk-choice-opt adk-choice-${role}${picked ? (chaotic ? " adk-choice-picked" : " adk-choice-dim") : ""}`}>
      <span className="adk-choice-role">{role}</span>
      <span className="adk-choice-label">{label}{chaotic && <span className="adk-choice-die"> 🎲</span>}</span>
    </div>
  );
  return (
    <div className="adk-choice">
      <div className="adk-choice-prompt">{cc.choicePrompt}</div>
      <div className={`adk-choice-opts ${s >= 1 ? "adk-choice-in" : "adk-hide"}`}>
        {opt("logical", cc.choiceLogical)}
        {opt("passive", cc.choicePassive)}
        {opt("chaotic", cc.choiceChaotic, true)}
      </div>
      {s >= 3 && (
        <div className="adk-choice-react adk-fadeup">
          {cc.choiceReaction}
          <span className="adk-choice-float">+2</span>
        </div>
      )}
    </div>
  );
}

// ── CG unlock — the earned event-still (the HEADLINE reveal) ────────────────
// 3-phase: anticipation (SHORT) → hit (theme dialect) → settle (the campaign's CG
// artifact eases in + HOLDS). The "mount" is the VIBRANT skin; the artifact is
// per-campaign (Campaign.cgMount: mount | mount | plate). This
// is a DETERMINISTIC, earned reward — NOT a gacha pull: short anticipation, a
// SINGLE flash, no "pull again". Reduced-motion → instant, no flash (a11y).
// Spec: docs/design/animation-delights.md.
export function CGReveal({ dialect, forceReduced = false }: {
  dialect: "vibrant" | "parchment" | "dos"; forceReduced?: boolean;
}) {
  const reduced = forceReduced || prefersReduced();
  const cc = useCampaignCopy();
  // Title in the active campaign's motif voice; DOS dialect renders it INSTANT +
  // uppercase. Prose + caption also come from the active campaign.
  const title = dialect === "dos" ? cc.cgTitle.toUpperCase() : cc.cgTitle;
  return (
    <div className={`adk-cg adk-cg-${dialect}${reduced ? " adk-cg-reduced" : ""}`}>
      {!reduced && <div className="adk-cg-dim" />}
      {!reduced && <div className="adk-cg-hit" />}
      <div className="adk-cg-mount">
        {/* TEXT-FIRST: the "art" slot is the moment in PROSE (the words are the picture),
            not a figure-blob photo. Real art is greybox/TBD; the prose carries it. */}
        <div className="adk-cg-scene">
          <div className="adk-cg-prose">{cc.cgProse}</div>
          <span className="adk-cg-arttag">CG · the words are the picture · art TBD</span>
        </div>
        <div className="adk-cg-meta">
          <div className="adk-cg-title">{title}</div>
          <div className="adk-cg-cap">{cc.cgCaption}</div>
        </div>
      </div>
    </div>
  );
}

// ── The VACATED FRAME — the RECESSION grammar (graduation) ───────────────────
// The third motion category: gentle SUBTRACTION, not additive juice. At a coach's
// graduation their CG transforms — the coach LIFTS to opacity 0 (easeIN, reluctant,
// no overshoot) WHILE the space WARMS into the absence (offset, easeOUT) so it reads
// "kept", not "abandoned". Mobile legibility (Gemini): warmth = light-bloom + a faint
// dust texture, NOT colour alone, + a whisper-tier diegetic sound carries it. Reduced-
// motion = end-state + "graduated · peer", NEVER a blank cut. NEVER a reward grammar
// (no chime/+crit — recession, not fanfare). Spec: animation-delights.md "RECESSION".
export function VacatedFrame({ dialect, forceReduced = false }: {
  dialect: "vibrant" | "parchment" | "dos"; forceReduced?: boolean;
}) {
  const reduced = forceReduced || prefersReduced();
  const cc = useCampaignCopy();
  // TEXT-FIRST (the words ARE the picture): the coach's LINE recedes (easeIn) and the
  // kept-space line + a warm glow remain (offset, easeOut). NO figure-blobs faking a photo.
  // Copy is per-campaign (Life Ops = Hana's bench; the Corner = the fighter's corner +
  // the "Inactive — Graduated" contact; DOS = the resident process exiting clean).
  return (
    <div className={`adk-vf adk-vf-${dialect}${reduced ? " adk-vf-reduced" : ""}`}>
      <div className="adk-vf-frame">
        <span className="adk-vf-warm" />
        <div className="adk-vf-coachline">{cc.vfCoachLine}</div>
        <div className="adk-vf-keptline">{cc.vfKeptLine}</div>
        <span className="adk-vf-tag">{reduced ? cc.vfReducedTag : cc.vfTag}</span>
      </div>
      <div className="adk-vf-cap">{cc.vfCaption}</div>
      {!reduced && <div className="adk-vf-audio">{cc.vfAudio}</div>}
    </div>
  );
}

// ── The LIVING MAP — arrival (accent) + Spatial Decay + Dynamic Legend ───────
// The ASCII map is a context-engine that GROWS + RECEDES with the story. Three small
// tweens: ARRIVE (a cell brightens when you first step in — wayfinding, the player
// learns "a place opened"); SPATIAL DECAY (a coach's territory recedes as they
// graduate — RECESSION grammar, easeIn); DYNAMIC LEGEND (the label morphs hers→yours
// in place — only the changed words cross-fade). Spec: living-map-and-area-context.md.
function LivingMap({ mode, forceReduced = false }: {
  mode: "arrive" | "decay" | "legend"; forceReduced?: boolean;
}) {
  const reduced = forceReduced || prefersReduced();
  const cc = useCampaignCopy();
  // The glyph + legend re-skin per campaign; the ASCII box border stays generic
  // (width-locked) so alignment never breaks across campaigns.
  return (
    <div className={`adk-lm adk-lm-${mode}${reduced ? " adk-lm-reduced" : ""}`}>
      <div className="adk-lm-cell">
        <div className="adk-lm-row">┌──── the track ─────┐</div>
        <div className="adk-lm-row">│ , , , , , , , , , │</div>
        <div className="adk-lm-row">│ , <span className="adk-lm-glyph">{cc.mapGlyph}</span> . . . . . . t │</div>
        <div className="adk-lm-row">│ , . . [bleachers] │</div>
        <div className="adk-lm-row">└───────────────────┘</div>
      </div>
      <div className="adk-lm-legend">
        <span className="adk-lm-glyph2">{cc.mapGlyph}</span>
        {mode === "legend" ? (
          <span className="adk-lm-lbl">
            <span className="adk-lm-lbl-old">{cc.mapLabelOld}</span>
            <span className="adk-lm-lbl-new">{cc.mapLabelNew}</span>
          </span>
        ) : (
          <span>{cc.mapLabelOld}</span>
        )}
      </div>
    </div>
  );
}

// ── The SCRAPBOOK (Wren) — a heap of discards SORTS into an archive ──────────
// Wren's signature accent. The Drawer's contents are the player's own thrown-away
// things (TEXT, not blobs — the items are prose). They start as a scattered heap
// (dim, offset, tilted) and SETTLE into ordered rows, staggered — junk becoming an
// archive ("kept, not trashed"). Spec: wren-destination-card.md / wren-reveal.beat.md.
function Scrapbook({ forceReduced = false }: { forceReduced?: boolean }) {
  const reduced = forceReduced || prefersReduced();
  const cc = useCampaignCopy();
  const items = cc.scrapItems;
  return (
    <div className={`adk-sb${reduced ? " adk-sb-reduced" : ""}`}>
      <div className="adk-sb-head">{cc.scrapHead}</div>
      <ul className="adk-sb-list">
        {items.map((it, i) => (
          <li key={i} className="adk-sb-item" style={{ "--sb-i": i } as React.CSSProperties}>
            <span className="adk-sb-mark">▪</span> {it}
          </li>
        ))}
      </ul>
      <div className="adk-sb-foot">{reduced ? "sorted — kept" : cc.scrapFoot}</div>
    </div>
  );
}

// ── Stat polygon — "your shape" grows/breathes to the new vertices ──────────
// The genre-feel core (Persona/FF stat chart). The dashed ghost = yesterday; the
// filled shape breathes out to today. Lab approximates the per-vertex tween with
// a scale-breathe + the curve; the Flutter StatPolygon tweens each axis value.
export function PolyGrowth({ dialect }: { dialect: "vibrant" | "parchment" }) {
  return (
    <div className={`adk-poly adk-poly-${dialect}`}>
      <svg viewBox="0 0 120 120" width="120" height="120">
        {/* guide ring */}
        <polygon points="60,8 112,60 60,112 8,60" className="adk-poly-ring" />
        {/* ghost (yesterday) */}
        <polygon points="60,34 86,60 60,92 36,60" className="adk-poly-ghost" />
        {/* today — breathes out from center */}
        <polygon points="60,16 104,58 64,104 22,66" className="adk-poly-fill" />
      </svg>
      <div className="adk-poly-axes"><span>STR</span><span>INT</span><span>GLD</span><span>CHR</span></div>
    </div>
  );
}

// ── Vital reveal — the SILENT "whisper" (??? → value), no flash/toast ────────
// A perception line just named the detail; the sheet row fills in QUIETLY. The
// delight here is subtlety — interrupting it with a fanfare is the failure case.
function VitalWhisper() {
  const cc = useCampaignCopy();
  return (
    <div className="adk-vrow">
      <span className="adk-vlabel">{cc.vitalLabel}</span>
      <span className="adk-vslot">
        <span className="adk-vital-q">???</span>
        <span className="adk-vital-v">{cc.vitalValue}</span>
      </span>
    </div>
  );
}

// ── "You see" perception line — gentle entrance under the scenario ───────────
// Whisper-tier (NOT a headline): the italic line drifts/fades in below the prose.
// Theme variants: Parchment fade (still) · Vibrant soft drift · DOS type-on.
export function YouSee() {
  const cc = useCampaignCopy();
  return (
    <div className="adk-ys">
      <div className="adk-ys-scene">{cc.ysScene}</div>
      <div className="adk-ys-line">{cc.ysLine}</div>
    </div>
  );
}

// ── Scene heartbeat (BPM) — the felt pulse, threshold-gated ──────────────────
// Two BPMs (character/player) for asymmetry; pulses ONLY when a BPM leaves the
// resting band (55–90) — an emotional shift, not a constant hum ("if everything
// pulses, nothing pulses"). NEVER labeled "heart rate" in-game (banned clinical
// word) — felt, not shown. Music uses ONE derived scene tempo. Spec: docs/design/bpm.md.
export function Heartbeat({ label, bpm }: { label: string; bpm: number }) {
  const pulses = bpm < 55 || bpm > 90;
  const dur = (60 / bpm).toFixed(2);
  return (
    <div className="adk-hb-node">
      <span
        className={`adk-hb-dot${pulses ? " adk-hb-beat" : ""}`}
        style={pulses ? ({ "--hb-dur": `${dur}s` } as React.CSSProperties) : undefined}
      />
      <span className="adk-hb-label">{label}</span>
      <span className="adk-hb-bpm">{bpm}{pulses ? "" : " · resting"}</span>
    </div>
  );
}

// ── Dialogue PACED by BPM — the heartbeat conducts the reveal ────────────────
// The same line reveals slow + lingering at a calm BPM, fast + snappy at a tense
// one (revealMsPerChar = 60ms@calm → 16ms@panic), with the threshold-gated pulse
// beside it. BPM is the conductor of the dialogue motion. Mirrors lib/bpm.dart.
function bpmRevealMs(bpm: number) {
  const t = Math.min(1, Math.max(0, (bpm - 40) / (120 - 40)));
  return Math.round(60 + (16 - 60) * t);
}
function BpmLine({ text, bpm }: { text: string; bpm: number }) {
  const ms = bpmRevealMs(bpm);
  const pulses = bpm < 55 || bpm > 90;
  const [n, setN] = useState(0);
  useEffect(() => {
    if (prefersReduced()) { setN(text.length); return; }
    let i = 0;
    const id = setInterval(() => { i += 1; setN(i); if (i >= text.length) clearInterval(id); }, ms);
    return () => clearInterval(id);
  }, [text, ms]);
  return (
    <div className="adk-bpmline">
      <span
        className={`adk-hb-dot adk-hb-sm${pulses ? " adk-hb-beat" : ""}`}
        style={pulses ? ({ "--hb-dur": `${(60 / bpm).toFixed(2)}s` } as React.CSSProperties) : undefined}
      />
      <span className="adk-bpmline-txt">{text.slice(0, n)}<span className="adk-cursor">▌</span></span>
    </div>
  );
}

// ── Campaign skin switcher (Phase 3) ───────────────────────────────────────
// The lab's prototypes are ENGINE — one motion vocabulary. Each CAMPAIGN wears
// it in its own skin (palette + motif + copy). This switcher applies a
// campaign's NATIVE palette (the data-pack the site CSS already defines) as a
// live preview, so you can see every prototype below in each campaign's
// dressing. Same engine, per-campaign skin (project_campaign_motif_framework).
export type CampaignKey = "lifeops" | "corner" | "longhunt" | "dos";

// Per-campaign COPY (increment 2): the prototypes are one engine; the words that
// dress them are per-campaign. The motion DIALECT (vibrant/parchment/dos) stays a
// separate per-card axis — this only swaps the COPY (+ the palette via pack).
export type CampaignCopy = {
  cgTitle: string; cgProse: string; cgCaption: string;
  vfCoachLine: string; vfKeptLine: string; vfTag: string; vfReducedTag: string;
  vfCaption: string; vfAudio: string;
  // LivingMap: the glyph + the legend labels re-skin per campaign (the ASCII box
  // border stays generic — width-locked — so alignment never breaks).
  mapGlyph: string; mapLabelOld: string; mapLabelNew: string;
  // Scrapbook: the kept-discards heap is per-campaign (Life Ops = the Drawer; the
  // Corner = the case file of keepsakes).
  scrapHead: string; scrapItems: string[]; scrapFoot: string;
  // The TRICHOTOMY CHOICE — the most universal mechanic (cross-campaign-mechanics.md §A.1):
  // a prompt + the 3 role options (logical / passive / chaotic) + the chaotic reaction (with
  // the 🎲 crit hint + a stat float). Per-campaign so the core beat re-skins like the rest.
  choicePrompt: string; choiceLogical: string; choicePassive: string;
  choiceChaotic: string; choiceReaction: string;
  // BPM clip: the focal coach name shown beside "You" (per-campaign — no hardcoded cast).
  bpmCoach: string;
  // Vitals whisper: a revealed perception vital (label → value).
  vitalLabel: string; vitalValue: string;
  // "You see" perception: the scene line + the italic perception line.
  ysScene: string; ysLine: string;
  // Achievement stamp: the headline title + the 4 rarity-tier example titles.
  stampTitle: string; stampTiers: [string, string, string, string];
  // Earned-title reward (TitleUnlock): the title that pops (the "Just <name>" button reuses bpmCoach).
  titleEarned: string;
  // Full-REL reward stack (FullRelReward): public→intimate title, the passive, the legendary, mutual mode.
  relTitleFrom: string; relTitleTo: string; relPassive: string; relKeepsake: string; relMutual: string;
};

export type CampaignDef = {
  key: CampaignKey; label: string; pack: string; mode: string; motif: string; copy: CampaignCopy;
};

export const CAMPAIGNS: CampaignDef[] = [
  {
    key: "lifeops", label: "Life Ops", pack: "parchment", mode: "light",
    motif: "Parchment & Ink — cream / forest-green / spot-red. Titles in the FRIENDS voice (“The One…”). The Main Line.",
    copy: {
      cgTitle: "The One Where the Fourth Beat Landed",
      cgProse: "The breath you could never finish — this morning, no wind in the gap. It just landed.",
      cgCaption: "Hana’s 4-count, whole for the first time since it broke.",
      vfCoachLine: "Hana, on the kept side of the bench.",
      vfKeptLine: "the bench at dawn — your side, still warm.",
      vfTag: "the kept side",
      vfReducedTag: "graduated · peer",
      vfCaption: "The frame doesn’t go empty — it goes to the warm space she left you.",
      vfAudio: "♪ whisper · a bench creak settles (the recession’s audio tell — carries it where a glow is lost on mobile)",
      mapGlyph: "H",
      mapLabelOld: "— Hana’s track (her discipline)",
      mapLabelNew: "— the track (your dawn)",
      scrapHead: "the Drawer — kept, not logged",
      scrapItems: [
        "a drill you bombed on a Tuesday",
        "the audit you blew",
        "a wasted Saturday",
        "the receipt from the night you quit pretending",
        "a pen that died mid-sentence",
      ],
      scrapFoot: "…a heap settles into an archive",
      choicePrompt: "5:14 AM. Hana's already on the track. The cold makes its case for bed.",
      choiceLogical: "Lace up. Match her pace.",
      choicePassive: "Hit snooze. Tomorrow, for real.",
      choiceChaotic: "Sprint it — beat her to the corner.",
      choiceReaction: "Hana, surprised into a grin: \"+2 STR. Clumsy. Reckless. Did NOT see it coming. Do it again.\"",
      bpmCoach: "Hana",
      vitalLabel: "HAIR", vitalValue: "Amber",
      ysScene: "She doesn't narrate the walk this morning. Just walks.",
      ysLine: "You catch her watching the gate instead of you — dark eyes already on the door.",
      stampTitle: "The One Sam Framed",
      stampTiers: ["The One Where You Showed Up", "The One Sam Framed", "The One Who Witnessed the Audit", "The One Where the Door Opened"],
      titleEarned: "the Monk",
      relTitleFrom: "the Monk", relTitleTo: "the Spotter",
      relPassive: "+1 when you show up for the hard thing — every campaign",
      relKeepsake: "the Iron Whistle", relMutual: "she spots you now",
    },
  },
  {
    key: "corner", label: "The Corner", pack: "corner", mode: "light",
    motif: "Canvas-grey / steel-blue / oxblood — The Wingman’s gym. Terse coach-talk titles; graduations leave an “Inactive — Graduated” contact.",
    copy: {
      cgTitle: "Beat the Count",
      cgProse: "Across the floor, before the count-in lands — you’re already moving.",
      cgCaption: "You moved on a real one before the count-in.",
      vfCoachLine: "Your corner — the one who worked it between rounds.",
      vfKeptLine: "the stool, the water, the towel — kept for whoever’s next.",
      vfTag: "the corner",
      vfReducedTag: "Inactive — Graduated",
      vfCaption: "The corner doesn’t empty — the contact just goes quiet: Inactive — Graduated. You carry your own water now.",
      vfAudio: "♪ whisper · the propped stool ticks as it cools (the recession’s audio tell)",
      mapGlyph: "N",
      mapLabelOld: "— the Opener’s stool (his read)",
      mapLabelNew: "— where he used to count you in",
      scrapHead: "the case file — five keepsakes kept",
      scrapItems: [
        "the Worst Line (the opener that somehow worked)",
        "the Last Clean Read (the call you made solo)",
        "the One-Line Draft (the message you finally sent)",
        "the Unsent Text (the one you didn’t need to)",
        "the Candid (the coach, caught without a mask)",
      ],
      scrapFoot: "…five rounds, five things in your pocket",
      choicePrompt: "Three seconds before 'later' turns into 'never.' Nico's at your shoulder.",
      choiceLogical: "Say the small, true thing.",
      choicePassive: "Take a sip. Wait for a better moment.",
      choiceChaotic: "Open with the worst line — on purpose.",
      choiceReaction: "Nico, losing it: \"+2 NERVE. Worst opener I've ever heard — and they LAUGHED. The cringe didn't kill you. Nothing will.\"",
      bpmCoach: "Nico",
      vitalLabel: "EYES", vitalValue: "Steel-blue",
      ysScene: "He doesn't run the count tonight. Just watches the floor.",
      ysLine: "You catch the old tell — his thumb working the tape on his knuckles, the way he must have before a bout.",
      stampTitle: "Beat the Count",
      stampTiers: ["Stepped Off the Wall", "Beat the Count", "The Last Clean Read", "She Said Nothing"],
      titleEarned: "the Opener",
      relTitleFrom: "the Opener", relTitleTo: "the Count-In",
      relPassive: "+1 nerve — the bold move is one easier, any lane",
      relKeepsake: "Beat the Count", relMutual: "he texts GO, unprompted",
    },
  },
  {
    key: "longhunt", label: "The Long Hunt", pack: "parchment", mode: "light",
    motif: "Parchment & Ink, run cold for the dark — cream / forest-green / spot-red. Hunter's-creed titles (“the oath, named”). The first ROMANCE campaign; the rope goes both ways. (Shares Parchment with Life Ops — same engine, the words run colder.)",
    copy: {
      cgTitle: "Both Came Back",
      cgProse: "The deep line should have taken one of you. Neither let go of the rope — and the dark gave you both back.",
      cgCaption: "The descent that went wrong, and the hand that didn’t open.",
      vfCoachLine: "Roan’s place at the lip — where he checked your knots before his own.",
      vfKeptLine: "the rope, coiled where he left it — yours to run now.",
      vfTag: "the rope’s yours",
      vfReducedTag: "graduated · the rope’s free",
      vfCaption: "The lip doesn’t go empty — he just stops checking your knots, because you don’t need him to. The rope’s free some nights, and he’s the other end of it when you want it.",
      vfAudio: "♪ whisper · a carabiner ticks as it cools on the rock (the recession’s audio tell)",
      mapGlyph: "R",
      mapLabelOld: "— Roan’s lip (his rope, his read)",
      mapLabelNew: "— the lip (your descent now)",
      scrapHead: "the kit — what the dark left you",
      scrapItems: [
        "the coffin hitch he made you un-learn",
        "the cord he left coiled by your bunk",
        "a carabiner that caught you mid-drop",
        "the oath-cord — the partner he couldn’t hold",
        "a knot you tied scared, and it held anyway",
      ],
      scrapFoot: "…a kit settles into the weight you carry",
      choicePrompt: "The hold shears. The drop opens under you. The rope is all there is.",
      choiceLogical: "Trust the knot. Find the next hold.",
      choicePassive: "Freeze. Let him take the weight.",
      choiceChaotic: "Do the reckless thing that might save you both.",
      choiceReaction: "Roan, hauling you both clear: \"+2 NERVE. It should not have worked. You are going to give me a heart attack.\"",
      bpmCoach: "Roan",
      vitalLabel: "HANDS", vitalValue: "Rope-scarred",
      ysScene: "He sets the anchor and says nothing.",
      ysLine: "You catch his hand rest on the rope a beat too long — the knot already perfect, his eyes already on the dark below.",
      stampTitle: "Both Came Back",
      stampTiers: ["Tied In", "Good Rope", "Especially Scared", "Both Came Back"],
      titleEarned: "the Coldest",
      relTitleFrom: "the Coldest", relTitleTo: "the Other End",
      relPassive: "+1 nerve on any drop — the rope holds in every world",
      relKeepsake: "the Oath-Cord", relMutual: "the rope's free some nights",
    },
  },
  {
    key: "dos", label: "DOS-era", pack: "dos", mode: "light",
    motif: "Green CRT, monospace, INSTANT text (no fades). The Day-0 boot-up onboarding skin (a theme, not a cast).",
    copy: {
      cgTitle: "moment_kept.exe",
      cgProse: "> a real one, logged before the prompt finished printing.",
      cgCaption: "STATUS: unlogged → kept.",
      vfCoachLine: "GUIDE.PROC — resident since boot.",
      vfKeptLine: "the prompt stays; the process exits clean.",
      vfTag: "kept",
      vfReducedTag: "PROC ENDED · 0 ERRORS",
      vfCaption: "The process doesn’t crash — it exits. The prompt it left is yours now.",
      vfAudio: "♪ whisper · a single terminal beep settles (the recession’s audio tell)",
      mapGlyph: "@",
      mapLabelOld: "— GUIDE.SECTOR (resident)",
      mapLabelNew: "— your sector (u/root)",
      scrapHead: "KEPT/ — 0 bytes lost",
      scrapItems: [
        "build_v1.bak (the one that wouldn’t compile)",
        "TODO.txt (the abandoned list)",
        "a draft.eml, never sent",
        "log from the night it crashed",
        "a function that died mid-call",
      ],
      scrapFoot: "…junk → archive, sorted clean",
      choicePrompt: "> a prompt blinks. three commands. one window before it times out.",
      choiceLogical: "run the safe routine",
      choicePassive: "wait — watch the log",
      choiceChaotic: "force-push the untested branch",
      choiceReaction: "> +2 NERVE. it should not have compiled. it compiled. [ OK ]",
      bpmCoach: "GUIDE",
      vitalLabel: "STATUS", vitalValue: "Resident",
      ysScene: "> GUIDE.PROC idles. No output this cycle.",
      ysLine: "> the cursor holds one extra blink before the prompt — like it is deciding whether to say more.",
      stampTitle: "moment_kept.exe",
      stampTiers: ["boot_ok", "moment_kept.exe", "drawer_unlocked", "door_opened.exe"],
      titleEarned: "u/root",
      relTitleFrom: "GUIDE.PROC", relTitleTo: "root",
      relPassive: "+1 — resident in every process now",
      relKeepsake: "the kept prompt", relMutual: "it answers first now",
    },
  },
];

// Active-campaign context: the switcher sets it; the prototypes read their copy
// from it. Default = Life Ops (the Main Line).
export const CampaignCtx = createContext<CampaignCopy>(CAMPAIGNS[0].copy);
export const useCampaignCopy = () => useContext(CampaignCtx);

function CampaignSkin({ active, onPick }: { active: CampaignKey; onPick: (k: CampaignKey) => void }) {
  const apply = (c: CampaignDef) => {
    onPick(c.key);
    if (typeof document !== "undefined") {
      document.documentElement.dataset.pack = c.pack;
      document.documentElement.dataset.mode = c.mode;
    }
  };
  const cur = CAMPAIGNS.find((c) => c.key === active) ?? CAMPAIGNS[0];
  return (
    <div style={{ border: "2px solid var(--ink-soft)", padding: "14px 16px", margin: "0 0 28px", background: "var(--paper-shade)" }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
        <span style={{ fontFamily: "var(--theme-display)", fontSize: 11, letterSpacing: ".16em", color: "var(--spot-red)", marginRight: 4 }}>CAMPAIGN SKIN · 3 campaigns, 1 engine</span>
        {CAMPAIGNS.map((c) => (
          <button
            key={c.key}
            onClick={() => apply(c)}
            style={{
              fontFamily: "var(--theme-body)", fontSize: 13, padding: "5px 12px", cursor: "pointer",
              border: "2px solid var(--ink-soft)",
              background: c.key === active ? "var(--forest)" : "transparent",
              color: c.key === active ? "var(--paper)" : "var(--ink)",
            }}
          >
            {c.label}
          </button>
        ))}
      </div>
      <p style={{ fontSize: 13, color: "var(--ink-soft)", margin: "10px 0 4px", lineHeight: 1.5 }}>{cur.motif}</p>
      <p style={{ fontSize: 12, color: "var(--margin-ink)", margin: 0, fontStyle: "italic" }}>
        The three campaigns — Life Ops · The Wingman · The Long Hunt — are ONE engine in three skins; <b>DOS-era</b> is the Day-0 onboarding theme. Picking one re-skins every prototype below to its native palette AND copy (live preview — your saved theme returns on reload). The clips ARE the cross-campaign mechanics (cross-campaign-mechanics.md); the words + palette are the per-campaign dressing.
      </p>
    </div>
  );
}

export default function AnimationGallery() {
  const [campaign, setCampaign] = useState<CampaignKey>("lifeops");
  const copy = (CAMPAIGNS.find((c) => c.key === campaign) ?? CAMPAIGNS[0]).copy;
  return (
    <CampaignCtx.Provider value={copy}>
      <style>{CSS}</style>

      <JumpNav />
      <CampaignSkin active={campaign} onPick={setCampaign} />

      <Section
        title="The trichotomy choice — the core beat  ★NEW (cross-campaign)"
        note="The most UNIVERSAL mechanic: every beat in every campaign offers three roles — logical / passive / chaotic — and the chaotic carries the 🎲 (it can roll a crit, or escalate to the battle minigame below). Pick → the others recede, the reaction lands, a stat floats up. Flip the CAMPAIGN SKIN above to watch the SAME beat re-skin across all three campaigns (Hana's dawn track → Nico's count-in → Roan's drop on the rope) — one engine, per-campaign words. Spec: docs/design/cross-campaign-mechanics.md §A.1."
      >
        <Demo
          title="The 3-choice beat — re-skins with the campaign switcher"
          spec="options stagger in (fadeup .3s, +120ms each) → chaotic picks (border → spot-red, siblings dim to .32, x+3px) → reaction fade-up + stat float (+N, translateY 0→-10px)"
          flutter="_ChoiceButton column → on select: AnimatedOpacity dims siblings + the reaction reveal + the +N float (the same float as the bottom bar's resolved-choice gain)"
        >
          <ChoiceCard />
        </Demo>
      </Section>

      <Section
        title="CG unlock — the earned moment  ★NEW (headline)"
        note="A peak beat earns a full event-still (the achievement blurb captions it). 3 phases — anticipation (SHORT) → hit → settle (the campaign's CG mount eases in + HOLDS). The 'mount' is the Vibrant skin; the artifact is per-campaign (Campaign.cgMount). DETERMINISTIC + earned — NOT a gacha pull (no drumroll, no 'again'). One flash max (WCAG 2.3.1); reduced-motion skips it. Spec: docs/design/animation-delights.md."
      >
        <Demo
          title="Vibrant Realm — flash → mount"
          spec="dim 180ms easeIn → SINGLE white flash 140ms easeOut → mount drop+tilt+settle 420ms easeOutBack (delay .3s)"
          flutter="RevealOverlay(spec: vibrant) — explicit controller, 3 phases; flash = white overlay opacity 0→.95→0 (ONE pulse); card ScaleTransition+rotation easeOutBack; RepaintBoundary"
        >
          <CGReveal dialect="vibrant" />
        </Demo>

        <Demo
          title="Parchment &amp; Ink — cream-bloom → framed card"
          spec="page STILLS → soft cream-bloom 500ms (NO white flash — would cheapen) → framed card fade-up 360ms easeOut (no overshoot, delay .28s)"
          flutter="RevealOverlay(spec: parchment) — bloom = paper-color overlay; card FadeTransition only, no transform overshoot (stillness)"
        >
          <CGReveal dialect="parchment" />
        </Demo>

        <Demo
          title="DOS-era — █ wipe → terminal plate"
          spec="cursor stops → single █ wipe (steps, hard cut) → ASCII plate appears, title INSTANT (DOS text is never typed except Day-0 boot)"
          flutter="RevealOverlay(spec: dos) — wipe = accent block opacity step; plate instant; monospace + box frame"
        >
          <CGReveal dialect="dos" />
        </Demo>

        <Demo
          title="Reduced-motion fallback (forced)"
          spec="prefers-reduced-motion → NO flash, NO dim, NO transform — the card is simply already there (single fade max). Designed here, not bolted on"
          flutter="if MediaQuery.disableAnimations: skip flash/anticipation, set end state instantly (a11y + seizure-safe)"
        >
          <CGReveal dialect="vibrant" forceReduced />
        </Demo>
      </Section>

      <Section
        title="The VACATED FRAME — the RECESSION grammar  ★NEW (headline · graduation)"
        note="The THIRD motion category (after additive Headline + silent Whisper): gentle SUBTRACTION. At a coach's graduation the CG transforms — the coach LIFTS to opacity 0 (easeIN, reluctant, no overshoot) WHILE the space WARMS into the absence (offset, easeOUT) so it reads 'kept', not 'abandoned'. The opposite curve + intent from juice. NEVER a reward grammar (no chime/+crit — recession, not fanfare). Mobile legibility: warmth = light-bloom + dust texture + a whisper-tier diegetic sound, NOT colour alone. The on-thesis motion for 'grows with you'. Spec: animation-delights.md 'RECESSION'."
      >
        <Demo
          title="Parchment &amp; Ink — the gentlest recede (the canonical)"
          spec="coach opacity 1→0 + lift -10px over 1200ms easeIn (reluctant, no overshoot) → warmth bloom opacity 0→.55 over 1000ms easeOut, delay 500ms (offset = absence→warmth reads cause-effect). MC stays."
          flutter="RevealOverlay(spec: recede) — FadeTransition(easeIn) + SlideTransition up on coach; ColorTween/Opacity warmth layer delayed; MC unchanged; NO flash, NO sound-of-reward"
        >
          <VacatedFrame dialect="parchment" />
        </Demo>

        <Demo
          title="Vibrant Realm — warmth slightly stronger, STILL easeIn"
          spec="same recede (easeIn — recession NEVER overshoots, even in Vibrant) but the warmth bloom is more saturated + a faint dust-mote drift, so it reads on a bright screen. The dialect modulates the WARMTH, never the recede curve."
          flutter="recede identical; warmth layer higher target opacity + a subtle particle field; recession contract holds (no easeOutBack here — that's juice, not recession)"
        >
          <VacatedFrame dialect="vibrant" />
        </Demo>

        <Demo
          title="DOS-era — the glyph empties to a kept marker"
          spec="the coach glyph (H) fades to '·' (the empty-but-kept cell marker) — recession in terminal dialect; the 'warmth' is the cell staying marked, not blanked. No colour-warmth (DOS is cold); the KEPT-ness is the persistent marker."
          flutter="char swap H→· via opacity step (DOS = instant grammar); the cell keeps a marker so the space reads 'kept', never 'gone'"
        >
          <VacatedFrame dialect="dos" />
        </Demo>

        <Demo
          title="Reduced-motion fallback (forced) — end-state, NEVER blank"
          spec="prefers-reduced-motion → NO recede animation, NO bloom tween: the warmed-empty bench + a 'graduated · peer' label are simply already there. The critical recession a11y case: an instant-cut to blank reads as a CRASH, so we land the END-STATE with the label, never empty."
          flutter="if MediaQuery.disableAnimations: set coach opacity 0 + warmth at target + show 'graduated · peer' label instantly — the space is kept, legibly, with zero motion"
        >
          <VacatedFrame dialect="parchment" forceReduced />
        </Demo>
      </Section>

      <Section
        title="The LIVING MAP — arrival · Spatial Decay · Dynamic Legend  ★NEW"
        note="The ASCII map GROWS + RECEDES with the story (it's a context-engine, not static chrome). Arrival is an ACCENT (wayfinding — the player learns 'a place opened'); Spatial Decay is RECESSION (a coach's territory recedes as they graduate, easeIn); Dynamic Legend morphs the label hers→yours in place. Spec: docs/design/living-map-and-area-context.md."
      >
        <Demo
          title="Arrival — a cell brightens (accent · wayfinding)"
          spec="cell opacity .35→1 + grayscale(1)→0 over 700ms easeOut; the glyph lands forest-green ('you are here'). The player LEARNS a place opened — motion as wayfinding, not garnish."
          flutter="AnimatedContainer/AnimatedOpacity 700ms easeOut on the cell; the focal glyph color-tweens to forest (the 'you are here' highlight in realm_map_screen)"
        >
          <LivingMap mode="arrive" />
        </Demo>

        <Demo
          title="Spatial Decay — the territory recedes (RECESSION · easeIn)"
          spec="at graduation the coach's glyph + cell content fade toward dim 1→.28 over 1000ms easeIn (reluctant, no snap); the H softens toward the open '.' tiles — the space becomes yours, not a hole. Recession, not removal."
          flutter="TweenSequence/opacity easeIn on the cell layer; the glyph fades; the cell stays (kept), just no longer dominant — pairs with the Vacated Frame at the same graduation"
        >
          <LivingMap mode="decay" />
        </Demo>

        <Demo
          title="Dynamic Legend — the label morphs hers → yours"
          spec="the legend line cross-fades in place: the OLD label → the NEW label (per the active skin) over 600ms (old fades out 0-50%, new fades in 50-100%). Only the label changes; the glyph stays. The place becomes yours, in words."
          flutter="Stack cross-fade (two AnimatedOpacity) on the legend label; the place's title is data (the realm-map LEGEND line) — re-voiced at graduation like a character title"
        >
          <LivingMap mode="legend" />
        </Demo>

        <Demo
          title="Reduced-motion fallback (forced) — end-state, never blank"
          spec="prefers-reduced-motion → the cell + legend are simply at end-state (arrived/decayed/morphed), no tween. A receding map that instant-cut to empty would read as a glitch; the kept state is shown, legibly, with zero motion."
          flutter="if MediaQuery.disableAnimations: set end state instantly on cell/glyph/label — the map is correct, just still"
        >
          <LivingMap mode="decay" forceReduced />
        </Demo>
      </Section>

      <Section
        title="The SCRAPBOOK (Wren) — a heap sorts into an archive  ★NEW (accent)"
        note="Wren's signature: the Drawer's contents are the player's own discards (TEXT — the items are prose, not blobs). They start as a scattered heap and SETTLE into ordered rows, staggered — junk becoming an archive ('kept, not trashed'). The active proof of Wren's lane (keep what a column can't hold). Spec: wren-destination-card.md."
      >
        <Demo
          title="The Drawer opens — the heap settles into order"
          spec="each discard starts dim + offset (alternating ±, slight tilt) → settles into its row: opacity 0→1 + translate→0 + rotate→0 over 420ms easeOut, STAGGERED by index (delay = i·120ms). A heap becoming an archive."
          flutter="ListView with a per-row staggered AnimatedSlide/AnimatedOpacity (Interval(i*.12, ...)); each item is text (the memento's label), never a figure"
        >
          <Scrapbook />
        </Demo>

        <Demo
          title="Reduced-motion fallback (forced) — already an archive"
          spec="prefers-reduced-motion → the rows are simply ordered + present, 'junk → kept' shown, no stagger. (An accent, so the fallback is trivial — but still no blank/heap state.)"
          flutter="if MediaQuery.disableAnimations: items at end-state instantly"
        >
          <Scrapbook forceReduced />
        </Demo>
      </Section>

      <Section
        title="Stat polygon — your shape  ★NEW"
        note="The genre-feel core (Persona/FF stat chart): the dashed ghost = yesterday, the filled shape BREATHES out to today's vertices. Accent tier. Vibrant overshoots (breathe); Parchment settles (no overshoot — stillness); DOS redraws instant. Flutter tweens each axis value per-vertex; the lab shows the curve + feel."
      >
        <Demo
          title="Vibrant — breathe (overshoot)"
          spec="filled polygon scales .5→1 + fade, easeOutBack ~550ms (a single breath out past the ghost, settling)"
          flutter="StatPolygon: Tween per axis value, Curves.easeOutBack ~550ms; dashed ghost = previousStats (static)"
        >
          <PolyGrowth dialect="vibrant" />
        </Demo>
        <Demo
          title="Parchment — settle (no overshoot)"
          spec="filled polygon scales .5→1 + fade, easeOut ~480ms — grows and stops, no bounce (stillness)"
          flutter="StatPolygon: Tween per axis, Curves.easeOut ~480ms (no overshoot under Parchment)"
        >
          <PolyGrowth dialect="parchment" />
        </Demo>
      </Section>

      <Section
        title="Vitals &amp; &ldquo;you see&rdquo; — the perception mechanic  ★NEW"
        note="The faceless-MC visual layer (docs/design/character-vitals.md). The 'you see' line does the describing; revealing a VITAL is a WHISPER — silent, no flash, no toast (a fanfare on an eye-color reveal is the failure case). The line itself enters gently (whisper-tier, never the headline grammar)."
      >
        <Demo
          title="Vital reveal — SILENT whisper (??? → value)"
          spec="the slot cross-fades ??? out (150ms, delay .3s) then the value in (150ms) — opacity only, NO movement, NO flash, NO toast"
          flutter="character sheet _VitalRow: AnimatedSwitcher (fade) on isVitalRevealed; NO toast/sound — silent by contract"
        >
          <VitalWhisper />
        </Demo>
        <Demo
          title="&ldquo;You see&rdquo; line — gentle entrance"
          spec="italic perception drifts/fades in below the scenario · ~420ms · Parchment fade (still) / Vibrant soft drift / DOS type-on"
          flutter="narrative_event_screen: Event.youSee → AnimatedOpacity/slide by theme; whisper-tier, never the CG grammar"
        >
          <YouSee />
        </Demo>
      </Section>

      <Section
        title="Scene heartbeat — BPM  ★NEW"
        note="Every scene has a felt BPM (its emotional heartbeat) — two BPMs (character + player) for asymmetry; DERIVED from state (lib/bpm.dart), not hand-set per line. Pulses ONLY when a BPM leaves the resting band 55–90 (an emotional shift, never a constant hum). NEVER labeled 'heart rate' in-game (banned clinical word) — felt, not shown. Music uses ONE derived scene tempo; the two BPMs drive arrangement. Spec: docs/design/bpm.md."
      >
        <Demo
          title="Resting — NO pulse (the threshold)"
          spec="both inside 55–90 → static. 'If everything pulses, nothing pulses' — no baseline hum (anti-fatigue + reduced-motion-safe)"
          flutter="Bpm.anyPulse == false → no heartbeat driver; UI still"
        >
          <div className="adk-hb"><Heartbeat label={copy.bpmCoach} bpm={64} /><Heartbeat label="You" bpm={70} /></div>
        </Demo>
        <Demo
          title="Tense — asymmetric (calm coach, racing player)"
          spec="player 108 BPM pulses (lub-dub at 60/bpm s); coach 60 stays composed (the gift). The dramatic asymmetry"
          flutter="deriveBpm(stakes:3, valenceTilt:-1) → player pulses, character static; pulse dur = Bpm.secondsPerBeat"
        >
          <div className="adk-hb"><Heartbeat label={copy.bpmCoach} bpm={60} /><Heartbeat label="You" bpm={108} /></div>
        </Demo>
        <Demo
          title="Their exposed beat (the Monument)"
          spec="the character's OWN vulnerable beat spikes THEIR heartbeat (104, pulsing); the player steadies (76)"
          flutter="deriveBpm(stakes:3, characterExposed:true) → character pulses (the coach's own vulnerable beat)"
        >
          <div className="adk-hb"><Heartbeat label={copy.bpmCoach} bpm={104} /><Heartbeat label="You" bpm={76} /></div>
        </Demo>

        <Demo
          title="BPM conducts the dialogue — calm (slow reveal)"
          spec="same line, BPM 64 → revealMsPerChar 51ms (slow, weighty) + long dwell + no pulse. ▶ replay to feel the pace"
          flutter="Bpm.revealMsPerChar drives the type/stagger; DOS types, Vibrant staggers, Parchment instant + dwell"
        >
          <BpmLine text="So. Same drill as yesterday. You already know the first move." bpm={64} />
        </Demo>
        <Demo
          title="BPM conducts the dialogue — tense (fast reveal + pulse)"
          spec="same line, BPM 108 → revealMsPerChar ~23ms (fast, urgent) + short dwell + the pulse fires. The heartbeat IS the pace"
          flutter="higher sceneTempo → shorter revealMsPerChar + dwellMs; pulse threshold-crossed → heartbeat shows"
        >
          <BpmLine text="So. Same drill as yesterday. You already know the first move." bpm={108} />
        </Demo>
      </Section>

      <Section
        list
        title="DIALOGUE MOTION — theme · character · emotion  ★NEW"
        note="One system, three stacked layers (docs/design/voice-motion.md): LAYER 1 — the THEME owns the reveal family (how text appears at all: DOS instant, Parchment typographic, Vibrant animated). LAYER 2 — VOICE-MOTION owns the CHARACTER (pace, rhythm, settle — the voice, kinetic, never sound; locked-sheet canon, auditioned at the character audits). LAYER 3 — the EMOTION owns the line's MOOD (VN / Phoenix-Wright energy: the animation IS the feeling). They compose: theme → character → emotion. (Consolidated 2026-06-13 — the old 'Text & narration' demos folded in; the per-emotion examples now live in Layer 3.)"
      >
        <Demo
          title="L1 · the THEME reveal family — DOS (instant + ASCII)"
          spec="NO motion — a terminal prints at once. Monospace; personality comes from ASCII art (frames/banners), not animation. The character preset survives only as punctuation-holds; emotion collapses to instant"
          flutter="ThemePack.textReveal = instant + monospace; lean on ASCII art blocks for character"
        >
          <div className="adk-textstage adk-dos-stage">
            <pre className="adk-ascii">{`+----------------------------+
|  > DROP AND GIVE ME 20.    |
|    [ Y / N ] _             |
+----------------------------+`}</pre>
          </div>
        </Demo>

        <Demo
          title="L1 · the THEME reveal family — Parchment (typographic) vs Vibrant (animated)"
          spec="Parchment & Ink stays STILL — emphasis is typographic (shout → bold, aside → italic), appears at once. Vibrant Realm ANIMATES — and that animation is the character preset (Layer 2) carrying the emotion (Layer 3) below"
          flutter="Parchment: instant Text + FontWeight/FontStyle · Vibrant: the per-unit motion engine (Layers 2-3)"
        >
          <div className="adk-textstage">
            <span className="adk-ink-text">She didn’t raise her voice. <b>Sit down.</b> <i>(she’d only say it once.)</i></span>
          </div>
        </Demo>

        <Demo stack
          title="L2 · VOICE-MOTION — the ENERGETIC type (hot-blooded shonen)"
          spec="DRILL word·70ms even + caps-snap (counted reps) · COUNT-IN front-burst (first 4 words at pace/3, then relaxes — out of the gate fast, then walks). Inspirations: the sports-anime captain, the hero-academy mentor, early-Naruto bravado"
          flutter="VoiceMotionSpec{unit, paceMs, rhythm, entry, emphasis, settle} keyed by ARCHETYPE not name; a character just picks a preset"
        >
          <VoiceRow who="The Hot-Blooded Coach" preset="DRILL" text="Up. One more set. The wall’s in your HEAD." />
          <VoiceRow who="The Brash Hype-Man" preset="COUNT-IN" text="THREE, two, one — see? Easy. Told you." />
        </Demo>

        <Demo stack
          title="L2 · VOICE-MOTION — the COOL & PRECISE type (Ace-Attorney cool)"
          spec="LEDGER word·125ms + pen-lift holds, numbers weight-settle · RULED INK precise word·130ms · RED PEN strike-revise mid-line (the draft visible) · STRAIGHT READ flat-even, then the verdict lands WHOLE. Inspirations: the prosecutor (Edgeworth), the calculating mind (L), the blunt detective"
          flutter="strike = struck-style keyframe + replacement unit · verdict = full-line instant after hold"
        >
          <VoiceRow who="The Cool Analyst" preset="LEDGER" text="Three problems. One cause. We start there." />
          <VoiceRow who="The Meticulous Keeper" preset="RULED INK" text="Noted. Filed. Nothing leaves this desk unrecorded." />
          <div className="vm-row"><span className="vm-who">The Perfectionist Editor · RED PEN</span><span className="vm-text"><RedPenLine before="Tell her you’re" from="nervous." to="glad you came." after="Send it before you edit the glad out." /></span></div>
          <div className="vm-row"><span className="vm-who">The Deadpan Truth-Teller · STRAIGHT READ</span><span className="vm-text"><StraightRead read="He looked back twice on the way out." verdict="That’s not a maybe." /></span></div>
        </Demo>

        <Demo stack
          title="L2 · VOICE-MOTION — the WARM & COZY type (slice-of-life caretaker)"
          spec="SERVICE phrase·260ms drift (plated in portions) · KINDLE word·230ms IGNITE (each word brightens like a wick taking) · TWO CUPS paired phrases · LADLE phrase·210ms percussive TICK. Inspirations: the Ghibli kitchen, the gentle elder, the soft-spoken tea host"
          flutter="ignite = brightness keyframe · paired = alternating 70ms/pace · tick = translateY dip"
        >
          <VoiceRow who="The Warm Caretaker" preset="SERVICE" text="Sit. Eat first — the rest can wait." />
          <VoiceRow who="The Patient Elder" preset="KINDLE" text="One small flame. Then the next. That’s all it takes." />
          <VoiceRow who="The Quiet Host" preset="TWO CUPS" text="Two cups. Sit a while. The question can keep." />
          <VoiceRow who="The Brisk Cook" preset="LADLE" text="Hot and ready. Don’t let it go cold." />
        </Demo>

        <Demo stack
          title="L2 · VOICE-MOTION — the TERSE & GRUFF type (cold-warm mentor)"
          spec="ROPE pair·95ms with LONG holds (3.2× at clause ends) · COIL pair·165ms work-rhythm · FULL PRICE whole phrases, flat, no ornament · CHALK word·150ms STAMP (corrects a hair upward). Inspirations: the hardass sensei (Jiraiya), the gruff veteran, the stern shopkeeper"
          flutter="holds multiplier on the sheet; the WARMTH DIAL softens the holds at high REL, never the length"
        >
          <VoiceRow who="The Gruff Sensei" preset="ROPE" text="Again. Slower. The hand remembers what the head forgets." />
          <VoiceRow who="The Steady Workhand" preset="COIL" text="Hold it taut. Eyes on the line. Good." />
          <VoiceRow who="The Blunt Craftsman" preset="FULL PRICE" text="Rough edge. Honest work. Full price." />
          <VoiceRow who="The Firm Appraiser" preset="CHALK" text="That’s underpriced. The work was real — so’s the number." />
        </Demo>

        <Demo stack
          title="L2 · VOICE-MOTION — the SERENE & WRY type (contemplative / narrator)"
          spec="SURFACE sentence·950ms fades up from the dark (the far shore arriving) · ANCHOR damped phrase drift, never jitters · NARRATOR sentence·620ms drift (page-lines). Inspirations: the calm navigator, the unflappable senpai, the visual-novel narrator"
          flutter="surface = opacity + blur keyframe; damped = drift with zero overshoot"
        >
          <VoiceRow who="The Serene Navigator" preset="SURFACE" text="The dark has its own currents. We hold our heading." />
          <VoiceRow who="The Unflappable Senpai" preset="ANCHOR" text="Breathe. The room isn’t going anywhere. Neither am I." />
          <VoiceRow who="The Wry Narrator" preset="NARRATOR" text="And so the quiet ones surprised everybody. As they do." />
        </Demo>

        <Demo stack
          title="L3 · EMOTION — every emotion, on a line that fits it"
          spec="word-mode = per-word keyframe; letter-mode (eml-*) = per-CHARACTER stagger (shock scales 2.4× + rotates ±11°, angry ±5px, tremble = a SUSTAINED shake, excited springs .45→1.25); line-mode (emc-declare) = the whole line jolts ±8px. Hit replay-all"
          flutter="VoiceMotionSpec gains `emotion` + `mode`; the renderer splits by letter for the dramatic ones, shakes the container for declare, else per word"
        >
          <EmotionGallery />
        </Demo>

        <Demo stack
          title="L3 · EMOTION — the big VN beats (WHAAAT?! / OBJECTION! / you did WHAT)"
          spec="shock = per-letter punch-and-shake · declare = the line desk-slams · angry = per-letter judder · tremble = the held breakdown shake. The text doing the acting"
          flutter="same engine; letter-mode + line-mode at full amplitude"
        >
          <div className="vm-row" style={{ marginBottom: 14 }}><span className="vm-text" style={{ fontSize: 26 }}><EmoLine text="WHAAAAT?!" emotion="shock" /></span></div>
          <div className="vm-row" style={{ marginBottom: 14 }}><span className="vm-text" style={{ fontSize: 22 }}><EmoLine text="OBJECTION! That’s not what happened." emotion="declare" /></span></div>
          <div className="vm-row" style={{ marginBottom: 14 }}><span className="vm-text" style={{ fontSize: 20 }}><EmoLine text="You did WHAT with my ledger?" emotion="angry" /></span></div>
          <div className="vm-row"><span className="vm-text" style={{ fontSize: 20 }}><EmoLine text="Y-you can’t prove that…!" emotion="tremble" /></span></div>
        </Demo>

        <Demo stack
          title="L3 · EMOTION × archetype — the same range, different personalities"
          spec="emotion drives the motion; the archetype's preset still sets the rhythm. The hot-blood SHOUTS, the hype-man is EXCITED, the deadpan reads WRY, the rookie TREMBLES, the sensei SIGHS, the craftsman DEADPANS"
          flutter="emotion overlays the preset: same `[emotion]` tag, any character can wear any archetype"
        >
          <div className="vm-row"><span className="vm-who">The Hot-Blooded Coach · shout</span><span className="vm-text"><EmoLine text="THAT’S the rep. Do it AGAIN." emotion="shout" unit="word" basePace={70} /></span></div>
          <div className="vm-row"><span className="vm-who">The Warm Caretaker · smile</span><span className="vm-text"><EmoLine text="There you are. I made too much again." emotion="smile" unit="phrase" basePace={260} /></span></div>
          <div className="vm-row"><span className="vm-who">The Brash Hype-Man · excited</span><span className="vm-text"><EmoLine text="You ACTUALLY did it!" emotion="excited" /></span></div>
          <div className="vm-row"><span className="vm-who">The Deadpan Truth-Teller · wry</span><span className="vm-text"><EmoLine text="That’s not a maybe. You know it isn’t." emotion="wry" unit="word" basePace={105} /></span></div>
          <div className="vm-row"><span className="vm-who">The Nervous Rookie · tremble</span><span className="vm-text"><EmoLine text="I— I rehearsed this part…" emotion="tremble" /></span></div>
          <div className="vm-row"><span className="vm-who">The Gruff Sensei · sigh</span><span className="vm-text"><EmoLine text="Again. Slower. We have all night." emotion="sigh" unit="pair" basePace={120} /></span></div>
          <div className="vm-row"><span className="vm-who">The Blunt Craftsman · deadpan</span><span className="vm-text"><EmoLine text="Burnt edge. Best flavor. Full price." emotion="deadpan" unit="phrase" basePace={300} /></span></div>
        </Demo>
      </Section>

      <Section
        title="Modals &amp; popups — themed  ★NEW"
        note="How a popup/modal enters is part of the theme's motion personality: Parchment & Ink fades (calm, no movement), Vibrant Realm slides (kinetic), DOS-era appears instantly inside an ASCII frame."
      >
        <Demo
          title="Parchment &amp; Ink — fade"
          spec="opacity 0→1 (+ a hair of scale) · 240ms ease; no positional movement — calm dissolve"
          flutter="themed modal route: FadeTransition when active.id == parchment"
        >
          <div className="adk-modal adk-modal-fade">
            <div className="adk-modal-eye">FIELD NOTES</div>
            <div className="adk-modal-body">A bent brass key, warm from a pocket.</div>
          </div>
        </Demo>

        <Demo
          title="Vibrant Realm — slide"
          spec="translateY 16px→0 + fade · easeOutBack 300ms; enters with movement"
          flutter="themed modal route: SlideTransition when active.id == vibrant"
        >
          <div className="adk-modal adk-modal-slide">
            <div className="adk-modal-eye">FIELD NOTES</div>
            <div className="adk-modal-body">A bent brass key, warm from a pocket.</div>
          </div>
        </Demo>

        <Demo
          title="DOS-era — instant, ASCII frame"
          spec="NO motion — prints at once inside a box-drawing frame; monospace"
          flutter="themed modal route: no transition; ASCII box border"
        >
          <pre className="adk-ascii adk-modal-dos">{`+--------------------------+
| FIELD NOTES              |
| a bent brass key, warm.  |
+--------------------------+`}</pre>
        </Demo>
      </Section>

      <Section
        title="Bottom bar"
        note="The persistent bottom-edge surface (mid-day): FOCAL · the four stats, one line. No DAY (it's in the header) and no REL tier — both retired. A '+N' floats up + fades on the stat that just changed."
      >
        <Demo
          title="FOCAL · stats + floating gains"
          spec="float +N: translateY 0→-10px + fade-in-then-out · easeOut · 1000ms, fired once per resolved choice (keyed on a gain nonce)"
          flutter="global_activity_bar.dart — _MidDayBar: NAME + _StatChip per stat (gameState.recentStatGain / statGainNonce)"
        >
          <div className="adk-statbar">
            <div className="adk-statbar-left"><b>HANA</b></div>
            <div className="adk-statbar-stats">
              <span className="adk-stat">STR 13<span className="adk-float">+2</span></span>
              <span className="adk-stat">INT 8</span>
              <span className="adk-stat">GLD 5</span>
              <span className="adk-stat">CHR 10<span className="adk-float adk-float-b">+1</span></span>
            </div>
          </div>
        </Demo>
      </Section>

      <Section
        title="Battle minigame  ★NEW"
        note="A chance-based (chaotic 🎲) action can enter a themed battle — a mini version of the option-based story. The bottom bar becomes the battle HUD: the ENEMY's HP is the progress bar; the protagonist is just a name + HP number (no bar). Protagonist/enemy are whatever fits the event — here, REPS vs A PUSHUP."
      >
        <Demo
          title="Entering battle — bar transition  ★NEW"
          spec="the stats bar morphs into the battle HUD: labels crossfade (HANA+stats → REPS·HP / A PUSHUP), the enemy HP bar grows in (spot-red), quick shake at the swap. ~1.6s"
          flutter="global_activity_bar.dart — swap _MidDayBar (stats) ↔ _BattleBar on battleController.active"
        >
          <div className="adk-tbar">
            <div className="adk-tbar-labels">
              <div className="adk-tlayer adk-tlayer-rel">
                <span><b>HANA</b></span>
                <span className="adk-tier">STR 13 · INT 8 · GLD 5 · CHR 10</span>
              </div>
              <div className="adk-tlayer adk-tlayer-battle">
                <span>REPS · <b className="adk-hp">HP 30</b></span>
                <span className="adk-enemy">A PUSHUP</span>
              </div>
            </div>
            <div className="adk-bar adk-tbar-track"><div className="adk-tbar-fill" /></div>
            <div className="adk-tbar-cap">
              <span className="adk-tlayer-battle adk-cap adk-cap-battle">ENEMY · HP 32 / 40</span>
            </div>
          </div>
        </Demo>

        <Demo
          title="Battle HUD — bottom bar"
          spec="enemy HP = the bar (spot-red, depletes on hit, easeOutCubic 500ms); protagonist = name + HP number, no bar"
          flutter="global_activity_bar.dart — battle mode: _EnemyHpBar + hero HP label (gameState.battle)"
        >
          <div className="adk-battlebar">
            <div className="adk-bb-row">
              <span className="adk-bb-hero">REPS · <b>HP 30</b></span>
              <span className="adk-bb-enemy">A PUSHUP</span>
            </div>
            <div className="adk-bar adk-bb-track"><div className="adk-bb-fill" /></div>
            <div className="adk-bb-hp">ENEMY · HP 12 / 40</div>
          </div>
        </Demo>

        <Demo
          title="Battle round (mini narrative)"
          spec="a compact option round; win drains enemy HP, lose chips the hero. Outcome maps to the chaotic crit-success/fail it replaced"
          flutter="BattleScreen — reuses _ChoiceButton + reaction loop, shorter; themed text reveal applies"
        >
          <div className="adk-battle">
            <div className="adk-battle-head">BATTLE · REPS <span>vs</span> A PUSHUP</div>
            <div className="adk-battle-prose">“Drop and give me twenty.” The floor is cold and unimpressed.</div>
            <div className="adk-battle-opts">
              <div className="adk-battle-opt">PUSH — steady form <span className="adk-battle-tag">+STR</span></div>
              <div className="adk-battle-opt">FIND A RHYTHM <span className="adk-battle-tag">pace</span></div>
              <div className="adk-battle-opt adk-battle-chaos">EXPLODE UP <span className="adk-battle-tag">🎲 38%</span></div>
            </div>
          </div>
        </Demo>
      </Section>

      <Section
        title="Post-action result — narrative screen"
        note="What the reaction card shows after a choice resolves."
      >
        <Demo
          title="DROPS — horizontal scroll  ★NEW"
          spec="label DROPS + horizontally-scrolling reward cards (~2.5 visible, peek); each snaps in staggered ~120ms"
          flutter="_DropsCard — 'DROPS' + horizontal ListView of _DropChipCard (built)"
        >
          <div className="adk-drops">
            <div className="adk-drops-label">DROPS</div>
            <div className="adk-drops-row">
              <div className="adk-drop adk-d0"><span className="adk-drop-rt rt-relic">★ RELIC</span>Week One, Logged</div>
              <div className="adk-drop adk-d1"><span className="adk-drop-rt rt-keep">▸ KEPT</span>Salt-Mix Recipe</div>
              <div className="adk-drop adk-d2"><span className="adk-drop-rt rt-mem">▸ DROP</span>Pink Yoga Mat</div>
              <div className="adk-drop adk-d3"><span className="adk-drop-rt rt-mem">▸ DROP</span>Water Levels Log</div>
            </div>
          </div>
        </Demo>

        <Demo
          title="Stat gains — inline pills"
          spec="quiet bordered pills (no box); the celebration moved to items/bar — stats stay understated here"
          flutter="_DeltaPill wrap in _ReactionCard (built)"
        >
          <div className="adk-pills">
            <span className="adk-pill">+2 STR</span>
            <span className="adk-pill">+3 REL</span>
            <span className="adk-pill">+1 CHR</span>
          </div>
        </Demo>
      </Section>

      <Section
        title="Items &amp; achievements"
        note="The reveal box, rarity treatment, and the drop toast."
      >
        <Demo
          title="Reveal box (item / achievement)"
          spec="scale 0.85→1 (easeOutBack overshoot) + fade · 280ms"
          flutter="reward-stamp style box → item/achievement reveal"
        >
          <div className="adk-stamp">
            <div className="adk-stamp-eye">★ ACHIEVEMENT UNLOCKED</div>
            <div className="adk-stamp-title">{copy.stampTitle}</div>
          </div>
        </Demo>

        <Demo
          title="Achievement rarity tiers  ★NEW"
          spec="escalating border + color + star + glow (COMMON/RARE/EPIC/LEGENDARY)"
          flutter="Achievement.rarity → achievements_screen row treatment (built)"
        >
          <div className="adk-rar-col">
            <div className="adk-rar adk-rar-common"><b>▸ COMMON</b> · {copy.stampTiers[0]}</div>
            <div className="adk-rar adk-rar-rare"><b>★ RARE</b> · {copy.stampTiers[1]}</div>
            <div className="adk-rar adk-rar-epic"><b>★ EPIC</b> · {copy.stampTiers[2]}</div>
            <div className="adk-rar adk-rar-legend"><b>★ LEGENDARY</b> · {copy.stampTiers[3]}</div>
          </div>
        </Demo>

        <Demo
          title="Item toast (slide-in)"
          spec="translateY 110%→0 (easeOutCubic) · 300ms"
          flutter="lib/toast_stack.dart — GameToast.slideIn 300ms"
        >
          <div className="adk-toast">★ THE DAY GIVES YOU<br /><small>Golden Posture Sticker</small></div>
        </Demo>
      </Section>

      <Section
        title="Onboarding — DOS / Day 0"
        note="The text-adventure boot that blooms into the home theme. NOTE: the typewriter + cursor live ONLY here (boot flavor) — the DOS theme's everyday text reveal is instant monospace (see above)."
      >
        <Demo
          title="DOS boot — typewriter (boot only)"
          spec="type char-by-char ~40ms/char + blinking ▌ cursor; the one-time boot sequence, NOT the per-line reveal"
          flutter="day0_screen.dart — boot types; afterward DOS text is instant"
        >
          <div className="adk-textstage adk-dos-stage"><Typewriter text="> YOU ARE STANDING IN FRONT OF A HOUSE." /></div>
        </Demo>

        <Demo
          title="DOS bloom (theme flip)"
          spec="bg + ink green→cream · 450ms ease"
          flutter="Day0Screen open-door → themeController.popWorld()"
        >
          <div className="adk-bloom">&gt; the bent key turns…<span className="adk-cursor">▌</span></div>
        </Demo>

        <Demo
          title="Blinking terminal cursor"
          spec="opacity 1↔0 step · 1.1s loop"
          flutter="day0_screen.dart _Cursor — Timer 550ms"
        >
          <div className="adk-term">YOU ARE STANDING IN FRONT OF A HOUSE <span className="adk-cursor">▌</span></div>
        </Demo>
      </Section>

      <Section
        title="Growth &amp; navigation"
        note="Stat/REL growth reveals and page transitions."
      >
        <Demo
          title="Growth / REL bar (Day End)"
          spec="width 0→target (easeOutCubic) · 900ms"
          flutter="GrowthReveal / _RelBar — TweenAnimationBuilder 900ms"
        >
          <div className="adk-bar"><div className="adk-bar-fill" /></div>
        </Demo>

        <Demo
          title="Page change"
          spec="INSTANT — no slide/fade (game rule)"
          flutter="theme.dart _NoTransitionsBuilder"
        >
          <div className="adk-instant">pages cut, never slide — popups fade, pages don't</div>
        </Demo>
      </Section>

      <Section
        title="Character intro — name + earned titles"
        note="The intro REVEALS the locked name + the clearest title, then the player picks how to be shown them (Title / Name+Title / Just Name). Names are locked (no rename); the flavored titles are EARNED — so the SAME reveal doubles as the 'new title unlocked' reward on tier-ups. Parchment register: fade-up + typographic, the page stays still."
      >
        <Demo
          title="Intro reveal + display-mode pick"
          spec="staged fade-up: name @150ms → clear title @750ms → chips @1350ms; each 280ms ease-out (opacity + 6px rise). NO slide. Chips switch the label live (names locked — pick is display-only)."
          flutter="CharacterIntro — AnimatedOpacity 280ms staggered; displayMode enum → displayName(char, prefs); no rename path"
        >
          <CharacterIntro />
        </Demo>

        <Demo
          title="New title unlocked (reward reuse)"
          spec="same reveal as a reward — reuses the celebration stamp (scale .85→1.06→1 · 280ms overshoot); fires on a REL tier-up / achievement, then offers the switch"
          flutter="TitleUnlockToast — reuses GrowthReveal stamp curve; gated on the tier/Unspoken achievement"
        >
          <TitleUnlock />
        </Demo>
      </Section>

      <Section
        title="Full-REL reward — the Unspoken payoff"
        note="Reaching Unspoken reveals the per-character reward STACK (story-engine §2): intimate title + the Passive ('what they taught you' = a permanent cross-game buff) + an always-mystery legendary keepsake + 'they reach out' mutual mode. A dignified staged reveal, bigger than a title pop. Shown for the Reader (title-only — still nameless)."
      >
        <Demo
          title="Full-REL reward reveal (Unspoken)"
          spec="staged fade-up bundle: title @200 → passive @1000 → keepsake @1700 → mutual @2400; 280ms ease-out each, NO slide. Legendary keepsake tagged gold."
          flutter="UnspokenRewardSheet — staggered AnimatedOpacity; grants passive (critBonusPct/buff) + reveals legendary mystery + flips mutual mode"
        >
          <FullRelReward />
        </Demo>
      </Section>
    </CampaignCtx.Provider>
  );
}

export const CSS = `
.adk-section{margin-bottom:34px;}
.adk-sec-title{font-family:var(--theme-display);font-size:15px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink);
  border-bottom:2px solid var(--ink);padding-bottom:6px;margin:0 0 4px;}
.adk-sec-note{font-size:12px;color:var(--ink-soft);margin:0 0 14px;max-width:60ch;line-height:1.5;}
.adk-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:18px;}
.adk-list{display:grid;grid-template-columns:1fr;gap:18px;}
.adk-card{border:2px solid var(--ink);background:var(--paper-shade);}
.adk-head{display:flex;justify-content:space-between;align-items:center;padding:8px 12px;border-bottom:1.5px solid var(--ink);}
.adk-head b{font-family:var(--theme-display);font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:var(--ink);}
.adk-replay{font-size:11px;border:1px solid var(--margin-ink);background:var(--paper);color:var(--ink-soft);padding:3px 8px;cursor:pointer;}
.adk-replay:hover{border-color:var(--ink);}
.adk-stage{min-height:120px;display:flex;align-items:center;justify-content:center;overflow:hidden;padding:14px;background:var(--paper);}
.adk-stage-stack{display:block;text-align:left;}
.adk-stage-stack>*{width:100%;}
.adk-spec{font-size:11px;color:var(--ink-soft);padding:7px 12px 2px;font-family:ui-monospace,monospace;}
.adk-flutter{font-size:10px;color:var(--margin-ink);padding:0 12px 8px;font-family:ui-monospace,monospace;}

/* Themed text reveals */
.adk-textstage{width:100%;font-size:14px;line-height:1.5;color:var(--ink);}
.adk-ink-text{font-family:var(--theme-body);}
.adk-ink-text b{font-weight:800;}
.adk-ink-text i{color:var(--ink-soft);}
.adk-tw{font-family:ui-monospace,monospace;font-size:12px;color:#43ff8d;}
.adk-dos-stage{background:#00140a;padding:10px;margin:-14px;width:auto;}
.adk-ascii{font-family:ui-monospace,monospace;font-size:11px;line-height:1.25;color:#43ff8d;margin:0;white-space:pre;}

/* Themed modals — fade (Parchment) / slide (Vibrant) / instant ASCII (DOS) */
.adk-modal{border:2px solid var(--ink);background:var(--paper);padding:11px 14px;min-width:220px;}
.adk-modal-eye{font-family:var(--theme-display);font-size:9px;letter-spacing:.18em;color:var(--spot-red);margin-bottom:5px;}
.adk-modal-body{font-family:var(--theme-body);font-size:13px;color:var(--ink);line-height:1.4;}
.adk-modal-fade{animation:adk-modalfade .24s ease both;}
@keyframes adk-modalfade{0%{opacity:0;transform:scale(.98);}100%{opacity:1;transform:scale(1);}}
.adk-modal-slide{animation:adk-modalslide .3s cubic-bezier(.34,1.56,.64,1) both;}
@keyframes adk-modalslide{0%{opacity:0;transform:translateY(16px);}100%{opacity:1;transform:translateY(0);}}
.adk-modal-dos{background:#00140a;padding:10px;border:0;color:#43ff8d;}

/* Vibrant — SAY: word pop, properly spaced (margin-right, not a swallowed space) */
.adk-vibrant{font-family:var(--theme-body);font-weight:600;}
.adk-popword{display:inline-block;margin-right:.28em;animation:adk-pop .34s cubic-bezier(.34,1.56,.64,1) both;}
@keyframes adk-pop{0%{opacity:0;transform:translateY(6px) scale(.8);}100%{opacity:1;transform:none;}}

/* Vibrant — SHOUT: per-letter continuous jitter, bold + accent */
.adk-shout{font-family:var(--theme-body);font-weight:800;font-size:17px;letter-spacing:.01em;color:var(--spot-red);}
.adk-shoutchar{display:inline-block;animation:adk-letshake .26s ease-in-out infinite;}
.adk-sp{display:inline-block;width:.3em;}
@keyframes adk-letshake{0%,100%{transform:translate(0,0) rotate(0);}25%{transform:translate(.6px,-1.2px) rotate(-4deg);}50%{transform:translate(-.6px,1px) rotate(3deg);}75%{transform:translate(1px,.2px) rotate(1deg);}}

/* Vibrant — WHISPER: soft slow drift, italic, faded */
.adk-whisper{font-family:var(--theme-body);font-style:italic;font-size:13px;color:var(--ink-soft);}
.adk-whisperword{display:inline-block;margin-right:.26em;animation:adk-soft .6s ease both;}
@keyframes adk-soft{0%{opacity:0;transform:translateY(-2px);}100%{opacity:.75;transform:none;}}

/* Reward stamp — scale overshoot + fade */
@keyframes adk-stampin{0%{opacity:0;transform:scale(.85);}60%{opacity:1;transform:scale(1.06);}100%{transform:scale(1);}}
.adk-stamp{border:2px solid var(--spot-red);background:color-mix(in srgb,var(--spot-red) 6%,transparent);padding:10px 14px;animation:adk-stampin .28s cubic-bezier(.34,1.56,.64,1) both;}
.adk-stamp-eye{font-family:var(--theme-display);font-size:10px;letter-spacing:.14em;color:var(--spot-red);}
.adk-stamp-title{font-family:var(--theme-display);font-size:18px;font-weight:700;color:var(--ink);line-height:1.15;margin-top:4px;}

/* Character intro — name reveal + earned-title pick (Parchment: fade-up, still) */
.adk-introstage{width:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;}
.adk-intro-card{display:flex;flex-direction:column;align-items:center;min-height:62px;justify-content:center;}
.adk-intro-name{font-family:var(--theme-display);font-size:30px;letter-spacing:.04em;color:var(--ink);line-height:1.05;}
.adk-intro-title{font-family:var(--theme-display);font-size:14px;letter-spacing:.08em;color:var(--spot-red);margin-top:3px;}
.adk-fadeup{animation:adk-fadeup .28s ease-out both;}
@keyframes adk-fadeup{0%{opacity:0;transform:translateY(6px);}100%{opacity:1;transform:none;}}
.adk-hide{visibility:hidden;}
.adk-intro-chips{display:flex;align-items:center;gap:6px;flex-wrap:wrap;justify-content:center;}
.adk-chip-label{font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:var(--margin-ink);margin-right:2px;}
.adk-chip{font-family:var(--theme-display);font-size:11px;letter-spacing:.04em;border:1.5px solid var(--margin-ink);background:var(--paper);color:var(--ink-soft);padding:3px 9px;cursor:pointer;}
.adk-chip:hover{border-color:var(--ink);}
.adk-chip.on{border-color:var(--ink);background:var(--ink);color:var(--paper);}

/* Full-REL reward — the Unspoken payoff (staged fade-up bundle) */
.adk-rewardstage{width:100%;display:flex;flex-direction:column;align-items:flex-start;gap:7px;font-family:var(--theme-body);}
.adk-reward-eye{font-family:var(--theme-display);font-size:10px;letter-spacing:.18em;color:var(--spot-red);}
.adk-reward-name{font-family:var(--theme-display);font-size:19px;color:var(--ink);line-height:1.1;}
.adk-reward-row{font-size:12.5px;color:var(--ink);line-height:1.4;display:flex;align-items:baseline;}
.adk-reward-tag{font-family:var(--theme-display);font-size:9px;letter-spacing:.1em;border:1.5px solid var(--ink);padding:1px 5px;margin-right:7px;color:var(--ink);white-space:nowrap;}
.adk-reward-tag.legendary{border-color:#b8860b;color:#7a5c00;background:color-mix(in srgb,#b8860b 12%,transparent);}
.adk-reward-tag.mutual{border-color:var(--forest);color:var(--forest);}

/* Bottom bar — REL level-up progress */
.adk-relbar,.adk-statbar{width:100%;border:2px solid var(--ink);background:var(--paper-shade);padding:8px 12px;}
.adk-relrow{display:flex;justify-content:space-between;align-items:baseline;font-family:var(--theme-display);font-size:11px;
  letter-spacing:.06em;color:var(--ink);text-transform:uppercase;margin-bottom:5px;}
.adk-relrow b{color:var(--ink);}
.adk-tier{color:var(--forest);}
.adk-relfill{animation:adk-relfill .6s cubic-bezier(.22,1,.36,1) both;}
@keyframes adk-relfill{0%{width:0;}100%{width:62%;}}
.adk-relnext{font-family:var(--theme-display);font-size:8px;letter-spacing:.12em;color:var(--margin-ink);text-align:right;margin-top:4px;}

/* Bottom bar — floating stat gains (idea) */
.adk-statbar{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;}
.adk-statbar-left{font-family:var(--theme-display);font-size:11px;letter-spacing:.06em;color:var(--ink);text-transform:uppercase;}
.adk-statbar-stats{display:flex;gap:10px;}
.adk-stat{position:relative;font-family:var(--theme-display);font-size:11px;font-weight:700;letter-spacing:.06em;color:var(--forest);}
.adk-float{position:absolute;top:-4px;left:50%;transform:translateX(-50%);color:var(--spot-red);font-weight:700;font-size:12px;
  white-space:nowrap;animation:adk-rise 1s ease-out both;}
.adk-float-b{animation-delay:.18s;}
@keyframes adk-rise{0%{opacity:0;transform:translate(-50%,2px);}15%{opacity:1;}100%{opacity:0;transform:translate(-50%,-22px);}}

/* Battle minigame — entering-battle transition (REL bar → battle HUD) */
.adk-tbar{width:100%;border:2px solid var(--ink);background:var(--paper-shade);padding:8px 12px;
  animation:adk-toborder 1.6s both,adk-tshake .34s .56s both;}
@keyframes adk-toborder{0%,37%{border-color:var(--ink);background:var(--paper-shade);}
  58%,100%{border-color:var(--spot-red);background:color-mix(in srgb,var(--spot-red) 4%,transparent);}}
@keyframes adk-tshake{0%,100%{transform:translateX(0);}25%{transform:translateX(-3px);}50%{transform:translateX(3px);}75%{transform:translateX(-2px);}}
.adk-tbar-labels{position:relative;height:14px;margin-bottom:5px;}
.adk-tlayer{position:absolute;inset:0;display:flex;justify-content:space-between;align-items:baseline;
  font-family:var(--theme-display);font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--ink);}
.adk-tlayer b{color:var(--forest);}
.adk-tier{color:var(--forest);}
.adk-enemy{color:var(--spot-red);font-weight:700;}
.adk-hp{color:var(--forest);}
.adk-tlayer-rel{animation:adk-tfadeout 1.6s both;}
.adk-tlayer-battle{animation:adk-tfadein 1.6s both;}
@keyframes adk-tfadeout{0%,40%{opacity:1;}55%,100%{opacity:0;}}
@keyframes adk-tfadein{0%,45%{opacity:0;}60%,100%{opacity:1;}}
.adk-tbar-fill{height:100%;background:var(--spot-red);animation:adk-tofill 1.6s cubic-bezier(.22,1,.36,1) both;}
/* stats bar has no fill; the enemy HP bar grows in only on battle entry */
@keyframes adk-tofill{0%,52%{width:0;}100%{width:80%;}}
.adk-tbar-cap{position:relative;height:10px;margin-top:4px;}
.adk-cap{position:absolute;right:0;top:0;font-family:var(--theme-display);font-size:8px;letter-spacing:.12em;color:var(--margin-ink);}
.adk-cap-battle{color:var(--spot-red);}

/* Battle minigame — HUD bar (enemy HP) + battle round card */
.adk-battlebar{width:100%;border:2px solid var(--spot-red);background:color-mix(in srgb,var(--spot-red) 4%,transparent);padding:8px 12px;}
.adk-bb-row{display:flex;justify-content:space-between;align-items:baseline;font-family:var(--theme-display);font-size:11px;
  letter-spacing:.06em;color:var(--ink);text-transform:uppercase;margin-bottom:5px;}
.adk-bb-hero b{color:var(--forest);}
.adk-bb-enemy{color:var(--spot-red);font-weight:700;}
.adk-bb-track{border-color:var(--spot-red);}
.adk-bb-fill{height:100%;background:var(--spot-red);animation:adk-enemyhp .5s cubic-bezier(.22,1,.36,1) both;}
@keyframes adk-enemyhp{0%{width:80%;}100%{width:30%;}}
.adk-bb-hp{font-family:var(--theme-display);font-size:8px;letter-spacing:.12em;color:var(--spot-red);text-align:right;margin-top:4px;}

.adk-battle{width:100%;}
.adk-battle-head{font-family:var(--theme-display);font-size:11px;font-weight:700;letter-spacing:.1em;color:var(--spot-red);text-transform:uppercase;margin-bottom:8px;}
.adk-battle-head span{color:var(--margin-ink);font-size:9px;margin:0 4px;}
.adk-battle-prose{font-family:var(--theme-body);font-size:13px;line-height:1.45;color:var(--ink);margin-bottom:10px;}
.adk-battle-opts{display:flex;flex-direction:column;gap:6px;}
.adk-battle-opt{font-family:var(--theme-body);font-size:12px;color:var(--ink);border:1.5px solid var(--ink);background:var(--paper);
  padding:7px 10px;display:flex;justify-content:space-between;align-items:center;}
.adk-battle-chaos{border-color:var(--spot-red);}
.adk-battle-tag{font-family:var(--theme-display);font-size:9px;letter-spacing:.08em;color:var(--forest);}
.adk-battle-chaos .adk-battle-tag{color:var(--spot-red);}

/* DROPS — horizontal-scroll of reward cards (~2.5 visible, peek) */
.adk-drops{width:100%;}
.adk-drops-label{font-family:var(--theme-display);font-size:10px;letter-spacing:.22em;color:var(--forest);margin-bottom:6px;}
.adk-drops-row{display:flex;gap:8px;overflow-x:auto;padding-bottom:4px;}
.adk-drop{flex:0 0 auto;width:140px;border:2px solid var(--ink);background:var(--paper-shade);padding:8px 10px;
  font-family:var(--theme-display);font-size:12px;font-weight:700;letter-spacing:.04em;color:var(--ink);line-height:1.2;
  animation:adk-stampin .28s cubic-bezier(.34,1.56,.64,1) both;}
.adk-drop-rt{display:block;font-family:var(--theme-display);font-size:7px;font-weight:700;letter-spacing:.1em;margin-bottom:5px;}
.rt-relic{color:var(--spot-red);} .rt-keep{color:var(--forest);} .rt-mem{color:var(--margin-ink);}
.adk-d0{animation-delay:0s;border-color:var(--spot-red);border-width:2.5px;}
.adk-d1{animation-delay:.12s;border-color:var(--forest);}
.adk-d2{animation-delay:.24s;border-color:var(--margin-ink);border-width:1px;}
.adk-d3{animation-delay:.36s;border-color:var(--margin-ink);border-width:1px;}

/* Stat gains — inline pills */
.adk-pills{display:flex;gap:8px;flex-wrap:wrap;}
.adk-pill{font-family:var(--theme-display);font-size:10px;font-weight:700;letter-spacing:.1em;color:var(--forest);
  border:1px solid var(--forest);padding:3px 7px;}

/* Achievement rarity tiers — escalating border + color + glow */
.adk-rar-col{display:flex;flex-direction:column;gap:8px;width:100%;}
.adk-rar{font-family:var(--theme-body);font-size:12px;padding:8px 11px;border:1px solid var(--margin-ink);background:var(--paper);color:var(--ink);}
.adk-rar b{font-family:var(--theme-display);font-size:10px;letter-spacing:.1em;}
.adk-rar-common b{color:var(--margin-ink);}
.adk-rar-rare{border:1.5px solid var(--forest);} .adk-rar-rare b{color:var(--forest);}
.adk-rar-epic{border:2px solid var(--spot-red);} .adk-rar-epic b{color:var(--spot-red);}
.adk-rar-legend{border:2.5px solid var(--spot-red);background:color-mix(in srgb,var(--spot-red) 8%,transparent);box-shadow:0 0 0 2px color-mix(in srgb,var(--spot-red) 20%,transparent);}
.adk-rar-legend b{color:var(--spot-red);}

/* Toast slide-in */
@keyframes adk-slidein{0%{opacity:0;transform:translateY(110%);}100%{opacity:1;transform:translateY(0);}}
.adk-toast{border:2px solid var(--ink);background:var(--paper);padding:10px 14px;font-family:var(--theme-display);font-size:11px;letter-spacing:.1em;color:var(--spot-red);animation:adk-slidein .3s cubic-bezier(.22,1,.36,1) both;}
.adk-toast small{font-family:var(--theme-body);font-size:12px;color:var(--ink);letter-spacing:0;}

/* Growth bar fill */
@keyframes adk-fill{0%{width:0;}100%{width:78%;}}
.adk-bar{width:100%;height:16px;border:1.5px solid var(--ink);background:var(--paper);}
.adk-bar-fill{height:100%;background:var(--forest);animation:adk-fill .9s cubic-bezier(.22,1,.36,1) both;}

/* DOS bloom — green→cream */
@keyframes adk-bloom{0%{background:#00140a;color:#43ff8d;}100%{background:var(--paper);color:var(--ink);}}
.adk-bloom{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-family:ui-monospace,monospace;font-size:13px;animation:adk-bloom .45s ease both;animation-delay:.4s;background:#00140a;color:#43ff8d;}

/* Terminal cursor blink */
@keyframes adk-blink{0%,49%{opacity:1;}50%,100%{opacity:0;}}
.adk-term{font-family:ui-monospace,monospace;font-size:11px;color:var(--ink);text-align:center;}
.adk-cursor{animation:adk-blink 1.1s steps(1) infinite;color:var(--forest);}

.adk-instant{font-family:var(--theme-body);font-size:12px;color:var(--ink-soft);text-align:center;}

/* CG unlock — earned event-still: anticipation → hit → settle, per theme dialect */
.adk-cg{position:relative;width:100%;min-height:160px;display:flex;align-items:center;justify-content:center;overflow:hidden;}
.adk-cg-dim{position:absolute;inset:-14px;background:#000;opacity:0;pointer-events:none;animation:adk-cgdim .18s ease-in both;}
@keyframes adk-cgdim{to{opacity:.42;}}
.adk-cg-hit{position:absolute;inset:-14px;opacity:0;pointer-events:none;z-index:2;}
.adk-cg-vibrant .adk-cg-hit{background:#fff;animation:adk-cgflash .14s ease-out .18s both;}
@keyframes adk-cgflash{0%{opacity:0;}45%{opacity:.95;}100%{opacity:0;}}
.adk-cg-parchment .adk-cg-hit{background:var(--paper);animation:adk-cgbloom .5s ease-out .12s both;}
@keyframes adk-cgbloom{0%{opacity:0;}50%{opacity:.7;}100%{opacity:0;}}
.adk-cg-dos .adk-cg-hit{background:#43ff8d;animation:adk-cgwipe .16s steps(1,end) .12s both;}
@keyframes adk-cgwipe{0%{opacity:0;}50%{opacity:.55;}100%{opacity:0;}}
.adk-cg-mount{position:relative;z-index:1;}
.adk-cg-vibrant .adk-cg-mount{background:#fff;border:1px solid #e2e2e2;padding:7px 7px 0;box-shadow:0 8px 20px rgba(0,0,0,.28);animation:adk-cgvib .42s cubic-bezier(.34,1.56,.64,1) .3s both;}
@keyframes adk-cgvib{0%{opacity:0;transform:translateY(-24px) rotate(-5deg) scale(.9);}70%{opacity:1;transform:translateY(0) rotate(2.5deg) scale(1.02);}100%{transform:rotate(-1.5deg) scale(1);}}
.adk-cg-parchment .adk-cg-mount{background:var(--paper);border:2px solid var(--ink);padding:7px;animation:adk-cgparch .36s ease-out .28s both;}
@keyframes adk-cgparch{0%{opacity:0;transform:translateY(8px);}100%{opacity:1;transform:none;}}
.adk-cg-dos .adk-cg-mount{background:#00140a;border:1px solid #43ff8d;padding:7px;animation:adk-cgdos .12s steps(2,end) .28s both;}
@keyframes adk-cgdos{0%{opacity:0;}100%{opacity:1;}}
.adk-cg-reduced .adk-cg-mount{animation:none;opacity:1;transform:none;}
/* TEXT-FIRST: the CG "art" slot is the moment in PROSE, not a figure-blob photo */
.adk-cg-scene{position:relative;width:190px;min-height:72px;display:flex;align-items:center;justify-content:center;padding:14px 12px 16px;overflow:hidden;background:var(--paper);border-bottom:1px solid var(--ink);}
.adk-cg-parchment .adk-cg-scene{background:var(--paper);}
.adk-cg-vibrant .adk-cg-scene{background:#fafafa;border-bottom-color:#e2e2e2;}
.adk-cg-dos .adk-cg-scene{background:#00140a;border-bottom:1px dashed #2c6b45;}
.adk-cg-prose{font-family:var(--theme-body);font-size:12px;font-style:italic;color:var(--ink);line-height:1.4;text-align:center;}
.adk-cg-vibrant .adk-cg-prose{color:#333;}
.adk-cg-dos .adk-cg-prose{font-family:ui-monospace,monospace;font-style:normal;color:#43ff8d;}
.adk-cg-arttag{position:absolute;top:4px;right:5px;font-size:8px;letter-spacing:.04em;color:var(--margin-ink,#8a7d68);font-family:ui-monospace,monospace;}
.adk-cg-dos .adk-cg-arttag{color:#43ff8d;}
.adk-cg-parchment .adk-cg-arttag{color:rgba(40,30,20,.5);}
.adk-cg-meta{padding:6px 4px 7px;max-width:190px;}
.adk-cg-title{font-family:var(--theme-display);font-size:15px;letter-spacing:.04em;color:var(--ink);line-height:1.1;}
.adk-cg-cap{font-family:var(--theme-body);font-size:11px;color:var(--ink-soft);line-height:1.35;margin-top:2px;}
.adk-cg-vibrant .adk-cg-title{color:#1a1a1a;}
.adk-cg-vibrant .adk-cg-cap{color:#555;font-style:italic;}
.adk-cg-dos .adk-cg-title,.adk-cg-dos .adk-cg-cap{color:#43ff8d;font-family:ui-monospace,monospace;}
.adk-cg-dos .adk-cg-title{font-size:13px;}

/* ── The VACATED FRAME — RECESSION grammar, TEXT-FIRST (the coach's LINE recedes) ── */
.adk-vf{display:flex;flex-direction:column;align-items:center;gap:6px;}
.adk-vf-frame{position:relative;width:230px;padding:14px 14px 18px;overflow:hidden;background:var(--paper-shade,#efe7d6);border:2px solid var(--ink);}
.adk-vf-dos .adk-vf-frame{background:#00140a;border:1px solid #43ff8d;}
/* the warm glow rises into the kept space — LIGHTING, not a blob (offset, easeOut) */
.adk-vf-warm{position:absolute;inset:0;opacity:0;pointer-events:none;background:radial-gradient(150px 100px at 50% 70%,rgba(255,196,120,.5),rgba(255,170,90,.1) 55%,transparent 78%);animation:adk-vf-warmth 1000ms ease-out 500ms both;}
.adk-vf-vibrant .adk-vf-warm{background:radial-gradient(160px 110px at 50% 70%,rgba(255,205,130,.66),rgba(255,150,70,.16) 55%,transparent 80%);}
.adk-vf-dos .adk-vf-warm{background:none;}
@keyframes adk-vf-warmth{0%{opacity:0;}100%{opacity:.85;}}
/* the COACH'S LINE recedes — easeIn, reluctant, no overshoot (the opposite of juice) */
.adk-vf-coachline{position:relative;z-index:1;font-family:var(--theme-body);font-size:14px;color:var(--ink);line-height:1.4;animation:adk-vf-recede 1200ms cubic-bezier(.4,0,1,1) both;}
.adk-vf-dos .adk-vf-coachline{font-family:ui-monospace,monospace;color:#43ff8d;}
@keyframes adk-vf-recede{0%{opacity:1;transform:none;}100%{opacity:0;transform:translateY(-6px);}}
/* the KEPT-SPACE line remains — fades in offset (easeOut) as the coach leaves */
.adk-vf-keptline{position:relative;z-index:1;font-family:var(--theme-body);font-style:italic;font-size:14px;color:var(--ink);line-height:1.4;margin-top:5px;animation:adk-vf-keep 900ms ease-out 600ms both;}
.adk-vf-dos .adk-vf-keptline{font-family:ui-monospace,monospace;color:#43ff8d;font-style:normal;}
@keyframes adk-vf-keep{0%{opacity:.25;}100%{opacity:1;}}
.adk-vf-tag{position:absolute;top:5px;right:7px;z-index:1;font-size:8px;letter-spacing:.04em;color:var(--margin-ink,#8a7d68);font-family:ui-monospace,monospace;}
.adk-vf-dos .adk-vf-tag{color:#43ff8d;}
.adk-vf-cap{font-family:var(--theme-body);font-size:11px;color:var(--ink-soft);font-style:italic;line-height:1.35;max-width:230px;text-align:center;}
.adk-vf-audio{font-family:ui-monospace,monospace;font-size:9px;color:var(--margin-ink,#8a7d68);opacity:.85;max-width:230px;text-align:center;line-height:1.3;}
/* reduced-motion: END-STATE, never a blank cut — coach-line gone, kept-line + warmth present */
.adk-vf-reduced .adk-vf-coachline{animation:none;opacity:0;transform:translateY(-6px);}
.adk-vf-reduced .adk-vf-keptline{animation:none;opacity:1;}
.adk-vf-reduced .adk-vf-warm{animation:none;opacity:.85;}

/* ── The LIVING MAP — arrival / Spatial Decay / Dynamic Legend ── */
.adk-lm{display:flex;flex-direction:column;align-items:center;gap:7px;}
.adk-lm-cell{font-family:ui-monospace,monospace;font-size:12px;line-height:1.25;color:var(--ink);white-space:pre;}
.adk-lm-row{}
.adk-lm-glyph{color:var(--forest,#2d4a2b);font-weight:700;}
.adk-lm-legend{font-family:ui-monospace,monospace;font-size:11px;color:var(--ink-soft);display:flex;gap:5px;align-items:baseline;}
.adk-lm-glyph2{color:var(--forest,#2d4a2b);font-weight:700;}
/* ARRIVE — the cell brightens from dim/grey (Static Horizon) to active (easeOut, wayfinding) */
.adk-lm-arrive .adk-lm-cell{animation:adk-lm-arrive 700ms ease-out both;}
.adk-lm-arrive .adk-lm-glyph{animation:adk-lm-yah 700ms ease-out both;}
@keyframes adk-lm-arrive{0%{opacity:.35;filter:grayscale(1);}100%{opacity:1;filter:grayscale(0);}}
@keyframes adk-lm-yah{0%{color:var(--ink-soft);}100%{color:var(--forest,#2d4a2b);}}
.adk-lm-arrive.adk-lm-reduced .adk-lm-cell{animation:none;opacity:1;filter:none;}
.adk-lm-arrive.adk-lm-reduced .adk-lm-glyph{animation:none;color:var(--forest,#2d4a2b);}
/* DECAY — RECESSION: the glyph + cell recede toward the open tiles (easeIn) */
.adk-lm-decay .adk-lm-glyph{animation:adk-lm-recede 1000ms cubic-bezier(.4,0,1,1) both;}
.adk-lm-decay .adk-lm-cell{animation:adk-lm-dim 1000ms cubic-bezier(.4,0,1,1) both;}
@keyframes adk-lm-recede{0%{opacity:1;color:var(--forest,#2d4a2b);}100%{opacity:.28;color:var(--ink-soft);}}
@keyframes adk-lm-dim{0%{opacity:1;}100%{opacity:.6;}}
.adk-lm-decay.adk-lm-reduced .adk-lm-glyph{animation:none;opacity:.28;color:var(--ink-soft);}
.adk-lm-decay.adk-lm-reduced .adk-lm-cell{animation:none;opacity:.6;}
/* LEGEND — in-place cross-fade of the label (hers → yours) */
.adk-lm-lbl{position:relative;display:inline-block;min-width:15em;}
.adk-lm-lbl-old,.adk-lm-lbl-new{position:absolute;left:0;top:0;white-space:nowrap;}
.adk-lm-lbl-old{animation:adk-lm-lblout 600ms ease both;}
.adk-lm-lbl-new{animation:adk-lm-lblin 600ms ease both;}
@keyframes adk-lm-lblout{0%,35%{opacity:1;}60%,100%{opacity:0;}}
@keyframes adk-lm-lblin{0%,45%{opacity:0;}70%,100%{opacity:1;}}
.adk-lm-legend.adk-lm-reduced .adk-lm-lbl-old,.adk-lm-reduced .adk-lm-lbl-old{animation:none;opacity:0;}
.adk-lm-reduced .adk-lm-lbl-new{animation:none;opacity:1;}

/* ── The SCRAPBOOK (Wren) — a heap of TEXT discards settles into ordered rows ── */
.adk-sb{display:flex;flex-direction:column;gap:6px;width:250px;}
.adk-sb-head{font-family:var(--theme-display);font-size:12px;letter-spacing:.06em;color:var(--ink);text-transform:uppercase;}
.adk-sb-list{list-style:none;margin:0;padding:8px 10px;border:1px solid var(--ink);background:var(--paper-shade,#efe7d6);display:flex;flex-direction:column;gap:5px;}
.adk-sb-item{font-family:var(--theme-body);font-size:12px;color:var(--ink);line-height:1.3;opacity:0;transform:translateX(calc((var(--sb-i) - 2) * 18px)) translateY(-6px) rotate(calc((var(--sb-i) - 2) * 2deg));animation:adk-sb-settle 420ms ease-out both;animation-delay:calc(var(--sb-i) * 120ms);}
.adk-sb-mark{color:var(--forest,#2d4a2b);}
@keyframes adk-sb-settle{to{opacity:1;transform:translateX(0) translateY(0) rotate(0);}}
.adk-sb-reduced .adk-sb-item{animation:none;opacity:1;transform:none;}
.adk-sb-foot{font-family:var(--theme-body);font-style:italic;font-size:11px;color:var(--ink-soft);}

/* Stat polygon — "your shape" breathes to the new vertices */
.adk-poly{position:relative;width:120px;height:140px;}
.adk-poly svg{display:block;}
.adk-poly-ring{fill:none;stroke:var(--margin-ink);stroke-width:.8;opacity:.4;}
.adk-poly-ghost{fill:none;stroke:var(--ink-soft);stroke-width:1.2;stroke-dasharray:3 3;opacity:.7;}
.adk-poly-fill{fill:color-mix(in srgb,var(--forest) 28%,transparent);stroke:var(--forest);stroke-width:2;stroke-linejoin:round;transform-box:fill-box;transform-origin:center;}
.adk-poly-vibrant .adk-poly-fill{animation:adk-polygrow .55s cubic-bezier(.34,1.56,.64,1) both;}
.adk-poly-parchment .adk-poly-fill{animation:adk-polygrow .48s cubic-bezier(.22,1,.36,1) both;}
@keyframes adk-polygrow{0%{transform:scale(.5);opacity:.35;}100%{transform:scale(1);opacity:1;}}
.adk-poly-axes{position:absolute;inset:0;pointer-events:none;}
.adk-poly-axes span{position:absolute;font-family:var(--theme-display);font-size:9px;letter-spacing:.06em;color:var(--ink-soft);}
.adk-poly-axes span:nth-child(1){top:-1px;left:50%;transform:translateX(-50%);}
.adk-poly-axes span:nth-child(2){top:52px;right:-3px;}
.adk-poly-axes span:nth-child(3){top:114px;left:50%;transform:translateX(-50%);}
.adk-poly-axes span:nth-child(4){top:52px;left:-3px;}

/* Vital reveal — SILENT whisper (??? cross-fades to value; opacity only) */
.adk-vrow{display:flex;justify-content:space-between;align-items:center;gap:12px;width:240px;border:1px solid var(--margin-ink);background:var(--paper-shade);padding:10px 12px;}
.adk-vlabel{font-family:var(--theme-display);font-size:11px;letter-spacing:.1em;color:var(--margin-ink);}
.adk-vslot{position:relative;flex:1;min-height:17px;font-family:var(--theme-body);font-size:13px;}
.adk-vslot>span{position:absolute;right:0;top:0;white-space:nowrap;}
.adk-vital-q{color:var(--margin-ink);font-style:italic;animation:adk-vqout .15s ease .35s both;}
@keyframes adk-vqout{to{opacity:0;}}
.adk-vital-v{color:var(--ink);opacity:0;animation:adk-vvin .15s ease .5s both;}
@keyframes adk-vvin{from{opacity:0;}to{opacity:1;}}

/* "You see" perception line — gentle fade-up under the scenario */
.adk-ys{width:250px;font-family:var(--theme-body);}
.adk-ys-scene{font-size:13px;color:var(--ink);line-height:1.5;}
.adk-ys-line{font-size:12px;font-style:italic;color:var(--ink-soft);line-height:1.45;margin-top:10px;animation:adk-ysin .42s ease-out .25s both;}
@keyframes adk-ysin{0%{opacity:0;transform:translateY(5px);}100%{opacity:1;transform:none;}}

/* Scene heartbeat (BPM) — lub-dub pulse, threshold-gated (only extremes pulse) */
.adk-hb{display:flex;gap:30px;align-items:flex-start;justify-content:center;}
.adk-hb-node{display:flex;flex-direction:column;align-items:center;gap:6px;}
.adk-hb-dot{width:34px;height:34px;border-radius:50%;background:var(--spot-red);opacity:.5;display:block;}
.adk-hb-beat{animation:adk-beat var(--hb-dur,1s) ease-in-out infinite;}
@keyframes adk-beat{0%,52%,100%{transform:scale(1);opacity:.5;}12%{transform:scale(1.42);opacity:.95;}24%{transform:scale(1.06);opacity:.66;}34%{transform:scale(1.2);opacity:.85;}}
.adk-hb-label{font-family:var(--theme-display);font-size:10px;letter-spacing:.1em;color:var(--ink);text-transform:uppercase;}
.adk-hb-bpm{font-family:ui-monospace,monospace;font-size:10px;color:var(--margin-ink);}
/* Dialogue paced by BPM — the heartbeat conducts the reveal */
.adk-bpmline{display:flex;align-items:center;gap:11px;width:100%;}
.adk-hb-sm{width:16px;height:16px;flex:none;}
.adk-bpmline-txt{font-family:var(--theme-body);font-size:14px;color:var(--ink);line-height:1.5;}

/* The trichotomy choice — the core beat (cross-campaign-mechanics.md §A.1) */
.adk-choice{display:flex;flex-direction:column;gap:9px;padding:12px 6px;}
.adk-choice-prompt{font-style:italic;color:var(--ink-soft);font-size:14px;line-height:1.5;}
.adk-choice-opts{display:flex;flex-direction:column;gap:6px;}
.adk-choice-opt{display:flex;align-items:baseline;gap:10px;border:2px solid var(--ink-soft);padding:7px 11px;background:var(--paper);transition:opacity .3s ease,border-color .3s ease,transform .3s ease,background .3s ease;}
.adk-choice-in .adk-choice-opt{animation:adk-fadeup .3s ease-out both;}
.adk-choice-in .adk-choice-opt:nth-child(2){animation-delay:.12s;}
.adk-choice-in .adk-choice-opt:nth-child(3){animation-delay:.24s;}
.adk-choice-role{font-family:var(--theme-display);font-size:10px;letter-spacing:.13em;text-transform:uppercase;color:var(--margin-ink);min-width:62px;flex:none;}
.adk-choice-chaotic .adk-choice-role{color:var(--spot-red);}
.adk-choice-label{font-family:var(--theme-body);font-size:14px;color:var(--ink);line-height:1.4;}
.adk-choice-die{white-space:nowrap;}
.adk-choice-dim{opacity:.32;}
.adk-choice-picked{border-color:var(--spot-red);background:var(--paper-shade);transform:translateX(3px);}
.adk-choice-react{position:relative;margin-top:2px;border-left:3px solid var(--spot-red);background:var(--paper-shade);padding:8px 36px 8px 11px;font-size:13px;line-height:1.5;color:var(--ink);}
.adk-choice-float{position:absolute;right:11px;top:7px;color:var(--spot-red);font-family:var(--theme-display);font-size:13px;letter-spacing:.04em;}

/* Jump-to-section nav (floating button + panel, scroll-spy) */
.adk-section{scroll-margin-top:16px;}
.adk-jump-fab{position:fixed;right:16px;bottom:16px;z-index:50;display:flex;align-items:center;gap:8px;max-width:62vw;padding:9px 13px;border:2px solid var(--ink);border-radius:24px;background:var(--forest);color:var(--paper);font-family:var(--theme-body);font-size:12.5px;font-weight:700;cursor:pointer;box-shadow:3px 3px 0 rgba(0,0,0,.2);}
.adk-jump-fab:hover{filter:brightness(1.08);}
.adk-jump-fab-i{font-size:14px;line-height:1;}
.adk-jump-fab-l{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:44vw;}
.adk-jump-scrim{position:fixed;inset:0;z-index:49;background:rgba(0,0,0,.28);}
.adk-jump-panel{position:fixed;right:16px;bottom:64px;z-index:51;width:min(340px,86vw);max-height:70vh;overflow:auto;border:2px solid var(--ink);background:var(--paper);box-shadow:4px 4px 0 rgba(0,0,0,.22);padding:6px 0 8px;}
.adk-jump-hd{font-family:var(--theme-display);font-size:10px;letter-spacing:.16em;color:var(--spot-red);padding:8px 14px;border-bottom:1px solid var(--ink-soft);position:sticky;top:0;background:var(--paper);}
.adk-jump-link{display:flex;gap:9px;align-items:baseline;padding:7px 14px;font-family:var(--theme-body);font-size:13px;color:var(--ink);text-decoration:none;line-height:1.35;}
.adk-jump-link:hover{background:var(--paper-shade);}
.adk-jump-on{background:var(--paper-shade);color:var(--forest);font-weight:700;box-shadow:inset 3px 0 0 var(--spot-red);}
.adk-jump-n{flex:none;font-family:var(--theme-display);font-size:10px;color:var(--margin-ink);min-width:16px;}

@media (prefers-reduced-motion: reduce){
  .adk-choice-opt,.adk-choice-react,
  .adk-stamp,.adk-toast,.adk-bar-fill,.adk-bloom,.adk-float,.adk-drop,.adk-relfill,.adk-popword,.adk-whisperword,
  .adk-bb-fill,.adk-tbar,.adk-tlayer-rel,.adk-tlayer-battle,.adk-tbar-fill,.adk-modal-fade,.adk-modal-slide,.adk-cg-mount,
  .adk-poly-fill,.adk-vital-q,.adk-vital-v,.adk-ys-line{animation-duration:.001s;}
  .adk-cursor,.adk-shoutchar,.adk-hb-beat{animation:none;}
  .adk-cg-dim,.adk-cg-hit{display:none;} /* no flash / no dim under reduced-motion (a11y) */
}
`;
