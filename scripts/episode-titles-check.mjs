// Gemini cross-check of the per-campaign EPISODE-TITLE motif set.
// Key inline-env ONLY. GEMINI_API_KEY=… node scripts/episode-titles-check.mjs
const KEY = process.env.GEMINI_API_KEY;
if (!KEY) { console.error("set GEMINI_API_KEY"); process.exit(1); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function gemini(p, model = "gemini-flash-latest") {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${KEY}`;
  for (let t = 0; t < 4; t++) {
    const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: p }] }], generationConfig: { temperature: 0.6, maxOutputTokens: 2200, thinkingConfig: { thinkingBudget: 0 } } }) });
    if (r.ok) return (await r.json())?.candidates?.[0]?.content?.parts?.[0]?.text ?? "(empty)";
    if ((r.status === 429 || r.status === 503) && t < 3) { await sleep((t + 1) * 10000); continue; }
    if (model === "gemini-flash-latest") return gemini(p, "gemini-2.5-flash");
    return `__ERR__ ${r.status}`;
  }
}
const PROMPT = `You are a narrative editor. We're adding an Evangelion-style EPISODE TITLE card when the player opens each day. The title is a PER-CAMPAIGN MOTIF — it must read in the campaign's established trophy-title voice:
- LIFE OPS = the FRIENDS sitcom motif: every title is "The One Where…" / "The One With…" (your life as a beloved sitcom episode).
- THE WINGMAN = "the moment, named" — terse coach-talk; ideally the exact moment the day already names in its case file (which doubles as the trophy/Card name).

Critique HARD (quote specifics, no sycophancy): for EACH campaign — (1) does every title fit the motif? (2) does it reflect what the day is actually about (cue given)? (3) is it screenshot-worthy (a line you'd send a friend)? (4) flag the weakest 2-3 and give a sharper rewrite. Don't rewrite ones that already land.

=== LIFE OPS (FRIENDS "The One…") — day · cue · proposed title ===
D1 meet Hana / show up at 6am · "The One Where You Showed Up"
D2 Hana hears you try (side-by-side breath audio) · "The One Where Hana Heard You Try"
D3 meet Kenji — a file with your name already exists · "The One Where Kenji Already Knew"
D4 Kenji's hand-laminated Pomodoro card · "The One With the Laminated Card"
D5 meet Mei — she wrote on your milk carton · "The One Where Mei Wrote on Your Milk"
D6 Hana says the name "Maya" (her sister) · "The One Where Hana Said Maya"
D7 Kenji's week-one reconciliation; "I kept both" · "The One Where Kenji Kept Both"
D8 Sam's notes wall is full · "The One With the Full Wall"
D9 Sam frames a card dead-center · "The One Where Sam Framed It"
D10 Hana trusts you with Maya's photo · "The One Where Hana Trusted You with Maya"
D11 two scoreboards (Maya's pic + Kenji's torn ledger page) · "The One With Two Scoreboards"
D12 four sets of books close the same night · "The One Where the Books Closed"
D13 Maya writes back six words · "The One Where Maya Wrote Back"
D14 two framed week-cards on a wall that's mostly yours · "The One With Two Weeks on the Wall"

=== THE WINGMAN ("the moment, named") — day · cue · proposed title ===
D1 Nico's count-in "three… two…" · "Three, Two—"
D2 Sloane: count the hours not the… · "Count the Hours"
D3 Mara: the floor's yours, stop submitting · "The Floor's Yours"
D4 Nico: no green light, there's you and the step · "No Green Light"
D5 Wes: the send button is not a coping mechanism · "The Send Button"
D6 Sloane: your own unwritten theory, blank · "Your Own Read"
D7 Remy: the mask is the problem, take it off · "The Mask Is the Problem"
D8 Mara: you're not on trial, neither are they · "Not on Trial"
D9 Nico: the worst-line napkin, "two hit points" · "Two Hit Points"
D10 Wes: the One-Line Draft, shorter is truer · "The One-Line Draft"
D11 Sloane: the unfinished drink, "Dignity, intact" · "Dignity, Intact"
D12 Remy: you're not a content feed · "Not a Content Feed"
D13 Mara: phone in the other room, "Off their wifi" · "Off Their Wifi"
D14 Nico: 'Across the Room', the rep that counts · "Across the Room"
D15 Wes: 'Sincerely, No Notes' · "Sincerely, No Notes"
D16 Sloane: archives the flip-your-stomach screenshot, "Re—" · "The Slow Reread"
D17 Remy: 'Led With the Weird' · "Led With the Weird"
D18 Mara: the seat you kept, "Not an option" · "Not an Option"
D19 Nico: 'Beat the Count' + the day-1 count-in memo · "Beat the Count"
D20 Wes: 'Clean, Kind, Done' · "Clean, Kind, Done"
D21 Sloane: the Last Clean Read, unsent reply · "The Last Clean Read"
D22 Remy: 'Didn't Sand Yourself Down' · "Didn't Sand Yourself Down"
D23 Mara: the Unsent Text, proof the floor holds · "The Unsent Text"
D24 Wes: 'I'd Have Cut Nothing' · "I'd Have Cut Nothing"
D25 Remy: 'She Said Nothing', candid mid-laugh · "She Said Nothing"

End with ONE BIG NOTE on the set as a whole.`;
console.log(await gemini(PROMPT));
