import { ArrowUpRight, Eye } from "lucide-react";
import {
  DEMO_ALLOCATION,
  DEMO_BORROWED,
  DEMO_LIQUIDITY,
  DEMO_PORTFOLIO_VALUE,
  DEMO_SUPPLIED,
} from "@/lib/demo-data";

function AssetRow({
  glyph,
  symbol,
  balance,
  value,
}: {
  glyph: string;
  symbol: string;
  balance: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
      <div className="flex items-center gap-2.5">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-[#10B981]/15 text-sm font-bold text-accent-bright">
          {glyph}
        </span>
        <span>
          <span className="block text-sm font-semibold text-white">{symbol}</span>
          <span className="num block text-xs text-muted">{balance} · demo</span>
        </span>
      </div>
      <span className="num text-sm text-white/85">{value}</span>
    </div>
  );
}

export function HeroDashboardMock() {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0C1210]/95 shadow-card"
      role="img"
      aria-label="Illustrative demo dashboard preview showing portfolio value $12,480.00 with demo supplied, borrowed, and liquidity figures"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-emerald-radial" aria-hidden="true" />
      <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-3.5">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#10B981]/60" />
          <span className="ml-2 text-xs font-medium text-muted">Singularis · Preview</span>
        </div>
        <span className="demo-chip">
          <Eye size={12} aria-hidden="true" /> Illustrative Demo
        </span>
      </div>

      <div className="space-y-4 p-5">
        <div className="rounded-xl border border-[#10B981]/20 bg-[#10B981]/[0.06] p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted">Portfolio value · demo</p>
              <p className="num mt-1 text-3xl font-bold text-white">{DEMO_PORTFOLIO_VALUE}</p>
              <p className="mt-1 text-xs text-muted">Illustrative demo data — not real funds</p>
            </div>
            <span className="badge-emerald">Demo</span>
          </div>
          <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-white/[0.06]" aria-hidden="true">
            {DEMO_ALLOCATION.map((a) => (
              <span key={a.label} style={{ width: `${a.pct}%`, background: a.color }} />
            ))}
          </div>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted">
            {DEMO_ALLOCATION.map((a) => (
              <span key={a.label} className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: a.color }} />
                {a.label} {a.pct}% demo
              </span>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="label !mb-2">Supplied · demo</p>
            <div className="space-y-2">
              {DEMO_SUPPLIED.map((a) => (
                <AssetRow key={a.symbol} glyph={a.glyph} symbol={a.symbol} balance={a.balance} value={a.value} />
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <p className="label !mb-2">Borrowed · demo</p>
              <div className="space-y-2">
                {DEMO_BORROWED.map((a) => (
                  <AssetRow key={a.symbol} glyph={a.glyph} symbol={a.symbol} balance={a.balance} value={a.value} />
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
              <p className="text-xs uppercase tracking-wider text-muted">Available liquidity · demo</p>
              <p className="num mt-1 text-lg font-bold text-white">{DEMO_LIQUIDITY}</p>
              <p className="text-[11px] text-muted">Illustrative figure for layout only</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-white/[0.06] px-3 py-2.5 text-xs text-muted">
          <span>All balances are static demo placeholders.</span>
          <span className="inline-flex items-center gap-1 font-semibold text-accent-bright">
            View preview <ArrowUpRight size={14} aria-hidden="true" />
          </span>
        </div>
      </div>
    </div>
  );
}
