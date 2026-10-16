/**
 * Venus Core Pool integration (BNB Smart Chain mainnet only).
 *
 * Every address below was verified on-chain 2026-10-16:
 * - vUSDC + full market list enumerated from the Comptroller's allMarkets().
 * - vUSDC.underlying() == USDC, comptroller admin == Venus governance timelock,
 *   vUSDC listed with 82.5% collateral factor, live supply/borrow rates.
 * - Comptroller + oracle confirmed live (close factor 50%).
 *
 * Venus contracts are independently audited; Singularis only reads them and
 * submits standard user transactions (supply/borrow/repay) — no custom
 * money-holding code sits between the user and Venus.
 */

export const VENUS_CHAIN_ID = 56;
export const VENUS_COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384" as const;
export const VENUS_VUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8" as const;
export const VENUS_VBNB = "0xA07c5b74C9B40447a954e1466938b865b6BBea36" as const;

/** BSC ~3s blocks => ~10.5M blocks/year for nominal rate math. */
export const BSC_BLOCKS_PER_YEAR = 10_512_000;

/** Nominal yearly % from a Venus per-block rate (1e18-scaled). Labeled nominal, not compounded. */
export function ratePerBlockToNominalApy(ratePerBlock: bigint): number {
  return (Number(ratePerBlock) / 1e18) * BSC_BLOCKS_PER_YEAR * 100;
}

export const VTOKEN_ABI = [
  { type: "function", name: "mint", stateMutability: "nonpayable", inputs: [{ name: "mintAmount", type: "uint256" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "redeem", stateMutability: "nonpayable", inputs: [{ name: "redeemTokens", type: "uint256" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "redeemUnderlying", stateMutability: "nonpayable", inputs: [{ name: "redeemAmount", type: "uint256" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "borrow", stateMutability: "nonpayable", inputs: [{ name: "borrowAmount", type: "uint256" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "repayBorrow", stateMutability: "nonpayable", inputs: [{ name: "repayAmount", type: "uint256" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ name: "owner", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "borrowBalanceStored", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "exchangeRateStored", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "supplyRatePerBlock", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "borrowRatePerBlock", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "underlying", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
] as const;

export const VBNB_ABI = [
  { type: "function", name: "mint", stateMutability: "payable", inputs: [], outputs: [] },
  { type: "function", name: "redeem", stateMutability: "nonpayable", inputs: [{ name: "redeemTokens", type: "uint256" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "redeemUnderlying", stateMutability: "nonpayable", inputs: [{ name: "redeemAmount", type: "uint256" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "borrow", stateMutability: "nonpayable", inputs: [{ name: "borrowAmount", type: "uint256" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "repayBorrow", stateMutability: "payable", inputs: [], outputs: [] },
  { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ name: "owner", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "borrowBalanceStored", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "exchangeRateStored", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "supplyRatePerBlock", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "borrowRatePerBlock", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
] as const;

export const COMPTROLLER_ABI = [
  { type: "function", name: "enterMarkets", stateMutability: "nonpayable", inputs: [{ name: "vTokens", type: "address[]" }], outputs: [{ name: "", type: "uint256[]" }] },
  { type: "function", name: "exitMarket", stateMutability: "nonpayable", inputs: [{ name: "vToken", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "getAssetsIn", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ name: "", type: "address[]" }] },
  { type: "function", name: "getAccountLiquidity", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ name: "", type: "uint256" }, { name: "", type: "uint256" }, { name: "", type: "uint256" }] },
  { type: "function", name: "markets", stateMutability: "view", inputs: [{ name: "vToken", type: "address" }], outputs: [{ name: "", type: "bool" }, { name: "", type: "uint256" }, { name: "", type: "bool" }] },
] as const;
