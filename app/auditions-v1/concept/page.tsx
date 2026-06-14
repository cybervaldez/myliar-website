// /auditions-v1/concept — THE SLATE: the master concept ledger (every concept, all rounds). Shared
// across campaigns — concepts ARE the campaign seeds, so this is the cross-campaign idea bank.
// Picks badged `building`; the unselected `available` (revivable, audition already paid for). A new
// concept reads this first so it never re-picks a taken setting×destination. NOT canon.
import StepBoard from "../StepBoard";
import { SLATE, SLATE_STATUS, INTRO, PRIMERS, CAMPAIGNS, stepDataFor } from "../registry";

export const metadata = { title: "The Slate — every concept (the idea bank)", description: "The master concept ledger: picks + the bank, status-tagged, so future concepts never duplicate a taken setting." };

const sd = stepDataFor("ferry", "concept")!; // concept resolves to the shared SLATE regardless of campaign

export default function SlatePage() {
  return (
    <StepBoard
      stepLabel="The Slate — every concept"
      intro={`The master ledger of every concept we've auditioned. ${INTRO.concept} Picks AND the unselected stay side by side: the unselected aren't rejects, they're a bank (their auditions paid for), so a future concept never re-picks a taken setting×destination. Open a story from the board to see the path built on its pick.`}
      primer={PRIMERS.concept}
      sourceStudy={CAMPAIGNS.ferry.sourceStudy?.concept}
      data={SLATE}
      items={sd.items}
      status={SLATE_STATUS}
      prev={{ href: "/auditions-v1", label: "the board" }}
    />
  );
}
