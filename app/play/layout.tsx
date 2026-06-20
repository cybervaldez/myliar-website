// The /play campaign surface loads the GAME's theme packs (Vibrant / DOS / Corner). They live OUTSIDE
// globals.css so the rest of the website stays Parchment-only; this route-scoped import is what lets
// PlayRunner set data-pack=corner (etc.) and have it actually resolve. See app/campaign-themes.css.
import "../campaign-themes.css";

export default function PlayLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
