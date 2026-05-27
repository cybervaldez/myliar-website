import type { Metadata } from "next";
import { Anton, Lora, PT_Sans } from "next/font/google";
import "./globals.css";

// ── Typography mirror of docs/manual.html ──────────────────────────
// Anton — display caps (h1/h2/h3, AP COUNTER, etc.)
// Lora — body serif (paragraphs, quotes, italics)
// PT Sans — UI sans (TOC dot-leaders, debug-log callouts, margin notes)
const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});
const lora = Lora({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-lora",
  display: "swap",
});
const ptSans = PT_Sans({
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-pt-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mylifeisanrpg.com"),
  title:
    "My Life is an RPG — daily story about your day, narrated by people who are starting to know you",
  description:
    "Four characters live in your phone. They write about your day every morning. You write back at night. By Day 5 they compare notes.",
  openGraph: {
    title: "My Life is an RPG",
    description:
      "Four characters live in your phone. They write about your day every morning. You write back at night.",
    url: "https://mylifeisanrpg.com",
    siteName: "My Life is an RPG",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${anton.variable} ${lora.variable} ${ptSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
