// Character story-bible page — the /writers-room centerpiece. All facts
// render from the parity export (lib/characters.dart + lib/sam.dart), so
// the page can't drift from the game. Static-prerendered per character.

import { notFound } from "next/navigation";
import {
  WikiPage,
  Infobox,
  Navbox,
  SectionHead,
  VoiceQuote,
  WikiLink,
} from "../../_components/WikiChrome";
import { ImagePrompt, PortraitPlaceholder } from "../../_components/ImagePrompt";
import { NotesThread } from "../../_components/NotesThread";
import { buildCharacterPrompt } from "../../art-direction";
import { squad, characterById } from "../../wiki-data";
import { anchors } from "../../notes";

export function generateStaticParams() {
  return squad().map((c) => ({ id: c.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const c = characterById(id);
  if (!c) return { title: "Unknown — The Codex" };
  return {
    title: `${c.name} — The Codex`,
    description: `${c.name}, ${c.classLabel} — ${c.specialty}. ${c.archetype ?? ""}`,
  };
}

// Per the JRPG-party table in docs/design/rpg-framing.md §"the four
// characters are a JRPG party". Kept canon-accurate (the /writers-room
// blend gate flags mismatches here).
const STAT_LANE: Record<string, string> = {
  hana: "STR",
  kenji: "INT + GLD",
  mei: "GLD–CHR",
  sam: "INT-adjacent (meta)",
};

export default async function CharacterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const c = characterById(id);
  if (!c) notFound();

  const gender = c.gender === "female" ? "♀ she/her" : "♂ he/him";
  const prompt = buildCharacterPrompt(c);

  const infobox = (
    <>
      <PortraitPlaceholder caption={`${c.name.toUpperCase()} · ${c.classLabel.toUpperCase()}`} />
      <Infobox
      title={c.name}
      subtitle={`${c.classLabel} · ${c.specialty}`}
      rows={[
        { label: "CLASS", value: c.classLabel },
        { label: "SPECIALTY", value: c.specialty },
        {
          label: "JOINS",
          value:
            c.joinsDay === 0
              ? "Day 0 — runs the tutorial"
              : `Day ${c.joinsDay}`,
        },
        { label: "STAT LANE", value: STAT_LANE[c.id] ?? "—" },
        { label: "GENDER", value: gender },
        {
          label: "RELATIONSHIP",
          value: (
            <>
              shares the <WikiLink to="REL">10-tier REL ladder</WikiLink>
            </>
          ),
        },
        { label: "CUSTOMIZABLE", value: "No — locked canon" },
      ]}
      footer="Locked canonical sheet. Chat yes, toggle context yes, edit no."
      />
    </>
  );

  const navbox = (
    <Navbox
      title="DRAMATIS PERSONAE"
      links={squad()
        .slice()
        .sort((a, b) => (a.joinsDay ?? 0) - (b.joinsDay ?? 0))
        .map((m) => ({ label: m.name, href: `/wiki/characters/${m.id}` }))}
    />
  );

  return (
    <WikiPage
      kicker={`${c.classLabel.toUpperCase()} · LOCKED CANON`}
      title={c.name}
      breadcrumb={[
        { label: "The Codex", href: "/wiki" },
        { label: "Dramatis Personae", href: "/wiki/characters" },
      ]}
      infobox={infobox}
      navbox={navbox}
    >
      {c.archetype && (
        <p className="text-[16px] text-ink leading-[1.55] mb-2">
          <strong>{c.archetype}.</strong>
        </p>
      )}

      {c.helpSummary && (
        <>
          <SectionHead>How they help</SectionHead>
          <VoiceQuote>{c.helpSummary}</VoiceQuote>
        </>
      )}

      {c.starterPrompts.length > 0 && (
        <>
          <SectionHead>Things you might open with</SectionHead>
          <ul className="list-none p-0 space-y-2">
            {c.starterPrompts.map((p, i) => (
              <li
                key={i}
                className="border-l-2 border-margin-ink/50 pl-3 font-body italic text-[14.5px] text-ink-soft"
              >
                &ldquo;{p}&rdquo;
              </li>
            ))}
          </ul>
        </>
      )}

      <SectionHead>Art · portrait brief</SectionHead>
      <p className="text-[14px] leading-[1.55] text-ink-soft mb-3">
        No portrait yet — here&apos;s a paste-ready prompt instead. The subject
        is built from {c.name}&apos;s canonical sheet; the visual style is the
        house art direction so the whole roster renders as one set.
      </p>
      <ImagePrompt bundle={prompt} kind="portrait" />

      <p className="mt-9 text-[12.5px] text-margin-ink italic">
        Character facts are generated from the game&apos;s own sheet; the visual
        design in the brief is editorial art direction (the game has no portrait
        data yet).
      </p>

      <NotesThread anchor={anchors.character(c.id)} anchorLabel={c.name} />
    </WikiPage>
  );
}
