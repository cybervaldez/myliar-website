// Wiki shell — wraps every /wiki/* route. Provides the left category
// rail (WikiNav); each page renders its own article + infobox via
// WikiPage. Two-column on lg (nav | main), stacked on mobile.

import type { ReactNode } from "react";
import { WikiNav } from "./_components/WikiNav";
import { navTree } from "./wiki-data";

export default function WikiLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex-1 max-w-[1180px] mx-auto px-5 sm:px-8 py-8 sm:py-12 w-full">
      <div className="grid lg:grid-cols-[200px_1fr] gap-8 lg:gap-12 items-start">
        <WikiNav tree={navTree()} />
        <div className="min-w-0">{children}</div>
      </div>
    </main>
  );
}
