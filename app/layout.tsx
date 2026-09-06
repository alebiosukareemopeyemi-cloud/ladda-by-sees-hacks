import type { Metadata } from "next";
import {
  Bricolage_Grotesque,
  Instrument_Sans,
  JetBrains_Mono,
} from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/app-shell";

/** Display — headings, the gap score, step titles. §9 */
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

/** Body — 400 / 500. §9 */
const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  display: "swap",
});

/** Data — labels, scores, credential ids, eyebrows. §9 */
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ladda",
  description:
    "Map your skill gap against a target role, follow a roadmap cited to real career trajectories, and earn a verifiable credential.",
};

/**
 * Applies the saved theme before first paint so the toggle never flashes.
 * No saved value = follow the OS via `prefers-color-scheme` (handled in CSS).
 */
const themeScript = `(function(){try{var t=localStorage.getItem("ladda-theme");if(t==="dark"||t==="light"){document.documentElement.classList.add(t);}}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${instrument.variable} ${jetbrainsMono.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
