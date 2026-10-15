"use client";

import Link from "next/link";
import { ArrowUpRight, FlaskConical } from "lucide-react";
import { vaultCatalogue } from "@/lib/vaults";
import { integrationsFor } from "@/lib/strategy-registry";

export default function VaultExplorer() {
  const vaults = vaultCatalogue();
  return (
    <div className="space-y-6 pt-6">
      <div>
        <h1 className="text-3xl font-bold text-paper">Vault explorer</h1>
        <p className="mt-1 text-sm text-muted">
          Every figure below comes from configuration or on-chain reads. Vaults without a
          deployed address cannot accept deposits.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {vaults.map((v) => {
          const strat = integrationsFor(v.chain).find((s) => s.id === v.strategyId);
          const live = !!v.address;
          return (
            <div key={v.id} className="interactive-card p-6">
              <div className="flex items-center justify-between gap-2">
                <h2 className="flex items-center gap-2 font-semibold text-paper">
                  {v.name}
                  {!live && <FlaskConical size={15} className="text-muted" />}
                </h2>
                <span className="badge">{v.status}</span>
              </div>
              <p className="num mt-1 text-xs text-muted">
                {v.symbol} · {v.assetSymbol} · {v.chain} · fee {(v.performanceFeeBps / 100).toFixed(1)}%
              </p>
              <p className="mt-3 text-sm text-muted">{v.description}</p>
              <p className="mt-3 rounded-xl border border-ink-700 bg-ink-900 p-3 text-xs text-muted">
                Strategy: <span className="font-semibold text-paper">{strat?.name ?? v.strategyId}</span>{" "}
                ({strat?.status ?? "unknown"})
              </p>
              <Link
                href={`/vaults/${v.id}`}
                className="btn-primary mt-4 inline-flex items-center gap-2 text-sm"
              >
                Inspect vault <ArrowUpRight size={15} />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
