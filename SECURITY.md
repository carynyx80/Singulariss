# SINGULARIS Security

## Assumptions
- Contracts are unaudited dev drafts — testnet only.
- Admin keys are single-signer dev keys. Production requires multisig + timelock for fee/strategy/cap changes.
- No oracle dependency in v1 (share price from internal accounting). Future adapters must document oracle freshness + deviation handling.

## Controls
- Roles: DEFAULT_ADMIN, PAUSE_ROLE, STRATEGY_MANAGER_ROLE, FEE_SETTER_ROLE.
- Pause blocks user flows AND strategy moves; it cannot seize funds (no admin withdraw path).
- Fee ceiling 20% enforced in constructor + setter; default proposal 5%.
- Allocation cap (default 50%) enforced against totalAssets at allocation time.
- ReentrancyGuard on deposit/mint/withdraw/redeem + strategy moves; checks-effects-interactions via OZ ERC4626; SafeERC20 + forceApprove reset.
- Rounding: deposit floors shares, withdraw ceils assets (OZ); virtual offset blunts inflation attacks; zero-value reverts.

## Test coverage
- `tests/vault-math.test.ts`: issuance, donation resistance, round-trip dust, fees, caps, multi-user.
- Required before mainnet (not yet done): Foundry fuzz/invariant (deposit/withdraw/redeem, fee monotonicity, pause matrix, strategy-failure containment), independent audit, multisig/timelock deploy, mainnet fork tests for real adapters.

## Operational rules
- Never deploy to mainnet or move real funds without explicit approval.
- Never describe the protocol as audited.
- Never substitute chains on RPC failure — surface outage.
