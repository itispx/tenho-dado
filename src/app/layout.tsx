import clsx from "clsx";
import type { Metadata, Viewport } from "next";
import { Bebas_Neue, DM_Sans } from "next/font/google";

import "@/styles/globals.css";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Tenho Dado 🎲",
    template: "%s — Tenho Dado",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0a0a0a",
};

export interface RootLayoutProps {
  children: React.ReactNode;
}

function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="pt-BR" className={clsx(bebasNeue.variable, dmSans.variable)}>
      <body className="min-h-dvh bg-ink-950 font-body text-ink-50 antialiased">{children}</body>
    </html>
  );
}

export default RootLayout;
