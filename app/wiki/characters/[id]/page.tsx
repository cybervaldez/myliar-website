// Character article — the three-zone template (companion-wiki §5): a mechanics
// INFOBOX (the crunch), an in-universe LORE BODY whose Field Notes double as an
// image-gen brief, and a walled COMMUNITY zone (the fan-art FACES gallery).
// Words before numbers. Mystery characters (Wren) render the ??? variant — the
// obscured brief only, mirroring the game's mysteryLocked. Per the comments
// decision, character pages carry fan art + owner notes, NOT open threads.

import { notFound } from "next/navigation";
import { WikiPage, Infobox, SectionHead, SpoilerTag } from "../../_components/WikiChrome";
import { FanArtSection } from "../../_components/FanArtSection";
import { DiscussionThread } from "../../_components/DiscussionThread";
import { anchors } from "../../../lib/codex";
import {
  squad,
  characterById,
  mysteryRoster,
  mysteryById,
  humanizeLexicon,
} from "../../wiki-data";

export function generateStaticParams() {
  return [...squad().map((c) => ({ id: c.id })), ...mysteryRoster().map((m) => ({ id: m.id }))];
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = characterById(id);
  if (c) return { title: `${c.name} — My Life is an RPG Wiki`, description: `${c.name}, the ${c.classLabel} of the squad.` };
  if (mysteryById(id)) return { title: "??? — My Life is an RPG Wiki", description: "A sealed entry. Keep playing." };
  return { title: "Unknown — My Life is an RPG Wiki" };
}

const STAT_LANE: Record<string, string> = {
  hana: "STR",
  kenji: "INT + GLD",
  mei: "GLD · CHR",
  sam: "INT-adjacent (meta)",
};
const GLYPH: Record<string, string> = { female: "♀", male: "♂", unknown: "⚲" };

export default async function CharacterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const breadcrumb = [
    { label: "Wiki", href: "/wiki" },
    { label: "Characters", href: "/wiki/characters" },
  ];

  // ── Mystery variant (Wren): ??? + obscured brief only ──
  const m = mysteryById(id);
  if (m) {
    return (
      <WikiPage
        title="???"
        breadcrumb={breadcrumb}
        infobox={
          <Infobox
            title="???"
            subtitle="a stranger you've met"
            rows={[
              { label: "Class", value: "▓▓▓▓▓▓" },
              { label: "Lane", value: "▓▓▓" },
              { label: "Gender", value: GLYPH[m.gender ?? "unknown"] ?? "⚲" },
              { label: "Canon", value: "Main Line · LOCKED" },
              { label: "Sealed by", value: `${m.gateCount} things you haven't done yet` },
            ]}
            footer="You haven't earned their name yet. Keep playing — it fills in when the game decides you've earned it."
          />
        }
      >
        <p className="text-ink-soft leading-[1.6]">
          You&apos;ve met them. You haven&apos;t been <em>told</em> about them. Some doors in
          here only open after you&apos;ve earned the key — and this is one of them.
        </p>
        <SectionHead id="field-notes">▸ Field Notes — what little you can make out</SectionHead>
        <p className="wiki-prose text-[14.5px] leading-[1.6] text-ink-soft italic">
          {m.mysteryAppearance ? humanizeLexicon(m.mysteryAppearance) : "A shape in the dark."}
        </p>
        <p className="text-[13px] text-margin-ink mt-3">
          The rest of this page is sealed. When the game decides you&apos;ve earned it, the
          name fills in.
        </p>
        <FanArtSection targetKind="character" targetId={m.id} mystery />
      </WikiPage>
    );
  }

  // ── Revealed canonical squad member ──
  const c = characterById(id);
  if (!c) notFound();
  const lane = STAT_LANE[c.id] ?? "—";

  return (
    <WikiPage
      title={c.name}
      breadcrumb={breadcrumb}
      infobox={
        <Infobox
          title={c.name}
          subtitle={`${c.classLabel ?? ""} · canonical squad`}
          rows={[
            { label: "Class", value: c.classLabel ?? "—" },
            { label: "Lane", value: lane },
            { label: "Specialty", value: c.specialty ?? "—" },
            { label: "Gender", value: GLYPH[c.gender ?? "unknown"] ?? "⚲" },
            {
              label: "Introduced",
              value: c.joinsDay === 0 ? "Day 0 (onboarding)" : c.joinsDay != null ? `Day ${c.joinsDay}` : "—",
            },
            { label: "Canon", value: "Main Line · LOCKED" },
            { label: "Editable", value: "No" },
          ]}
          footer="A locked canonical sheet — you can talk with them and toggle context, but not edit who they are."
        />
      }
    >
      {c.helpSummary && <p className="text-ink-soft leading-[1.6]">{c.helpSummary}</p>}
      {c.archetype && <p className="text-[13.5px] text-margin-ink italic mt-2">{c.archetype}.</p>}

      {c.appearance && (
        <>
          <SectionHead id="field-notes">▸ Field Notes</SectionHead>
          <p className="wiki-prose text-[14.5px] leading-[1.65] text-ink-soft italic">
            {humanizeLexicon(c.appearance)}
          </p>
        </>
      )}

      {c.starterPrompts.length > 0 && (
        <>
          <SectionHead id="openers">Openers</SectionHead>
          <ul className="list-none p-0 m-0 space-y-1.5">
            {c.starterPrompts.map((p, i) => (
              <li key={i} className="border-l-[3px] border-margin-ink/40 pl-3 text-[14px] text-ink-soft italic">
                &ldquo;{p}&rdquo;
              </li>
            ))}
          </ul>
        </>
      )}

      {(c.intimateTitle || c.passive) && (
        <>
          <SectionHead id="full-rel">Full-REL reward (Unspoken)</SectionHead>
          <SpoilerTag>
            <div className="text-[13.5px] leading-[1.5] space-y-1">
              {c.intimateTitle && (
                <div>
                  Intimate title: <strong>{c.intimateTitle}</strong>
                </div>
              )}
              {c.passive && (
                <div>
                  What they taught you: <strong>{c.passive.name}</strong>
                  {c.passive.critBonusPct > 0 && (
                    <span className="text-margin-ink"> · +{c.passive.critBonusPct}% (within this campaign)</span>
                  )}
                  <span className="block text-margin-ink italic mt-0.5 leading-[1.4]">{c.passive.taught}</span>
                </div>
              )}
            </div>
          </SpoilerTag>
        </>
      )}

      <FanArtSection targetKind="character" targetId={c.id} />

      <div className="mt-6 border-t border-margin-ink/30 pt-3">
        <DiscussionThread anchor={anchors.character(c.id)} anchorLabel={c.name} notesOnly />
      </div>
    </WikiPage>
  );
}
