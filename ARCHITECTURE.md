# SINGULARIS Architecture

## Frontend
Next.js 14 App Router, strict TS, Tailwind, wagmi 2 + viem 2 + RainbowKit 2 + TanStack Query.
Reads via `useVaultReads` (asset, totals, balances, allowance, caps, pause, liquidity);
writes via `useVaultTx` (approve when needed → deposit/withdraw → waitForReceipt → refetch).
Success surfaces only after receipt with explorer link from `lib/chains.ts`.

## Contracts
- `SingularisVault`: ERC4626 (OZ) + AccessControl + Pausable + ReentrancyGuard.
  Virtual offset 1e3 (decimalsOffset=3) against donation inflation.
  `totalAssets = idle + strategy.balance()`; `availableLiquidity = idle` only.
  `maxWithdraw/maxRedeem` clamped to idle — never promises instant strategy exits.
  Fees: HWM-based performance fee minted as shares to feeRecipient.
- `MockStrategy`: dev harness, MANAGER_ROLE-gated allocate/withdraw, lock flag to simulate illiquidity.
- `MockERC20`: test asset faucet.

## Multi-chain
`lib/chains.ts` is the single source: id, RPC, explorer, gas, enabled flag.
No shared addresses across chains. No bridge/messaging in v1.

## Data honesty
Vault catalogue marks `Awaiting deployment` when no address is configured; staking page
disables controls; docs distinguish live vs planned; strategy registry has zero `Verified` entries.
