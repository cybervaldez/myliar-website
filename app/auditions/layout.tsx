// The auditions shell — wraps every page with the NAV RAIL (shown only in shell layout) + the LAYOUT
// SWITCHER (column · shell · dashboard, pick-and-choose). Layout is CSS-driven off data-aud-layout. NOT canon.
import NavRail from "./NavRail";
import LayoutSwitcher from "./LayoutSwitcher";

export default function AuditionsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* set the layout on <html> BEFORE paint (no flash; the attribute is always present) */}
      <script dangerouslySetInnerHTML={{ __html: "try{document.documentElement.dataset.audLayout=localStorage.getItem('audLayout')||'column'}catch(e){}" }} />
      <NavRail />
      {children}
      <LayoutSwitcher />
    </>
  );
}
