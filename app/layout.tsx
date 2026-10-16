import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { SiteNavbar } from "@/components/landing/SiteNavbar";
import { SiteFooter } from "@/components/landing/SiteFooter";

export const metadata: Metadata = {
  title: "Singularis — Put Your Capital to Work",
  description:
    "Singularis is a planned multichain DeFi capital protocol concept for lending, borrowing, and approved yield strategies across Robinhood Chain and BNB Chain. Preview only — no live markets or transactions.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div id="top">
            <SiteNavbar />
            <main className="w-full">{children}</main>
            <SiteFooter />
          </div>
        </Providers>
      </body>
    </html>
  );
}
