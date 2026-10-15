/**
 * Vault catalogue. All figures are config-driven; on-chain reads override
 * fixtures at runtime. No fabricated TVL/APY — vaults with no deployment
 * show "Awaiting deployment" and disable deposits.
 */
import type { SingularisChainKey } from "./chains";

export interface VaultMeta {
  id: string;
  name: string;
  symbol: string;
  assetSymbol: string;
  assetDecimals: number;
  chain: SingularisChainKey;
  description: string;
  strategyId: string;
  performanceFeeBps: number; // 500 = 5% proposal, evaluated per-vault
  managementFeeBps: number; // 0 default — only if justified + disclosed
  capAssets: string; // human-readable cap, "0" = uncapped in config (contract enforces)
  riskTier: "Conservative" | "Balanced" | "Experimental";
  status: "Live" | "Testnet" | "Paused" | "Awaiting deployment" | "Disabled";
  address: string | null; // null until deployed + verified
}

function envAddr(name: string): string | null {
  const v = process.env[name];
  return v && /^0x[0-9a-fA-F]{40}$/.test(v) ? v : null;
}

export function vaultCatalogue(): VaultMeta[] {
  return [
    {
      id: "sing-eth-core",
      name: "Singularis Core Vault",
      symbol: "svETH",
      assetSymbol: "WETH (test)",
      assetDecimals: 18,
      chain: "robinhood-testnet",
      description:
        "ERC-4626 vault holding a single test asset with a capped mock strategy allocation. First vault; proves accounting, fees, pause, and withdrawal rules before any real integration.",
      strategyId: "mock-local",
      performanceFeeBps: 500,
      managementFeeBps: 0,
      capAssets: "100",
      riskTier: "Experimental",
      status: envAddr("NEXT_PUBLIC_VAULT_ROBINHOOD_TESTNET") ? "Testnet" : "Awaiting deployment",
      address: envAddr("NEXT_PUBLIC_VAULT_ROBINHOOD_TESTNET"),
    },
    {
      id: "sing-bnb-core",
      name: "Singularis Core Vault (BSC)",
      symbol: "svBNB",
      assetSymbol: "WBNB (test)",
      assetDecimals: 18,
      chain: "bsc-testnet",
      description:
        "BSC counterpart of the core vault. Separate deployment, addresses, and risk params. Activated only after Robinhood testnet proves reliable.",
      strategyId: "bsc-lending",
      performanceFeeBps: 500,
      managementFeeBps: 0,
      capAssets: "100",
      riskTier: "Experimental",
      status: envAddr("NEXT_PUBLIC_VAULT_BSC_TESTNET") ? "Testnet" : "Awaiting deployment",
      address: envAddr("NEXT_PUBLIC_VAULT_BSC_TESTNET"),
    },
  ];
}
