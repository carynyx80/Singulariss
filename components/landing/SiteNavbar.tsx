"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, HandCoins, Home, Landmark, Menu, Vault, X } from "lucide-react";
import { ConnectWalletButton } from "./ConnectWalletButton";
import { LogoMark } from "./LogoMark";

const LINKS = [
  { href: "#markets", label: "Markets" },
  { href: "/lend", label: "Lending" },
  { href: "/borrow", label: "Borrowing" },
  { href: "#strategies", label: "Strategies" },
  { href: "#ecosystem", label: "Ecosystem" },
  { href: "#about", label: "About" },
];

const MOBILE_LINKS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/lend", label: "Lending", icon: HandCoins },
  { href: "/borrow", label: "Borrowing", icon: Landmark },
  { href: "/vaults", label: "Vaults", icon: Vault },
];

export function SiteNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-[#080B09]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Singularis home">
          <LogoMark size={34} />
          <span className="leading-tight">
            <span className="block text-sm font-bold tracking-[0.22em] text-white">SINGULARIS</span>
            <span className="block text-[11px] text-muted">Multichain capital protocol</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-white/[0.05] hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <span className="badge" title="Supported networks for wallet connection">
            <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" aria-hidden="true" />
            <span className="text-muted">Robinhood Chain · BNB Chain</span>
            <span className="font-semibold text-white/80">Mainnet</span>
          </span>
          <Link href="/preview" className="btn-ghost !min-h-0 !px-4 !py-2 text-sm">
            Launch App <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
          <ConnectWalletButton />
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <ConnectWalletButton />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-white hover:bg-white/[0.06]"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open ? (
        <nav
          className="border-t border-white/[0.07] bg-[#0C1210] px-4 py-4 sm:px-6 lg:hidden"
          aria-label="Mobile"
        >
          <div className="flex flex-col gap-1">
            {MOBILE_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] font-medium text-white/85 transition-colors hover:bg-white/[0.05] hover:text-white"
              >
                <span className="grid h-9 w-9 place-items-center rounded-xl border border-[#10B981]/25 bg-[#10B981]/10 text-accent-bright">
                  <l.icon size={17} aria-hidden="true" />
                </span>
                {l.label}
              </Link>
            ))}
            <div className="mt-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 text-xs text-muted">
              <p className="font-semibold uppercase tracking-wider text-white/70">Networks</p>
              <p className="mt-1">Robinhood Chain — mainnet live</p>
              <p>BNB Chain — mainnet live</p>
            </div>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
