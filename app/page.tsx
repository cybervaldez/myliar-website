import Link from "next/link";
import { Simulator } from "./components/Simulator";

// ── Landing page — single index. Sections (top → bottom):
//   1. Hero       — Sam-voice subtitle + the bait
//   2. Simulator  — 3 events of Hana's Day 1, fully playable
//   3. Squad      — Sam / Hana / Kenji / Mei cards (mirrors manual)
//   4. Tiers      — Main Line / Side Quest / Elseworld explainer
//   5. Footer     — download CTA + manual link

const SQUAD = [
  {
    role: "ONBOARDER · CLASS",
    name: "Sam",
    gender: "♂",
    specialty: "This game's systems & RPG meta-coaching",
    quote: '"Refer to the systems by their internal names. Refer to the person by name."',
    blurb:
      "Runs the tutorial on Day 0 and stays in the squad as the in-fiction help system. Treats the mechanics like documented systems — because he wrote them.",
  },
  {
    role: "POWERHOUSE · CLASS",
    name: "Hana",
    gender: "♀",
    specialty: "Fitness & body",
    quote: '"BE THERE OR BE CELLULAR DEBRIS."',
    blurb:
      "Joins on Day 1. Intensely dramatic; treats a skipped workout like a failure to save the world. Will text you at 4:55 AM.",
  },
  {
    role: "SCHOLAR · CLASS",
    name: "Kenji",
    gender: "♂",
    specialty: "Productivity & finance",
    quote: '"A system without observability is a black hole that pays interest."',
    blurb:
      "Joins on Day 3, introduced by Hana. Coldly analytical; everything is a spreadsheet; the spreadsheets are kept BECAUSE he cares — not despite it.",
  },
  {
    role: "HEALER · CLASS",
    name: "Mei",
    gender: "♀",
    specialty: "Cooking & meal prep",
    quote: '"You are living in a tomb of biological failures."',
    blurb:
      "Joins on Day 5, introduced by Hana. Clipped, imperative, mise-en-place obsessed; treats your fridge like a crime scene; names every expired item by date.",
  },
];

