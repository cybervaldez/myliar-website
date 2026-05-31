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

// Vibrant: words pop in one at a time, each shaking as it lands (dating-sim
// dialogue energy).
function ShakyReveal({ text }: { text: string }) {
  const words = text.split(" ");
  const [n, setN] = useState(0);
  useEffect(() => {
    if (prefersReduced()) { setN(words.length); return; }
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setN(i);
      if (i >= words.length) clearInterval(id);
    }, 130);
    return () => clearInterval(id);
  }, [text, words.length]);
  return (
    <span className="adk-shaky-wrap">
      {words.map((w, idx) => (
        <span
          key={idx}
          className="adk-shaky-word"
          style={{ visibility: idx < n ? "visible" : "hidden" }}
        >
          {w}{" "}
        </span>
      ))}
    </span>
  );
}

const SAMPLE = "Hana drops the clipboard on the bench. “Same drill. Show me.”";

export default function AnimationGallery() {
  return (
    <>
      <style>{CSS}</style>

      <Section
        title="Text &amp; narration — themed"
        note="Text reveal is part of a theme's personality. The theme pack carries a reveal mode; the narration widget reads it. Same line, three voices."
      >
        <Demo
          title="DOS-era — typewriter + cursor"
          spec="type char-by-char ~40ms/char, blinking ▌ cursor trails; the boot/terminal world"
          flutter="ThemePack.textReveal = typewriter → AnimatedText types via Timer + _Cursor"
        >
          <div className="adk-textstage adk-dos-stage"><Typewriter text="> YOU ARE STANDING IN FRONT OF A HOUSE." /></div>
        </Demo>

        <Demo
          title="Parchment &amp; Ink — instant"
          spec="NO animation — text appears at once. The serious/default world; reveal motion would cheapen it"
          flutter="ThemePack.textReveal = instant → plain Text, no controller"
        >
          <div className="adk-textstage"><span className="adk-ink-text">{SAMPLE}</span></div>
        </Demo>

        <Demo
          title="Vibrant Realm — shaky words"
          spec="words pop in one at a time (~130ms), each shakes as it lands (dating-sim dialogue energy)"
          flutter="ThemePack.textReveal = shaky → per-word AnimationController, shake-in tween"
        >
          <div className="adk-textstage"><ShakyReveal text={SAMPLE} /></div>
        </Demo>
      </Section>

      <Section
        title="Bottom bar"
        note="The persistent bottom-edge surface (mid-day). Progress now tracks the relationship, not the day's event count."
      >
        <Demo
          title="REL level-up progress  ★NEW"
          spec="fill 0→target (easeOutCubic) 600ms toward the next REL tier; tier name + NEXT hint"
          flutter="global_activity_bar.dart — _RelLevelBar(progress: gameState.tierProgress)"
        >
          <div className="adk-relbar">
            <div className="adk-relrow">
              <span>DAY 14 · <b>HANA</b></span>
              <span className="adk-tier">INSIDE THEIR ORBIT</span>
            </div>
            <div className="adk-bar"><div className="adk-bar-fill adk-relfill" /></div>
            <div className="adk-relnext">NEXT · TRADING FAVORS</div>
          </div>
        </Demo>

        <Demo
          title="Floating stat gains (idea)"
          spec="float +N: translateY 0→-22px + fade · easeOut · 1000ms (staggered ~180ms) — if stats live on the bar"
          flutter="optional: per-stat TweenAnimationBuilder fired on a gain nonce"
        >
          <div className="adk-statbar">
            <div className="adk-statbar-left">DAY 14 · <b>HANA</b></div>
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
        note="The text-adventure boot that blooms into the home theme."
      >
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
.adk-tw{font-family:ui-monospace,monospace;font-size:12px;color:#43ff8d;}
.adk-dos-stage{background:#00140a;padding:10px;margin:-14px;}
@keyframes adk-shakein{0%{opacity:0;transform:translateY(3px) rotate(-3deg);}60%{opacity:1;transform:translateY(0) rotate(2deg);}100%{transform:rotate(0);}}
.adk-shaky-wrap{font-family:var(--theme-body);font-weight:600;}
.adk-shaky-word{display:inline-block;animation:adk-shakein .26s cubic-bezier(.34,1.56,.64,1) both;}

/* Reward stamp — scale overshoot + fade */
@keyframes adk-stampin{0%{opacity:0;transform:scale(.85);}60%{opacity:1;transform:scale(1.06);}100%{transform:scale(1);}}
.adk-stamp{border:2px solid var(--spot-red);background:color-mix(in srgb,var(--spot-red) 6%,transparent);padding:10px 14px;animation:adk-stampin .28s cubic-bezier(.34,1.56,.64,1) both;}
.adk-stamp-eye{font-family:var(--theme-display);font-size:10px;letter-spacing:.14em;color:var(--spot-red);}
.adk-stamp-title{font-family:var(--theme-display);font-size:18px;font-weight:700;color:var(--ink);line-height:1.15;margin-top:4px;}

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

@media (prefers-reduced-motion: reduce){
  .adk-stamp,.adk-toast,.adk-bar-fill,.adk-bloom,.adk-float,.adk-drop,.adk-relfill,.adk-shaky-word{animation-duration:.001s;}
  .adk-cursor{animation:none;}
}
`;
