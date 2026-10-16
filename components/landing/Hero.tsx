import Link from "next/link";
import { ArrowRight, LayoutDashboard } from "lucide-react";
import { LivePortfolioCard } from "./LivePortfolioCard";
import { Reveal } from "./Reveal";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-12 sm:pt-16 lg:pt-20" aria-labelledby="hero-heading">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute left-1/2 top-[-220px] h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-[#10B981]/[0.10] blur-[120px]" />
        <div className="absolute right-[-160px] top-[30%] h-[320px] w-[320px] rounded-full bg-[#10B981]/[0.07] blur-[100px]" />
      </div>

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
        <Reveal>
          <p className="badge-emerald">Building across two ecosystems</p>
          <h1
            id="hero-heading"
            className="mt-5 text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            Put Your Capital
            <span className="block bg-gradient-to-r from-[#34D399] to-[#10B981] bg-clip-text text-transparent">
              to Work.
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
            A unified capital layer for lending, borrowing, and yield strategies across Robinhood
            Chain and BNB Chain.
          </p>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted/90">
            Balances shown are read live from the chain once you connect. Lending markets and
            strategies are not live services yet.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href="#markets" className="btn-primary">
              Explore the Protocol <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link href="#preview" className="btn-ghost">
              <LayoutDashboard size={17} aria-hidden="true" /> View Dashboard
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap gap-2 text-xs">
            <span className="badge">Robinhood Chain · Planned</span>
            <span className="badge">BNB Chain · Planned</span>
            <span className="badge">Wallet connects to both mainnets</span>
          </div>
        </Reveal>

        <Reveal delay={140} className="relative">
          <div
            className="pointer-events-none absolute -inset-4 rounded-[28px] bg-gradient-to-b from-[#10B981]/15 via-transparent to-transparent blur-2xl"
            aria-hidden="true"
          />
          <div className="relative animate-float">
            <LivePortfolioCard />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
