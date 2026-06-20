// The auditions shell — wraps every page with the NAV RAIL (shown only in shell layout) + the LAYOUT
// SWITCHER (column · shell · dashboard, pick-and-choose). Layout is CSS-driven off data-aud-layout. NOT canon.
import NavRail from "./NavRail";
import LayoutSwitcher from "./LayoutSwitcher";

export default function AuditionsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* before paint: force Parchment & Ink for the auditions tool (creative-liberty target; the game keeps
          its packs) + restore the saved layout mode. No flash; the attributes are always present. */}
      <script dangerouslySetInnerHTML={{ __html: "try{var r=document.documentElement;r.dataset.pack='parchment';r.dataset.audLayout=localStorage.getItem('audLayout')||'shell'}catch(e){}" }} />
      <NavRail />
      {children}
      <LayoutSwitcher />
    </>
  );
}
