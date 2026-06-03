// VIBE stage (top of the maturity ladder: vibe → draft → run → live). The earliest,
// top-down pick: a character's FEEL. Rendered as side-by-side cards (vibes are judged
// by comparison, not in sequence). Pick one → it becomes the `draft` → the locked
// persona via /writers-room → ports to lib/characters.dart. Server component.

import { CopyForLLM } from "../_components/CopyForLLM";

export type VibeCandidate = {
  author: string; name: string; recommended?: boolean; picked?: boolean; status: string;
  oneLineFeel: string; temperament: string; giftDirection: string; voiceSample: string; statLaneIdea: string;
};
export type VibePick = { character: string; stage: string; prompt: string; candidates: VibeCandidate[] };

// T2 PORT export for a CHARACTER pick → a lib/characters.dart entry (DRAFT). Fields the vibe
// doesn't hold are TODO. A human pastes it after /writers-room ratifies (the canon lock).
function toCharacterDart(c: VibeCandidate): string {
  const id = (c.name.split("—")[0] || c.name).trim().toLowerCase().split(/\s+/)[0];
  return `// DRAFT — port to lib/characters.dart AFTER /writers-room ratifies (the canon lock).
const _${id} = Character(
  id: '${id}',
  name: '${c.name.split("—")[0].trim()}',
  classLabel: 'TODO',           // e.g. the Hearthkeeper
  title: 'TODO',
  statLane: 'TODO',             // ${c.statLaneIdea}
  gender: 'TODO',               // male | female | unknown
  race: 'TODO',
  appearance: 'TODO — image-gen brief, in-fiction, no UI words.',
  archetype: 'TODO',
  personaDescription:
      "${c.oneLineFeel.replace(/"/g, "'")} ${c.temperament.replace(/"/g, "'")} "
      "GIFT: ${c.giftDirection.replace(/"/g, "'")} "
      "VOICE: ${c.voiceSample.replace(/"/g, "'")}",
  quirk: 'TODO',
  specialty: 'TODO',
  helpSummary: 'TODO',
  starterPrompts: ['TODO', 'TODO', 'TODO'],
);
// then add _${id} to canonicalRoster.`;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  if (!children) return null;
  return (
    <div className="mt-2">
      <div className="font-sans text-[10px] uppercase tracking-[0.12em] text-spot-red">{label}</div>
      <div className="text-[13px] leading-[1.5] text-ink-soft">{children}</div>
    </div>
  );
}

export function VibePicks({ picks }: { picks: VibePick[] }) {
  return (
    <div>
      {picks.map((p) => (
        <div key={p.character} className="mb-4">
          <h3 className="font-display text-[20px] text-ink">{p.character}</h3>
          <p className="text-[13px] text-ink-soft mt-1 mb-4 leading-[1.5]">{p.prompt}</p>
          <div className="grid md:grid-cols-3 gap-4">
            {p.candidates.map((c) => {
              const pending = c.status === "pending";
              return (
                <div
                  key={c.name}
                  className={`border-2 p-4 ${c.recommended ? "border-forest bg-paper-shade/50" : pending ? "border-ink/15 bg-paper-shade/20 opacity-70" : "border-ink/40 bg-paper-shade/30"}`}
                >
                  <div className="flex items-baseline justify-between gap-2 flex-wrap">
                    <h4 className="font-display text-[17px] text-forest">{c.name}</h4>
                    {c.picked ? (
                      <span className="font-sans text-[10px] uppercase tracking-[0.1em] bg-spot-red text-paper px-1.5 py-0.5 rounded">✓ picked</span>
                    ) : c.recommended ? (
                      <span className="font-sans text-[10px] uppercase tracking-[0.1em] bg-forest text-paper px-1.5 py-0.5 rounded">★ lead</span>
                    ) : null}
                  </div>
                  <div className="font-sans text-[10px] uppercase tracking-[0.12em] text-margin-ink mt-0.5">{c.author}</div>
                  <p className="text-[13px] leading-[1.5] mt-2 italic">{c.oneLineFeel}</p>
                  <Field label="Temperament">{c.temperament}</Field>
                  <Field label="Gift direction">{c.giftDirection}</Field>
                  <Field label="Voice sample">{c.voiceSample}</Field>
                  <Field label="Stat lane">{c.statLaneIdea}</Field>
                  {c.picked && (
                    <div className="mt-3">
                      <CopyForLLM payload={toCharacterDart(c)} label="Copy as characters.dart (draft)" title="A lib/characters.dart entry draft from this vibe — TODOs for the rest; port after /writers-room locks it." />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
