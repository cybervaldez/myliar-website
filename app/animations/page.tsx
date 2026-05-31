// /animations — a sandbox for the game's motion. Prototype animations + page
// transitions here on the web (fast to tweak), then translate the listed
// curve + duration to Flutter. Easier to play with than rebuilding in the app
// each time. Respects the theme picker (uses the site tokens).

import Link from "next/link";
import AnimationGallery from "./gallery";

export const metadata = {
  title: "Animations — My Life is an RPG",
  description: "Web prototypes of the game's motion + transitions, with the curve/duration to port to Flutter.",
};

export default function AnimationsPage() {
  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: "32px 20px 80px" }}>
      <h1 style={{ fontSize: 30, marginBottom: 6 }}>Animations</h1>
      <p style={{ color: "var(--ink-soft)", lineHeight: 1.6, marginBottom: 6, maxWidth: 640 }}>
        A sandbox for the game&apos;s motion. Tweak the CSS here (fast), then translate the
        listed <b>curve + duration</b> to Flutter — the port is mechanical. Hit{" "}
        <b>▶ replay</b> on any card. Flip the theme (the <b>✦ THEME</b> button) to see each
        animation in every pack.
      </p>
      <p style={{ fontSize: 13, color: "var(--margin-ink)", marginBottom: 26 }}>
        <Link href="/" style={{ color: "var(--forest)" }}>← home</Link>
        {"   ·   "}new clips drop in here as we build them.
      </p>
      <AnimationGallery />
    </main>
  );
}
