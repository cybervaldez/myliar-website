// ③ THE DESTINATION AUDITION — its own page. The full-REL coach THE FERRY converges to (authored
// first among build steps; the rest build the PATH to it). Carries ① CONCEPT + ② PILOT experts
// forward: the Ferry + its internal-struggle gem, and the pilot's "logged at full weight" witness
// tone. The path-building legs judge whether this destination is worth reaching. NOT canon.
import StepBoard, { type Item } from "../StepBoard";
import destination from "../destination.json";

export const metadata = { title: "③ Destination audition — Auditions", description: "The Ferry destination audition: three takes on the full-REL coach, judged for the one worth reaching." };

type Read = { index: number; relate: number; feelsSafe: number; wouldPlay: boolean; why?: string; feeling?: string };
type Leg = { index: number; canBuild: "load-bearing" | "hairline" | "hollow"; explanation: string; opens: string; forecloses: string; seed: string };
const D = destination as { destinations: { id: string; title: string; facet: string; sample: string }[]; results: Record<string, Read[]>; legs: Record<string, Leg[]> };

const items: Item[] = D.destinations.map((d, k) => ({ key: d.id, idx: k + 1, title: d.title, sub: d.facet, body: d.sample }));

const carried = [
  { step: "① CONCEPT — THE FERRY", lines: ["the crossing as the day-unit", "◆ gem: a passive struggle (hairline) → must resolve to an internal letting-go"] },
  { step: "② PILOT — “Logged at Full Weight” won (5★, every leg load-bearing)", lines: ["a clear-eyed WITNESS, not a mentor", "the “I log you at full weight” tone turned the struggle gem load-bearing", "↳ seed: the coach witnesses without grading — belonging must never read as social demand"] },
];

export default function DestinationPage() {
  return (
    <StepBoard
      stepLabel="③ The Destination Audition"
      intro="The deepest chat the whole game converges to — the full-REL coach. Authored first; every other build step makes the PATH to it. The fleet asks: does the deepest relationship land? The path-building legs ask: is this coach worth the climb?"
      items={items}
      results={D.results}
      legs={D.legs}
      carried={carried}
      prev={{ href: "/auditions/pilot", label: "② the pilot" }}
    />
  );
}
