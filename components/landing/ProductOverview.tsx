import { ArrowUpRight, HandCoins, Landmark, LineChart, Vault } from "lucide-react";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

const CARDS = [
  {
    icon: HandCoins,
    title: "Lend",
    body: "Supply supported assets to lending markets once protocol contracts are deployed and reviewed.",
    points: ["Not deployed yet", "Contracts required", "Risk-aware presentation"],
    live: false,
  },
  {
    icon: Landmark,
    title: "Borrow",
    body: "Borrow USDC or BNB against your collateral on BNB Chain through the audited Venus Core Pool, from the Borrow tab.",
    points: ["Live on BNB Chain", "Overcollateralized", "Liquidation risk applies"],
    live: true,
  },
  {
    icon: LineChart,
    title: "Strategies",
    body: "Approved yield strategies with transparent risks will appear here after review and deployment.",
    points: ["Not deployed yet", "Explicit risk labels", "No yield implied today"],
    live: false,
  },
  {
    icon: Vault,
    title: "Wallet",
    body: "Your live ETH + USDG on Robinhood Chain and BNB + USDC on BNB Chain, with real transfers today.",
    points: ["Live balances", "Real send & receive", "Both mainnets"],
    live: true,
  },
];

export function ProductOverview() {
  return (
    <section id="markets" className="section-pad scroll-mt-20" aria-labelledby="markets-heading">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="Product overview"
            title="Live wallet today, lending when ready"
            description="Wallet balances and transfers work now on both mainnets. Lending, borrowing, and strategies unlock only after contracts are deployed and reviewed."
          />
          <Reveal delay={100}>
            <span className="status-chip">Wallet, vaults & borrowing live</span>
          </Reveal>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CARDS.map((c, i) => (
            <Reveal key={c.title} delay={i * 80}>
              <article className="interactive-card group flex h-full flex-col p-6">
                <span className="grid h-11 w-11 place-items-center rounded-xl border border-[#10B981]/25 bg-[#10B981]/10 text-accent-bright transition-colors group-hover:bg-[#10B981]/15">
                  <c.icon size={20} aria-hidden="true" />
                </span>
                <h3 id={i === 0 ? "markets-heading" : undefined} className="mt-4 text-lg font-semibold text-white">
                  {c.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{c.body}</p>
                <ul className="mt-4 space-y-1.5 border-t border-white/[0.07] pt-4 text-[13px] text-muted">
                  {c.points.map((p) => (
                    <li key={p} className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-[#10B981]" aria-hidden="true" />
                      {p}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 inline-flex items-center gap-1 text-[13px] font-semibold text-accent-bright">
                  {c.live ? "Live now" : "Not deployed yet"} <ArrowUpRight size={14} aria-hidden="true" />
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
