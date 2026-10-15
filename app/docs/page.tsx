import { STRATEGY_REGISTRY } from "@/lib/strategy-registry";

export default function DocsPage() {
  return (
    <div className="space-y-6 pt-6">
      <h1 className="text-3xl font-bold text-paper">Documentation</h1>

      <section className="card p-6">
        <h2 className="font-semibold">Architecture</h2>
        <p className="mt-2 text-sm text-muted">
          Next.js 14 App Router + wagmi/viem/RainbowKit frontend; Solidity vaults (ERC-4626 style)
          with separated strategy adapters; per-chain config in <span className="num">lib/chains.ts</span>.
          No bridge or cross-chain messaging in v1 — each chain is an independent deployment with
          its own addresses, assets, strategies, and history.
        </p>
      </section>

      <section className="card p-6">
        <h2 className="font-semibold">Vault mechanics</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">
          <li><span className="num">deposit(assets) → shares</span>, <span className="num">withdraw/redeem → assets</span>, ERC-4626 conversions with rounding guards.</li>
          <li>Deposit caps (<span className="num">maxDeposit</span>), pause guardian, allocation cap to strategy.</li>
          <li>Performance fee (proposed 5%) on realized profit above high-water mark; no management fee by default.</li>
          <li>Events: Deposit, Withdraw, FeeAccrued, StrategyAllocated, StrategyReported, Paused.</li>
          <li>Withdrawals limited by <span className="num">availableLiquidity</span> — allocated strategy funds are not counted as liquid.</li>
        </ul>
      </section>

      <section className="card p-6">
        <h2 className="font-semibold">Networks</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">
          <li>Robinhood Chain mainnet 4663 — RPC https://rpc.mainnet.chain.robinhood.com — explorer robinhoodchain.blockscout.com — gas ETH.</li>
          <li>Robinhood Chain testnet 46630 — RPC https://rpc.testnet.chain.robinhood.com — explorer explorer.testnet.chain.robinhood.com — gas ETH.</li>
          <li>BNB Smart Chain mainnet 56 — RPC https://bsc-dataseed.bnbchain.org — explorer bscscan.com — gas BNB (deployment disabled).</li>
          <li>BNB Smart Chain testnet 97 — RPC https://data-seed-prebsc-1-s1.bnbchain.org:8545 — explorer testnet.bscscan.com — gas tBNB.</li>
        </ul>
      </section>

      <section className="card p-6">
        <h2 className="font-semibold">Strategy status</h2>
        <div className="mt-3 space-y-2">
          {STRATEGY_REGISTRY.map((s) => (
            <div key={s.id} className="rounded-xl border border-ink-700 p-3 text-sm">
              <p className="font-medium">{s.name} <span className="text-muted">· {s.chain} · {s.status}</span></p>
              <p className="text-xs text-muted">{s.notes}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card p-6">
        <h2 className="font-semibold">Fee model (proposal under evaluation)</h2>
        <p className="mt-2 text-sm text-muted">
          5% performance fee on realized profit is a starting proposal, not a final universal fee.
          Charged only when vault accounting confirms profit; disclosed per-vault; collected to a
          disclosed treasury address. No hidden fees, no double-charging, no fees on unrealized gains.
          Protocol revenue ≠ token-holder revenue.
        </p>
      </section>

      <section className="card p-6">
        <h2 className="font-semibold">Risks</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">
          <li>Unaudited contracts — use testnets only.</li>
          <li>Strategy, oracle, liquidity, and admin-key risks per integration.</li>
          <li>Swarm orchestration (future) must never execute unapproved transactions or bypass consent.</li>
        </ul>
      </section>
    </div>
  );
}
