"use client";

// Animation sandbox — web prototypes of the game's motion. Tweak here (fast
// iteration), then translate the curve + duration to Flutter. Each card lists
// the spec so the port is mechanical. Uses the site theme tokens, so the
// theme picker re-skins these too.
//
// Organized by the MECHANIC / SCREEN the motion belongs to, so a given surface
// (bottom bar, narration, the post-action result) collects all its candidate
// treatments in one place.

import { useEffect, useState } from "react";

function prefersReduced(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function Demo({ title, spec, flutter, children }: {
  title: string; spec: string; flutter: string; children: React.ReactNode;
}) {
  const [k, setK] = useState(0);
  return (
    <div className="adk-card">
      <div className="adk-head">
        <b>{title}</b>
        <button className="adk-replay" onClick={() => setK((x) => x + 1)}>▶ replay</button>
      </div>
      <div className="adk-stage" key={k}>{children}</div>
      <div className="adk-spec">{spec}</div>
      <div className="adk-flutter">Flutter: {flutter}</div>
    </div>
  );
}

function Section({ title, note, children }: {
  title: string; note?: string; children: React.ReactNode;
}) {
  return (
    <section className="adk-section">
      <h2 className="adk-sec-title">{title}</h2>
      {note && <p className="adk-sec-note">{note}</p>}
      <div className="adk-grid">{children}</div>
    </section>
  );
}

// ── Themed text reveals ────────────────────────────────────────────────────

// DOS: a terminal types the line out, character by character, cursor trailing.
function Typewriter({ text }: { text: string }) {
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

// Vibrant — dialog emotion drives the motion. The line carries an emphasis
// tag (say / shout / whisper); the theme maps each to a different reveal.

// SAY (normal): words pop in one at a time, properly spaced. CSS stagger via
// per-word animation-delay, so a Demo replay (remount) restarts it cleanly.
function WordPop({ text }: { text: string }) {
  const words = text.split(" ");
  return (
    <span className="adk-vibrant">
      {words.map((w, i) => (
        <span key={i} className="adk-popword" style={{ animationDelay: `${i * 0.08}s` }}>{w}</span>
      ))}
    </span>
  );
}

// SHOUT: letter-by-letter — each glyph jitters continuously (a character
// raising their voice). Spaces preserved so words don't stick.
function ShoutText({ text }: { text: string }) {
  const chars = [...text];
  return (
    <span className="adk-shout">
      {chars.map((ch, i) =>
        ch === " "
          ? <span key={i} className="adk-sp">&nbsp;</span>
          : <span key={i} className="adk-shoutchar" style={{ animationDelay: `${(i % 6) * 0.04}s` }}>{ch}</span>
      )}
    </span>
  );
}

// WHISPER: words drift in softly, slow + faded + italic (an aside).
function Whisper({ text }: { text: string }) {
  const words = text.split(" ");
  return (
    <span className="adk-whisper">
      {words.map((w, i) => (
        <span key={i} className="adk-whisperword" style={{ animationDelay: `${i * 0.11}s` }}>{w}</span>
      ))}
    </span>
  );
}

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
function TitleUnlock() {
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
        <div className="adk-stamp-title">&ldquo;the Monk&rdquo;</div>
      </div>
      <div className="adk-intro-chips adk-fadeup" style={{ marginTop: 8 }}>
        <span className="adk-chip-label">switch to it, or stay on</span>
        <button className="adk-chip on">Just Hana</button>
      </div>
    </div>
  );
}

// The Unspoken payoff — the full-REL reward STACK revealed as a staged bundle
// (story-engine §2): intimate title + Passive + legendary keepsake + mutual mode.
// Bigger than a title pop. Shown for the Reader (title-only — still nameless).
function FullRelReward() {
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
      {s >= 1 && <div className="adk-reward-name adk-fadeup">the Reader &rarr; <i>the Tell</i></div>}
      {s >= 2 && <div className="adk-reward-row adk-fadeup"><span className="adk-reward-tag">PASSIVE</span>+1 to the read — in everyone&apos;s scenarios now</div>}
      {s >= 3 && <div className="adk-reward-row adk-fadeup"><span className="adk-reward-tag legendary">LEGENDARY</span>keepsake: <i>the Last Clean Read</i></div>}
      {s >= 4 && <div className="adk-reward-row adk-fadeup"><span className="adk-reward-tag mutual">MUTUAL</span>she vouches for you now</div>}
    </div>
  );
}

