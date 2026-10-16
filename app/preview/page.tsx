import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DashboardPreview } from "@/components/landing/DashboardPreview";

export const metadata = {
  title: "Demo Dashboard Preview — Singularis",
  description:
    "Static preview of the intended Singularis dashboard. Illustrative demo data only, no live transactions or wallet connection.",
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
          Placeholder application route
        </p>
        <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">Demo dashboard preview</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          This is a clearly marked demo route linked from “Launch App”. It shows static
          illustrative placeholders with no wallet connection, deposits, borrowing, or
          transactions.
        </p>
      </div>
      <div className="mt-8">
        <DashboardPreview compact />
      </div>
      <p className="mt-6 text-center text-xs text-muted">
        All figures are illustrative demo data — not real protocol TVL, funds, yield, or market
        data.
      </p>
    </div>
  );
}
