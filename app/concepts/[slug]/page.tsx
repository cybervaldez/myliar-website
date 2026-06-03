// /concepts/[slug] — one concept's cast. While nameless it's a Step-1 vibe board; once the cast is
// NAMED + canon-locked it becomes the campaign's RECORD (the website is the documentary of how a
// campaign was built). Multiple fit-for-purpose views (Bible / Sheet / Kanban / List). Next 16: params async.

import Link from "next/link";
import { notFound } from "next/navigation";
import board from "../../lib/storyboard.json";
import { FandomShell } from "../../_components/FandomShell";
import { CastView, type CastMember } from "../CastView";
import { CampaignSystems } from "../CampaignSystems";

type Concept = { name: string; slug: string; status: string; gift: string; cast: string; trend: string; note: string; theme?: string; statReskin?: string; castMembers: CastMember[] };

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
      <div className="font-sans text-[11px] uppercase tracking-[0.1em] text-margin-ink mb-3">{c.status}</div>

      <div className="border-2 border-ink bg-paper-shade/40 p-4 mb-6 max-w-[760px]">
        <p className="text-[14px] leading-[1.5]"><strong>Gift:</strong> {c.gift}</p>
        <p className="text-[12px] text-ink-soft leading-[1.5] mt-1">↑ {c.trend}</p>
        <p className="text-[12px] text-margin-ink leading-[1.5] mt-1 italic">{c.note}</p>
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
