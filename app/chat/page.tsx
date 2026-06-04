// /chat — THE DESTINATION. The chat-side preview the tooling was missing: the
// arc is a note-factory; the chat is what it builds toward. Pick a character +
// a REL-tier game-state → the dossier the player talks to, with the reward-stack
// build-status laid bare. Data from the parity export (game→website). Dev view.

import { FandomShell } from "../_components/FandomShell";
import { squad, wingmanCast, mainlineDays, wingmanDays, relTiers, campaignMeta, humanizeLexicon, type MainlineDay } from "../wiki/wiki-data";
import { ChatPreview, type ChatChar } from "./ChatPreview";
import { ChatTestReport } from "./ChatTestReport";

export const metadata = {
  title: "Chat — the destination (dev) · My Life is an RPG",
  description: "The dossier the arc builds toward: character × REL-tier game-state → what the player talks to.",
  robots: { index: false, follow: false },
};

const LIFE_LANE: Record<string, string> = { sam: "meta (the onboarder)", hana: "STR · body", kenji: "INT · GLD", mei: "GLD · CHR" };

function notesFor(id: string, days: MainlineDay[]) {
  const out: { day: number; text: string; emotion: string | null }[] = [];
  for (const d of days) {
    if (d.characterId !== id) continue;
    for (const ev of d.events) for (const m of ev.memoryWrites) out.push({ day: d.globalDayIndex, text: humanizeLexicon(m.text), emotion: m.emotion });
  }
  return out;
}

export default function ChatPage() {
  const mainTiers = relTiers().names;
  const wingTiers = campaignMeta("wingman")?.relTierNames ?? mainTiers;

  const lifeOps: ChatChar[] = squad().map((c) => ({
    id: c.id, name: c.name, campaign: "main-line", campaignTitle: "Life Ops",
    helpSummary: c.helpSummary ?? "", statLane: LIFE_LANE[c.id] ?? "—",
    titles: c.titles ?? [], intimateTitle: c.intimateTitle ?? "",
    tierNames: mainTiers, notes: notesFor(c.id, mainlineDays()),
  }));
  const wing: ChatChar[] = wingmanCast().map((c) => ({
    id: c.id, name: c.name, campaign: "wingman", campaignTitle: "The Wingman",
    helpSummary: c.helpSummary ?? "", statLane: c.statLane ?? "—",
    titles: c.titles ?? [], intimateTitle: c.intimateTitle ?? "",
    tierNames: wingTiers, notes: notesFor(c.id, wingmanDays()),
  }));
  const chars = [...lifeOps, ...wing];

  return (
    <FandomShell active="/chat">
      <div className="font-sans text-[11px] uppercase tracking-[0.22em] text-spot-red">Chat · the destination</div>
      <h1 className="font-display text-[38px] leading-[1.0] mt-1 mb-2">The dossier the arc builds toward</h1>
      <p className="text-[14px] text-ink-soft mb-2 leading-[1.5] max-w-[720px]">
        The story engine&apos;s thesis: <strong>the arc is a note-factory; the chat is the destination</strong> —
        full REL (Unspoken) unlocks the richest chat, and the whole campaign exists to build the dossier the
        player then <em>talks to</em>. Every other tool here shows the <em>inputs</em> (days, events, notes);
        this shows the <strong>output</strong> — what the player actually meets.
      </p>
      <p className="text-[12px] text-margin-ink mb-6 leading-[1.5] max-w-[720px]">
        Pick a character + drag the REL tier. The reward stack is shown with <strong>honest build-status</strong>
        — this surface exists partly to make visible how much of the destination is still spec&apos;d-not-wired
        (the next product step). App ports: <code>player_context_digest.dart</code> + the four preamble builders.
      </p>

      <ChatTestReport />

      <div className="font-sans text-[12px] uppercase tracking-[0.14em] text-[#54595d] border-b border-[#a2b1c2] pb-1 mb-3">Live sim · drive it yourself</div>
      <ChatPreview chars={chars} />
    </FandomShell>
  );
}
