# $SING Token — Design Proposal (NOT implemented)

Do not build the token before vaults work and this design is reviewed.

## Open questions (no invented final tokenomics)
- Total supply: fixed vs capped-emission — undecided. No figure promised.
- Allocation: team/contributor vesting (e.g. 2–4y with cliff), ecosystem/dev, liquidity — percentages TBD with legal review.
- Emissions: if any, must NOT be the sole staking reward source; prefer fee-linked or activity-linked sources evaluated separately.
- Governance: proposal threshold, quorum, timelock, guardian veto path — design with multisig + timelock from day one.
- Staking: lock options, cooldowns, slashing (none in v1), benefit schedule (fee discounts, analytics access) — benefits explicitly defined, no fixed APY.
- Treasury: on-chain treasury with spending caps + public reporting.
- Security: OZ ERC20 + permit, no fee-on-transfer, no blacklist unless justified + disclosed; upgradeability only via transparent proxy + timelock if ever needed.

## Hard constraints
- Vault deposits/withdrawals never require $SING.
- No automatic buybacks, guaranteed distributions, or revenue promises. Any future fee-sharing needs separate technical/economic/legal review.
- No staking-reward simulation in the UI.
