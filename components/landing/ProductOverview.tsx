import { ArrowUpRight, HandCoins, Landmark, LineChart, Vault } from "lucide-react";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

const CARDS = [
  {
    icon: HandCoins,
    title: "Lend",
    body: "Supply supported assets to lending markets and follow planned supply positions from one unified view.",
    points: ["Planned supply markets", "Illustrative rates for layout", "Risk-aware presentation"],
  },
  {
    icon: Landmark,
    title: "Borrow",
    body: "Access borrowing against eligible collateral with transparent limits and health indicators.",
    points: ["Planned collateralized borrowing", "Illustrative limits only", "Clear exposure controls"],
  },
  {
    icon: LineChart,
    title: "Strategies",
    body: "Discover approved yield strategies with transparent risks, constraints, and exit expectations.",
    points: ["Curated strategy concepts", "Explicit risk labels", "No live yield implied"],
  },
  {
    icon: Vault,
    title: "Collateral",
    body: "Manage eligible assets and collateral exposure with a calm, readable overview of planned positions.",
    points: ["Eligibility previews", "Demo loan-to-value", "Conservative defaults"],
  },
];

export function ProductOverview() {
  return (
    <section id="markets" className="section-pad scroll-mt-20" aria-labelledby="markets-heading">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="Product overview"
            title="One capital layer for four planned capabilities"
            description="These are planned product capabilities, not live services. Every screen on this page is a static concept preview."
          />
          <Reveal delay={100}>
            <span className="demo-chip">Planned capabilities · Not live</span>
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
                  Planned <ArrowUpRight size={14} aria-hidden="true" />
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
