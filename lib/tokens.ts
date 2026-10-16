/**
 * Singularis supported-asset registry (mainnets only).
 *
 * Robinhood Chain mainnet (4663): ETH (native gas) + USDG (Global Dollar).
 * BNB Smart Chain mainnet (56): BNB (native gas) + USDC (Binance-peg USD Coin).
 *
 * Addresses verified 2026-10-16 against independent sources:
 * - USDG 0x5fc5360d0400a0fd4f2af552add042d716f1d168: Robinhood Chain Blockscout,
 *   Etherscan ("Robinhood: USDG Token"), Robinscan, OpenSea, OKX. Decimals: 6.
 * - USDC 0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d: BscScan token page
 *   ("Token Contract WITH 18 Decimals"). Decimals: 18.
 *
 * No other assets are supported. Nothing here is invented.
 */

export const ROBINHOOD_MAINNET_ID = 4663;
export const BSC_MAINNET_ID = 56;

export interface NativeAsset {
  kind: "native";
  symbol: string;
  name: string;
  chainId: number;
  decimals: 18;
  glyph: string;
}

export interface Erc20Asset {
  kind: "erc20";
  symbol: string;
  name: string;
  chainId: number;
  address: `0x${string}`;
  decimals: number;
  glyph: string;
}

export type SupportedAsset = NativeAsset | Erc20Asset;

export const NATIVE_ETH: NativeAsset = {
  kind: "native",
  symbol: "ETH",
  name: "Ethereum",
  chainId: ROBINHOOD_MAINNET_ID,
  decimals: 18,
  glyph: "Ξ",
};

export const USDG: Erc20Asset = {
  kind: "erc20",
  symbol: "USDG",
  name: "Global Dollar",
  chainId: ROBINHOOD_MAINNET_ID,
  address: "0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168",
  decimals: 6,
  glyph: "$",
};

export const NATIVE_BNB: NativeAsset = {
  kind: "native",
  symbol: "BNB",
  name: "BNB",
  chainId: BSC_MAINNET_ID,
  decimals: 18,
  glyph: "B",
};

export const USDC_BSC: Erc20Asset = {
  kind: "erc20",
  symbol: "USDC",
  name: "USD Coin",
  chainId: BSC_MAINNET_ID,
  address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
  decimals: 18,
  glyph: "$",
};

/** Supported assets per chain, in display order. */
export const ASSETS_BY_CHAIN: Record<number, SupportedAsset[]> = {
  [ROBINHOOD_MAINNET_ID]: [NATIVE_ETH, USDG],
  [BSC_MAINNET_ID]: [NATIVE_BNB, USDC_BSC],
};

export function assetsForChain(chainId: number | undefined): SupportedAsset[] {
  if (chainId === undefined) return [];
  return ASSETS_BY_CHAIN[chainId] ?? [];
}

/** Minimal ERC-20 ABI for balance + transfer flows. */
export const ERC20_ABI = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "balance", type: "uint256" }],
  },
  {
    type: "function",
    name: "transfer",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "ok", type: "bool" }],
  },
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
] as const;
