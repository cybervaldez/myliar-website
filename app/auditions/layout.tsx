// The auditions shell — wraps every page with the NAV RAIL. ONE layout now (shell-only, 2026-06-21):
// the column + dashboard modes + the switcher were removed; the shell is purely CSS/media-query driven
// (see globals.css "AUDITIONS · THE LAYOUT") — it collapses to a single column on mobile. NOT canon.
import NavRail from "./NavRail";

export default function AuditionsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* before paint: force Parchment & Ink for the auditions tool (the game keeps its own packs). */}
      <script dangerouslySetInnerHTML={{ __html: "try{document.documentElement.dataset.pack='parchment'}catch(e){}" }} />
      <NavRail />
      {children}
    </>
  );
}
