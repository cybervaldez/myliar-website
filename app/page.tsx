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
    specialty: "Fitness & wellness",
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
      <section className="max-w-[880px] mx-auto px-6 sm:px-8 pt-16 sm:pt-24 pb-10">
        <div className="font-display tracking-[0.3em] text-[13px] text-forest-dim mb-4 text-center">
          INSTRUCTION BOOKLET · FOR THE PLAYER WHO AGREED
        </div>
        <h1 className="text-[56px] sm:text-[88px] leading-[0.95] text-center text-ink">
          My Life
          <br />
          Is an RPG
        </h1>
        <p className="text-center italic text-ink-soft text-[18px] sm:text-[20px] mt-6 max-w-[640px] mx-auto leading-[1.5]">
          They started writing about you on Day 1. By Day 5 there are four of
          them and they compare notes.
        </p>
        <div className="text-center mt-7">
          <span className="inline-block border-2 border-ink px-4 py-2 font-display tracking-[0.18em] text-[13px]">
            SAM-NARRATED EDITION · v0.0.19 · EARLY ACCESS
          </span>
        </div>
      </section>

      <hr className="rule-flourish max-w-[880px] mx-auto" />

      {/* ── SIMULATOR ─────────────────────────────────────────────────── */}
      <section className="max-w-[880px] mx-auto px-6 sm:px-8 py-12">
        <div className="mb-6 text-center">
          <div className="font-display tracking-[0.18em] text-[12px] text-spot-red mb-2">
            ▸ TRY THE FIRST 90 SECONDS
          </div>
          <h2 className="text-[36px] sm:text-[44px] leading-[1.05]">
            Hana texts at 5:14 AM.
          </h2>
          <p className="text-ink-soft italic max-w-[560px] mx-auto mt-3 leading-[1.5]">
            Three events. Three choices each. The chaotic one rolls dice — and
            yes, it can crit-fail. Nothing about this is hypothetical; this is
            lifted from the actual game.
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
            body="Travel into an alternate-reality side zone. Meet strangers spun up at your chosen vibe (Tolkien, 80s cyber, cottagecore, six bands). These characters are yours — fully customizable. Share the great ones via 8-char code."
          />
        </div>
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
        <div className="flex flex-col sm:flex-row gap-3 max-w-[560px] mx-auto">
          <Link
            href="https://github.com/cybervaldez/myliar"
            className="flex-1 font-display tracking-[0.16em] text-paper bg-forest py-4 px-6 border-2 border-ink !no-underline hover:bg-[#1f3a1d] transition"
          >
            EARLY ACCESS · GITHUB
          </Link>
          <Link
            href="/manual"
            className="flex-1 font-display tracking-[0.16em] text-ink bg-paper py-4 px-6 border-2 border-ink !no-underline hover:bg-paper-shade transition"
          >
            READ THE FULL MANUAL
          </Link>
        </div>
        <p className="font-sans italic text-margin-ink mt-10 text-[13px] leading-[1.55]">
          — Sam (this site is the only place I get to do marketing copy.
          Don&apos;t tell Mei.)
        </p>
      </section>
    </main>
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
