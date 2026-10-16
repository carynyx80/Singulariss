"use client";

import { RefreshCw, Wallet } from "lucide-react";
import { useAccount, useChainId } from "wagmi";
import { chainById } from "@/lib/chains";
import { useAssetBalances } from "@/lib/useBalances";

function shortAmount(formatted: string | null): string {
  if (formatted === null) return "…";
  const [w, f = ""] = formatted.split(".");
  const frac = f.slice(0, 4).replace(/0+$/, "");
  return frac ? `${w}.${frac}` : w;
}

export function LivePortfolioCard() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const meta = chainById(chainId);
  const { balances, isLoading, refetch } = useAssetBalances();

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0C1210]/95 shadow-card"
      aria-label="Live wallet portfolio"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-emerald-radial" aria-hidden="true" />
      <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-3.5">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#10B981]/60" />
          <span className="ml-2 text-xs font-medium text-muted">Singularis · Live</span>
        </div>
        <span className="badge-emerald">
          <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" aria-hidden="true" /> On-chain
        </span>
      </div>

      <div className="space-y-4 p-5">
        {!isConnected ? (
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-6 text-center">
            <Wallet size={22} className="mx-auto text-accent-bright" aria-hidden="true" />
            <p className="mt-3 font-semibold text-white">Connect your wallet</p>
            <p className="mx-auto mt-1 max-w-xs text-sm text-muted">
              See your real ETH + USDG on Robinhood Chain, or BNB + USDC on BNB Chain.
            </p>
          </div>
        ) : balances.length === 0 ? (
          <div className="rounded-xl border border-amber-400/25 bg-amber-400/[0.06] p-5 text-center text-sm text-amber-100">
            Unsupported network. Switch to Robinhood Chain or BNB Chain from the wallet menu.
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted">Wallet assets · live</p>
                <p className="mt-1 text-lg font-bold text-white">
                  {meta ? meta.label : `Chain ${chainId}`}
                </p>
              </div>
              <button
                type="button"
                onClick={refetch}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-white/[0.06] hover:text-white disabled:opacity-50"
              >
                <RefreshCw size={13} aria-hidden="true" className={isLoading ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>
            <div className="space-y-2">
              {balances.map((b) => (
                <div
                  key={b.asset.symbol}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-[#10B981]/15 text-sm font-bold text-accent-bright">
                      {b.asset.glyph}
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-white">{b.asset.symbol}</span>
                      <span className="block text-xs text-muted">{b.asset.name}</span>
                    </span>
                  </div>
                  <span className="num text-sm text-white/85">
                    {b.isError ? (
                      <span className="text-xs text-rose-300">unavailable</span>
                    ) : (
                      `${shortAmount(b.formatted)} ${b.asset.symbol}`
                    )}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[11px] leading-relaxed text-muted">
              Live token amounts read from the chain. No valuations shown — no price feeds are
              integrated.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
