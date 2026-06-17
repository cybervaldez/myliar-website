// The auditions shell — wraps every page with the NAV RAIL (shown only in shell layout) + the LAYOUT
// SWITCHER (column · shell · dashboard, pick-and-choose). Layout is CSS-driven off data-aud-layout. NOT canon.
import NavRail from "./NavRail";
import LayoutSwitcher from "./LayoutSwitcher";

export default function AuditionsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavRail />
      {children}
      <LayoutSwitcher />
    </>
  );
}
