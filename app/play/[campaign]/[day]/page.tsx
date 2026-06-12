// /play/[campaign]/[day] — the player. The day is the deep-linkable POSITION;
// the rest of the path (event phase, choices, dice seed) rides in the query, so
// the full URL reproduces a run. All state is derived from the URL (see PlayRunner).

import { notFound } from "next/navigation";
import Link from "next/link";
import parity from "../../../lib/parity.generated.json";
import { CAMPAIGN_MAP } from "../../campaigns";
import PlayRunner, { type PlayDay, type VitalMap } from "../PlayRunner";

export default async function PlayDayPage({
  params,
  searchParams,
}: {
  params: Promise<{ campaign: string; day: string }>;
  searchParams: Promise<{ e?: string; p?: string; seed?: string; id?: string; vibe?: string; td?: string; nm?: string; leadIn?: string; hf?: string }>;
}) {
  const { campaign, day } = await params;
  const sp = await searchParams;
  const m = CAMPAIGN_MAP[campaign];
  if (!m) notFound();
  const days = (parity as unknown as Record<string, { days?: PlayDay[] }>)[m.parityKey]?.days ?? [];
  const vitals = (parity as unknown as { vitals?: VitalMap }).vitals ?? {};
  const version = (parity as unknown as { version?: { runId?: string; contentHash?: string } }).version ?? {};
  const relTiers = (parity as unknown as { relTiers?: { thresholds?: number[]; names?: string[] } }).relTiers ?? {};
  const relThresholds = relTiers.thresholds ?? [];
  const relNames = relTiers.names ?? [];
  // The crit-buff inputs: achievement id → critBonusPct, and this campaign's cast
  // passives (id + critBonusPct) so an Unspoken coach's "what they taught you" nudge
  // can be replayed (see PlayRunner.passiveCritBonus).
  const achList = (parity as unknown as { achievements?: { id: string; critBonusPct?: number }[] }).achievements ?? [];
  const critBonusById: Record<string, number> = {};
  for (const a of achList) if (a.critBonusPct) critBonusById[a.id] = a.critBonusPct;
  // the Day-1 opening hook (the cover) — from the matching parity campaign.
  const campaigns = (parity as unknown as { campaigns?: { id: string; openingHook?: string }[] }).campaigns ?? [];
  const openingHook = campaigns.find((cm) => cm.id === campaign)?.openingHook ?? "";
  const dayNum = parseInt(day, 10);
  const di = days.findIndex((d) => d.globalDayIndex === dayNum);
  if (di < 0) notFound();
  const { parityKey, ...rest } = m;
  type CastMember = { id: string; name?: string; title?: string; titles?: string[]; passive?: { critBonusPct?: number } | null };
  const cast: CastMember[] = parityKey === "mainline"
    ? ((parity as unknown as { squad?: CastMember[] }).squad ?? [])
    : ((parity as unknown as Record<string, { cast?: CastMember[] }>)[parityKey]?.cast ?? []);
  const castPassives = cast
    .filter((c) => c.passive && (c.passive.critBonusPct ?? 0) > 0)
    .map((c) => ({ id: c.id, critBonusPct: c.passive!.critBonusPct ?? 0 }));
  // id → display parts, so the run renders cast names per the names-show pref (td) instead of raw ids.
  const castLite = cast.map((c) => ({ id: c.id, name: c.name, title: c.titles?.[0] ?? c.title }));
  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "20px 16px 64px" }}>
      <p style={{ fontSize: 12, color: "var(--margin-ink)", marginBottom: 14 }}>
        <Link href="/" style={{ color: "var(--forest)" }}>← site</Link>
        {"   ·   ⌂ home (below) returns to the front door; the URL is the path — share it to replay this exact run."}
      </p>
      <PlayRunner meta={{ campaign, ...rest }} days={days} di={di} e={sp.e ?? "intro"} pathStr={sp.p ?? ""} seed={sp.seed ?? ""} vitals={vitals} relThresholds={relThresholds} relNames={relNames} critBonusById={critBonusById} castPassives={castPassives} castLite={castLite} version={version} openingHook={openingHook} lockedPrefs={{ id: sp.id ?? "", vibe: sp.vibe ?? "", td: sp.td ?? "", nm: sp.nm ?? "", leadIn: sp.leadIn ?? "", hf: sp.hf ?? "" }} />
    </main>
  );
}
