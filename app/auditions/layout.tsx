// The auditions shell — wraps every page with the NAV RAIL. ONE layout now (shell-only, 2026-06-21):
// the column + dashboard modes + the switcher were removed; the shell is purely CSS/media-query driven
// (see globals.css "AUDITIONS · THE LAYOUT") — it collapses to a single column on mobile. NOT canon.
import NavRail from "./NavRail";
import DarkToggle from "./DarkToggle";

export default function AuditionsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* before paint: force Parchment & Ink + restore the saved light/dark mode (no flash). */}
      <script dangerouslySetInnerHTML={{ __html: "try{var m=localStorage.getItem('aud-mode')||'light';var d=document.documentElement.dataset;d.pack='parchment';d.mode=m;}catch(e){}" }} />
      <NavRail />
      <DarkToggle />
      {children}
    </>
  );
}
