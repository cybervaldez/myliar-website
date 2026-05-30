// Elseworlds — index of the six vibe bands. Each links to its sample
// encounter character. Data from the parity export.

import Link from "next/link";
import { WikiPage } from "../_components/WikiChrome";
import { vibeBands, elseworldSampleByBand } from "../wiki-data";

export const metadata = {
  title: "Elseworlds — Wiki",
  description: "The six vibe bands of My Life is an RPG and their sample encounters.",
};

export default function ElseworldsIndex() {
  return (
    <WikiPage
      title="Elseworlds"
      breadcrumb={[{ label: "Wiki", href: "/wiki" }]}
    >
      <p className="text-ink-soft leading-[1.6] mb-6">
        Step through a door in the{" "}
        <Link href="/wiki/atlas">Courtyard</Link> and you land in an Elseworld —
        a little side-world in one of six flavors. The strangers you meet there
        are <strong>yours to make your own</strong>. Each one comes with a
        ready-made character to show you the vibe.
      </p>

      <div className="grid sm:grid-cols-2 gap-4">
        {vibeBands().map((b) => {
          const s = elseworldSampleByBand(b.id);
          return (
            <Link
              key={b.id}
              href={`/wiki/elseworlds/${b.id}`}
              className="block border-[1.5px] border-ink bg-paper-shade p-4 hover:bg-paper transition !border-b-[1.5px] group"
            >
              <div className="font-display text-[20px] leading-tight group-hover:text-spot-red transition">
                {b.label}
              </div>
              {s && s.name && s.name !== "???" ? (
                <div className="font-display tracking-[0.12em] text-[10px] text-margin-ink mt-1">
                  SAMPLE · {s.name.toUpperCase()} · {s.classLabel}
                </div>
              ) : (
                <div className="font-display tracking-[0.12em] text-[10px] text-margin-ink mt-1">
                  ROLLED LIVE
                </div>
              )}
              {s && s.archetype && (
                <p className="text-[13.5px] text-ink-soft italic mt-2 leading-[1.45]">
                  {s.archetype}
                </p>
              )}
            </Link>
          );
        })}
      </div>
    </WikiPage>
  );
}