// ── CG unlock — the earned event-still (the HEADLINE reveal) ────────────────
// 3-phase: anticipation (SHORT) → hit (theme dialect) → settle (the campaign's CG
// artifact eases in + HOLDS). The "polaroid" is the VIBRANT skin; the artifact is
// per-campaign (Campaign.cgFrame: polaroid | framed-card | terminal-plate). This
// is a DETERMINISTIC, earned reward — NOT a gacha pull: short anticipation, a
// SINGLE flash, no "pull again". Reduced-motion → instant, no flash (a11y).
// Spec: docs/design/animation-delights.md.
function CGReveal({ dialect, forceReduced = false }: {
  dialect: "vibrant" | "parchment" | "dos"; forceReduced?: boolean;
}) {
  const reduced = forceReduced || prefersReduced();
  // Title in the campaign motif voice (the Corner = terse coach-talk); the
  // caption is the achievement blurb.
  const title = dialect === "dos" ? "BEAT THE COUNT" : "Beat the Count";
  const caption = "You moved on a real one before the count-in.";
  return (
    <div className={`adk-cg adk-cg-${dialect}${reduced ? " adk-cg-reduced" : ""}`}>
      {!reduced && <div className="adk-cg-dim" />}
      {!reduced && <div className="adk-cg-hit" />}
      <div className="adk-cg-card">
        <div className="adk-cg-art">
          <span className="adk-cg-fig adk-cg-coach" />
          {/* the MC, back-turned = drawn but face-OBSCURED (canon stays faceless) */}
          <span className="adk-cg-fig adk-cg-mc" />
          <span className="adk-cg-arttag">CG · MC face-obscured</span>
        </div>
        <div className="adk-cg-meta">
          <div className="adk-cg-title">{title}</div>
          <div className="adk-cg-cap">{caption}</div>
        </div>
      </div>
    </div>
  );
}

// ── Stat polygon — "your shape" grows/breathes to the new vertices ──────────
// The genre-feel core (Persona/FF stat chart). The dashed ghost = yesterday; the
// filled shape breathes out to today. Lab approximates the per-vertex tween with
// a scale-breathe + the curve; the Flutter StatPolygon tweens each axis value.
function PolyGrowth({ dialect }: { dialect: "vibrant" | "parchment" }) {
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
  return (
    <div className="adk-vrow">
      <span className="adk-vlabel">HAIR</span>
      <span className="adk-vslot">
        <span className="adk-vital-q">???</span>
        <span className="adk-vital-v">Amber</span>
      </span>
    </div>
  );
}

// ── "You see" perception line — gentle entrance under the scenario ───────────
// Whisper-tier (NOT a headline): the italic line drifts/fades in below the prose.
// Theme variants: Parchment fade (still) · Vibrant soft drift · DOS type-on.
function YouSee() {
  return (
    <div className="adk-ys">
      <div className="adk-ys-scene">She doesn&apos;t narrate the walk this morning. Just walks.</div>
      <div className="adk-ys-line">You catch her watching the gate instead of you — dark eyes already on the door.</div>
    </div>
  );
}

