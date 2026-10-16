"use client";

import { useState } from "react";
import { Eye, LayoutDashboard, Lock, RefreshCw, ShieldAlert, Wallet } from "lucide-react";
import { useAccount, useChainId } from "wagmi";
import { cn } from "@/lib/utils";
import { chainById } from "@/lib/chains";
import { assetsForChain } from "@/lib/tokens";
import { useAssetBalances } from "@/lib/useBalances";
import { ActivityFeed } from "./ActivityFeed";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { TransferForm } from "./TransferForm";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "send", label: "Send & Receive" },
  { id: "activity", label: "Activity" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function LiveNotice() {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-[#10B981]/25 bg-[#10B981]/[0.07] p-3.5 text-sm sm:flex-row sm:items-center sm:justify-between">
      <p className="inline-flex items-center gap-2 font-semibold text-white">
        <Eye size={16} className="text-accent-bright" aria-hidden="true" />
        Live wallet data — transfers are real transactions
      </p>
      <p className="text-xs text-muted sm:text-right">
        Balances read from the chain. Lending, borrowing, and strategies are not available yet.
      </p>
    </div>
  );
}

function OverviewTab() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const meta = chainById(chainId);
  const { balances, isLoading, refetch } = useAssetBalances();
  const supported = assetsForChain(chainId).length > 0;

  if (!isConnected) {
    return (
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-8 text-center">
        <Wallet size={22} className="mx-auto text-accent-bright" aria-hidden="true" />
        <p className="mt-3 font-semibold text-white">Connect your wallet</p>
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted">
          Your live ETH + USDG balances on Robinhood Chain, or BNB + USDC on BNB Chain, appear
          here. Use the Connect Wallet button above.
        </p>
      </div>
    );
  }

  if (!supported) {
    return (
      <div className="rounded-2xl border border-amber-400/25 bg-amber-400/[0.06] p-6 text-center text-sm text-amber-100">
        Unsupported network. Switch to Robinhood Chain or BNB Chain from the wallet menu to see
        your assets.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">
          {meta ? meta.label : `Chain ${chainId}`} · {balances.length} supported assets
        </p>
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
      <div className="grid gap-3 sm:grid-cols-2">
        {balances.map((b) => (
          <div key={b.asset.symbol} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[#10B981]/15 font-bold text-accent-bright">
                {b.asset.glyph}
              </span>
              <div>
                <p className="font-semibold text-white">{b.asset.symbol}</p>
                <p className="text-xs text-muted">{b.asset.name}</p>
              </div>
            </div>
            <p className="num mt-3 truncate text-2xl font-bold text-white">
              {b.isLoading ? "…" : b.isError ? "—" : b.formatted}
            </p>
            <p className="mt-1 text-xs text-muted">
              {b.isError ? "Could not load — check your connection and refresh." : "Live on-chain balance"}
            </p>
          </div>
        ))}
      </div>
      <div className="flex items-start gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.01] p-4 text-sm">
        <Lock size={16} className="mt-0.5 shrink-0 text-muted" aria-hidden="true" />
        <p className="text-muted">
          <span className="font-semibold text-white">Lending, borrowing, and yield strategies</span>{" "}
          are not available yet — no protocol contracts are deployed. Your assets stay in your
          wallet until contracts are deployed, reviewed, and explicitly enabled.
        </p>
      </div>
    </div>
  );
}

export function DashboardPreview({ compact = false }: { compact?: boolean }) {
  const [tab, setTab] = useState<TabId>("overview");

  return (
    <section
      id={compact ? undefined : "preview"}
      className={compact ? "" : "section-pad scroll-mt-20 border-t border-white/[0.06]"}
      aria-labelledby={compact ? undefined : "preview-heading"}
    >
      <div className={compact ? "" : "mx-auto w-full max-w-6xl px-4 sm:px-6"}>
        {!compact ? (
          <>
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <SectionHeading
                eyebrow="Your money"
                title="Live balances, real transfers"
                description="Connect on Robinhood Chain for ETH and USDG, or BNB Chain for BNB and USDC. Everything here is read from — or written to — the real chain."
              />
            </div>
            <Reveal delay={80}>
              <div className="mt-6">
                <LiveNotice />
              </div>
            </Reveal>
          </>
        ) : (
          <LiveNotice />
        )}

        <Reveal delay={compact ? 0 : 120}>
          <div
            className="mt-6 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0C1210] shadow-card"
            id="strategies"
          >
            <div className="flex flex-col gap-3 border-b border-white/[0.07] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                <LayoutDashboard size={16} className="text-accent-bright" aria-hidden="true" />
                Singularis Wallet
                <span className="badge-emerald">Live</span>
              </p>
              <div className="flex gap-1 overflow-x-auto rounded-xl border border-white/[0.07] bg-black/30 p-1" role="tablist" aria-label="Wallet tabs">
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    role="tab"
                    aria-selected={tab === t.id}
                    onClick={() => setTab(t.id)}
                    className={cn(
                      "whitespace-nowrap rounded-lg px-3.5 py-2 text-[13px] font-medium transition-colors",
                      tab === t.id
                        ? "bg-[#10B981] text-[#05281C]"
                        : "text-muted hover:bg-white/[0.06] hover:text-white"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 sm:p-5" role="tabpanel">
              {tab === "overview" ? <OverviewTab /> : null}
              {tab === "send" ? <TransferForm /> : null}
              {tab === "activity" ? <ActivityFeed /> : null}
            </div>

            <div className="flex flex-col gap-1 border-t border-white/[0.07] bg-white/[0.01] px-5 py-3.5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
              <span className="inline-flex items-center gap-1.5">
                <ShieldAlert size={14} aria-hidden="true" />
                Transfers are real mainnet transactions — always verify the address
              </span>
              <span>No valuations shown — no price feeds integrated</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
