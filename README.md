# mylifeisanrpg.com

Marketing site for the **My Life is an RPG** mobile game. Lives in its own
git repository (this directory is `.gitignore`'d from the main `myliar`
monorepo); deployed to Vercel.

## What's here

- `app/page.tsx` — single-page landing with hero / playable simulator /
  squad / three-tier explainer / footer CTA.
- `app/components/Simulator.tsx` — the **landing-page gameplay simulator**.
  Three events of Hana's Day 1 lifted from the game's `run-003`
  payloads, client-side state only, no LLM call, no API key, no rate
  limit. Visitors experience the trichotomy (logical / passive /
  chaotic), the dice on chaotic, stats moving, REL tier-up. ~90 seconds
  end-to-end.
- `app/lib/sim-data.ts` — the canned scenario + types. Source of truth
  in the parent repo is `assets/payloads/run-003/onboarding_hana_d1.json`;
  if you re-sync, lift from there.
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

## Syncing assets from the parent game

When the game's content updates and you want the marketing site to
reflect it:

| Asset | Source in parent repo | Destination |
|---|---|---|
| Manual HTML | `docs/manual.html` | `website/public/manual.html` |
| Manual screenshots | `docs/screenshots/*.png` | `website/public/screenshots/` |
| Squad copy | `lib/characters.dart` (helpSummary fields) | `website/app/page.tsx` SQUAD array |
| Simulator scenario | `assets/payloads/run-003/onboarding_hana_d1.json` | `website/app/lib/sim-data.ts` |

A more disciplined version of this would publish those assets as a
package the website imports. For v1 a manual sync is fine — the parent
content changes are deliberate and infrequent.