export default function AnimationGallery() {
  return (
    <>
      <style>{CSS}</style>

      <Section
        title="CG unlock — the earned moment  ★NEW (headline)"
        note="A peak beat earns a full event-still (the achievement blurb captions it). 3 phases — anticipation (SHORT) → hit → settle (the campaign's CG card eases in + HOLDS). The 'polaroid' is the Vibrant skin; the artifact is per-campaign (Campaign.cgFrame). DETERMINISTIC + earned — NOT a gacha pull (no drumroll, no 'again'). One flash max (WCAG 2.3.1); reduced-motion skips it. Spec: docs/design/animation-delights.md."
      >
        <Demo
          title="Vibrant Realm — flash → polaroid"
          spec="dim 180ms easeIn → SINGLE white flash 140ms easeOut → polaroid drop+tilt+settle 420ms easeOutBack (delay .3s)"
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
        title="Text &amp; narration — themed"
        note="Text reveal is part of a theme's personality, and a line's EMPHASIS (say / shout / whisper) drives it. The theme maps emphasis its own way: DOS types everything; Parchment & Ink stays still and leans on bold/italic; Vibrant Realm animates by emotion."
      >
        <Demo
          title="DOS-era — monospace, instant + ASCII"
          spec="NO motion — a terminal prints at once. Monospace; personality comes from ASCII art (frames/banners), not animation"
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
          title="Parchment &amp; Ink — instant, bold/italic"
          spec="NO motion — serious world. Emphasis is typographic: shout → bold, aside → italic. Appears at once"
          flutter="ThemePack.textReveal = instant → plain Text; emphasis maps to FontWeight.bold / FontStyle.italic"
        >
          <div className="adk-textstage">
            <span className="adk-ink-text">She didn’t raise her voice. <b>Sit down.</b> <i>(she’d only say it once.)</i></span>
          </div>
        </Demo>

        <Demo
          title="Vibrant Realm — SAY (word pop)"
          spec="words pop in one at a time, spaced (no sticking); bouncy easeOutBack ~340ms, ~80ms stagger"
          flutter="emphasis=say → per-word AnimationController, pop-in (translateY+scale)"
        >
          <div className="adk-textstage"><WordPop text="Same drill. Show me what you’ve got." /></div>
        </Demo>

        <Demo
          title="Vibrant Realm — SHOUT (letter shake)"
          spec="letter-by-letter — each glyph jitters continuously; bold + spot-red. A character raising their voice"
          flutter="emphasis=shout → per-glyph shake (continuous), bold weight, accent color"
        >
          <div className="adk-textstage"><ShoutText text="DROP AND GIVE ME TWENTY!" /></div>
        </Demo>

        <Demo
          title="Vibrant Realm — WHISPER (soft drift)"
          spec="words drift in slow + faded + italic; an aside under the breath"
          flutter="emphasis=whisper → per-word slow fade, italic, ink-soft color"
        >
          <div className="adk-textstage"><Whisper text="(you actually did it.)" /></div>
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
            <div className="adk-stamp-title">The One Sam Framed</div>
          </div>
        </Demo>

        <Demo
          title="Achievement rarity tiers  ★NEW"
          spec="escalating border + color + star + glow (COMMON/RARE/EPIC/LEGENDARY)"
          flutter="Achievement.rarity → achievements_screen row treatment (built)"
        >
          <div className="adk-rar-col">
            <div className="adk-rar adk-rar-common"><b>▸ COMMON</b> · The One Where You Showed Up</div>
            <div className="adk-rar adk-rar-rare"><b>★ RARE</b> · The One Sam Framed</div>
            <div className="adk-rar adk-rar-epic"><b>★ EPIC</b> · The One Who Witnessed the Audit</div>
            <div className="adk-rar adk-rar-legend"><b>★ LEGENDARY</b> · The One Where the Door Opened</div>
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
    </>
  );
}

