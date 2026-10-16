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
    id: "idle",
    name: "Idle (no strategy allocated)",
    chain: "robinhood-mainnet",
    protocol: "None — assets held in-vault",
    docsUrl: "https://github.com/carynyx80/Singulariss",
    contractAddresses: {},
    supportedAssets: ["USDG"],
    status: "Disabled",
    audit: "No strategy contract involved; vault code covered by Hardhat suite, no independent audit.",
    risks: ["No yield while idle", "Smart-contract risk of the vault itself"],
    notes: "Launch posture: 100% of assets stay idle in the vault and fully withdrawable. Allocation enabled only after an adapter is reviewed.",
  },
  {
    id: "idle",
    name: "Idle (no strategy allocated)",
    chain: "bsc-mainnet",
    protocol: "None — assets held in-vault",
    docsUrl: "https://github.com/carynyx80/Singulariss",
    contractAddresses: {},
    supportedAssets: ["USDC"],
    status: "Disabled",
    audit: "No strategy contract involved; vault code covered by Hardhat suite, no independent audit.",
    risks: ["No yield while idle", "Smart-contract risk of the vault itself"],
    notes: "Launch posture: 100% of assets stay idle in the vault and fully withdrawable. Allocation enabled only after an adapter is reviewed.",
  },
  {
    id: "idle-testnet",
    name: "Idle (no strategy, testnet)",
    chain: "bsc-testnet",
    protocol: "None — assets held in-vault",
    docsUrl: "https://github.com/carynyx80/Singulariss",
    contractAddresses: {},
    supportedAssets: ["Test assets only"],
    status: "Testnet only",
    audit: "None — test vault with no strategy.",
    risks: ["No real yield", "Test balances only", "Must never hold mainnet funds"],
    notes: "BSC testnet vault proving accounting before any real integration.",
  },
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
    id: "venus-core-bsc",
    name: "Venus Core Pool (direct)",
    chain: "bsc-mainnet",
    protocol: "Venus Protocol",
    docsUrl: "https://docs-v4.venus.io/",
    contractAddresses: {
      comptroller: "0xfD36E2c2a6789Db23113685031d7F16329158384",
      vUSDC: "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8",
      vBNB: "0xA07c5b74C9B40447a954e1466938b865b6BBea36",
    },
    supportedAssets: ["USDC", "BNB"],
    status: "Under review",
    audit: "Venus Core Pool independently audited (multiple audits, bug bounty, risk fund). Singularis submits standard user transactions only; the VenusAdapter vault wiring is self-tested and NOT yet enabled (allocation 0).",
    risks: ["Variable rates", "Liquidation if borrow limit exceeded", "Venus governance/pause risk"],
    notes: "Borrowing runs directly on the audited Venus Core Pool via the app's Borrow tab (BNB Chain only). Vault allocation to Venus stays at 0 until explicitly enabled.",
  },
];

export function integrationsFor(chain: SingularisChainKey): StrategyIntegration[] {
  return STRATEGY_REGISTRY.filter((s) => s.chain === chain);
}
