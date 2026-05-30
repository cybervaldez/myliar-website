// Elseworld band page — the vibe + its sample encounter character.
// All from the parity export (lib/elseworld_vibes.dart).

import { notFound } from "next/navigation";
import {
  WikiPage,
  Infobox,
  Navbox,
  SectionHead,
  VoiceQuote,
} from "../../_components/WikiChrome";
import { vibeBands, elseworldSampleByBand } from "../../wiki-data";

export function generateStaticParams() {
  return vibeBands().map((b) => ({ band: b.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ band: string }>;
}) {
  const { band } = await params;
  const b = vibeBands().find((x) => x.id === band);
  if (!b) return { title: "Unknown — The Codex" };
  return {
    title: `${b.label} — Elseworlds — The Codex`,
    description: `The ${b.label} vibe band and its sample encounter.`,
  };
}

const ROLE_COLOR: Record<string, string> = {
  logical: "text-forest",
  passive: "text-ink",
  chaotic: "text-spot-red",
};

export default async function BandPage({
  params,
}: {
  params: Promise<{ band: string }>;
}) {
  const { band } = await params;
  const b = vibeBands().find((x) => x.id === band);
  if (!b) notFound();
  const s = elseworldSampleByBand(band);
  const rolledLive = !s || !s.name || s.name === "???";

  const options = s
    ? [
        { kind: "ENGAGE", opt: s.engageOption },
        { kind: "OBSERVE", opt: s.observeOption },
        { kind: "DECLINE", opt: s.declineOption },
      ].filter((o) => o.opt)
    : [];

  const infobox =
    s && !rolledLive ? (
      <Infobox
        title={s.name!}
        subtitle={`${s.classLabel ?? ""} · sample encounter`}
        rows={[
          { label: "VIBE BAND", value: b.label },
          { label: "CLASS", value: s.classLabel ?? "—" },
          { label: "SPECIALTY", value: s.specialty ?? "—" },
          {
            label: "GENDER",
            value: s.gender === "female" ? "♀ she/her" : s.gender === "male" ? "♂ he/him" : "—",
          },
          { label: "CUSTOMIZABLE", value: "Yes — player-authored" },
        ]}
        footer="Elseworld characters are fully customizable, bounded by the world rules."
      />
    ) : (
      <Infobox
        title={b.label}
        subtitle="rolled live"
        rows={[
          { label: "VIBE BAND", value: b.label },
          { label: "SAMPLE", value: "chosen at the moment you arrive" },
          { label: "CUSTOMIZABLE", value: "Yes — player-authored" },
        ]}
      />
    );

  const navbox = (
    <Navbox
      title="ELSEWORLDS"
      links={vibeBands().map((x) => ({
        label: x.label,
        href: `/wiki/elseworlds/${x.id}`,
      }))}
    />
  );

  return (
    <WikiPage
      kicker="▸ ELSEWORLD · CREATIVITY LANE"
      title={b.label}
      breadcrumb={[
        { label: "The Codex", href: "/wiki" },
        { label: "Elseworlds", href: "/wiki/elseworlds" },
      ]}
      infobox={infobox}
      navbox={navbox}
    >
      {rolledLive ? (
        <p className="text-[15px] leading-[1.6] text-ink">
          This band rolls a vibe and a character at the moment you walk in. You
          find out who they are when they speak.
        </p>
      ) : (
        <>
          {s!.archetype && (
            <p className="text-[16px] text-ink leading-[1.55] mb-2">
              <strong>{s!.archetype}.</strong>
            </p>
          )}

          {s!.coldOpen && (
            <>
              <SectionHead>The cold open</SectionHead>
              <p className="text-[15px] leading-[1.6] text-ink">{s!.coldOpen}</p>
            </>
          )}

          {s!.firstVoice && (
            <>
              <SectionHead>First words</SectionHead>
              <VoiceQuote>{s!.firstVoice}</VoiceQuote>
            </>
          )}

          {s!.personaDescription && (
            <>
              <SectionHead>Voice &amp; idiolect</SectionHead>
              <p className="text-[15px] leading-[1.6] text-ink">
                {s!.personaDescription}
              </p>
            </>
          )}

          {s!.quirk && (
            <>
              <SectionHead>Quirk</SectionHead>
              <p className="text-[15px] leading-[1.6] text-ink">{s!.quirk}</p>
            </>
          )}

          {options.length > 0 && (
            <>
              <SectionHead>How you can answer</SectionHead>
              <div className="space-y-2">
                {options.map((o) => (
                  <div
                    key={o.kind}
                    className="border-[1.5px] border-ink bg-paper-shade p-3"
                  >
                    <div
                      className={`font-display tracking-[0.14em] text-[10px] ${
                        ROLE_COLOR[o.opt!.roleHint] ?? "text-ink"
                      }`}
                    >
                      {o.kind} · {o.opt!.roleHint.toUpperCase()}
                    </div>
                    <p className="text-[14.5px] text-ink mt-1 leading-[1.4]">
                      {o.opt!.label}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      <p className="mt-9 text-[12.5px] text-margin-ink italic">
        The sample encounter is generated from the game; a live Elseworld spins
        up its own character at your chosen vibe.
      </p>
    </WikiPage>
  );
}
