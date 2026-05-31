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

export default function AnimationGallery() {
  return (
    <>
      <style>{CSS}</style>

      <Section
        title="Text &amp; narration — themed"
        note="Text reveal is part of a theme's personality, and a line's EMPHASIS (say / shout / whisper) drives it. The theme maps emphasis its own way: DOS types everything; Parchment & Ink stays still and leans on bold/italic; Vibrant Realm animates by emotion."
      >
        <Demo
          title="DOS-era — typewriter + cursor"
          spec="type char-by-char ~40ms/char, blinking ▌ cursor trails; the boot/terminal world (emphasis = caps)"
          flutter="ThemePack.textReveal = typewriter → AnimatedText types via Timer + _Cursor"
        >
          <div className="adk-textstage adk-dos-stage"><Typewriter text="> DROP AND GIVE ME TWENTY." /></div>
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
        title="Battle minigame  ★NEW"
        note="A chance-based (chaotic 🎲) action can enter a themed battle — a mini version of the option-based story. The bottom bar becomes the battle HUD: the ENEMY's HP is the progress bar; the protagonist is just a name + HP number (no bar). Protagonist/enemy are whatever fits the event — here, REPS vs A PUSHUP."
      >
        <Demo
          title="Entering battle — bar transition  ★NEW"
          spec="REL-progress bar morphs into the battle HUD: forest→spot-red recolor, fill resizes to enemy HP, labels crossfade (HANA→REPS, tier→A PUSHUP), quick shake at the swap. ~1.6s"
          flutter="global_activity_bar.dart — AnimatedSwitcher/Tween between _RelLevelBar and battle HUD on battleController.active"
        >
          <div className="adk-tbar">
            <div className="adk-tbar-labels">
              <div className="adk-tlayer adk-tlayer-rel">
                <span>DAY 14 · <b>HANA</b></span>
                <span className="adk-tier">INSIDE THEIR ORBIT</span>
              </div>
              <div className="adk-tlayer adk-tlayer-battle">
                <span>REPS · <b className="adk-hp">HP 30</b></span>
                <span className="adk-enemy">A PUSHUP</span>
              </div>
            </div>
            <div className="adk-bar adk-tbar-track"><div className="adk-tbar-fill" /></div>
            <div className="adk-tbar-cap">
              <span className="adk-tlayer-rel adk-cap">NEXT · TRADING FAVORS</span>
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
.adk-ink-text b{font-weight:800;}
.adk-ink-text i{color:var(--ink-soft);}
.adk-tw{font-family:ui-monospace,monospace;font-size:12px;color:#43ff8d;}
.adk-dos-stage{background:#00140a;padding:10px;margin:-14px;}

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
.adk-tbar-fill{height:100%;animation:adk-tofill 1.6s cubic-bezier(.22,1,.36,1) both;}
@keyframes adk-tofill{0%,37%{width:62%;background:var(--forest);}
  58%{background:var(--spot-red);}100%{width:80%;background:var(--spot-red);}}
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

@media (prefers-reduced-motion: reduce){
  .adk-stamp,.adk-toast,.adk-bar-fill,.adk-bloom,.adk-float,.adk-drop,.adk-relfill,.adk-popword,.adk-whisperword,
  .adk-bb-fill,.adk-tbar,.adk-tlayer-rel,.adk-tlayer-battle,.adk-tbar-fill{animation-duration:.001s;}
  .adk-cursor,.adk-shoutchar{animation:none;}
}
`;
