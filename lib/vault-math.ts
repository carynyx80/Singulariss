/**
 * Vault accounting mirror — TypeScript model of SingularisVault math.
 * Used by tests to verify rounding, fees, multi-user, and donation resistance.
 * Contract is source of truth; this model must match its documented formulas.
 */

export const VIRTUAL_SHARES = 1000n;
export const VIRTUAL_ASSETS = 1000n;

export function convertToShares(assets: bigint, totalAssets: bigint, totalSupply: bigint): bigint {
  const a = totalAssets + VIRTUAL_ASSETS;
  const s = totalSupply + VIRTUAL_SHARES;
  //mulDiv floor
  return (assets * s) / a;
}

export function convertToAssets(shares: bigint, totalAssets: bigint, totalSupply: bigint): bigint {
  const a = totalAssets + VIRTUAL_ASSETS;
  const s = totalSupply + VIRTUAL_SHARES;
  // mulDiv ceil for redeem preview parity (contract uses OZ preview logic)
  if (shares === 0n) return 0n;
  return (shares * a + s - 1n) / s;
}

export function previewDepositShares(assets: bigint, totalAssets: bigint, totalSupply: bigint): bigint {
  return convertToShares(assets, totalAssets, totalSupply); // floor
}

export function feeAssetsOnProfit(profit: bigint, bps: number): bigint {
  return (profit * BigInt(bps)) / 10_000n;
}

export function maxDeposit(totalAssets: bigint, cap: bigint | null, paused: boolean): bigint {
  if (paused) return 0n;
  if (cap === null || cap === 0n) return 2n ** 256n - 1n;
  return totalAssets >= cap ? 0n : cap - totalAssets;
}

export function maxWithdrawFor(ownerShares: bigint, totalAssets: bigint, totalSupply: bigint, idle: bigint, paused: boolean): bigint {
  if (paused) return 0n;
  const bal = convertToAssets(ownerShares, totalAssets, totalSupply);
  return bal > idle ? idle : bal;
}
