import Link from "next/link";
import board from "./lib/storyboard.json";
import { Simulator } from "./components/Simulator";
import { TitleCard, type PlayTitle } from "./play/PlayBrowser";

// ── Landing page — the SLATE front door (rebuilt 2026-06-13, /team panel).
// Modeled on /play: the worlds ARE the pitch. Evergreen — no version stamps.
// Sections (top → bottom):
//   1. Hero        — the wedge (coaches who want you to need them less) + the voice range
//   2. The slate   — the playable campaigns as cards (PlayBrowser idiom) + a concept teaser
//   3. The taste   — the Simulator (play a day, 90s, no install)
//   4. How it works — the funnel (prelude → front door → campaign) + the two lanes
//   5. Footer      — booklets, codex, the engine, Sam's sign-off

// Three voices, three worlds, one phone — the cosmology + the range, in the hero.
const VOICES: { campaign: string; who: string; tag: string; line: string; caps?: string }[] = [
  { campaign: "LIFE OPS", who: "Hana", tag: "5:14 AM", line: "Resting heart rate. Water before bed. ", caps: "NOW." },
  { campaign: "THE LONG HUNT", who: "Roan", tag: "NIGHT 1", line: "Your knot's wrong. Again. Slower." },
  { campaign: "THE NIGHT MARKET", who: "Edda", tag: "LANTERN 3", line: "Burnt edge. Best flavor. Full price." },
];

const COZY_GLYPH: Record<number, string> = { 1: "🔥", 2: "⚡", 3: "☕", 4: "🛋", 5: "🕯" };

