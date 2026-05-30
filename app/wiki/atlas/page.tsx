// Atlas — the phone-realm map, rendered from the parity export (the same
// asset the in-game viewer reads). Portals listed with their destination
// bands.

import Link from "next/link";
import { PannableAscii } from "../../components/PannableAscii";
import { WikiPage, Infobox, Navbox } from "../_components/WikiChrome";
import { phoneRealmMap, vibeBands } from "../wiki-data";

export const metadata = {
  title: "Atlas — The Codex",
  description: "The Courtyard — the phone-realm map of My Life is an RPG.",
};

// The five real portals lead to five of the six bands (surprise-me rolls
// live and has no fixed portal). Pair labels with band routes.
const PORTAL_BANDS = [
  "golden-age-fantasy",
  "80s-fantasy-and-cyber",
  "90s-anime-and-fantasy",
  "isekai-and-party-rpg",
  "cottagecore-and-cozy",
];

export default function AtlasPage() {
  const bands = vibeBands();
  const portals = PORTAL_BANDS.map((id) => bands.find((b) => b.id === id)).filter(
    (b): b is { id: string; label: string } => Boolean(b),
  );

  const infobox = (
    <Infobox
      title="The Courtyard"
      subtitle="phone realm"
      rows={[
        { label: "RENDER", value: "Navigable" },
        { label: "METAPHOR", value: "Village green" },
        { label: "RESIDENTS", value: "Sam · Hana · Kenji · Mei" },
        { label: "PORTALS", value: `${portals.length} (+ surprise-me, rolled live)` },
      ]}
      footer="In-game this map is tap-navigable; here it's the cartographer's draft."
    />
  );

  return (
    <WikiPage
      kicker="▸ ATLAS · PHONE REALM"
      title="The Courtyard"
      breadcrumb={[{ label: "The Codex", href: "/wiki" }]}
      infobox={infobox}
      navbox={
        <Navbox
          title="PORTALS LEAD TO"
          links={portals.map((b) => ({
            label: b.label,
            href: `/wiki/elseworlds/${b.id}`,
          }))}
        />
      }
    >
      <p className="text-ink-soft leading-[1.6] mb-5">
        The four canonical characters live together inside your phone — a
        communal green with a character space at each edge and a gate of five
        portals leading out to the Elseworlds.
      </p>

      <div className="border-2 border-ink bg-paper-shade p-3 sm:p-4 shadow-[6px_6px_0_0_rgba(26,26,26,0.12)] mb-4">
        <PannableAscii ariaLabel="phone-realm courtyard map">
          <pre className="font-mono text-[10px] sm:text-[12px] leading-[1.25] text-ink whitespace-pre m-0">
            {phoneRealmMap()}
          </pre>
        </PannableAscii>
      </div>

      <p className="text-[13px] text-margin-ink italic mb-6">
        The full interactive map (pan &amp; zoom) lives at{" "}
        <Link href="/map" className="text-forest hover:text-spot-red">
          /map
        </Link>
        . The Elseworld realm maps are still on the cartographer&apos;s queue.
      </p>

      <p className="text-[12.5px] text-margin-ink italic">
        This map is generated from the game&apos;s runtime asset — it is the
        same courtyard the in-game viewer renders.
      </p>
    </WikiPage>
  );
}
