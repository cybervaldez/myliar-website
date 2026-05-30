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

## Local dev

```bash
npm install
npm run dev
# http://localhost:3000
```

## Build + deploy

```bash
npm run build
```

Vercel auto-deploys on push to `main` (or whichever branch you
configure). No environment variables required — the simulator is fully
canned and runs client-side.

## Why is this directory git-ignored from the parent repo?

The marketing site lives in its own GitHub repo so Vercel can deploy it
independently. The parent `myliar` monorepo doesn't track `website/`;
treat this folder as a separate project. To wire it up:

```bash
cd website
git init -b main
git remote add origin <your-website-repo-url>
git add .
git commit -m "Initial scaffold"
git push -u origin main
```

Then connect that repo to Vercel.

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

## Syncing the static booklets

The HTML booklets served via `next.config.ts` rewrites are still a plain
file copy (not part of the parity JSON, since they're whole documents):

| Asset | Source in parent repo | Destination |
|---|---|---|
| Manual HTML | `docs/manual.html` | `website/public/manual.html` |
| Walkthrough TXT | `docs/walkthrough.txt` | `website/public/walkthrough.txt` |
| Campaign editor HTML | `docs/campaign-editor.html` | `website/public/campaign-editor.html` |
| Manual screenshots | `docs/screenshots/*.png` | `website/public/screenshots/` |
