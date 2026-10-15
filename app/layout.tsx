import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "SINGULARIS — Capital in motion",
  description:
    "SINGULARIS is a non-custodial multi-chain DeFi protocol for transparent on-chain yield vaults. Initial deployment: Robinhood Chain.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-6 sm:px-6">{children}</main>
          <footer className="border-t border-ink-700 py-8">
            <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 text-sm text-muted sm:px-6">
              <div className="flex items-center justify-between">
                <span className="font-semibold tracking-widest text-paper">SINGULARIS</span>
                <span className="num">Capital in motion.</span>
              </div>
              <p>
                Non-custodial vault protocol. Contracts unaudited — testnet only. Never deposit
                mainnet funds into unverified strategies.
              </p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
