// /the-engine — DESIGN NOTES (out-of-fiction). The long-read on how the
// mechanics, the rules, and the Story Engine intertwine. This is the ONE place
// on the site that talks about the game as a designed object rather than from
// inside the fiction — deliberately separate from the in-fiction Codex (/wiki)
// so the spoiler-safe, in-world discipline there is never diluted by craft talk.
// Sources: docs/design/story-engine.md, storybuilding-guide.md, rpg-framing.md,
// rel-tiers.md, achievements-and-unlocks.md + test/engine_pressure_test.dart.

import Link from "next/link";
import { FandomShell } from "../_components/FandomShell";

export const metadata = {
  title: "The Note Factory — how the engine works | My Life is an RPG",
  description:
    "Design notes: how the daily loop, the locked characters, the REL ladder, achievements, and the Story Engine intertwine to make a phone full of strangers slowly learn to know you.",
};

// A small reusable callout — the spot-red double-wall box from the manual look.
function Aside({ kicker, children }: { kicker: string; children: React.ReactNode }) {
  return (
    <aside className="my-7 border-l-[3px] border-spot-red bg-paper-shade/60 pl-4 py-3">
      <div className="font-sans text-[11px] uppercase tracking-[0.18em] text-spot-red mb-1">
        {kicker}
      </div>
      <div className="text-[15px] leading-[1.65] text-ink-soft">{children}</div>
    </aside>
  );
}

function H2({ id, n, children }: { id: string; n: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="font-display text-[28px] leading-tight text-forest mt-12 mb-3 scroll-mt-20">
      <span className="text-spot-red mr-2">{n}</span>
      {children}
    </h2>
  );
}

const TOC = [
  ["the-bet", "01", "The bet"],
  ["the-loop", "02", "The loop you see"],
  ["the-factory", "03", "The engine you don't: the note factory"],
  ["the-ladder", "04", "REL is the delivery schedule"],
  ["the-lock", "05", "Why the characters are locked"],
  ["the-spine", "06", "Achievements: the one currency"],
  ["the-proof", "07", "How we proved it works"],
  ["the-order", "08", "The authoring order that fell out"],
  ["the-weave", "09", "How it all intertwines"],
  ["my-take", "10", "What I actually think"],
];

