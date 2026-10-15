import { notFound } from "next/navigation";
import { vaultCatalogue } from "@/lib/vaults";
import { integrationsFor } from "@/lib/strategy-registry";
import { CHAINS, explorerAddressUrl } from "@/lib/chains";
import { VaultActions } from "@/components/VaultActions";

export default function VaultDetail({ params }: { params: { id: string } }) {
  const vault = vaultCatalogue().find((v) => v.id === params.id);
  if (!vault) return notFound();
  const chain = CHAINS[vault.chain];
  const strat = integrationsFor(vault.chain).find((s) => s.id === vault.strategyId);

  return (
    <div className="space-y-6 pt-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-muted">{vault.chain} · chain {chain.id}</p>
        <h1 className="mt-1 text-3xl font-bold text-paper">{vault.name}</h1>
        <p className="num mt-1 text-sm text-muted">
          {vault.symbol} · asset {vault.assetSymbol} · cap {vault.capAssets} · risk {vault.riskTier}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <span className="badge">Status: {vault.status}</span>
        <span className="badge">Performance fee: {(vault.performanceFeeBps / 100).toFixed(1)}% (proposal)</span>
        <span className="badge">Management fee: {vault.managementFeeBps === 0 ? "none" : `${vault.managementFeeBps / 100}%`}</span>
        {vault.address ? (
          <a className="badge underline" target="_blank" rel="noreferrer" href={explorerAddressUrl(vault.chain, vault.address)}>
            {vault.address.slice(0, 10)}… explorer
          </a>
        ) : (
          <span className="badge">No deployed address — test mode / awaiting deployment</span>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <VaultActions vault={vault} />
        <div className="space-y-4">
          <div className="card p-6">
            <h2 className="font-semibold">Strategy</h2>
            <p className="mt-2 text-sm">{strat?.name ?? vault.strategyId}</p>
            <p className="mt-1 text-sm text-muted">{strat?.notes}</p>
            <p className="mt-2 text-xs text-muted">
              Status: {strat?.status} · Audit: {strat?.audit}
            </p>
            {strat?.risks?.length ? (
              <ul className="mt-2 list-disc pl-5 text-xs text-muted">
                {strat.risks.map((r) => <li key={r}>{r}</li>)}
              </ul>
            ) : null}
          </div>
          <div className="card p-6">
            <h2 className="font-semibold">Risk disclosure</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">
              <li>Smart-contract risk: vault + strategy code is unaudited. Loss of funds is possible.</li>
              <li>Liquidity risk: withdrawals settle from available liquidity, not from allocated strategy funds.</li>
              <li>Fee risk: performance fees apply only to realized profit per vault accounting; verify on-chain.</li>
              <li>Pause risk: guardian can pause deposits/withdrawals; pause never grants fund seizure.</li>
            </ul>
          </div>
          <div className="card p-6">
            <h2 className="font-semibold">How accounting works</h2>
            <p className="mt-2 text-sm text-muted">
              ERC-4626: <span className="num">shares = assets × totalSupply / totalAssets</span> (round down
              on deposit, round up on withdraw). First depositor is protected by a virtual offset that
              makes donation-based share inflation unprofitable. Fees accrue as shares to the fee
              recipient only when <span className="num">totalAssets</span> grows above the high-water mark.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
