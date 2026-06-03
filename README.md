# mylifeisanrpg.com

Marketing site for the **My Life is an RPG** mobile game. Lives in its own
git repository (this directory is `.gitignore`'d from the main `myliar`
monorepo); deployed to Vercel.

## What's here

- `app/page.tsx` — single-page landing with hero / playable simulator /
  squad / three-tier explainer / footer CTA.
- `app/components/Simulator.tsx` — the **landing-page gameplay simulator**.
  Three events of Hana's Day 1 (a simplified, self-contained cut of the
  canonical onboarding day), client-side state only, no LLM call, no API
  key, no rate limit. Visitors experience the trichotomy (logical /
  passive / chaotic), the dice on chaotic, stats moving, REL tier-up.
  ~90 seconds end-to-end.
- `app/lib/sim-data.ts` — the canned scenario + types. The REL tier names
  and the tracked canonical payload come from `parity.generated.json`
  (see **Parity with the game** below); the scenario prose is a
  hand-simplified cut of it.
- `app/lib/parity.generated.json` — generated facts + tokens mirrored
  from the app. **Never hand-edit**; run `npm run parity`.
- `app/layout.tsx` — root layout with Anton + Lora + PT Sans fonts
  matched to `docs/manual.html` of the parent repo.
- `app/globals.css` — palette + Tailwind v4 design tokens. Cream paper,
  forest green, spot red. Mirrors the manual's visual language.
- `public/manual.html` — full instruction booklet served at `/manual`
  via a `next.config.ts` rewrite. Static HTML; do not duplicate as JSX.
- `app/wiki/` — **The Codex**: a read-only wiki mirror of the game canon
  (characters, mechanics, atlas, elseworlds, and the day-by-day **mainline
  gateway** `/wiki/arc`), generated from `parity.generated.json`. Carries
  the **community-notes** feedback layer (see below). Stamped with a data
  snapshot so notes record which canon version they were written against.
- `app/map/page.tsx` — the phone-realm courtyard map (from parity).

## Local dev

```bash
npm install
npm run dev
# http://localhost:3000
```

## Build + deploy

```bash
npm run build      # production build (what Vercel runs — stricter than `dev`)
npm run deploy     # ship it: sync this source → the mirror repo → Vercel deploys
```

**The model.** This site lives **in the `myliar` monorepo** (so the parity
exporter can read `../lib` + `../assets` — the website must sit alongside the
game). But Vercel deploys from a **separate mirror repo**,
`cybervaldez/myliar-website`. `npm run deploy` (`scripts/deploy.sh`) clones/
refreshes that mirror, rsyncs this `website/` source over it (excluding
`node_modules`/`.next`/`.vercel`), commits, and pushes to `main` — which is the
Vercel trigger.

> ⚠️ The mirror repo is a **deploy artifact**. Never edit it directly — it's
> overwritten on every deploy. Always edit here, in the monorepo, then run
> `npm run deploy`. (Run `npm run build` first to catch errors Vercel would hit.)

The core site needs **no environment variables** — the simulator and wiki are
fully static. The **community notes** feature is the one exception: it needs
`NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` set in Vercel (see
*Community notes* below). Without them the notes UI degrades to a quiet "coming
soon" card and everything else still works.

## Parity with the game

The website must show the same UI tokens, facts, and game elements as the
app. A parity exporter keeps them aligned **without ever letting the
website influence the app**.

### The one rule: truth flows game → website, never back

```
  Flutter app  (SINGLE SOURCE OF TRUTH)
  ../lib/theme.dart · ../lib/game_state.dart · ../lib/elseworld_vibes.dart
  ../lib/characters.dart · ../lib/sam.dart · ../lib/payloads/daily_story.dart
  ../assets/realm-maps/phone-realm.txt
  ../assets/payloads/run-005/onboarding_hana_d1.json
        │
        │  website/scripts/sync-parity.mjs   (READS the app, EMITS json)
        ▼
  app/lib/parity.generated.json   ← GENERATED — never hand-edit
        │
        │  the website imports it
        ▼
  Next.js website  (CONSUMER)
```

