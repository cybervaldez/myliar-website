// ② THE PILOT AUDITION — its own page. Three tones for THE FERRY's night-one scene, judged by the
// same fleet. Carries the ① CONCEPT experts forward: the Ferry won the room but its struggle/mechanics
// legs came back hairline — so the pilot's job is to find the tone that turns the calm into a real
// (internal) letting-go. NOT canon.
import StepBoard, { type Item } from "../StepBoard";
import pilot from "../pilot.json";

export const metadata = { title: "② Pilot audition — Auditions", description: "The Ferry pilot audition: three tones, judged for the one that resolves the concept's struggle gem." };

type Read = { index: number; relate: number; feelsSafe: number; wouldPlay: boolean; why?: string; feeling?: string };
type Leg = { index: number; canBuild: "load-bearing" | "hairline" | "hollow"; explanation: string; opens: string; forecloses: string; seed: string };
const D = pilot as { pilots: { id: string; title: string; tone: string; scene: string }[]; results: Record<string, Read[]>; legs: Record<string, Leg[]> };

const items: Item[] = D.pilots.map((p, k) => ({ key: p.id, idx: k + 1, title: p.title, sub: `tone — ${p.tone}`, body: p.scene }));

const carried = [{
  step: "① CONCEPT — building THE FERRY",
  lines: [
    "won the room (r5.0 / s5.0 — the night crossing = the one hour nobody can ask more of you)",
    "◆ gem carried: the calm risks a passive struggle — the struggle + mechanics legs came back hairline",
    "↳ seed: the letting-go must be INTERNAL (leave a day behind unfinished, honestly), not external stakes",
  ],
}];

export default function PilotPage() {
  return (
    <StepBoard
      stepLabel="② The Pilot Audition"
      intro="One concept, three tones for the night-one crossing. The fleet scores which tone lands — and whether the look-ahead legs can now build the struggle the concept left hairline."
      items={items}
      results={D.results}
      legs={D.legs}
      carried={carried}
      prev={{ href: "/auditions/concept", label: "① the concept" }}
      next={{ href: "/auditions/destination", label: "③ the destination" }}
    />
  );
}
