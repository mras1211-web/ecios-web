import type { Metadata } from "next";
import { Source_Serif_4, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const display = Source_Serif_4({ subsets: ["latin"], variable: "--font-display", weight: ["500", "600"] });
const sans = IBM_Plex_Sans({ subsets: ["latin", "arabic"], variable: "--font-sans", weight: ["400", "500", "600"] });
const mono = IBM_Plex_Mono({ subsets: ["latin"], variable: "--font-mono", weight: ["400", "500"] });

export const metadata: Metadata = {
  title: "ECIOS · Vantage",
  description: "Enterprise Consulting Intelligence Operating System — Vantage for Business & Leadership Development",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