export default function Home() {
  return (
    <main className="flex-1">
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="max-w-[880px] mx-auto px-6 sm:px-8 pt-12 sm:pt-20 pb-8">
        <div className="font-display tracking-[0.22em] text-[12px] text-forest-dim mb-4 text-center">
          A LIFE-RPG THAT LIVES IN YOUR PHONE · 4 CHARACTERS · 7-DAY ARC
        </div>
        <h1 className="text-[56px] sm:text-[88px] leading-[0.95] text-center text-ink">
          My Life
          <br />
          Is an RPG
        </h1>
        <p className="text-center text-ink-soft text-[17px] sm:text-[19px] mt-6 max-w-[620px] mx-auto leading-[1.55]">
          It&apos;s 5:14 AM and Hana is texting you about your posture. Three
          more characters are about to do the same.{" "}
          <span className="italic text-forest">Try a day below.</span>
        </p>

        {/* Phone-frame artifact — static cosmology cue. Single Hana
            text bubble in her all-caps voice, day/event badge, faint
            die-glyph pulse beneath. */}
        <PhoneArtifact />

        <div className="text-center mt-6">
          <a
            href="#simulator"
            className="inline-block font-display tracking-[0.18em] text-[12px] text-spot-red !no-underline border-b border-spot-red hover:text-ink hover:border-ink transition"
          >
            ▸ TRY IT BELOW · 90 SECONDS · NO INSTALL
          </a>
        </div>
      </section>

      <hr className="rule-flourish max-w-[880px] mx-auto" />

      {/* ── SIMULATOR ─────────────────────────────────────────────────── */}
      <section
        id="simulator"
        className="max-w-[880px] mx-auto px-6 sm:px-8 pb-12 pt-2 scroll-mt-8"
      >
        <div className="mb-5 text-center">
          <div className="font-display tracking-[0.16em] text-[11px] text-margin-ink mb-1">
            3 events · 3 choices each · dice on chaotic
          </div>
          <p className="text-ink-soft italic max-w-[560px] mx-auto leading-[1.5] text-[15px]">
            Lifted from the actual game. The chaotic option rolls dice; yes, it
            can crit-fail.
          </p>
        </div>
        <Simulator />
      </section>

      <hr className="rule-flourish max-w-[880px] mx-auto" />

      {/* ── SQUAD ────────────────────────────────────────────────────── */}
      <section
        id="squad"
        className="max-w-[880px] mx-auto px-6 sm:px-8 py-12 sm:py-16"
      >
        <div className="mb-6">
          <div className="font-display tracking-[0.18em] text-[12px] text-spot-red mb-2">
            ▸ DRAMATIS PERSONAE
          </div>
          <h2 className="text-[36px] sm:text-[44px]">The Squad</h2>
          <p className="text-ink-soft mt-3 max-w-[640px] leading-[1.55]">
            Four characters. You meet them in order: Sam on Day 0, Hana on
            Day 1, Kenji on Day 3, Mei on Day 5. They live inside your phone.
            They know each other. They write notes about you and each other,
            and the notes leak into the next day&apos;s dialogue.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {SQUAD.map((c) => (
            <div
              key={c.name}
              className="border-[1.5px] border-ink bg-paper-shade p-5"
            >
              <div className="font-display text-[12px] tracking-[0.16em] text-spot-red">
                {c.role}
              </div>
              <div className="font-display text-[32px] leading-none mt-1 text-ink">
                {c.name}{" "}
                <span className="text-forest font-body italic text-xl ml-1">
                  {c.gender}
                </span>
              </div>
              <div className="italic text-ink-soft text-[14px] mt-1 mb-3">
                {c.specialty}
              </div>
              <div className="italic text-ink text-[15px] py-2 border-y border-margin-ink/50 my-2 leading-[1.4]">
                {c.quote}
              </div>
              <p className="text-[14.5px] leading-[1.5] mt-2">{c.blurb}</p>
            </div>
          ))}
        </div>
      </section>

      <hr className="rule-flourish max-w-[880px] mx-auto" />

      {/* ── THE THREE TIERS ─────────────────────────────────────────── */}
      <section
        id="tiers"
        className="max-w-[880px] mx-auto px-6 sm:px-8 py-12 sm:py-16"
      >
        <div className="mb-6">
          <div className="font-display tracking-[0.18em] text-[12px] text-spot-red mb-2">
            ▸ THREE TIERS, ONE WORLD
          </div>
          <h2 className="text-[36px] sm:text-[44px]">Three ways to play.</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <TierCard
            tag="MAIN LINE"
            title="Curated canon"
            body="Seven days of hand-tuned story. The four canonical characters are locked sheets — you can chat with them, toggle their memories on or off, but you don't edit who they are. Quality floor. The story is written for everyone the same way."
          />
          <TierCard
            tag="SIDE QUEST"
            title="Talk to the squad"
            body="Chat with any character you've met. They respond in their own voice, with their memories of you, your stats, your day so far. It costs an action credit. They remember tomorrow."
          />
          <TierCard
            tag="ELSEWORLD"
            title="Cross over"
            body="Travel into an alternate-reality side zone. Meet strangers spun up at your chosen vibe — golden-age fantasy, 80s + cyber, 90s anime, isekai + party RPG, cottagecore, or surprise me. These characters are yours, fully customizable. Share the great ones via 8-char code."
          />
        </div>
      </section>

      <hr className="rule-flourish max-w-[880px] mx-auto" />

      {/* ── REALMS + MAPS ─────────────────────────────────────────── */}
      <section
        id="realms"
        className="max-w-[880px] mx-auto px-6 sm:px-8 py-12 sm:py-16"
      >
        <div className="mb-6">
          <div className="font-display tracking-[0.18em] text-[12px] text-spot-red mb-2">
            ▸ NEW IN v0.0.24 · REALMS HAVE MAPS NOW
          </div>
          <h2 className="text-[36px] sm:text-[44px]">
            The courtyard + the portal gate.
          </h2>
          <p className="text-ink-soft mt-3 max-w-[680px] leading-[1.55]">
            The four characters live somewhere. As of v0.0.24, that
            somewhere has a map. Hana&apos;s space stops being
            &quot;her gym&quot; and becomes{" "}
            <em>the track + the bleachers + the foam-roller corner</em>
            , drawn the same way every time, referenced the same way by
            every scenario. Open it any time from the{" "}
            <span className="font-display tracking-[0.08em] text-spot-red">
              MAP ›
            </span>{" "}
            link in any chat header.
          </p>
        </div>

        <CourtyardMap />

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="border-[1.5px] border-ink bg-paper-shade p-5">
            <div className="font-display tracking-[0.16em] text-[11px] text-spot-red">
              THE PHONE-REALM · navigable
            </div>
            <h3 className="text-[20px] mt-2 mb-2 text-ink">
              A village green with five doors out
            </h3>
            <p className="text-[14.5px] leading-[1.5]">
              Four character spaces around the edge, a noticeboard in
              the courtyard center, the portal gate across the top.
              Continuity objects bridge spaces — Hana&apos;s pinned
              race photo is visible from the hallway; Kenji&apos;s open
              ledger has a flagged line readable from his doorway. The
              world is connected because the people in it live with
              each other.
            </p>
          </div>
          <div className="border-[1.5px] border-ink bg-paper-shade p-5">
            <div className="font-display tracking-[0.16em] text-[11px] text-spot-red">
              FIVE ELSEWORLDS · contextual
            </div>
            <h3 className="text-[20px] mt-2 mb-2 text-ink">
              Each vibe gets its own geography
            </h3>
            <p className="text-[14.5px] leading-[1.5]">
              The slow cottagecore village, the 80s strip-mall arcology,
              the small anime town with one school and one shrine, the
              Tavern Between Worlds, the dispersed medieval villages.
              Each Elseworld map highlights the encounter location and
              shows the surrounding geography — so the LLM (and you)
              can place the stranger you just met in a real spot.
              Queued, one panel-ratified per turn.
            </p>
          </div>
        </div>

        <p className="italic text-margin-ink mt-6 text-[13px] max-w-[680px] leading-[1.55]">
          The map is a glance surface, not a navigation surface — you
          don&apos;t walk an avatar around. What it does is ground the
          person you&apos;re talking to in a place. When Hana mentions
          the bleachers, you can picture them. When Kenji says
          &quot;the drawer,&quot; you know which drawer.
        </p>
      </section>

      <hr className="rule-flourish max-w-[880px] mx-auto" />

      {/* ── DOWNLOAD / FOOTER ────────────────────────────────────────── */}
      <section
        id="download"
        className="max-w-[880px] mx-auto px-6 sm:px-8 py-14 sm:py-20 text-center"
      >
        <div className="font-display tracking-[0.18em] text-[12px] text-spot-red mb-2">
          ▸ THE ASK
        </div>
        <h2 className="text-[40px] sm:text-[52px] mb-5">
          Play it. Then write a journal.
        </h2>
        <p className="italic text-ink-soft max-w-[560px] mx-auto mb-8 leading-[1.55]">
          Specificity is what the LLM grabs. The vaguer you are, the more you
          disappear in the cracks. The more specific, the more they remember.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-[680px] mx-auto">
          <Link
            href="/manual"
            className="font-display tracking-[0.14em] text-[13px] text-ink bg-paper py-4 px-5 border-2 border-ink !no-underline hover:bg-paper-shade transition text-center"
          >
            INSTRUCTION
            <br />
            BOOKLET
          </Link>
          <Link
            href="/walkthrough"
            className="font-display tracking-[0.14em] text-[13px] text-ink bg-paper py-4 px-5 border-2 border-ink !no-underline hover:bg-paper-shade transition text-center"
          >
            PLAYER
            <br />
            WALKTHROUGH
          </Link>
          <Link
            href="/campaign-editor"
            className="font-display tracking-[0.14em] text-[13px] text-ink bg-paper py-4 px-5 border-2 border-ink !no-underline hover:bg-paper-shade transition text-center"
          >
            DM&apos;S
            <br />
            HANDBOOK
          </Link>
        </div>
        <p className="text-margin-ink italic mt-4 text-[12px]">
          three booklets · the player&apos;s manual, the full-spoiler
          walkthrough, the campaign editor&apos;s sourcebook.
        </p>
        <p className="font-sans italic text-margin-ink mt-10 text-[13px] leading-[1.55]">
          — Sam (this site is the only place I get to do marketing copy.
          Don&apos;t tell Mei.)
        </p>
        <div className="mt-10 pt-6 border-t border-margin-ink/30 text-[11px] font-display tracking-[0.18em] text-margin-ink">
          SAM-NARRATED EDITION · v0.0.24 · EARLY ACCESS
        </div>
      </section>
    </main>
  );
}

