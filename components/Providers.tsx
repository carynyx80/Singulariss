"use client";

import dynamic from "next/dynamic";

/**
 * App shell: loads the wallet stack client-side only.
 * WalletConnect initializes indexedDB at setup, which crashes SSR —
 * so WalletProviders is excluded from server rendering. Pages render
 * a static shell first, then hydrate wallet state in the browser.
 */
const WalletProviders = dynamic(
  () => import("./WalletProviders").then((m) => m.WalletProviders),
  {
    ssr: false,
    loading: () => (
      <div>
        <header className="border-b border-ink-700">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
            <span className="text-sm font-bold tracking-widest text-paper">SINGULARIS</span>
            <span className="text-xs text-muted">Loading wallet…</span>
          </div>
        </header>
      </div>
    ),
  }
);

export function Providers({ children }: { children: React.ReactNode }) {
  return <WalletProviders>{children}</WalletProviders>;
}
