"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, ShieldCheck, Vault, Network, Lock, ChevronDown } from "lucide-react";
import { ACTIVE_CHAIN } from "@/lib/chains";
import { AnimatedCounter } from "@/components/AnimatedCounter";

const STEPS = [
  {
    icon: Vault,
    title: "1 · Deposit into a vault",
    body: "Approve the underlying asset, deposit, receive vault shares. Share price comes from on-chain totalAssets / totalSupply — never a fixture.",
  },
  {
    icon: ShieldCheck,
    title: "2 · Strategy allocates under limits",
    body: "The vault holds liquid assets plus a capped allocation to one approved strategy adapter. Pauses and caps are enforced on-chain.",
  },
  {
    icon: Network,
    title: "3 · Withdraw per actual liquidity",
    body: "Withdrawals settle from available liquidity. If strategy funds are locked, the UI says so — instant withdrawals are never promised.",
  },
];

const STATS = [
  { value: 2, suffix: "", label: "Chains configured" },
  { value: 5, suffix: "%", label: "Proposed performance fee", decimals: 1 },
  { value: 100, suffix: "%", label: "On-chain verified data" },
  { value: 0, suffix: "", label: "Fabricated metrics shown" },
];

const FAQS = [
  {
    q: "Is SINGULARIS audited?",
    a: "No. Contracts are unaudited testnet drafts. Never deposit mainnet funds until an independent audit is completed and its scope is published.",
  },
  {
    q: "Where does the yield come from?",
    a: "V1 ships with a dev-only mock strategy (zero real yield). Real adapters like Morpho/Uniswap are under review with no verified addresses yet.",
  },
  {
    q: "Can I withdraw anytime?",
    a: "Withdrawals settle from available on-chain liquidity per contract rules. Strategy-allocated funds are not counted as liquid and may be temporarily unavailable.",
  },
  {
    q: "What is $SING?",
    a: "A proposed native token for future governance, fee benefits, and staking. The design is a proposal only — no token exists and vaults never require it.",
  },
];

function Faq({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div onClick={() => setOpen(!open)} className="interactive-card cursor-pointer p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold text-paper">{q}</p>
        <ChevronDown
          size={18}
          className={`shrink-0 text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </div>
      <div
        className="grid transition-all duration-200"
        style={{ gridTemplateRows: open ? "1fr" : "0fr", opacity: open ? 1 : 0 }}
      >
        <p className="overflow-hidden pt-1 text-sm text-muted">{a}</p>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="space-y-10 pt-6">
      {/* HERO */}
      <section className="card p-8 sm:p-12">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted">
          Non-custodial yield protocol
        </p>
        <h1 className="mt-3 max-w-2xl text-4xl font-bold leading-tight text-paper sm:text-5xl">
          Capital in motion.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted">
          SINGULARIS routes deposits into transparent ERC-4626 vaults with explicit fees,
          verifiable accounting, and per-chain deployments. Robinhood Chain first, BNB Smart
          Chain second. No invented APY. No fake TVL. Only what the contracts report.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/vaults" className="btn-primary inline-flex items-center gap-2">
            Explore vaults <ArrowRight size={16} />
          </Link>
          <Link href="/docs" className="btn-ghost inline-flex items-center gap-2">
            How vaults work
          </Link>
        </div>
        <div className="mt-6 flex flex-wrap gap-2 text-xs">
          <span className="badge">Network: {ACTIVE_CHAIN.label} ({ACTIVE_CHAIN.id})</span>
          <span className="badge">Contracts: unaudited testnet drafts</span>
          <span className="badge">No bridge in v1 — separate deployments</span>
        </div>
      </section>

      {/* STATS */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="card p-6 text-center">
            <p className="num text-4xl font-bold text-paper">
              <AnimatedCounter value={s.value} suffix={s.suffix} decimals={s.decimals ?? 0} />
            </p>
            <p className="mt-2 text-sm text-muted">{s.label}</p>
          </div>
        ))}
      </section>

      {/* HOW IT WORKS */}
      <section>
        <h2 className="text-2xl font-bold text-paper">How it works</h2>
        <p className="mt-1 text-muted">Three steps. Everything verifiable on-chain.</p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.title} className="interactive-card p-6">
              <s.icon className="text-accent" size={22} />
              <h3 className="mt-3 font-semibold text-paper">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* LIVE VS PLANNED */}
      <section className="grid gap-4 md:grid-cols-2">
        <div className="card p-6 sm:p-8">
          <h2 className="text-lg font-bold text-paper">What is live today</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted">
            <li>ERC-4626 core vault + dev-only mock strategy (testnet, unaudited).</li>
            <li>Deposit / withdraw flow with approval checks, previews, and explorer links.</li>
            <li>Per-chain configuration for Robinhood Chain and BNB Smart Chain.</li>
          </ul>
          <Link href="/app" className="btn-primary mt-6 inline-block text-sm">
            Launch app
          </Link>
        </div>
        <div className="card p-6 sm:p-8">
          <h2 className="flex items-center gap-2 text-lg font-bold text-paper">
            <Lock size={18} className="text-muted" /> Explicitly not live
          </h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted">
            <li>$SING token, staking rewards, governance, fee-sharing — proposal only.</li>
            <li>Verified real-yield integrations (adapters under review, no addresses).</li>
            <li>Swarm orchestration, strategy marketplace — future stages.</li>
          </ul>
          <Link href="/docs" className="btn-ghost mt-6 inline-block text-sm">
            Read the docs
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section>
        <h2 className="text-2xl font-bold text-paper">Frequently asked questions</h2>
        <div className="mx-auto mt-5 max-w-3xl space-y-3">
          {FAQS.map((f) => (
            <Faq key={f.q} q={f.q} a={f.a} />
          ))}
        </div>
      </section>
    </div>
  );
}