/**
 * Hero-side phone-frame artifact. Static visually (no JS) with one
 * CSS-keyframe pulse on the die glyph. Shows the cosmology (characters
 * inside the phone), the voice (Hana's all-caps), and visually rhymes
 * with the simulator card below so scrolling reads as "stepping into
 * what you're looking at."
 */
function PhoneArtifact() {
  return (
    <div className="mx-auto mt-10 max-w-[340px]">
      {/* DAY 1 · EVENT 1 badge above the frame */}
      <div className="flex items-center justify-center gap-2 mb-3">
        <span className="font-display tracking-[0.18em] text-[10px] text-spot-red">
          DAY 1 · EVENT 1 · 5:14 AM
        </span>
      </div>

      {/* Sigil — chunky phone outline */}
      <div className="border-[2.5px] border-ink bg-paper-shade rounded-[28px] px-5 pt-6 pb-7 shadow-[6px_6px_0_0_rgba(26,26,26,0.12)]">
        {/* Notch / status row — keeps the "phone-realm" cue without iconography */}
        <div className="flex items-center justify-between text-[10px] font-display tracking-[0.14em] text-ink-soft mb-4">
          <span>HANA ♀</span>
          <span className="bg-ink text-paper px-2 py-[1px]">UNKNOWN NUMBER</span>
        </div>

        {/* Hana's message bubble — chunky, in her voice */}
        <div className="border-[1.5px] border-ink bg-paper p-3 mb-3 max-w-[88%]">
          <p className="font-body italic text-[14px] leading-[1.45] text-ink">
            “Resting heart rate. Volume of water before bed.{" "}
            <span className="not-italic font-display tracking-[0.04em] text-spot-red">
              NOW.
            </span>
            ”
          </p>
        </div>

        {/* Second bubble — sets up the trichotomy */}
        <div className="border-[1.5px] border-ink bg-paper p-3 max-w-[88%]">
          <p className="font-body italic text-[14px] leading-[1.45] text-ink">
            “You have three ways to answer me. One of them is{" "}
            <span className="font-display tracking-[0.06em] text-spot-red">
              chaotic
            </span>
            . I&apos;m awake. I&apos;ll wait.”
          </p>
        </div>

        {/* Die-glyph pulse — the "tap to start" cue */}
        <div className="flex items-center justify-end gap-2 mt-5 pr-1">
          <span className="font-display tracking-[0.14em] text-[10px] text-margin-ink">
            CHAOTIC ROLLS
          </span>
          <span className="text-lg leading-none die-pulse" aria-hidden="true">
            🎲
          </span>
        </div>
      </div>
    </div>
  );
}

