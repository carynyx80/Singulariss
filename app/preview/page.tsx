import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DashboardPreview } from "@/components/landing/DashboardPreview";

export const metadata = {
  title: "Live Wallet — Singularis",
  description:
    "Connect your wallet to see live ETH and USDG balances on Robinhood Chain, or BNB and USDC on BNB Chain, and send real transfers.",
};

export default function PreviewPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-white"
      >
        <ArrowLeft size={16} aria-hidden="true" /> Back to overview
      </Link>
      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-bright">
          Application
        </p>
        <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">Your wallet, live</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Connect on Robinhood Chain for ETH and USDG, or BNB Chain for BNB and USDC. Balances
          are read from the chain and transfers are real mainnet transactions. Lending,
          borrowing, and strategies are not deployed yet.
        </p>
      </div>
      <div className="mt-8">
        <DashboardPreview compact />
      </div>
      <p className="mt-6 text-center text-xs text-muted">
        Balances shown are live on-chain data. No lending markets are deployed.
      </p>
    </div>
  );
}
