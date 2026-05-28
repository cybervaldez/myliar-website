import Link from "next/link";
import { PannableAscii } from "../components/PannableAscii";

// THE COURTYARD — phone-realm map. The ASCII below is a 1:1 mirror of
// assets/realm-maps/phone-realm.txt (the runtime asset rendered by the
// in-game viewer at lib/realm_map_screen.dart). When the source asset
// regens via /worldbuilding, paste-update this constant to match. The
// website is a marketing surface so the duplication is deliberate —
// no fs read, no build coupling, no runtime fetch.
// v0.0.24.2 regen: per-character tile-swap (`,` grass for Hana, `:`
// commercial tile for Mei, `.` neutral for Sam + Kenji); two new
// direct character-to-character continuity bridges ([recipe*] Hana↔Mei,
// [clip*] Kenji↔Hana); [sticky-wall*] renamed to [notes*] with the
// paired-pins rule. Mirror of assets/realm-maps/phone-realm.txt.
const PHONE_REALM_MAP = String.raw`╔════════════════════════════════════════════════════════════╗
║              THE COURTYARD — phone realm                   ║
║                                                            ║
║   ╔═══════════════ THE PORTAL GATE ═══════════════════╗    ║
║   ║   .   %         %         %        %        %     ║    ║
║   ║      the      the mall  the small the     the     ║    ║
║   ║   witch's       (80)     town    tavern  cottage  ║    ║
║   ║    path                  (90)    (isekai) (cozy)  ║    ║
║   ║    (GA)                                            ║    ║
║   ╚═════════════════════│══════════════════════════════╝    ║
║                          │                                  ║
║   ┌─── HANA's track ────┘    └──── KENJI's office ───┐     ║
║   │ , , , , , , , , , ,│    │. . . . . . . . . . . . │     ║
║   │ , H . . . . . . . t│    │. K . . . . . . . . . . │     ║
║   │ , . . [bleachers]  │    │. . [desk][clip*] . . . │     ║
║   │ , . . . . . p . . .│    │. . . . . . . [ledger*] │     ║
║   │ , . [pic*][recipe*]│    │. . . . . . [drawer]  . │     ║
║   └──────────────│─────┘    └───────│─────────────────┘    ║
║                  │                  │                       ║
║              ┌───┴──[noticeboard]───┴───┐                  ║
║              │   the courtyard center   │                  ║
║              │   . . . . . . . . . . .  │                  ║
║              └───┬──────────────────┬───┘                  ║
║                  │                  │                       ║
║   ┌─── MEI's kitchen ───┐  ┌── SAM's desk ──┐              ║
║   │ [prep]:[line s]: : :│  │ . . . . . . .  │              ║
║   │ [bell*]: : :    : : │  │ . S . d        │              ║
║   │ [mise]: :[dish pit] │  │ [notes*]       │              ║
║   └─────────────────────┘  └────────────────┘              ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝`;

export const metadata = {
  title: "The Courtyard · Atlas — My Life is an RPG",
  description:
    "The phone-realm map. Four canonical characters live here. Five portals lead to Elseworlds.",
};

