import { Coins, SlidersHorizontal, BadgePercent } from "lucide-react";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

const POINTS = [
  {
    icon: SlidersHorizontal,
    title: "Access to advanced tools",
    body: "Future utility may include access to advanced portfolio and strategy tooling, subject to final product design.",
  },
  {
    icon: BadgePercent,
    title: "Protocol-fee benefits",
    body: "Future utility may include protocol-fee benefits for participants, subject to final design and implementation.",
  },
  {
    icon: Coins,
    title: "Staking concept",
    body: "$TITAN is a planned utility and staking concept only. No staking functionality exists.",
  },
];

export function TitanSection() {
  return (
    <section id="titan" className="scroll-mt-20 border-t border-white/[0.06] bg-white/[0.01]">
      <div className="section-pad mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="grid items-start gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <SectionHeading
              eyebrow="$TITAN"
              title="A planned protocol utility concept"
              description="Introducing $TITAN as a long-term utility and staking concept for the Singularis ecosystem — planned, not launched."
            />
            <Reveal delay={100}>
              <div className="mt-6 rounded-2xl border border-[#10B981]/25 bg-[#10B981]/[0.06] p-5">
                <p className="text-4xl font-bold tracking-tight text-white">
                  $TITAN <span className="status-chip ml-2 align-middle">Planned — no token exists</span>
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  No tokenomics, supply, price, APR, contract address, or staking functionality is
                  presented here. Any future utility remains subject to final design, security
                  review, and implementation decisions.
                </p>
              </div>
            </Reveal>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {POINTS.map((p, i) => (
              <Reveal key={p.title} delay={i * 90}>
                <article className="interactive-card h-full p-6">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#10B981]/12 text-accent-bright ring-1 ring-[#10B981]/25">
                    <p.icon size={19} aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 font-semibold text-white">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{p.body}</p>
                </article>
              </Reveal>
            ))}
            <Reveal delay={270}>
              <div className="flex h-full flex-col justify-center rounded-2xl border border-dashed border-white/15 p-6 text-sm leading-relaxed text-muted">
                <p className="font-semibold text-white">What is not claimed</p>
                <p className="mt-2">
                  No allocations, emissions, valuations, or launch timelines are stated for $TITAN.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
