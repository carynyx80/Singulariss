import { Database, FileWarning, KeyRound, Scale } from "lucide-react";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

const ITEMS = [
  {
    icon: KeyRound,
    title: "Conservative limits",
    body: "Both vaults cap deposits at 10,000 assets with zero strategy allocation — everything stays idle and withdrawable.",
  },
  {
    icon: Database,
    title: "Borrowing risk",
    body: "Venus borrowing is overcollateralized with live health checks — borrow beyond your limit and liquidators can seize collateral.",
  },
  {
    icon: Scale,
    title: "Yield strategies",
    body: "Approved yield strategies require defined exposure caps, exit assumptions, and ongoing monitoring before activation.",
  },
  {
    icon: FileWarning,
    title: "No audit yet",
    body: "Singularis vault contracts handle real funds without an independent audit. Caps stay low until one exists.",
  },
];

export function SecurityRisk() {
  return (
    <section id="risk" className="section-pad scroll-mt-20" aria-labelledby="risk-heading">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Security and risk"
          title="Risk-first, stated plainly"
          description="What protects funds today — and what each future step requires."
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
            Vault contracts have not been independently audited. Start small and verify every
            address on the explorer.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
