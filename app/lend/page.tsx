"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CHAINS } from "@/lib/chains";
import { useVaultReads } from "@/lib/useVault";
import { vaultCatalogue, type VaultMeta } from "@/lib/vaults";
import { formatUnits } from "@/lib/utils";

function LendCard({ vault }: { vault: VaultMeta }) {
  const reads = useVaultReads(vault.address, vault.assetDecimals);
  const live = !!vault.address && vault.status === "Live";
  const price =
    reads.totalAssets !== null && reads.totalSupply !== null && reads.totalSupply > 0n
      ? Number(reads.totalAssets) / Number(reads.totalSupply)
      : 1;

  return (
    <article className="interactive-card flex h-full flex-col p-6">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-semibold text-white">{vault.name}</h2>
        <span className="badge">{vault.status}</span>
      </div>
      <p className="num mt-1 text-xs text-muted">
        {vault.symbol} · {vault.assetSymbol} · {CHAINS[vault.chain].label} · fee{" "}
        {(vault.performanceFeeBps / 100).toFixed(1)}%
      </p>
      <div className="num mt-4 grid grid-cols-3 gap-2 text-sm">
        <div className="rounded-lg border border-white/[0.06] px-2.5 py-2">
          <p className="text-[11px] uppercase tracking-wider text-muted">Deposits</p>
          <p className="font-bold text-white">
            {reads.totalAssets === null ? "…" : formatUnits(reads.totalAssets, vault.assetDecimals)}
          </p>
        </div>
        <div className="rounded-lg border border-white/[0.06] px-2.5 py-2">
          <p className="text-[11px] uppercase tracking-wider text-muted">Share price</p>
          <p className="font-bold text-white">{price.toFixed(4)}</p>
        </div>
        <div className="rounded-lg border border-white/[0.06] px-2.5 py-2">
          <p className="text-[11px] uppercase tracking-wider text-muted">Cap</p>
          <p className="font-bold text-white">{vault.capAssets}</p>
        </div>
      </div>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{vault.description}</p>
      {live ? (
        <Link href={`/vaults/${vault.id}`} className="btn-primary mt-4 inline-flex items-center gap-2 text-sm">
          Supply / Withdraw <ArrowUpRight size={15} aria-hidden="true" />
        </Link>
      ) : (
        <p className="mt-4 text-sm text-muted">Not deployed yet — deposits unavailable.</p>
      )}
    </article>
  );
}

export default function LendPage() {
  const vaults = vaultCatalogue().filter((v) => v.chain === "robinhood-mainnet" || v.chain === "bsc-mainnet");
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-10 sm:px-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-bright">Lending</p>
        <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">Supply assets, earn later</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Live ERC-4626 vaults with conservative caps. Deposits sit idle and fully withdrawable
          until a reviewed yield strategy is enabled — no yield is implied today.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {vaults.map((v) => (
          <LendCard key={v.id} vault={v} />
        ))}
      </div>
    </div>
  );
}
