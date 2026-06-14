// ① THE CONCEPT AUDITION — its own page. The blind audience fleet + the look-ahead legs judge the
// three concept candidates by their two-part title + world + night-one gift. Head of the pipeline:
// nothing carried in; the FERRY's gems are what the next page (pilot) carries forward. NOT canon.
import StepBoard, { type Item } from "../StepBoard";
import concepts from "../concepts.json";

export const metadata = { title: "① Concept audition — Auditions", description: "The concept audition: the blind audience fleet + look-ahead legs judge the three candidates." };

type Read = { index: number; relate: number; feelsSafe: number; wouldPlay: boolean; expectExperience?: string; feeling?: string };
type Leg = { index: number; canBuild: "load-bearing" | "hairline" | "hollow"; explanation: string; opens: string; forecloses: string; seed: string };
const D = concepts as { concepts: { id: string; t1: string; t2: string; world: string; gift: string }[]; results: Record<string, Read[]>; legs: Record<string, Leg[]> };

const items: Item[] = D.concepts.map((c, k) => ({ key: c.id, idx: k + 1, title: c.t2, sub: c.t1, body: `${c.world}\n\nGift — ${c.gift}` }));
// THE LEDGER — picks AND unselected are kept as historical context. The Ferry is building; the other
// two are in the bank (revivable, their auditions paid for). Future concepts read this to avoid
// re-picking a setting×destination already taken. (per docs/flavors/concepts/GUIDELINE.md Step 0)
const status: Record<string, string> = { ferry: "building", lighthouse: "available", cloudhouse: "available" };

export default function ConceptPage() {
  return (
    <StepBoard
      stepLabel="① The Concept Audition"
      intro="The cover meets the room. Each candidate is shown the way a player meets it — its two-part title, its world, and the gift it gives on night one. The audience scores relate · feels-safe; the look-ahead legs leave forward notes. This page is also the LEDGER: the pick and the unselected stay side by side — the unselected aren't rejects, they're a bank (their auditions paid for), so a future concept never re-picks a taken setting×destination."
      items={items}
      results={D.results}
      legs={D.legs}
      status={status}
      next={{ href: "/auditions/pilot", label: "② the pilot" }}
    />
  );
}
