import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin Turbopack workspace root to this directory — without it Next
  // walks up looking for the nearest lockfile and lands on the user's
  // home dir, polluting the build.
  turbopack: {
    root: path.join(__dirname),
  },

  // /manual serves the existing self-contained instruction booklet
  // (public/manual.html). It's already styled to spec; an iframe-free
  // rewrite is the cleanest way to preserve the cream-paper layout
  // without re-implementing it in React.
  async rewrites() {
    return [
      {
        source: "/manual",
        destination: "/manual.html",
      },
    ];
  },
};

export default nextConfig;
