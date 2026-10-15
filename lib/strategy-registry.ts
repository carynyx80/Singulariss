/**
 * Strategy integration registry.
 * No integration below is "Verified" — none has been reviewed + enabled
 * for production. Mock entries are dev-only and must never be presented
 * as live yield. Never invent contract addresses.
 */
import type { SingularisChainKey } from "./chains";

export type IntegrationStatus =
  | "Planned"
  | "Under review"
  | "Testnet only"
  | "Verified"
  | "Disabled";

export interface StrategyIntegration {
  id: string;
  name: string;
  chain: SingularisChainKey;
  protocol: string;
  docsUrl: string;
  contractAddresses: Record<string, string>; // empty until verified
  supportedAssets: string[];
  status: IntegrationStatus;
  audit: string;
  risks: string[];
  notes: string;
}

export const STRATEGY_REGISTRY: StrategyIntegration[] = [
  {
    id: "mock-local",
    name: "MockStrategy (dev only)",
    chain: "robinhood-testnet",
    protocol: "SINGULARIS dev harness",
    docsUrl: "https://docs.robinhood.com/chain/",
    contractAddresses: {},
    supportedAssets: ["MockERC20 (dev)"],
    status: "Testnet only",
    audit: "None — development harness, unaudited, no real funds.",
    risks: ["No real yield", "Test balances only", "Must never hold mainnet funds"],
    notes: "Local/testnet accounting harness. Simulates deposit/withdraw latency only.",
  },
  {
    id: "morpho-robinhood",
    name: "Morpho lending adapter",
    chain: "robinhood-testnet",
    protocol: "Morpho",
    docsUrl: "https://docs.morpho.org/",
    contractAddresses: {},
    supportedAssets: ["TBD — asset availability on Robinhood Chain unverified"],
    status: "Under review",
    audit: "Morpho core audited; Robinhood Chain deployment + adapter NOT reviewed.",
    risks: ["Deployment unverified", "Oracle availability unverified", "Liquidity unverified"],
    notes: "Robinhood docs list Morpho as ecosystem partner; no vault adapter verified. Do not enable deposits.",
  },
  {
    id: "uniswap-robinhood",
    name: "Uniswap LP adapter",
    chain: "robinhood-testnet",
    protocol: "Uniswap",
    docsUrl: "https://docs.uniswap.org/",
    contractAddresses: {},
    supportedAssets: ["TBD"],
    status: "Planned",
    audit: "Not reviewed for this chain/adapter.",
    risks: ["Impermanent loss", "Pool liquidity unverified"],
    notes: "Uniswap listed as public DEX on Robinhood Chain; pool addresses not verified.",
  },
  {
    id: "bsc-lending",
    name: "BSC lending adapter",
    chain: "bsc-testnet",
    protocol: "TBD (Venus/Solv review pending)",
    docsUrl: "https://docs.bnbchain.org/",
    contractAddresses: {},
    supportedAssets: ["TBD"],
    status: "Planned",
    audit: "Not reviewed.",
    risks: ["Integration not selected", "Addresses not verified"],
    notes: "BSC strategy review starts only after Robinhood testnet vault works reliably.",
  },
];

export function integrationsFor(chain: SingularisChainKey): StrategyIntegration[] {
  return STRATEGY_REGISTRY.filter((s) => s.chain === chain);
}
