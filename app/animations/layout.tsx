// The theme gallery showcases every GAME pack (Vibrant / DOS / Corner), so it loads the campaign
// theme packs the same way /play does — route-scoped, NOT in globals.css. See app/campaign-themes.css.
import "../campaign-themes.css";

export default function AnimationsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