const CSS = `
.adk-section{margin-bottom:34px;}
.adk-sec-title{font-family:var(--theme-display);font-size:15px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink);
  border-bottom:2px solid var(--ink);padding-bottom:6px;margin:0 0 4px;}
.adk-sec-note{font-size:12px;color:var(--ink-soft);margin:0 0 14px;max-width:60ch;line-height:1.5;}
.adk-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:18px;}
.adk-card{border:2px solid var(--ink);background:var(--paper-shade);}
.adk-head{display:flex;justify-content:space-between;align-items:center;padding:8px 12px;border-bottom:1.5px solid var(--ink);}
.adk-head b{font-family:var(--theme-display);font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:var(--ink);}
.adk-replay{font-size:11px;border:1px solid var(--margin-ink);background:var(--paper);color:var(--ink-soft);padding:3px 8px;cursor:pointer;}
.adk-replay:hover{border-color:var(--ink);}
.adk-stage{min-height:120px;display:flex;align-items:center;justify-content:center;overflow:hidden;padding:14px;background:var(--paper);}
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
.adk-cg-card{position:relative;z-index:1;}
.adk-cg-vibrant .adk-cg-card{background:#fff;border:1px solid #e2e2e2;padding:7px 7px 0;box-shadow:0 8px 20px rgba(0,0,0,.28);animation:adk-cgvib .42s cubic-bezier(.34,1.56,.64,1) .3s both;}
@keyframes adk-cgvib{0%{opacity:0;transform:translateY(-24px) rotate(-5deg) scale(.9);}70%{opacity:1;transform:translateY(0) rotate(2.5deg) scale(1.02);}100%{transform:rotate(-1.5deg) scale(1);}}
.adk-cg-parchment .adk-cg-card{background:var(--paper);border:2px solid var(--ink);padding:7px;animation:adk-cgparch .36s ease-out .28s both;}
@keyframes adk-cgparch{0%{opacity:0;transform:translateY(8px);}100%{opacity:1;transform:none;}}
.adk-cg-dos .adk-cg-card{background:#00140a;border:1px solid #43ff8d;padding:7px;animation:adk-cgdos .12s steps(2,end) .28s both;}
@keyframes adk-cgdos{0%{opacity:0;}100%{opacity:1;}}
.adk-cg-reduced .adk-cg-card{animation:none;opacity:1;transform:none;}
.adk-cg-art{position:relative;width:190px;height:92px;overflow:hidden;background:linear-gradient(160deg,#3a4a52,#1d2630);}
.adk-cg-parchment .adk-cg-art{background:linear-gradient(160deg,#d8cfba,#bcae90);}
.adk-cg-dos .adk-cg-art{background:#00140a;border:1px dashed #2c6b45;}
.adk-cg-fig{position:absolute;bottom:-10px;border-radius:50% 50% 45% 45%;}
.adk-cg-coach{left:46%;width:46px;height:60px;background:rgba(255,255,255,.22);}
.adk-cg-mc{left:14%;width:52px;height:66px;background:rgba(0,0,0,.5);}
.adk-cg-dos .adk-cg-coach{background:rgba(67,255,141,.3);}
.adk-cg-dos .adk-cg-mc{background:rgba(67,255,141,.6);}
.adk-cg-arttag{position:absolute;top:4px;right:5px;font-size:8px;letter-spacing:.04em;color:rgba(255,255,255,.6);font-family:ui-monospace,monospace;}
.adk-cg-dos .adk-cg-arttag{color:#43ff8d;}
.adk-cg-parchment .adk-cg-arttag{color:rgba(40,30,20,.5);}
.adk-cg-meta{padding:6px 4px 7px;max-width:190px;}
.adk-cg-title{font-family:var(--theme-display);font-size:15px;letter-spacing:.04em;color:var(--ink);line-height:1.1;}
.adk-cg-cap{font-family:var(--theme-body);font-size:11px;color:var(--ink-soft);line-height:1.35;margin-top:2px;}
.adk-cg-vibrant .adk-cg-title{color:#1a1a1a;}
.adk-cg-vibrant .adk-cg-cap{color:#555;font-style:italic;}
.adk-cg-dos .adk-cg-title,.adk-cg-dos .adk-cg-cap{color:#43ff8d;font-family:ui-monospace,monospace;}
.adk-cg-dos .adk-cg-title{font-size:13px;}

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

@media (prefers-reduced-motion: reduce){
  .adk-stamp,.adk-toast,.adk-bar-fill,.adk-bloom,.adk-float,.adk-drop,.adk-relfill,.adk-popword,.adk-whisperword,
  .adk-bb-fill,.adk-tbar,.adk-tlayer-rel,.adk-tlayer-battle,.adk-tbar-fill,.adk-modal-fade,.adk-modal-slide,.adk-cg-card,
  .adk-poly-fill,.adk-vital-q,.adk-vital-v,.adk-ys-line{animation-duration:.001s;}
  .adk-cursor,.adk-shoutchar{animation:none;}
  .adk-cg-dim,.adk-cg-hit{display:none;} /* no flash / no dim under reduced-motion (a11y) */
}
`;
