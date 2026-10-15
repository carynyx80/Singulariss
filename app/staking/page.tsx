export default function StakingPage() {
  return (
    <div className="space-y-6 pt-6">
      <h1 className="text-3xl font-bold text-paper">Staking</h1>
      <div className="card p-6">
        <p className="badge">Not live — interface preview only</p>
        <p className="mt-3 text-sm text-muted">
          $SING staking is a documented proposal, not an operational feature. Token design
          (supply, allocation, vesting, governance, staking mechanics, treasury controls) must be
          reviewed before any contract is written. No APY is promised; emissions will never be the
          sole reward source; vault withdrawals will never require $SING.
        </p>
        <div className="mt-4 grid gap-3 opacity-50">
          <button disabled className="btn-primary">Stake $SING (disabled)</button>
          <button disabled className="btn-ghost">Unstake (disabled)</button>
        </div>
        <p className="mt-3 text-xs text-muted">Transaction controls stay disabled until a reviewed staking contract deploys.</p>
      </div>
    </div>
  );
}
