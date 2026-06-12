// /play/[campaign] — the FRONT DOOR (docs/design/front-door-interaction.md). Was: an
// instant redirect into Day 1. Now: the pre-campaign screen — a spoiler-safe PREVIEW
// of what's inside (??? you fill in by playing) + the PREFERENCE GATE (who you play
// as + the vibe, each with a no-spoiler "what this changes" list), which START locks
// into the run URL. Returning via HOME shows the locked prefs + RESUME / RESET.

import { notFound } from "next/navigation";
import Link from "next/link";
import parity from "../../lib/parity.generated.json";
import { CAMPAIGN_MAP } from "../campaigns";
import FrontDoor from "./FrontDoor";
import { type LeadInData } from "./LeadInBoard";

type ParityCampaign = {
  id: string; title?: string; tagline?: string; gift?: string; whatYouGet?: string[]; openingHook?: string;
  campaignType?: string; relationshipCategory?: string; romanceEnabled?: boolean;
  intensity?: string; tone?: string; tropes?: string[]; leadIn?: LeadInData | null;
};

export default async function PlayLanding({
  params, searchParams,
}: {
  params: Promise<{ campaign: string }>;
  searchParams: Promise<{ id?: string; vibe?: string; td?: string; nm?: string; hf?: string; resume?: string }>;
}) {
  const { campaign } = await params;
  const sp = await searchParams;
  const m = CAMPAIGN_MAP[campaign];
  if (!m) notFound();
  const days = (parity as unknown as Record<string, { days?: { globalDayIndex?: number; episodeTitle?: string }[] }>)[m.parityKey]?.days ?? [];
  if (!days.length) notFound();
  const firstDay = days[0]?.globalDayIndex ?? 1;
  // the REAL Day-1 episode title (playtest fix #1A — the bridge must never promise a chapter the run doesn't open)
  const firstDayTitle = days[0]?.episodeTitle ?? "";
  const cm = (parity as unknown as { campaigns?: ParityCampaign[] }).campaigns?.find((c) => c.id === campaign);
  // the cast ROLES (the preview hook) + a sample name for the title-display example.
  // id is needed so the lead-in Scene Board can join helper → name + Day-1 title.
  type Cast = { id?: string; name?: string; titles?: string[]; title?: string; appearance?: string };
  const cast: Cast[] = m.parityKey === "mainline"
    ? ((parity as unknown as { squad?: Cast[] }).squad ?? [])
    : ((parity as unknown as Record<string, { cast?: Cast[] }>)[m.parityKey]?.cast ?? []);
  const castTitles = cast.map((c) => c.titles?.[0]).filter((t): t is string => !!t);
  const castSampleName = cast.find((c) => c.titles?.[0])?.name ?? cast[0]?.name ?? "You";
  // the name-collision set: cast names + story-significant non-cast names
  // (e.g. Maya) — presets filter on it; free-typed matches get a gentle note.
  const castNames = cast.map((c) => c.name).filter((n): n is string => !!n);
  const reservedNames = [...castNames, ...((cm as unknown as { storyNames?: string[] })?.storyNames ?? [])];
  const seed = Math.floor(Math.random() * 1e9).toString(36); // a fresh run's dice seed
  const locked = sp.id || sp.vibe || sp.td || sp.nm || sp.hf
    ? { id: sp.id ?? "", vibe: sp.vibe ?? "", td: sp.td ?? "", nm: sp.nm ?? "", hf: sp.hf ?? "" } : null;

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "20px 16px 64px" }}>
      <p style={{ fontSize: 12, color: "var(--margin-ink)", marginBottom: 14 }}>
        <Link href="/" style={{ color: "var(--forest)" }}>← site</Link>
        {"   ·   the campaign front door — see what's inside, set your story, then start."}
      </p>
      <FrontDoor
        campaign={campaign}
        title={cm?.title ?? m.title}
        tagline={cm?.tagline ?? ""}
        dayUnit={m.dayUnit}
        daysCount={days.length}
        firstDay={firstDay}
        firstDayTitle={firstDayTitle}
        seed={seed}
        gift={cm?.gift ?? ""}
        whatYouGet={cm?.whatYouGet ?? []}
        castTitles={castTitles}
        castSampleName={castSampleName}
        castNames={reservedNames}
        leadIn={cm?.leadIn ?? null}
        leadInCast={cast}
        openingHook={cm?.openingHook ?? ""}
        taxonomy={{
          campaignType: cm?.campaignType, relationshipCategory: cm?.relationshipCategory,
          romanceEnabled: cm?.romanceEnabled, intensity: cm?.intensity, tone: cm?.tone, tropes: cm?.tropes,
        }}
        locked={locked}
        resume={sp.resume ?? null}
      />
    </main>
  );
}