export default function Home() {
  const all = (board.concept.candidates ?? []) as unknown as PlayTitle[];
  const campaigns = all.filter((t) => t.kind === "campaign");
  const concepts = all.filter((t) => t.kind === "concept");

  return (
    <main className="flex-1 fandom">
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="max-w-[920px] mx-auto px-6 sm:px-8 pt-12 sm:pt-20 pb-8">
        <div className="font-display tracking-[0.22em] text-[12px] text-forest-dim mb-4 text-center">
          A LIFE-RPG THAT LIVES IN YOUR PHONE · MANY WORLDS · ONE ENGINE
        </div>
        <h1 className="text-[52px] sm:text-[84px] leading-[0.95] text-center text-ink">
          My Life
          <br />
          Is an RPG
        </h1>
        <p className="text-center text-ink-soft text-[17px] sm:text-[19px] mt-6 max-w-[640px] mx-auto leading-[1.55]">
          Coaches who live in your phone, get your real life in order — and{" "}
          <span className="italic text-forest">want you to need them less.</span>{" "}
          Pick a world below and start.
        </p>

        <PhoneVoices />

        <div className="text-center mt-7 flex flex-wrap gap-x-6 gap-y-2 justify-center">
          <a
            href="#slate"
            className="inline-block font-display tracking-[0.18em] text-[12px] text-spot-red !no-underline border-b border-spot-red hover:text-ink hover:border-ink transition"
          >
            ▸ PICK A WORLD
          </a>
          <a
            href="#simulator"
            className="inline-block font-display tracking-[0.18em] text-[12px] text-forest !no-underline border-b border-forest hover:text-ink hover:border-ink transition"
          >
            ▸ OR PLAY A DAY · 90 SECONDS · NO INSTALL
          </a>
        </div>
      </section>

      <hr className="rule-flourish max-w-[920px] mx-auto" />

      {/* ── THE SLATE ─────────────────────────────────────────────────── */}
      <section id="slate" className="max-w-[920px] mx-auto px-6 sm:px-8 py-12 sm:py-16 scroll-mt-8">
        <div className="mb-6">
          <div className="font-display tracking-[0.18em] text-[12px] text-spot-red mb-2">
            ▸ THE WORLDS
          </div>
          <h2 className="text-[36px] sm:text-[44px]">Pick where you start.</h2>
          <p className="text-ink-soft mt-3 max-w-[700px] leading-[1.55] text-[15.5px]">
            Each world is a different flavor with the same engine underneath. The three things
            that tell you if it&apos;s for you:{" "}
            <strong className="text-ink">Cozy Level</strong> (even the intense ones keep a cozy
            floor), the <strong className="text-ink">characters</strong> you&apos;ll meet, and the{" "}
            <strong className="text-ink">agents you unlock</strong> — the part you keep.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {campaigns.map((t) => (
            <TitleCard key={t.slug} t={t} all={all} />
          ))}
        </div>

        {/* Concept teaser — the pipeline, never a dead-link dump (Product guardrail) */}
        {concepts.length > 0 && (
          <div className="mt-8 border-t border-ink/15 pt-6">
            <div className="font-sans text-[10px] uppercase tracking-[0.16em] text-margin-ink mb-2">
              More worlds in the pipeline
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              {concepts.slice(0, 8).map((c) => (
                <span
                  key={c.slug}
                  className="font-sans text-[12px] border border-ink/30 text-ink-soft px-2 py-1 whitespace-nowrap"
                  title={c.legs ?? c.gift ?? ""}
                >
                  {c.metrics?.cozy ? `${COZY_GLYPH[c.metrics.cozy]} ` : ""}
                  {c.name}
                </span>
              ))}
              {concepts.length > 8 && (
                <span className="font-sans text-[12px] text-margin-ink">
                  +{concepts.length - 8} more
                </span>
              )}
            </div>
            <p className="mt-3 text-[13px]">
              <Link href="/play" className="font-display tracking-[0.14em] text-[12px] text-spot-red">
                ▸ BROWSE THE FULL SLATE
              </Link>
              <span className="text-margin-ink italic ml-2 text-[12.5px]">
                — every world + concept, scored on one card.
              </span>
            </p>
          </div>
        )}
      </section>

      <hr className="rule-flourish max-w-[920px] mx-auto" />

      {/* ── THE TASTE (Simulator) ─────────────────────────────────────── */}
      <section
        id="simulator"
        className="max-w-[920px] mx-auto px-6 sm:px-8 py-12 sm:py-16 scroll-mt-8"
      >
        <div className="mb-6">
          <div className="font-display tracking-[0.18em] text-[12px] text-spot-red mb-2">
            ▸ NOT SURE? TASTE ONE
          </div>
          <h2 className="text-[36px] sm:text-[44px]">Play a day, right here.</h2>
          <p className="text-ink-soft mt-3 max-w-[640px] leading-[1.55] text-[15.5px]">
            Three events from the first day of <em>Life Ops</em>, lifted straight from the game.
            Three choices each; the chaotic one rolls dice — yes, it can crit-fail. No install,
            about ninety seconds.
          </p>
        </div>
        <Simulator />
      </section>

      <hr className="rule-flourish max-w-[920px] mx-auto" />

      {/* ── HOW IT WORKS (the funnel + the two lanes) ─────────────────── */}
      <section className="max-w-[920px] mx-auto px-6 sm:px-8 py-12 sm:py-16">
        <div className="mb-6">
          <div className="font-display tracking-[0.18em] text-[12px] text-spot-red mb-2">
            ▸ HOW A WORLD UNFOLDS
          </div>
          <h2 className="text-[36px] sm:text-[44px]">One story, three doors in.</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FunnelCard
            step="1 · THE PRELUDE"
            title="The night before you"
            body="Every world opens with a short story of the place the moment before you arrive — the crew at work, a seat kept open. It&apos;s the hook, and it&apos;s page one of the campaign."
          />
          <FunnelCard
            step="2 · THE FRONT DOOR"
            title="Who do you want to be?"
            body="Step inside and the world greets you. You choose how you play it — interest-driven, never a form — and what&apos;s ahead previews as ??? that fill in as you go. The anticipation engine."
          />
          <FunnelCard
            step="3 · THE CAMPAIGN"
            title="The chat is the destination"
            body="The days play out as choices, dice, and characters who write private notes about you — and the notes leak into tomorrow. They coach you toward not needing them. That&apos;s the whole point."
          />
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <LaneCard
            tag="THE TRUST LANE"
            title="Curated worlds"
            body="The campaigns above are hand-tuned canon. The characters are locked sheets — you chat with them, toggle which memories are in play, but you don&apos;t edit who they are. Install-and-play quality, written for everyone the same way."
          />
          <LaneCard
            tag="THE CREATIVITY LANE"
            title="Your own realms"
            body="Cross into an Elseworld and meet strangers spun up at a vibe you pick — golden-age fantasy, 90s anime, cottagecore, surprise me. These characters are yours, fully customizable. Sam even helps you sketch the places themselves."
            href="/map"
            hrefLabel="▸ SEE WHERE THEY LIVE"
          />
        </div>
      </section>

      <hr className="rule-flourish max-w-[920px] mx-auto" />

      {/* ── FOOTER ───────────────────────────────────────────────────── */}
      <section
        id="more"
        className="max-w-[920px] mx-auto px-6 sm:px-8 py-14 sm:py-20 text-center"
      >
        <div className="font-display tracking-[0.18em] text-[12px] text-spot-red mb-2">
          ▸ GO DEEPER
        </div>
        <h2 className="text-[38px] sm:text-[50px] mb-5">Read the books.</h2>
        <p className="italic text-ink-soft max-w-[560px] mx-auto mb-8 leading-[1.55]">
          Specificity is what the characters grab. The vaguer you are, the more you disappear in
          the cracks. The more specific, the more they remember.
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
        <p className="mt-6 text-[12px]">
          <Link
            href="/wiki"
            className="font-display tracking-[0.16em] text-[12px] text-spot-red !border-b-0"
          >
            ▸ BROWSE THE CODEX
          </Link>
          <span className="text-margin-ink italic ml-2">
            — the full wiki: characters, realms, mechanics.
          </span>
        </p>
        <p className="mt-3 text-[12px]">
          <Link
            href="/the-engine"
            className="font-display tracking-[0.16em] text-[12px] text-spot-red !border-b-0"
          >
            ▸ READ HOW THE ENGINE WORKS
          </Link>
          <span className="text-margin-ink italic ml-2">
            — design notes: how the mechanics, rules, and Story Engine intertwine.
          </span>
        </p>
        <p className="font-sans italic text-margin-ink mt-10 text-[13px] leading-[1.55]">
          — Sam (this site is the only place I get to do marketing copy. Don&apos;t tell Mei.)
        </p>
      </section>
    </main>
  );
}