The dependency arrow points one direction only. The exporter **reads**
the app's own source + asset files and **writes** a JSON into the
website. The app imports nothing from the website and is unaware this
script exists — reading app files is not influencing the app. The script
lives in **this repo** on purpose: the app repo gets nothing added (no
script, no dependency, no config). It is **not** run on Vercel; the
generated JSON is committed and Vercel just reads it.

### Usage

```bash
npm run parity         # regenerate parity.generated.json from the game
npm run parity:check   # diff vs committed; non-zero exit on drift (CI-able)
```

The exporter also enforces a **banned-word frame gate** (Rule S,
`docs/design/rpg-framing.md`): it refuses to ship any banned real-world
term (`wellness`, `401k`, `BMI`, `cortisol`, …) to a player-facing field.
Author-craft fields that legitimately contain those words for the LLM
(`personaDescription`, `quirk`) are **not** shipped to the wiki; the
one canon-documented exception (`fitness & wellness` → `fitness & body`)
is substituted. If a banned token ever reaches a shipped field, `npm run
parity` / `parity:check` **fails the build** with the offending field —
so the leak the /writers-room panel caught can't recur.

Run `npm run parity` after any game change that touches the sources
above, then commit the updated `app/lib/parity.generated.json`. Run
`npm run parity:check` before a deploy to catch a stale website (this is
what would have caught last week's "REL tiers went 4→10 but the homepage
still said 4" drift).

> Requires the parent app checkout next to this folder — the script reads
> `../lib` and `../assets`. It does not run on Vercel (no app tree there);
> the committed JSON is what ships.

### What parity covers

| Domain | App source (truth) | Consumed by |
|---|---|---|
| UI tokens (palette) | `lib/theme.dart` `GameColors` | `app/globals.css` (cross-checked, warn on drift — CSS can't import JSON) |
| REL tier ladder | `lib/game_state.dart` `kRelTierThresholds`/`Names` | `app/lib/sim-data.ts` `relTierName()` |
| Item rarities | `lib/payloads/daily_story.dart` `ItemRarity` | available in JSON |
| Vibe bands | `lib/elseworld_vibes.dart` | `app/page.tsx` Elseworld tier card |
| Squad facts | `lib/characters.dart` + `lib/sam.dart` | `app/page.tsx` SQUAD array |
| Phone-realm map | `assets/realm-maps/phone-realm.txt` | `app/map/page.tsx` |
| Sim scenario | `assets/payloads/run-005/onboarding_hana_d1.json` | `app/lib/sim-data.ts` (simplified) |
| **Mainline story** | all `assets/payloads/run-005/*.json` | `app/wiki/arc` (read-only gateway, day-by-day) |

The **mainline gateway** (`/wiki/arc`) surfaces the full curated 7-day arc
— every event, choice, delta, reaction, memory write, reveal — read-only
from the run-005 payloads, so the canon is browsable from anywhere without
being in the repo. The app stays the source of truth; this is a *gateway*,
not a second canon. Player-facing display fields only (author-craft fields
like `missionPrompt` are dropped). Banned-word hits in the shipped payload
text are **surfaced as visible frame-flags** (per day, and in the sync
console) rather than blocked — the website mirrors what the game already
ships to players, so a hit is a to-do for the writers' room to fix in the
payload, not a website bug.

**Facts vs presentation.** Parity governs the *facts and tokens*, not the
marketing prose or layout — those stay hand-authored. The simulator
scenario is allowed to be a *simplified* version of the canonical day
(self-contained, no map-glyph brackets); the exporter carries the full
canonical payload as `simScenario` so the simplification always derives
from game-sourced data rather than being independently invented.

**`palette` / squad `specialty` note.** The `globals.css` palette is
hand-authored for Tailwind and *verified* against the game tokens (the
exporter warns on mismatch) rather than generated, since CSS can't import
JSON. Character `specialty` is carried raw from the app; some values
(e.g. Hana's contains a banned word per the app's own comment) should be
displayed via the cleaned label, not the raw field — the homepage already
does this.

## Community notes (the feedback loop)

The wiki carries an **anchored notes** layer (`/wiki/*` pages, bottom of
each): comment-feel submission, ticket-spine backend. A note attaches to a
specific entity (`character:hana`, `arc:day-1`, `mechanics:page`, …) and
carries `open → applied / declined / discuss` + a writers'-room reply.
Notes are **suggestions** — never canon. The app stays the source of truth.

**The loop — wiki → notes → /writers-room reject/approve → changes:**
browser/you/LLM drops a note (stamped with the data snapshot
`run-005 · <contentHash>` it was written against) → Supabase `wiki_notes`
(a *separate feedback store*, not the app, not the canon) → the triage
workflow runs each note through **/writers-room adjudication**:

- **APPROVE** → the panel drafts the exact payload edit; you ratify it
  into the `run-005` payload (the source of truth); `npm run parity`
  re-syncs and the wiki re-renders. Note → `applied`.
- **REJECT** → note → `declined` with a short reply (off-frame, breaks a
  gate, wrong character lane, or already superseded by a newer snapshot).
- **DISCUSS** → kept open for a human conversation.

`/writers-room` is the **final say**; notes are only suggestions; the
workflow **never auto-commits canon** — it drafts, a human ratifies. The
website never writes to the app; one-way holds. The snapshot stamp lets
triage flag a note written against an older canon version (with an
"↺ EARLIER SNAPSHOT" tag in the UI) so a stale suggestion gets
re-verified before it's acted on. Worked example already in the wild:
the gateway surfaced "RESTING HEART RATE" in Hana's Day-1 scenario (a
banned clinical term her sheet forbids); a note flagged it, /writers-room
approved, and it was rewritten in her idiolect — note now `applied`.

### Going live — status

1. **Table:** ✅ **provisioned.** Applied to the `myliar` Supabase project
   as the app-repo migration `supabase/migrations/0005_wiki_notes.sql`
   (RLS verified: anon insert open-only → 201; anon self-approve → 401;
   public read of non-declined). The standalone `supabase/wiki_notes.sql`
   here is a reference copy of the same schema.
2. **Local env:** ✅ **set.** `website/.env.local` (gitignored) holds
   `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` (the
   JWT-format `eyJ…` anon key). `npm run dev` shows live notes.
   **⚠ Production still needs these two vars set in the Vercel dashboard**
   — until then the prod notes UI shows the quiet "coming soon" card (the
   site builds/deploys fine without them).
3. **Triage:** ✅ **proven end-to-end once.** Set `SUPABASE_URL` +
   `SUPABASE_SERVICE_KEY` (service role — server-side only, never
   committed, never the anon key), then run the workflow
   `scripts/triage-notes.workflow.mjs`. It reads open notes, adjudicates
   via /writers-room, writes replies back, and hands you a digest of
   recommended applies with draft edits. It **never** commits canon —
   /writers-room + you are final. (First run already happened: the
   Day-1 "heart rate" note was approved, the payload was fixed, and the
   note is now `applied`.)

## Syncing the static booklets

The HTML booklets served via `next.config.ts` rewrites are still a plain
file copy (not part of the parity JSON, since they're whole documents):

| Asset | Source in parent repo | Destination |
|---|---|---|
| Manual HTML | `docs/manual.html` | `website/public/manual.html` |
| Walkthrough TXT | `docs/walkthrough.txt` | `website/public/walkthrough.txt` |
| Campaign editor HTML | `docs/campaign-editor.html` | `website/public/campaign-editor.html` |
| Manual screenshots | `docs/screenshots/*.png` | `website/public/screenshots/` |
