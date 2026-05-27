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
      <body className="font-body antialiased bg-ink-950 text-ink-50 min-h-dvh">
        <div aria-hidden="true" className="fixed inset-0 pointer-events-none overflow-hidden">
          <span className="absolute top-[8%] left-[6%] text-7xl opacity-[0.04] rotate-[-18deg] select-none">⚀</span>
          <span className="absolute top-[12%] right-[10%] text-8xl opacity-[0.03] rotate-[22deg] select-none">⚅</span>
          <span className="absolute bottom-[18%] left-[12%] text-6xl opacity-[0.04] rotate-[10deg] select-none">⚃</span>
          <span className="absolute bottom-[10%] right-[8%] text-9xl opacity-[0.03] rotate-[-12deg] select-none">
            ⚂
          </span>
        </div>
        {children}
      </body>
    </html>
  );
}

export default RootLayout;
