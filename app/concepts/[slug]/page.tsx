// /concepts/[slug] — one concept's cast. While nameless it's a Step-1 vibe board; once the cast is
// NAMED + canon-locked it becomes the campaign's RECORD (the website is the documentary of how a
// campaign was built). Multiple fit-for-purpose views (Bible / Sheet / Kanban / List). Next 16: params async.

import Link from "next/link";
import { notFound } from "next/navigation";
import board from "../../lib/storyboard.json";
import { FandomShell } from "../../_components/FandomShell";
import { CastView, type CastMember } from "../CastView";
import { CampaignSystems } from "../CampaignSystems";

type RecRead = { id: string; why: string };
type ShelfItem = { title: string | null; creator?: string | null; medium: string; coverageBrief: string; status: string; monetized?: boolean };
type Concept = { name: string; slug: string; status: string; gift: string; cast: string; note: string; trend?: string; source?: string; legs?: string; keep?: string; theme?: string; statReskin?: string; castMembers: CastMember[]; sourceCategory?: string; sourceCategoryWhy?: string; collection?: string; collectionNote?: string; recommendedReads?: RecRead[]; realShelf?: ShelfItem[] };

const CAT_STYLE: Record<string, string> = {
  original: "border-forest text-forest",
  inspiration: "border-[#0645ad] text-[#0645ad]",
  audience: "border-spot-red text-spot-red",
};
const shelfTitle = (id: string) => id.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());

export async function generateStaticParams() {
  return (board.concept.candidates ?? []).map((c) => ({ slug: (c as { slug: string }).slug }));
}

export default async function ConceptDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = (board.concept.candidates ?? []).find((x) => (x as { slug: string }).slug === slug) as
    | Concept
    | undefined;
  if (!c) notFound();

  const members = Array.isArray(c.castMembers) ? c.castMembers : [];
  const locked = members.length > 0 && members.every((m) => m.name);

  return (
    <FandomShell active="/concepts">
      <Link href="/concepts" className="text-[#0645ad] text-[13px] hover:underline">← All concepts</Link>
      <div className="font-sans text-[11px] uppercase tracking-[0.22em] text-spot-red mt-3">{locked ? "Campaign cast · canon-locked" : "Concept · step 1 — cast"}</div>
      <h1 className="font-display text-[38px] leading-[1.0] mt-1 mb-1">{c.name}</h1>
      <div className="font-sans text-[11px] uppercase tracking-[0.1em] text-margin-ink mb-1">{c.status}</div>
      <div className="flex items-center gap-2 flex-wrap mb-3">
        {c.sourceCategory && <span title={c.sourceCategoryWhy} className={`font-sans text-[9.5px] uppercase tracking-[0.1em] border px-1.5 py-[2px] ${CAT_STYLE[c.sourceCategory] ?? "border-ink/40 text-margin-ink"}`}>{c.sourceCategory === "inspiration" ? "⚓ inspiration" : c.sourceCategory} lane</span>}
        {c.collection && <span className="font-sans text-[9.5px] uppercase tracking-[0.1em] border border-ink/30 text-margin-ink px-1.5 py-[2px]">▤ {shelfTitle(c.collection)}</span>}
      </div>

      <div className="border-2 border-ink bg-paper-shade/40 p-4 mb-6 max-w-[760px]">
        <p className="text-[14px] leading-[1.5]"><strong>Gift:</strong> {c.gift}</p>
        {c.legs && <p className="text-[13px] leading-[1.5] mt-1.5"><strong className="text-spot-red">Legs</strong> <span className="text-margin-ink">(what the STORY brings — the front-door hook):</span> {c.legs}</p>}
        {c.keep && <p className="text-[13px] leading-[1.5] mt-1"><strong className="text-spot-red">Keep</strong> <span className="text-margin-ink">(what the player walks out HOLDING):</span> {c.keep}</p>}
        {c.source && <p className="text-[11px] text-margin-ink leading-[1.5] mt-2">⚓ <strong>Source anchor</strong> <span className="italic">(private analytical truth — never ships; the concept is IP-stripped):</span> {c.source}</p>}
        {c.trend && <p className="text-[12px] text-ink-soft leading-[1.5] mt-1">↑ {c.trend}</p>}
        <p className="text-[12px] text-margin-ink leading-[1.5] mt-1 italic">{c.note}</p>
        {(c.recommendedReads ?? []).length > 0 && (
          <div className="mt-2 pt-2 border-t border-ink/15">
            <div className="font-sans text-[9px] uppercase tracking-[0.1em] text-forest mb-1">Your next read (post-graduation, door-open)</div>
            {(c.recommendedReads ?? []).map((r) => (
              <p key={r.id} className="text-[12px] leading-[1.5]"><Link href={`/concepts/${r.id}`} className="text-[#0645ad] hover:underline font-bold">→ {r.id}</Link> <span className="text-margin-ink italic">{r.why}</span></p>
            ))}
          </div>
        )}
        {c.collectionNote && <p className="text-[10.5px] text-margin-ink leading-[1.5] mt-2 italic">{c.collectionNote}</p>}
        {(c.realShelf ?? []).length > 0 && (
          <div className="mt-2 pt-2 border-t border-ink/15">
            <div className="font-sans text-[9px] uppercase tracking-[0.1em] text-spot-red mb-1">▦ The Real Shelf — kindred real-world media (real-shelf.md; referral-monetized where clean)</div>
            {(c.realShelf ?? []).map((s, i) => (
              <p key={i} className="text-[12px] leading-[1.5]">
                <span className="font-sans text-[9px] uppercase tracking-[0.08em] border border-ink/30 px-1 mr-1.5">{s.medium}</span>
                {s.title ?? <em className="text-margin-ink">to curate</em>}
                {s.monetized && <span className="font-sans text-[8.5px] uppercase tracking-[0.08em] text-spot-red ml-1.5">affiliate</span>}
                <span className="text-margin-ink italic"> — {s.coverageBrief}</span>
              </p>
            ))}
          </div>
        )}
      </div>

      {locked && <CampaignSystems theme={c.theme} statReskin={c.statReskin} cast={members} />}

      <h2 className="font-display text-[24px] text-forest">{locked ? "The cast — named & canon-locked" : "The cast — by vibe (names come last)"}</h2>
      <p className="text-[12px] text-margin-ink mt-1 mb-4">
        {locked
          ? <>The campaign&apos;s record. Pick the view that fits the question: <strong>Bible</strong> (deep profiles — intro line · voice · what they&apos;d never say), <strong>Sheet</strong> (the design grid + EARNS unlock), <strong>Kanban</strong> (the ensemble by temperament).</>
          : <>Working roles + temperament, no names yet. This is where you shape the ensemble — flip to <strong>Sheet</strong> for the whole design at a glance (stat · gift · full-REL reward).</>}
      </p>
      <CastView cast={members} />
    </FandomShell>
  );
}
