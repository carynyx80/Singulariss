import { ArrowUpRight, Boxes, Layers } from "lucide-react";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

const NETWORKS = [
  {
    icon: Layers,
    name: "Robinhood Chain",
    tagline: "Planned integration",
    body: "Designed as a primary home for Singularis lending markets and strategy discovery, with a focus on accessible, mobile-first capital tools.",
    bullets: ["Planned lending markets", "Planned collateral support", "Deployment subject to readiness reviews"],
    accent: "from-[#10B981]/20 via-transparent to-transparent",
  },
  {
    icon: Boxes,
    name: "BNB Chain",
    tagline: "Planned integration",
    body: "Designed as a complementary ecosystem for deep liquidity and broad asset coverage, unified under one preview dashboard.",
    bullets: ["Planned market coverage", "Planned strategy curation", "Launch subject to risk controls"],
    accent: "from-[#EAB308]/[0.12] via-transparent to-transparent",
  },
];

export function Ecosystem() {
  return (
    <section id="ecosystem" className="section-pad scroll-mt-20" aria-labelledby="ecosystem-heading">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Multichain ecosystem"
          title="Building across two ecosystems"
          description="Both networks are represented as planned integrations, not live deployments. No chain upgrades, contracts, or partnerships are implied."
        />

        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          {NETWORKS.map((n, i) => (
            <Reveal key={n.name} delay={i * 100}>
              <article className="interactive-card relative h-full overflow-hidden p-7 sm:p-8">
                <div className={`pointer-events-none absolute inset-0 bg-gradient-to-b ${n.accent}`} aria-hidden="true" />
                <div className="relative">
                  <div className="flex items-start justify-between gap-4">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-accent-bright">
                      <n.icon size={22} aria-hidden="true" />
                    </span>
                    <span className="badge-emerald">{n.tagline}</span>
                  </div>
                  <h3 className="mt-5 text-2xl font-bold text-white">{n.name}</h3>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">{n.body}</p>
                  <ul className="mt-5 space-y-2 text-sm text-white/80">
                    {n.bullets.map((b) => (
                      <li key={b} className="flex items-center gap-2.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" aria-hidden="true" />
                        {b}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 flex items-center justify-between border-t border-white/[0.07] pt-4 text-xs text-muted">
                    <span>Not yet connected · No live deployment</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-white/70">
                      Planned <ArrowUpRight size={14} aria-hidden="true" />
                    </span>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={120}>
          <p className="mx-auto mt-6 max-w-3xl text-center text-xs leading-relaxed text-muted">
            Wallet connection already works on both networks below. No protocol deployment
            addresses, partnerships, or completed lending deployments are implied.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
