import { Database, FileWarning, KeyRound, Scale } from "lucide-react";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

const ITEMS = [
  {
    icon: KeyRound,
    title: "Assets & collateral parameters",
    body: "Supported assets, loan-to-value limits, and liquidation thresholds will require explicit, conservative risk parameters before any launch.",
  },
  {
    icon: Database,
    title: "Oracles & liquidations",
    body: "Oracle integrations and liquidation mechanisms will need redundant price sources, fallback procedures, and clearly disclosed failure modes.",
  },
  {
    icon: Scale,
    title: "Yield strategies",
    body: "Approved yield strategies will require defined exposure caps, exit assumptions, and ongoing monitoring — concepts only in this preview.",
  },
  {
    icon: FileWarning,
    title: "Security reviews",
    body: "Appropriate security reviews will be required before handling real funds. This concept has not been audited and claims no audit.",
  },
];

export function SecurityRisk() {
  return (
    <section id="risk" className="section-pad scroll-mt-20" aria-labelledby="risk-heading">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Security and risk"
          title="Risk-first by design, audit before anything real"
          description="A concise view of what must be in place before Singularis could safely progress beyond a concept preview."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map((c, i) => (
            <Reveal key={c.title} delay={i * 80}>
              <article className="card h-full p-6">
                <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-accent-bright">
                  <c.icon size={19} aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-semibold text-white">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{c.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
        <Reveal delay={120}>
          <p className="mt-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 text-center text-sm text-muted">
            This project has not been audited. Do not treat any preview screen as a safety claim or
            an invitation to deposit funds.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