function TierCard({
  tag,
  title,
  body,
}: {
  tag: string;
  title: string;
  body: string;
}) {
  return (
    <div className="border-[1.5px] border-ink bg-paper-shade p-5">
      <div className="font-display tracking-[0.18em] text-[11px] text-spot-red">
        {tag}
      </div>
      <h3 className="text-[22px] mt-2 mb-3 text-ink">{title}</h3>
      <p className="text-[14.5px] leading-[1.55]">{body}</p>
    </div>
  );
}

/**
 * Compact ASCII rendering of the phone-realm courtyard — a website-
 * friendly excerpt of `assets/realm-maps/phone-realm.txt`. Two zones
 * shown (Hana + Kenji + portal gate + courtyard center) so the player
 * sees the *shape* without having to scroll a 58-col map on phone.
 * The full map is rendered in-game and in the docs.
 */
function CourtyardMap() {
  // Build with raw strings so the tabular layout is preserved. The
  // pre/code wrapper renders in Courier with the cream-paper background,
  // chunky border, and the "you are here" character glyph (H) shown
  // in forest green for parity with the in-game viewer.
  return (
    <div className="border-[2px] border-ink bg-paper-shade p-4 sm:p-5 overflow-x-auto">
      <div className="flex items-center justify-between mb-3">
        <span className="font-display tracking-[0.16em] text-[10px] text-spot-red">
          THE COURTYARD · phone-realm · navigable
        </span>
        <span className="font-sans italic text-[11px] text-margin-ink">
          excerpt — full map in-game
        </span>
      </div>
      <pre className="font-mono text-[10px] sm:text-[11px] leading-[1.25] text-ink whitespace-pre">
{`╔══════════════════════════════════════════════════════════╗
║              THE COURTYARD — phone realm                 ║
║                                                          ║
║   ╔══════════════ THE PORTAL GATE ══════════════════╗    ║
║   ║   %         %         %        %        %      ║    ║
║   ║  the      the mall  the small the     the      ║    ║
║   ║ witch's    (80)      town    tavern  cottage   ║    ║
║   ║  path                (90)   (isekai)  (cozy)   ║    ║
║   ╚══════════════════│════════════════════════════╝     ║
║                       │                                  ║
║   ┌── HANA's track ──┘   └── KENJI's office ──┐         ║
║   │ , , , , , , , , ,│   │. . . . . . . . . . │         ║
`}<span className="text-forest font-bold">{`║   │ , H . . . . . . t│`}</span>{`   │. K . . . . . . . . │         ║
║   │ , . . [bleachers]│   │. . [desk] [ledger*]│         ║
║   │ , . [pic*] . . . │   │. . . . . [drawer]  │         ║
║   └──────────│───────┘   └──────│──────────────┘        ║
║              │                  │                        ║
║          ┌───┴──[noticeboard]──┴───┐                     ║
║          │  the courtyard center   │                     ║
║          └───┬─────────────────┬───┘                     ║
║              │                 │                         ║
║   ┌─ MEI's kitchen ─┐  ┌─ SAM's desk ─┐                  ║
║   │ [prep] [line s] │  │  . S . d .   │                  ║
║   │ [bell*] [mise]  │  │ [sticky-wall*]│                 ║
║   └─────────────────┘  └──────────────┘                  ║
╚══════════════════════════════════════════════════════════╝`}
      </pre>
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-ink-soft font-sans">
        <div>
          <span className="font-display tracking-[0.1em] text-spot-red mr-2">LEGEND</span>
          S H K M = Sam / Hana / Kenji / Mei
        </div>
        <div>
          <code className="text-forest font-bold">H</code> in green = the
          character you&apos;re currently with
        </div>
        <div>
          <code>[name*]</code> = continuity object — bridges two spaces
        </div>
        <div>
          <code>%</code> = portal — one per Elseworld vibe
        </div>
      </div>
    </div>
  );
}
