import { Info, Search, Wallet, WalletCards } from "lucide-react";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

const STEPS = [
  {
    icon: Wallet,
    step: "Step 1",
    title: "Connect a supported wallet",
    body: "In a future release, you would connect a supported wallet to view positions per network. Wallet connection is not implemented in this preview.",
  },
  {
    icon: WalletCards,
    step: "Step 2",
    title: "Supply eligible assets",
    body: "Eligible assets could be supplied to planned lending markets. No deposits, approvals, or transfers are available in this phase.",
  },
  {
    icon: Search,
    step: "Step 3",
    title: "Manage borrowing or explore approved strategies",
    body: "Borrowing health and approved strategy concepts would be managed from one dashboard. All actions here are visual placeholders only.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 border-y border-white/[0.06] bg-white/[0.01]">
      <div className="section-pad mx-auto w-full max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="How it works"
          title="A clear path, when the protocol matures"
          description="A three-step flow showing the intended experience. Nothing on this page connects a wallet or submits a transaction."
        />

        <div className="relative mt-10 grid gap-4 md:grid-cols-3">
          <div className="pointer-events-none absolute left-[16%] right-[16%] top-10 hidden h-px bg-gradient-to-r from-transparent via-[#10B981]/40 to-transparent md:block" aria-hidden="true" />
          {STEPS.map((s, i) => (
            <Reveal key={s.title} delay={i * 100}>
              <article className="card relative h-full p-6">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#10B981]/12 text-accent-bright ring-1 ring-[#10B981]/25">
                  <s.icon size={20} aria-hidden="true" />
                </span>
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-accent-bright">
                  {s.step}
                </p>
                <h3 className="mt-1.5 text-lg font-semibold text-white">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={150}>
          <div className="mt-8 flex items-start gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] p-4 text-sm leading-relaxed text-white/85">
            <Info size={18} className="mt-0.5 shrink-0 text-amber-300" aria-hidden="true" />
            <p>
              <span className="font-semibold text-white">Preview notice: </span>
              wallet connection and on-chain transactions are intentionally not implemented in this
              phase. Buttons that resemble app actions scroll to the static dashboard preview
              below.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