export default function EngineEssay() {
  return (
    <FandomShell active="/the-engine">
      <div className="max-w-[820px]">
        {/* eyebrow + masthead */}

        <div className="mt-8 font-sans text-[11px] uppercase tracking-[0.22em] text-spot-red">
          Design Notes · Behind the screen
        </div>
        <h1 className="font-display text-[46px] leading-[0.98] mt-2 mb-3">
          The Note Factory
        </h1>
        <p className="font-body italic text-[19px] leading-[1.5] text-ink-soft">
          How a daily story, four locked characters, a relationship ladder, and a
          single unlock currency intertwine into one machine — whose only job is
          to make a phone full of strangers slowly learn to know you.
        </p>

        <hr className="border-0 border-t border-ink/15 my-8" />

        {/* TOC */}
        <nav className="font-sans text-[13px] leading-[1.9] mb-4">
          <div className="uppercase tracking-[0.18em] text-[11px] text-forest mb-2">Contents</div>
          {TOC.map(([id, n, label]) => (
            <Link key={id} href={`#${id}`} className="flex gap-3 text-ink-soft hover:text-spot-red">
              <span className="text-spot-red tabular-nums">{n}</span>
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        <hr className="border-0 border-t border-ink/15 my-8" />

        <article className="text-[17px] leading-[1.7] [&_p]:mb-4 [&_strong]:text-ink">
          {/* 01 */}
          <H2 id="the-bet" n="01">The bet</H2>
          <p>
            Most AI-companion apps make you pick a disappointment. Either the
            character is <strong>curated and polished but static</strong> — it
            never really becomes <em>yours</em> — or it&apos;s{" "}
            <strong>open and customizable but soulless</strong>, a blank doll
            that says whatever you typed into its personality box.
          </p>
          <p>
            We didn&apos;t want to choose, so we built two lanes and shipped
            both. The <strong>Trust lane</strong> is the Main Line: four locked,
            hand-authored characters — Sam, Hana, Kenji, Mei — who are
            functional agents first (Hana coaches your body, Kenji audits your
            time and money, Mei runs your kitchen) and companions second. The{" "}
            <strong>Creativity lane</strong> is the Elseworlds: worlds and
            characters players author themselves, bounded only by the world
            rules. This essay is about the Trust lane — because the hard problem
            lives there. How do you make a <em>locked</em> character feel like it
            knows <em>you</em> specifically, without letting players edit it into
            mush?
          </p>
          <Aside kicker="The thesis in one line">
            The story is not the destination. The story is a{" "}
            <strong>factory</strong> whose product is <em>notes</em> — and the
            notes are what make the chat, at the end, sound like someone who has
            been paying attention the whole time.
          </Aside>

          {/* 02 */}
          <H2 id="the-loop" n="02">The loop you see</H2>
          <p>
            Every morning a character writes you a short story about your day —
            a few moments to react to. Each moment offers exactly three answers:
          </p>
          <ul className="list-none p-0 my-4 space-y-2 text-[15px]">
            <li className="border-l-[3px] border-forest pl-3">
              <strong className="text-forest">Logical</strong> — the steady,
              smart move. No dice, reliable gain.
            </li>
            <li className="border-l-[3px] border-ink pl-3">
              <strong>Passive</strong> — hang back, watch, say nothing. Low risk
              — and occasionally, secretly, the right call.
            </li>
            <li className="border-l-[3px] border-spot-red pl-3">
              <strong className="text-spot-red">Chaotic</strong> — always rolls
              the dice. Crit and you win big (and feed your{" "}
              <strong>Charisma</strong>); whiff and it backfires.
            </li>
          </ul>
          <p>
            Those choices nudge four stats (STR, INT, GLD, CHR), drop the
            occasional item, and move a relationship meter called{" "}
            <strong>REL</strong>. That is the whole visible game, and it&apos;s
            deliberately simple — a casual player can follow it on day one. But
            the visible loop is a delivery mechanism for something underneath.
          </p>

          {/* 03 */}
          <H2 id="the-factory" n="03">The engine you don&apos;t see: the note factory</H2>
          <p>
            Underneath every choice is a <strong>note</strong> — a short line the
            character writes about <em>you</em>, in their own voice.{" "}
            <em>&quot;She did the drill twice — the kind of build that matters less
            than the fact that she came back.&quot;</em> Every note is stamped with
            four things: the <strong>slot</strong> it came from (the moment), its{" "}
            <strong>valence</strong> (steady / watchful / bold, from which choice
            you took), its <strong>category</strong> (memory, opinion, fear, or
            question), and its <strong>weight</strong> (flavor, opinion, or
            milestone).
          </p>
          <p>
            Three rules make the pile of notes behave like a person&apos;s
            memory instead of a database:
          </p>
          <ul className="list-disc pl-5 my-4 space-y-2 text-[15px] text-ink-soft">
            <li>
              <strong>One note per slot.</strong> You either reached for the key
              or you honored the protocol — never both. So the character&apos;s
              active memory <em>never contains a contradiction</em>.
            </li>
            <li>
              <strong>Influence is voice-only.</strong> A note changes how a
              character <em>talks about you</em> — never your stats, your REL, or
              their behavior. The valence mix is a tone knob, not a power-up.
            </li>
            <li>
              <strong>You curate.</strong> You choose which notes are in play.
              The feature isn&apos;t a chore — it&apos;s the question{" "}
              <em>&quot;which version of yourself do you want them to
              remember?&quot;</em> You are editing your own legend.
            </li>
          </ul>

          {/* 04 */}
          <H2 id="the-ladder" n="04">REL is the delivery schedule</H2>
          <p>
            Here&apos;s the join that took us a while to see: <strong>REL
            isn&apos;t a separate system the notes plug into — REL is the schedule
            on which notes arrive.</strong> The relationship ladder has ten tiers,
            from <em>Circling</em> (they don&apos;t trust you yet) up to{" "}
            <em>Unspoken</em>. Each tier-up beat is, mechanically, the day a heavy
            <em> milestone</em> note lands. The tier-up taxonomy — memory, opinion,
            fear, question — <em>is</em> the note-category set. Daily beats hand
            you the light flavor notes; tier crossings hand you the ones that
            change everything.
          </p>
          <Aside kicker="The destination">
            Reaching the top tier isn&apos;t a credits roll. It unlocks the{" "}
            <strong>richest possible chat</strong> — a character carrying a full
            dossier of who you&apos;ve been. The entire arc exists to build the
            person you then get to <em>talk to</em>.
          </Aside>

          {/* 05 */}
          <H2 id="the-lock" n="05">Why the characters are locked</H2>
          <p>
            Each character is two things at once: a real-life domain (Hana =
            fitness) and an RPG stat lane (Hana = STR, the Monk). We call the
            overlap the <strong>blend</strong>, and it&apos;s the whole product.
            A beat that would still work with the wrong character in the focal
            slot — a Hana scene that&apos;s really about money — fails the blend
            test and gets killed. The blend is also <em>why the sheets are
            locked</em>: it&apos;s what makes these characters RPG-themed
            functional agents instead of generic roleplay.
          </p>
          <p>
            There&apos;s a hard frame around all of it, too. Everyone lives in
            the phone-realm; nobody says <em>API</em> or <em>401k</em> or{" "}
            <em>resting heart rate</em>. Kenji says <em>&quot;a tax you forgot you
            signed.&quot;</em> Hana says <em>&quot;the numbers your body
            logged.&quot;</em> The fiction is the gate, and it never lifts.
          </p>

          {/* 06 */}
          <H2 id="the-spine" n="06">Achievements: the one currency</H2>
          <p>
            We refused to invent a second economy. <strong>Achievements are the
            only unlock currency.</strong> Items grant them; counters become them
            (collect 100 mementos → <em>junk-collector</em>); milestones and
            tier-ups grant them. And then achievements gate everything else:
            telegraphed <strong>★ fourth choices</strong> on top of the usual
            three, crit-chance buffs, the dice-driven{" "}
            <strong>battle minigame</strong>, and the <strong>mystery</strong>{" "}
            characters and <strong>legendary</strong> items you have to work
            toward (a legendary is never dropped — always earned, always a
            mystery until it isn&apos;t). One spine, no clutter.
          </p>

          {/* 07 */}
          <H2 id="the-proof" n="07">How we proved it works</H2>
          <p>
            A thesis this load-bearing shouldn&apos;t be taken on faith, so we
            built a harness: seed a real game state, render the exact context the
            chat model sees, and feed the same character the{" "}
            <em>same player message</em> with different curated note-sets.
            Then read what changes.
          </p>
          <p>Two findings landed, and one of them surprised us:</p>
          <ul className="list-disc pl-5 my-4 space-y-2 text-[15px] text-ink-soft">
            <li>
              <strong>Notes change posture, not temperature.</strong> A{" "}
              <em>steady</em> dossier made Kenji affirm a trusted regular; a{" "}
              <em>bold</em> one made him brace for a sparring partner —{" "}
              <em>&quot;an unexamined deficit is a cold draft in the room we both
              have to sit in.&quot;</em> Same warmth, opposite stance. And the
              jump from &quot;he knows my type&quot; to &quot;he knows{" "}
              <em>me</em>&quot; happened at the very <strong>first</strong>{" "}
              curated note.
            </li>
            <li>
              <strong>Off-lane notes go inert.</strong> We tried to break it with
              a dossier built for maximum drama — grief, childhood, &quot;you
              understand my heart.&quot; Kenji&apos;s locked sheet simply{" "}
              <em>refused to express any of it</em>; none of those notes
              surfaced, and his reply sagged into generic comfort. The lock
              didn&apos;t just protect him — it revealed that a note off his lane
              is <em>wasted</em>. Only notes that deepen the gift propagate to
              the voice.
            </li>
          </ul>

          {/* 08 */}
          <H2 id="the-order" n="08">The authoring order that fell out</H2>
          <p>
            That second finding rewrote how we write. The instinct is to ask
            &quot;what notes would change this character the most?&quot; — but the
            most-change notes are exactly the off-lane ones that go inert. So we
            author <strong>outside-in</strong>, pinning both ends before writing
            a single beat:
          </p>
          <ol className="list-decimal pl-5 my-4 space-y-1 text-[15px] text-ink-soft">
            <li><strong>Gift</strong> — what they give you, valuable on day one.</li>
            <li><strong>Destination</strong> — one paragraph: the top-tier chat feeling, the thing they understand about you that <em>only the gift</em> makes possible.</li>
            <li><strong>~5 milestone notes</strong> — reverse-engineered from the destination, each one gift-bounded. These <em>are</em> the tier-ups.</li>
            <li><strong>Beats</strong> — written last, to earn those notes.</li>
          </ol>
          <p>
            The rule we say out loud now: <strong>deepen the gift, never
            change-the-most.</strong> A coach who slowly drifts into a therapist
            isn&apos;t depth — it&apos;s a broken promise. And the gift&apos;s
            depth quietly governs length: about five honest milestones per
            character, across four characters, is roughly a two-to-three-week
            arc. The method and the runtime agree.
          </p>

          {/* 09 */}
          <H2 id="the-weave" n="09">How it all intertwines</H2>
          <p>It&apos;s one flywheel. Read it as a loop:</p>
          <pre className="font-sans text-[12.5px] leading-[1.7] text-forest bg-paper-shade/60 border border-ink/15 rounded p-4 my-5 overflow-x-auto">
{`  CHOICE  ──(valence)──►  NOTE  ──(weight)──►  REL TIER
    ▲                       │                      │
    │                       │ (you curate which)   │ (milestones
  the next                  ▼                       │  unlock the
  morning's       ┌──► CHAT VOICE ◄──┐              │  heavy notes)
  beat            │   sounds like     │             ▼
    │             │  someone who      │      ACHIEVEMENT
    │             │  knows you        │      (★ choices · buffs ·
    └─────────────┴───────────────────┘       battles · mysteries)`}
          </pre>
          <p>
            A choice carries a valence; the valence shapes a note; the note&apos;s
            weight sets which REL tier it belongs to; tier-ups grant
            achievements; achievements open new choices, battles, and mysteries —
            which produce new beats, new choices, new notes. And the curated
            notes feed the one surface all of it was built for: a chat that, by
            the end, talks to you like it remembers. The story fills the
            relationship; the relationship unlocks the chat; the chat is the
            destination.
          </p>

          {/* 10 */}
          <H2 id="my-take" n="10">What I actually think</H2>
          <p className="font-body italic text-ink-soft">
            (You asked for my honest read, not a sales pitch — so here it is.)
          </p>
          <p>
            The genuinely elegant move is that <strong>one mechanism serves the
            story and the chat at the same time.</strong> Most narrative games
            treat &quot;the branching story&quot; and &quot;the AI you talk
            to&quot; as two systems bolted together. Here they&apos;re the same
            system seen from two ends — the story <em>manufactures</em> the chat.
            That&apos;s the kind of unification you can&apos;t fake in later;
            it&apos;s either the spine or it isn&apos;t.
          </p>
          <p>
            The best surprise was the locked sheet turning out to be a{" "}
            <strong>feature, not a constraint</strong>. We expected &quot;locked&quot;
            to mean &quot;limited.&quot; Instead the lock is what gives notes their
            meaning: because Kenji <em>can&apos;t</em> become anything, the notes
            that <em>do</em> land mean something. The off-lane-notes-go-inert
            result is the whole design in miniature — boundaries are what make
            the variation legible.
          </p>
          <p>
            Where I&apos;m still honest about the risk:{" "}
            <strong>curation has to actually get used.</strong> The whole payoff
            assumes players will tune their dossier — and casual players
            famously don&apos;t open settings. The presets-by-default answer is
            good, but &quot;does a normal person ever feel the knob?&quot; is a
            playtest question, not a design one. Second: the inert-notes finding
            cuts both ways — it means authoring is <em>unforgiving</em>. Every
            note must be on-lane or it&apos;s dead weight, and that puts enormous
            pressure on getting each character&apos;s gift and destination exactly
            right before any beats exist. Third: we&apos;ve proven the engine on a
            handful of notes with one character. &quot;Does it still feel like he
            knows you at note forty, across a sixty-day expansion?&quot; is
            unproven, and scale has a way of revealing seams.
          </p>
          <p>
            But the shape is right. The thing I&apos;d defend hardest is the
            sentence that organizes everything else:{" "}
            <strong>the chat is the destination, and the story is the factory
            that builds the person you get to talk to.</strong> Every mechanic on
            this page earns its place by serving that, or it doesn&apos;t ship.
          </p>

          <hr className="border-0 border-t border-ink/15 my-10" />
          <p className="font-sans text-[13px] text-ink-soft">
            More for the curious: the in-fiction{" "}
            <Link href="/wiki" className="text-forest hover:text-spot-red underline underline-offset-2">Codex</Link>,
            the playable{" "}
            <Link href="/" className="text-forest hover:text-spot-red underline underline-offset-2">Day-1 demo</Link>,
            and the{" "}
            <Link href="/wiki/mechanics" className="text-forest hover:text-spot-red underline underline-offset-2">mechanics page</Link>.
          </p>
        </article>
      </div>
    </FandomShell>
  );
}
