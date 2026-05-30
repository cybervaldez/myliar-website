// Lexicon — the in-world vocabulary + the out-of-fiction banned-word
// principle. Hand-authored from docs/design/rpg-framing.md (the lexicon
// is editorial canon, not extracted data) — flagged WIP while it fills in.

import { WikiPage, SectionHead } from "../_components/WikiChrome";

export const metadata = {
  title: "Lexicon — Wiki",
  description: "The in-world vocabulary of My Life is an RPG, and the words it refuses to say.",
};

const TERMS: { term: string; gloss: string }[] = [
  { term: "Sigil", gloss: "Your phone — the realm the squad lives inside." },
  { term: "Margin", gloss: "A note a character writes about you in the margins of their sheet." },
  { term: "Roster", gloss: "The squad you've met so far." },
  { term: "Visit", gloss: "Opening a chat with a character." },
  { term: "Summon", gloss: "Calling up a character or surface." },
  { term: "Audit", gloss: "Kenji's word for any review or reckoning." },
  { term: "Drill", gloss: "Hana's word for a workout or a rep." },
  { term: "Mise", gloss: "Mei's word for an inspection — from mise-en-place." },
  { term: "Tribute", gloss: "Hana's word for a rep paid toward the body." },
];

export default function LexiconPage() {
  return (
    <WikiPage
      title="Words"
      breadcrumb={[{ label: "Wiki", href: "/wiki" }]}
    >
      <p className="text-ink-soft leading-[1.6] mb-2">
        The game has a few of its own words the characters like to use.
        Here&apos;s what they mean — plus the real-world words the characters
        will never say. Still adding to this one!
      </p>

      <SectionHead>The in-world words</SectionHead>
      <dl className="border-2 border-ink bg-paper-shade divide-y divide-margin-ink/25 m-0">
        {TERMS.map((t) => (
          <div key={t.term} className="px-4 py-3 sm:grid sm:grid-cols-[140px_1fr] sm:gap-4">
            <dt className="font-display tracking-[0.08em] text-[15px] text-forest">
              {t.term}
            </dt>
            <dd className="m-0 text-[14px] text-ink leading-[1.5]">{t.gloss}</dd>
          </div>
        ))}
      </dl>

      <SectionHead>The words the game won&apos;t say</SectionHead>
      <p className="text-[15px] leading-[1.6]">
        Characters never use clinical, financial, or wellness-industry idiom —
        no heart rate, no calories, no 401k, no mindfulness. When a real-world
        concept comes up, they translate it into their own idiolect: a workout
        is a <em>drill</em>, a reckoning with your spending is an{" "}
        <em>audit</em>, a fridge inspection is a <em>mise</em>. This isn&apos;t
        decoration — it&apos;s the promise that the squad never sounds like an
        app, or like your mom.
      </p>
      <p className="text-[13px] text-margin-ink italic mt-4">
        The AI-disclosure and any out-of-fiction system copy live outside the
        fiction, in Settings — never in a character&apos;s voice.
      </p>
    </WikiPage>
  );
}