export default function MapPage() {
  return (
    <main className="flex-1">
      <section className="max-w-[880px] mx-auto px-6 sm:px-8 py-12 sm:py-16">
        <div className="font-display tracking-[0.18em] text-[12px] text-spot-red mb-3 text-center">
          ▸ ATLAS · MAP 1 OF 6 · PHONE REALM
        </div>
        <h1 className="text-[44px] sm:text-[64px] leading-[1.02] text-center">
          The Courtyard
        </h1>
        <p className="text-center text-ink-soft mt-4 max-w-[620px] mx-auto leading-[1.55] italic">
          Where the four canonical characters live. In-game it&apos;s
          tap-navigable — you press a glyph and you&apos;re in that chat.
          Here it&apos;s the cartographer&apos;s draft.
        </p>

        {/* v0.0.30.6 — the in-game version pans and zooms now. Mobile
            ASCII used to wrap mid-line on narrow screens; the
            IntrinsicWidth + TextOverflow.visible fix means the map
            renders at its natural width and the viewport just clips
            (you pan to see the rest). Quiet callout under the intro. */}
        <p className="text-center text-margin-ink mt-3 max-w-[560px] mx-auto leading-[1.5] text-[13px] italic">
          The in-game version pans and zooms — drag with one finger to
          explore; pinch to scale. The focal character&apos;s glyph
          auto-centers on open.
        </p>

        {/* The map — chunky-bordered cream surface, monospace ASCII.
            Wrapped in PannableAscii so phone viewports keep the native
            horizontal-swipe behavior AND desktop users can click-drag
            to pan the map block. v0.0.25.1 fix per the user report
            that the courtyard ASCII was wrapping at narrow widths
            instead of holding its 58-col layout. */}
        <div className="mt-10 border-2 border-ink bg-paper-shade p-3 sm:p-5 shadow-[6px_6px_0_0_rgba(26,26,26,0.12)]">
          <PannableAscii ariaLabel="phone-realm courtyard map">
            <pre className="font-mono text-[11px] sm:text-[13px] leading-[1.25] text-ink whitespace-pre m-0">
{PHONE_REALM_MAP}
            </pre>
          </PannableAscii>
        </div>

        <p className="text-center font-display tracking-[0.16em] text-[11px] text-margin-ink mt-3">
          metaphor: village green · render: navigable
        </p>

        <hr className="rule-flourish max-w-[880px] mx-auto my-10" />

        {/* The legend — two cards covering character glyphs + portals. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="border-[1.5px] border-ink bg-paper-shade p-5">
            <div className="font-display tracking-[0.16em] text-[12px] text-spot-red mb-2">
              ▸ THE FOUR
            </div>
            <ul className="text-[14.5px] leading-[1.65] space-y-1 list-none p-0">
              <li>
                <span className="font-mono font-bold text-forest">S</span>{" "}
                Sam — consultation desk, small footprint.
              </li>
              <li>
                <span className="font-mono font-bold text-forest">H</span>{" "}
                Hana — outdoor track, bleachers, foam-roller corner.
              </li>
              <li>
                <span className="font-mono font-bold text-forest">K</span>{" "}
                Kenji — desk, ledger, back drawer.
              </li>
              <li>
                <span className="font-mono font-bold text-forest">M</span>{" "}
                Mei — prep, line, bell, dish pit. Four zones.
              </li>
            </ul>
          </div>
          <div className="border-[1.5px] border-ink bg-paper-shade p-5">
            <div className="font-display tracking-[0.16em] text-[12px] text-spot-red mb-2">
              ▸ FIVE PORTALS
            </div>
            <ul className="text-[14.5px] leading-[1.65] space-y-1 list-none p-0">
              <li>
                <span className="font-mono font-bold text-spot-red">%</span>{" "}
                the witch&apos;s path — golden-age fantasy
              </li>
              <li>
                <span className="font-mono font-bold text-spot-red">%</span>{" "}
                the mall — 80s + cyber
              </li>
              <li>
                <span className="font-mono font-bold text-spot-red">%</span>{" "}
                the small town — 90s anime
              </li>
              <li>
                <span className="font-mono font-bold text-spot-red">%</span>{" "}
                the tavern — isekai + party RPG
              </li>
              <li>
                <span className="font-mono font-bold text-spot-red">%</span>{" "}
                the cottage — cottagecore + cozy
              </li>
            </ul>
            <p className="text-[12px] text-margin-ink italic mt-3">
              Each Elseworld&apos;s own map is in the cartographer&apos;s queue.
            </p>
          </div>
        </div>

        {/* Continuity-objects callout — the textural detail that makes
            the map feel inhabited rather than diagrammatic. Synced to
            the v0.0.24.2 phone-realm regen: two new direct character-
            to-character bridges ([recipe*], [clip*]) added on top of
            the existing [ledger*] / [bell*] / [notes*] (renamed from
            [sticky-wall*]). */}
        <div className="mt-6 border-[1.5px] border-margin-ink/50 bg-paper p-5">
          <div className="font-display tracking-[0.16em] text-[11px] text-margin-ink mb-2">
            ▸ CONTINUITY OBJECTS
          </div>
          <p className="text-[14px] leading-[1.6] text-ink-soft">
            Items marked{" "}
            <span className="font-mono text-ink">[*]</span> are visible from
            more than one space — they link the characters to each other.{" "}
            <span className="font-mono text-ink">[pic*]</span> is Hana&apos;s
            pinned race photo (Day 14 callback).{" "}
            <span className="font-mono text-ink">[recipe*]</span> is Mei&apos;s
            recipe scrap tucked under Hana&apos;s foam-roller ({" "}
            <em>recovery snack: cold rice</em>) — the Hana↔Mei bridge.{" "}
            <span className="font-mono text-ink">[clip*]</span> on
            Kenji&apos;s desk is Hana&apos;s training log with weekly
            green/red ink — the Kenji↔Hana bridge.{" "}
            <span className="font-mono text-ink">[ledger*]</span> on
            Kenji&apos;s desk reads &ldquo;MEI&apos;S SPENDING&rdquo; — the
            Kenji↔Mei bridge.{" "}
            <span className="font-mono text-ink">[bell*]</span> rings in
            Mei&apos;s kitchen — the sound carries to every space except
            Kenji&apos;s office (he hung a blanket).{" "}
            <span className="font-mono text-ink">[notes*]</span> on
            Sam&apos;s desk: every squad member has pinned to it, often on
            the same nail (Hana&apos;s run cards beside Mei&apos;s
            nutrition cards). The{" "}
            <span className="font-mono text-ink">[noticeboard]</span> in
            the courtyard center is public.
          </p>
        </div>

        <hr className="rule-flourish max-w-[880px] mx-auto my-10" />

        {/* v0.0.28+ realm-editor callout — the picker now hosts custom
            realms alongside the courtyard. Player builds them by
            chatting with Sam; they render through the same pan/zoom
            viewer and persist locally. Pointer back to the homepage
            section. */}
        <div className="border-2 border-ink bg-paper-shade p-5 sm:p-6">
          <div className="font-display tracking-[0.18em] text-[12px] text-forest-dim mb-2">
            ▸ YOUR REALMS GO HERE TOO
          </div>
          <p className="text-[14.5px] leading-[1.65] text-ink-soft">
            The realm picker hosts both the courtyard and any places
            you&apos;ve sketched yourself. Sam helps you draft them in
            chat — one sentence about what the realm is FOR, a few
            taps, and a thing to come back to. They render through
            this same map viewer and persist across sessions, next
            to the canonical map.{" "}
            <Link href="/" className="!border-b-0">
              <span className="font-display tracking-[0.14em] text-[12px] text-forest">
                ← see how it works
              </span>
            </Link>
          </p>
        </div>

        <hr className="rule-flourish max-w-[880px] mx-auto my-10" />

        <div className="text-center">
          <Link
            href="/"
            className="font-display tracking-[0.16em] text-[12px] !border-b-0"
          >
            ← BACK TO THE LANDING
          </Link>
        </div>
      </section>
    </main>
  );
}
