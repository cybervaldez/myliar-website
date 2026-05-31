// The web companion — your app progress + wiki activity + shared worlds, on the
// web, for the account you signed in with. docs/design/guest-claim.md.

import Link from "next/link";
import parity from "../lib/parity.generated.json";
import { ProfilePanel } from "./ProfilePanel";

export const metadata = {
  title: "Your Companion — My Life is an RPG",
  description: "Your progress, your comments, and the worlds you've shared — on the web.",
};

export default function ProfilePage() {
  // Pull the small canon bits server-side so the big parity JSON stays out of
  // the client bundle.
  const relTiers = (parity as { relTiers: { thresholds: number[]; names: string[] } }).relTiers;
  const squad = (parity as { squad: { id: string; name: string }[] }).squad.map((c) => ({
    id: c.id,
    name: c.name,
  }));

  return (
    <main className="min-h-full bg-paper text-ink px-5 py-8 max-w-3xl mx-auto w-full">
      <div className="flex items-center justify-between mb-1">
        <Link href="/" className="font-display tracking-[0.12em] text-[11px] text-margin-ink hover:text-ink">
          ← MY LIFE IS AN RPG
        </Link>
        <Link href="/wiki" className="font-display tracking-[0.12em] text-[11px] text-margin-ink hover:text-ink">
          WIKI →
        </Link>
      </div>
      <h1 className="font-display text-[26px] tracking-[0.04em] text-ink mb-1">Your Companion</h1>
      <p className="text-[13px] text-ink-soft leading-[1.55] mb-6 max-w-xl">
        The web side of your save. Sign in with the same account you use in the app
        and your day, your squad, and the worlds you&apos;ve shared show up here.
      </p>
      <ProfilePanel relTiers={relTiers} squad={squad} />
    </main>
  );
}
