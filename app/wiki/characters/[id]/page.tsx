// Character article — encyclopedic, neutral third-person. Facts are
// generated from the game's own sheet (parity); the prose is the
// connective tissue. Old-wiki layout: lead → contents → sections.

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
    description: `${c.name}, a ${c.classLabel}-class character in My Life is an RPG.`,
  };
}

// Per the JRPG-party table in docs/design/rpg-framing.md.
const STAT_LANE: Record<string, string> = {
  hana: "STR",
  kenji: "INT + GLD",
  mei: "GLD–CHR",
  sam: "INT-adjacent (meta)",
};

const PRONOUN: Record<string, { subj: string; Subj: string; poss: string }> = {
  female: { subj: "she", Subj: "She", poss: "Her" },
  male: { subj: "he", Subj: "He", poss: "His" },
};

export default async function CharacterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const c = characterById(id);
  if (!c) notFound();

  const p = PRONOUN[c.gender ?? "female"] ?? PRONOUN.female;
  const prompt = buildCharacterPrompt(c);
  const joinClause =
    c.joinsDay === 0
      ? "introduced on Day 0, where he runs the tutorial"
      : `introduced on Day ${c.joinsDay}`;

  const infobox = (
    <>
      <PortraitPlaceholder caption={`${c.name.toUpperCase()} · ${c.classLabel.toUpperCase()}`} />
      <Infobox
        title={c.name}
        subtitle={`${c.classLabel} · canonical squad`}
        rows={[
          { label: "Class", value: c.classLabel },
          { label: "Specialty", value: c.specialty },
          {
            label: "Introduced",
            value: c.joinsDay === 0 ? "Day 0 (tutorial)" : `Day ${c.joinsDay}`,
          },
          { label: "Stat lane", value: STAT_LANE[c.id] ?? "—" },
          { label: "Gender", value: c.gender === "female" ? "Female" : "Male" },
          {
            label: "Relationship",
            value: <WikiLink to="REL">10-tier REL ladder</WikiLink>,
          },
          { label: "Editable", value: "No (locked canon)" },
        ]}
        footer="Locked canonical sheet — players may chat and toggle context, but not edit the character."
      />
    </>
  );

  const navbox = (
    <Navbox
      title="The squad"
      links={squad()
        .slice()
        .sort((a, b) => (a.joinsDay ?? 0) - (b.joinsDay ?? 0))
        .map((m) => ({ label: m.name, href: `/wiki/characters/${m.id}` }))}
    />
  );

  return (
    <WikiPage
      title={c.name}
      breadcrumb={[
        { label: "The Codex", href: "/wiki" },
        { label: "Characters", href: "/wiki/characters" },
      ]}
      infobox={infobox}
      toc={[
        { id: "role", label: "Role" },
        { id: "voice", label: "Voice" },
        ...(c.starterPrompts.length ? [{ id: "openers", label: "Sample openers" }] : []),
        { id: "art", label: "Art" },
        { id: "community-notes", label: "Discussion" },
      ]}
      navbox={navbox}
    >
      {/* Lead paragraph — encyclopedic. */}
      <p className="text-[15px] leading-[1.6] mb-1">
        <strong>{c.name}</strong> is a {c.classLabel}-class character in{" "}
        <em>My Life is an RPG</em> and one of the four canonical members of the
        squad. {p.Subj} is {joinClause} and holds the{" "}
        <WikiLink to={c.id}>{STAT_LANE[c.id] ?? "—"}</WikiLink> stat lane; {p.poss.toLowerCase()}{" "}
        domain is {c.specialty}.
        {c.archetype && ` ${p.Subj} is characterised as a ${c.archetype.toLowerCase()}.`}
      </p>

      <SectionHead id="role">Role</SectionHead>
      <p className="text-[15px] leading-[1.6]">
        {c.name} is a <strong>locked canonical sheet</strong>: the player can
        talk with {p.subj}, toggle which memories and skills {p.subj} carries
        into a reply, and delete notes, but cannot edit {p.poss.toLowerCase()}{" "}
        personality. {p.Subj} occupies the {STAT_LANE[c.id] ?? "—"} stat lane —
        actions in {p.poss.toLowerCase()} domain ({c.specialty}) move that stat.
        See <WikiLink to="trichotomy">the daily loop</WikiLink> for how choices
        earn stats.
      </p>

      <SectionHead id="voice">Voice</SectionHead>
      {c.helpSummary ? (
        <>
          <p className="text-[15px] leading-[1.6] mb-1">
            In {p.poss.toLowerCase()} own words, on what {p.subj} offers the
            player:
          </p>
          <VoiceQuote>{c.helpSummary}</VoiceQuote>
        </>
      ) : (
        <p className="text-[15px] leading-[1.6] text-margin-ink italic">
          (No player-help line on this sheet.)
        </p>
      )}

      {c.starterPrompts.length > 0 && (
        <>
          <SectionHead id="openers">Sample openers</SectionHead>
          <p className="text-[15px] leading-[1.6] mb-1.5">
            Lines the empty chat suggests the player might open with:
          </p>
          <ul className="list-disc list-inside m-0 p-0 space-y-1">
            {c.starterPrompts.map((s, i) => (
              <li key={i} className="text-[14px] italic text-ink-soft">
                &ldquo;{s}&rdquo;
              </li>
            ))}
          </ul>
        </>
      )}

      <SectionHead id="art">Art</SectionHead>
      <p className="text-[14px] leading-[1.55] text-ink-soft mb-3">
        No portrait has been produced yet. The brief below builds the subject
        from {c.name}&apos;s canonical sheet and adds the house art direction.
      </p>
      <ImagePrompt bundle={prompt} kind="portrait" />

      <div id="community-notes">
        <NotesThread anchor={anchors.character(c.id)} anchorLabel={c.name} />
      </div>

      <p className="mt-8 text-[12px] text-margin-ink italic border-t border-ink/15 pt-3">
        Character facts are generated from the game&apos;s own sheet; the visual
        design in the art brief is editorial (the game has no portrait data
        yet).
      </p>
    </WikiPage>
  );
}
