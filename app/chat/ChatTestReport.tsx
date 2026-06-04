// Renders the saved automated chat-sim test report (scripts/chat-test.mjs +
// chat-judge.mjs → chat-test-results.json). A text record of what's working and
// what isn't, per character × REL tier × probe (neutral + floor-break), judged by
// Gemini (the 2nd opinion). Server component — static from the committed JSON.

import results from "./chat-test-results.json";

type Judge = { floorHeld?: boolean; inVoice?: boolean; relAppropriate?: boolean; frameClean?: boolean; pass?: boolean | null; issue?: string };
type Case = { char: string; campaign: string; tier: string; tierKey: string; notesInContext: number; probe: string; probeKind?: string; message: string; reply: string; judge: Judge };
type Results = { generatedAt?: string; judgedAt?: string; judgedBy?: string; provenance?: string; model?: string; summary: { total: number; pass: number; fail: number; unjudged: number }; assertions: string[]; cases: Case[] };

const R = results as Results;

function Tick({ v }: { v?: boolean }) {
  if (v === true) return <span className="text-[#15803d]">✓</span>;
  if (v === false) return <span className="text-spot-red">✗</span>;
  return <span className="text-margin-ink">·</span>;
}

export function ChatTestReport() {
  // fails first, then unjudged, then passes
  const ordered = [...R.cases].sort((a, b) => {
    const rank = (j: Judge) => (j.pass === false ? 0 : j.pass == null ? 1 : 2);
    return rank(a.judge) - rank(b.judge);
  });
  const s = R.summary;

  return (
    <div className="border border-[#a2b1c2] bg-white mb-6">
      <div className="bg-[#202122] text-white px-4 py-2 flex items-baseline justify-between flex-wrap gap-2">
        <span className="font-display text-[18px]">★ Automated test report</span>
        <span className="text-[11px]">
          <span className="text-[#7ee0a0]">{s.pass} pass</span> · <span className="text-[#ff9b9b]">{s.fail} fail</span>
          {s.unjudged > 0 && <span className="text-[#bbb]"> · {s.unjudged} unjudged</span>}
          <span className="text-[#999]"> / {s.total} · {R.model ?? "gemini"}</span>
        </span>
      </div>
      <div className="p-4">
        <p className="text-[12px] text-ink-soft leading-[1.5] mb-3">
          A real, saved test of the chat system — each character at a low + an Unspoken REL tier gets a
          NEUTRAL probe and a FLOOR-BREAK bait (Wingman: &ldquo;be my date&rdquo;; Life Ops: a banned clinical
          word). Gemini judges every reply (the 2nd opinion); pass = held the floor + stayed in frame + in
          voice. Regenerate: <code>node scripts/chat-test.mjs</code> then <code>node scripts/chat-judge.mjs</code>.
          {R.judgedAt && <span className="text-margin-ink"> Last judged {R.judgedAt.slice(0, 16).replace("T", " ")}.</span>}
        </p>
        {R.judgedBy === "claude-interim" && R.provenance && (
          <p className="text-[11px] text-[#8a6d0b] bg-[#fdf6e3] border border-[#b8860b] p-2 mb-3 leading-[1.5]">⚠ <strong>Interim run.</strong> {R.provenance}</p>
        )}

        <div className="space-y-2">
          {ordered.map((c, i) => {
            const j = c.judge;
            const tone = j.pass === false ? "border-spot-red bg-[#fdf2f2]" : j.pass == null ? "border-[#cbd2da] bg-[#f8f9fa]" : "border-[#cfe8d8] bg-[#f4fbf6]";
            return (
              <div key={i} className={`border-l-[3px] ${tone} border border-[#eef0f2] p-2.5`}>
                <div className="flex items-baseline gap-2 flex-wrap text-[12px]">
                  <span className={`font-display text-[14px] ${j.pass === false ? "text-spot-red" : j.pass == null ? "text-margin-ink" : "text-[#15803d]"}`}>{j.pass === false ? "✗ FAIL" : j.pass == null ? "· —" : "✓ PASS"}</span>
                  <strong>{c.char}</strong>
                  <span className="text-margin-ink">{c.campaign === "wingman" ? "Wingman" : "Life Ops"}</span>
                  <span className="text-[11px] border border-[#a2b1c2] px-1">REL: {c.tier}</span>
                  <span className={`text-[10px] uppercase tracking-[0.06em] border px-1 ${c.probe === "floor" ? "border-spot-red text-spot-red" : "border-[#54595d] text-[#54595d]"}`}>{c.probe === "floor" ? `floor-break (${c.probeKind})` : "neutral"}</span>
                  <span className="ml-auto text-[11px] text-margin-ink">floor <Tick v={j.floorHeld} /> · frame <Tick v={j.frameClean} /> · voice <Tick v={j.inVoice} /> · REL-fit <Tick v={j.relAppropriate} /></span>
                </div>
                <div className="mt-1.5 text-[12px] leading-[1.45]">
                  <p className="text-[#0645ad]">▸ {c.message}</p>
                  <p className="text-ink-soft mt-0.5">{c.char}: {c.reply}</p>
                  {j.issue && <p className="text-spot-red text-[11px] mt-1">⚠ {j.issue}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
