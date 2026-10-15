"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useChainId } from "wagmi";
import { chainById } from "@/lib/chains";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/app", label: "App" },
  { href: "/vaults", label: "Vaults" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/staking", label: "Staking" },
  { href: "/docs", label: "Docs" },
];

export function Navbar() {
  const pathname = usePathname();
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const meta = chainById(chainId);

  return (
    <header className="sticky top-0 z-40 border-b border-ink-700 bg-ink-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent font-mono text-lg font-bold text-white">
            S
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-bold tracking-[0.2em]">SINGULARIS</span>
            <span className="block text-xs text-muted">Capital in motion.</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-ink-800 hover:text-paper",
                pathname === l.href || pathname?.startsWith(l.href + "/") ? "bg-ink-800 text-paper" : ""
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {isConnected && (
            <span className="badge hidden text-muted sm:inline-flex" title={meta ? `${meta.label} (${meta.id})` : "Unknown network"}>
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              {meta ? meta.label : `Chain ${chainId}`}
            </span>
          )}
          <ConnectButton showBalance={false} chainStatus="icon" />
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-4 pb-2 md:hidden">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium text-muted",
              pathname === l.href ? "bg-ink-800 text-paper" : ""
            )}
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
