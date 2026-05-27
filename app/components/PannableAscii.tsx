"use client";

import { useRef, useState, ReactNode } from "react";

// PannableAscii — wraps an ASCII map in a horizontally-scrollable
// container that ALSO supports click-drag-to-pan on desktop.
//
// Why: the in-game realm-map asset is ~58 chars wide. On narrow phone
// viewports that overflows; native horizontal swipe handles touch
// fine, but on desktop the user has no obvious way to scroll a
// non-wheel pre block. Drag-to-pan adds the game-feel scroll gesture
// without breaking the native overflow-x-auto behavior beneath it.
//
// The grab cursor + the small "drag to pan ›" hint discoverability-
// hint are the only chrome. No buttons, no scrollbar pollution.

interface Props {
  children: ReactNode;
  ariaLabel?: string;
}

export function PannableAscii({ children, ariaLabel = "ASCII map" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<{ startX: number; scrollLeft: number } | null>(null);

  const startDrag = (clientX: number) => {
    if (!ref.current) return;
    setDrag({ startX: clientX, scrollLeft: ref.current.scrollLeft });
  };
  const moveDrag = (clientX: number) => {
    if (!drag || !ref.current) return;
    ref.current.scrollLeft = drag.scrollLeft - (clientX - drag.startX);
  };
  const endDrag = () => setDrag(null);

  return (
    <div className="relative">
      <div
        ref={ref}
        role="region"
        aria-label={ariaLabel}
        className={`overflow-x-auto select-none ${
          drag ? "cursor-grabbing" : "cursor-grab"
        }`}
        onMouseDown={(e) => startDrag(e.clientX)}
        onMouseMove={(e) => {
          if (drag) {
            e.preventDefault();
            moveDrag(e.clientX);
          }
        }}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
      >
        {children}
      </div>
      {/* Discoverability hint — small italic margin-ink, top-right
          of the wrapper. Only visible on hover (desktop) so it
          doesn't clutter mobile where native swipe already works. */}
      <div
        className="pointer-events-none absolute top-1 right-2 hidden sm:block opacity-0 hover:opacity-100 transition"
        aria-hidden="true"
      >
        <span className="font-sans italic text-[10px] text-margin-ink">
          ‹ drag to pan ›
        </span>
      </div>
    </div>
  );
}
