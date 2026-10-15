export default function TermsPage() {
  return (
    <div className="space-y-6 pt-6">
      <h1 className="text-3xl font-bold text-paper">Terms &amp; risk disclosure (draft)</h1>
      <p className="badge">Draft for review — not final legal advice</p>
      <section className="card p-6 text-sm text-muted">
        <h2 className="font-semibold text-paper">1. Non-custodial use</h2>
        <p className="mt-1">You control your wallet. SINGULARIS cannot move funds without your signature. Never share private keys or seed phrases.</p>
        <h2 className="mt-4 font-semibold text-paper">2. Testnet only</h2>
        <p className="mt-1">Contracts are unaudited development drafts. Do not deposit mainnet assets. Mock strategies carry no real yield.</p>
        <h2 className="mt-4 font-semibold text-paper">3. No guaranteed returns</h2>
        <p className="mt-1">No APY is promised. Staking, governance, and fee-sharing are proposals, not live features.</p>
        <h2 className="mt-4 font-semibold text-paper">4. Withdrawal limits</h2>
        <p className="mt-1">Withdrawals settle from available liquidity per contract rules; strategy-allocated funds may be temporarily unavailable.</p>
        <h2 className="mt-4 font-semibold text-paper">5. Fees</h2>
        <p className="mt-1">Per-vault fees are disclosed in the UI and contracts. Verify fee parameters on-chain before depositing.</p>
      </section>
    </div>
  );
}
