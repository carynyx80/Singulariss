"use client";

import { useState } from "react";
import { Eye, LayoutDashboard, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DEMO_ALLOCATION,
  DEMO_BORROWED,
  DEMO_COLLATERAL,
  DEMO_LIQUIDITY,
  DEMO_MARKETS,
  DEMO_PORTFOLIO_VALUE,
  DEMO_STRATEGIES,
  DEMO_SUPPLIED,
} from "@/lib/demo-data";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "markets", label: "Lending Markets" },
  { id: "strategies", label: "Strategies" },
  { id: "collateral", label: "Collateral" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function PreviewNotice() {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-[#10B981]/25 bg-[#10B981]/[0.07] p-3.5 text-sm sm:flex-row sm:items-center sm:justify-between">
      <p className="inline-flex items-center gap-2 font-semibold text-white">
        <Eye size={16} className="text-accent-bright" aria-hidden="true" />
        Preview Mode — No live transactions
      </p>
      <p className="text-xs text-muted sm:text-right">
        Static demo data only. Tabs switch locally — connecting a wallet does not enable transactions.
      </p>
    </div>
  );
}

function OverviewTab() {
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-wider text-muted">Portfolio value · demo</p>
          <span className="demo-chip">Illustrative Demo</span>
        </div>
        <p className="num mt-2 text-4xl font-bold text-white">{DEMO_PORTFOLIO_VALUE}</p>
        <p className="mt-1 text-xs text-muted">Demo total for layout — not real funds or TVL</p>
        <div className="mt-4 flex h-2.5 overflow-hidden rounded-full bg-white/[0.06]" aria-hidden="true">
          {DEMO_ALLOCATION.map((a) => (
            <span key={a.label} style={{ width: `${a.pct}%`, background: a.color }} />
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          {DEMO_ALLOCATION.map((a) => (
            <div key={a.label} className="flex items-center justify-between rounded-lg border border-white/[0.06] px-2.5 py-2">
              <span className="inline-flex items-center gap-1.5 text-muted">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: a.color }} />
                {a.label} · demo
              </span>
              <span className="num font-semibold text-white">{a.pct}%</span>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
          <p className="text-xs uppercase tracking-wider text-muted">Supplied assets · demo</p>
          <div className="mt-3 space-y-2">
            {DEMO_SUPPLIED.map((a) => (
              <div key={a.symbol} className="flex items-center justify-between text-sm">
                <span className="inline-flex items-center gap-2.5">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-[#10B981]/15 text-sm font-bold text-accent-bright">
                    {a.glyph}
                  </span>
                  <span>
                    <span className="block font-semibold text-white">{a.symbol}</span>
                    <span className="num block text-xs text-muted">{a.balance} · demo</span>
                  </span>
                </span>
                <span className="num text-white/85">{a.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
            <p className="text-xs uppercase tracking-wider text-muted">Borrowed · demo</p>
            <div className="mt-2 space-y-2 text-sm">
              {DEMO_BORROWED.map((a) => (
                <div key={a.symbol} className="flex items-center justify-between">
                  <span className="font-semibold text-white">{a.symbol} <span className="font-normal text-muted">· demo</span></span>
                  <span className="num text-white/85">{a.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
            <p className="text-xs uppercase tracking-wider text-muted">Available liquidity · demo</p>
            <p className="num mt-2 text-xl font-bold text-white">{DEMO_LIQUIDITY}</p>
            <p className="mt-1 text-[11px] text-muted">Illustrative figure for layout only</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MarketsTab() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.07]">
      <div className="hidden grid-cols-[1.2fr_1fr_1fr_1fr_0.8fr] gap-3 border-b border-white/[0.07] bg-white/[0.02] px-5 py-3 text-xs uppercase tracking-wider text-muted sm:grid">
        <span>Asset · demo</span>
        <span>Supply · demo</span>
        <span>Borrow · demo</span>
        <span>Liquidity · demo</span>
        <span className="text-right">Status</span>
      </div>
      <div className="divide-y divide-white/[0.06]">
        {DEMO_MARKETS.map((m) => (
          <div key={m.asset} className="grid gap-2 px-5 py-4 text-sm sm:grid-cols-[1.2fr_1fr_1fr_1fr_0.8fr] sm:items-center sm:gap-3">
            <span className="inline-flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[#10B981]/15 text-sm font-bold text-accent-bright">
                {m.glyph}
              </span>
              <span className="font-semibold text-white">{m.asset}</span>
              <span className="demo-chip !text-[10px]">Demo</span>
            </span>
            <span className="text-muted">{m.supplyLabel} data</span>
            <span className="text-muted">{m.borrowLabel} data</span>
            <span className="num text-white/85">{m.liquidityLabel}</span>
            <span className="sm:text-right">
              <span className="badge">{m.status}</span>
            </span>
          </div>
        ))}
      </div>
      <p className="border-t border-white/[0.07] bg-white/[0.01] px-5 py-3 text-xs text-muted">
        Illustrative static rows for layout only. Not real market data, rates, or liquidity.
      </p>
    </div>
  );
}

function StrategiesTab() {
  const riskStyle: Record<string, string> = {
    Low: "border-[#10B981]/30 bg-[#10B981]/10 text-[#6EE7B7]",
    Moderate: "border-amber-400/30 bg-amber-400/10 text-amber-200",
    Elevated: "border-rose-400/30 bg-rose-400/10 text-rose-200",
  };
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {DEMO_STRATEGIES.map((s) => (
        <article key={s.name} className="flex flex-col rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
          <div className="flex items-center justify-between gap-2">
            <span className={cn("rounded-full border px-2.5 py-1 text-[11px] font-semibold", riskStyle[s.risk])}>
              {s.risk} risk · demo
            </span>
            <span className="demo-chip !text-[10px]">Demo</span>
          </div>
          <h3 className="mt-3 font-semibold text-white">{s.name}</h3>
          <p className="text-xs text-muted">{s.type}</p>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{s.description}</p>
          <p className="mt-4 border-t border-white/[0.07] pt-3 text-xs text-muted">{s.status}</p>
        </article>
      ))}
    </div>
  );
}

function CollateralTab() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {DEMO_COLLATERAL.map((c) => (
        <article key={c.asset} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[#10B981]/15 font-bold text-accent-bright">
                {c.glyph}
              </span>
              <span className="font-semibold text-white">{c.asset}</span>
            </span>
            <span className="demo-chip !text-[10px]">Demo</span>
          </div>
          <p className="mt-3 text-sm">
            <span className="badge">{c.eligibility}</span>
          </p>
          <p className="num mt-3 text-sm text-white/85">Max exposure: {c.maxLabel}</p>
          <p className="mt-1 text-xs text-muted">{c.note}</p>
        </article>
      ))}
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
                eyebrow="Dashboard preview"
                title="A calm preview of the intended product"
                description="Overview, lending markets, strategies, and collateral in one place. Every figure is a static demo placeholder."
              />
            </div>
            <Reveal delay={80}>
              <div className="mt-6">
                <PreviewNotice />
              </div>
            </Reveal>
          </>
        ) : (
          <PreviewNotice />
        )}

        <Reveal delay={compact ? 0 : 120}>
          <div
            className="mt-6 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0C1210] shadow-card"
            id="strategies"
          >
            <div className="flex flex-col gap-3 border-b border-white/[0.07] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                <LayoutDashboard size={16} className="text-accent-bright" aria-hidden="true" />
                Singularis Preview
                <span className="demo-chip">Illustrative Demo</span>
              </p>
              <div className="flex gap-1 overflow-x-auto rounded-xl border border-white/[0.07] bg-black/30 p-1" role="tablist" aria-label="Dashboard preview tabs">
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
              {tab === "markets" ? <MarketsTab /> : null}
              {tab === "strategies" ? <StrategiesTab /> : null}
              {tab === "collateral" ? <CollateralTab /> : null}
            </div>

            <div className="flex flex-col gap-1 border-t border-white/[0.07] bg-white/[0.01] px-5 py-3.5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
              <span className="inline-flex items-center gap-1.5">
                <ShieldAlert size={14} aria-hidden="true" />
                Mainnet wallet connection · No transactions · Demo data only
              </span>
              <span>Not real TVL, funds, yield, or market data</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