/* ── Hero artifact — three voices, three worlds, one phone. Static (CSS-only
 * pulse on the die glyph). The cosmology cue (characters-in-your-phone) AND
 * the range (three genuinely different registers) in one frame. */
function PhoneVoices() {
  return (
    <div className="mx-auto mt-10 max-w-[360px]">
      <div className="flex items-center justify-center gap-2 mb-3">
        <span className="font-display tracking-[0.18em] text-[10px] text-spot-red">
          THREE WORLDS · ONE PHONE
        </span>
      </div>
      <div className="border-[2.5px] border-ink bg-paper-shade rounded-[28px] px-5 pt-6 pb-7 shadow-[6px_6px_0_0_rgba(26,26,26,0.12)]">
        <div className="flex flex-col gap-3">
          {VOICES.map((v) => (
            <div key={v.campaign} className="border-[1.5px] border-ink bg-paper p-3">
              <div className="flex items-center justify-between text-[9px] font-display tracking-[0.14em] text-ink-soft mb-1.5">
                <span>{v.who}</span>
                <span className="bg-ink text-paper px-1.5 py-[1px]">
                  {v.campaign} · {v.tag}
                </span>
              </div>
              <p className="font-body italic text-[13.5px] leading-[1.45] text-ink">
                &ldquo;{v.line}
                {v.caps && (
                  <span className="not-italic font-display tracking-[0.04em] text-spot-red">
                    {v.caps}
                  </span>
                )}
                &rdquo;
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center font-display tracking-[0.16em] text-[10px] text-margin-ink die-pulse">
          ⚂ THEY LIVE IN HERE
        </div>
      </div>
    </div>
  );
}

function FunnelCard({ step, title, body }: { step: string; title: string; body: string }) {
  return (
    <div className="border-[1.5px] border-ink bg-paper-shade p-5">
      <div className="font-display tracking-[0.16em] text-[11px] text-spot-red mb-2">{step}</div>
      <h3 className="text-[20px] mb-2 text-ink leading-tight">{title}</h3>
      <p className="text-[14px] leading-[1.55]" dangerouslySetInnerHTML={{ __html: body }} />
    </div>
  );
}

function LaneCard({
  tag,
  title,
  body,
  href,
  hrefLabel,
}: {
  tag: string;
  title: string;
  body: string;
  href?: string;
  hrefLabel?: string;
}) {
  return (
    <div className="border-2 border-ink bg-paper-shade p-5">
      <div className="font-display tracking-[0.16em] text-[11px] text-forest-dim mb-2">{tag}</div>
      <h3 className="text-[22px] mb-2 text-ink leading-tight">{title}</h3>
      <p className="text-[14.5px] leading-[1.55]" dangerouslySetInnerHTML={{ __html: body }} />
      {href && hrefLabel && (
        <p className="mt-3">
          <Link href={href} className="font-display tracking-[0.14em] text-[12px] text-spot-red">
            {hrefLabel}
          </Link>
        </p>
      )}
    </div>
  );
}
