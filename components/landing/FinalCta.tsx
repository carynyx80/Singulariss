import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "./Reveal";

export function FinalCta() {
  return (
    <section id="about" className="scroll-mt-20 pb-20 sm:pb-24" aria-labelledby="about-heading">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-[#10B981]/25 bg-gradient-to-b from-[#10B981]/[0.12] via-[#0C1210] to-[#0C1210] px-6 py-14 text-center sm:px-12 sm:py-16">
            <div
              className="pointer-events-none absolute left-1/2 top-[-180px] h-[360px] w-[640px] -translate-x-1/2 rounded-full bg-[#10B981]/20 blur-[110px]"
              aria-hidden="true"
            />
            <div className="relative">
              <p className="badge-emerald mx-auto">Long-term vision</p>
              <h2
                id="about-heading"
                className="mx-auto mt-5 max-w-2xl text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-[2.75rem]"
              >
                Build a Better Relationship With Your Capital.
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted">
                Singularis envisions a unified multichain capital layer — where lending, borrowing,
                and curated strategies meet transparent risk and calm, readable tooling. This
                preview is the first step in sharing that direction.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="#preview" className="btn-primary">
                  Explore the Preview <ArrowRight size={17} aria-hidden="true" />
                </Link>
                <Link href="/preview" className="btn-ghost">
                  Open demo dashboard
                </Link>
              </div>
              <p className="mt-5 text-xs text-muted">
                Concept preview only · Illustrative demo data · No live transactions
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
