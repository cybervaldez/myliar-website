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
  if (!c) return { title: "Unknown — Wiki" };
  return {
    title: `${c.name} — Wiki`,
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
        { label: "Wiki", href: "/wiki" },
        { label: "Characters", href: "/wiki/characters" },
      ]}
      infobox={infobox}
      toc={[
        { id: "who", label: `Who ${c.name} is` },
        { id: "help", label: `What ${p.subj} helps with` },
        ...(c.starterPrompts.length ? [{ id: "openers", label: "Stuff to open with" }] : []),
        { id: "art", label: "Art" },
        { id: "community-notes", label: "Talk" },
      ]}
      navbox={navbox}
    >
      {/* Lead — casual. */}
      <p className="text-[15px] leading-[1.6] mb-1">
        <strong>{c.name}</strong> is the squad&apos;s {c.classLabel}.{" "}
        {p.poss} whole thing is {c.specialty}
        {c.archetype ? ` — ${c.archetype.toLowerCase()}` : ""}.{" "}
        {c.joinsDay === 0
          ? `You meet ${c.name} on Day 0 — ${p.subj} runs the tutorial.`
          : `You first meet ${c.name} on Day ${c.joinsDay}.`}{" "}
        {p.Subj} covers the{" "}
        <WikiLink to={c.id}>{STAT_LANE[c.id] ?? "—"}</WikiLink> stat.
      </p>

      <SectionHead id="who">👤 Who {c.name} is</SectionHead>
      <p className="text-[15px] leading-[1.6]">
        {c.name} is a <strong>set character</strong> — you can&apos;t change{" "}
        {p.poss.toLowerCase()} personality. But you do talk to {p.subj}, and you
        control what {p.subj} remembers about you: toggle any note or skill on
        or off, or delete it. Doing things in {p.poss.toLowerCase()} area (
        {c.specialty}) bumps your {STAT_LANE[c.id] ?? "—"} stat. See{" "}
        <WikiLink to="trichotomy">How to Play</WikiLink> for how choices earn
        stats.
      </p>

      <SectionHead id="help">🤝 What {p.subj} helps with</SectionHead>
      {c.helpSummary ? (
        <>
          <p className="text-[15px] leading-[1.6] mb-1">Here&apos;s how {p.subj} puts it:</p>
          <VoiceQuote>{c.helpSummary}</VoiceQuote>
        </>
      ) : (
        <p className="text-[15px] leading-[1.6] text-margin-ink italic">
          ({p.Subj} doesn&apos;t do player coaching — {p.subj}&apos;s the one who
          explains the game.)
        </p>
      )}

      {c.starterPrompts.length > 0 && (
        <>
          <SectionHead id="openers">💬 Stuff to open with</SectionHead>
          <p className="text-[15px] leading-[1.6] mb-1.5">
            Lines the chat suggests when you don&apos;t know where to start:
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

      <SectionHead id="art">🎨 Art</SectionHead>
      <p className="text-[14px] leading-[1.55] text-ink-soft mb-3">
        No picture yet! Here&apos;s a ready-to-paste prompt that builds {c.name}{" "}
        from {p.poss.toLowerCase()} character sheet plus the game&apos;s art
        style — drop it into an image generator.
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
