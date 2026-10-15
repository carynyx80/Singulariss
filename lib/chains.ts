/**
 * SINGULARIS chain registry.
 * Every value verified 2026-10-15:
 * - Robinhood Chain: https://docs.robinhood.com/chain/connecting
 *   mainnet 4663 / testnet 46630, gas ETH.
 * - BNB Smart Chain: https://docs.bnbchain.org/bnb-smart-chain/developers/wallet-configuration/
 *   mainnet 56 / testnet 97, gas BNB/tBNB. Target is BSC, NOT opBNB.
 *
 * Each chain is a separate deployment: own addresses, assets,
 * strategies, history, risk params. No bridge / cross-chain messaging in v1.
 */
import { defineChain } from "viem";

export type SingularisChainKey =
  | "robinhood-testnet"
  | "robinhood-mainnet"
  | "bsc-testnet"
  | "bsc-mainnet";

export interface ChainMeta {
  key: SingularisChainKey;
  label: string;
  id: number;
  nativeSymbol: string;
  rpcUrl: string;
  explorerUrl: string;
  testnet: boolean;
  enabled: boolean;
}

function env(name: string, fallback: string): string {
  const v = process.env[name];
  return v && v.length > 0 ? v : fallback;
}

export const CHAINS: Record<SingularisChainKey, ChainMeta> = {
  "robinhood-testnet": {
    key: "robinhood-testnet",
    label: "Robinhood Chain Testnet",
    id: 46630,
    nativeSymbol: "ETH",
    rpcUrl: env(
      "NEXT_PUBLIC_ROBINHOOD_TESTNET_RPC",
      "https://rpc.testnet.chain.robinhood.com"
    ),
    explorerUrl: env(
      "NEXT_PUBLIC_ROBINHOOD_TESTNET_EXPLORER",
      "https://explorer.testnet.chain.robinhood.com"
    ),
    testnet: true,
    enabled: true,
  },
  "robinhood-mainnet": {
    key: "robinhood-mainnet",
    label: "Robinhood Chain",
    id: 4663,
    nativeSymbol: "ETH",
    rpcUrl: env(
      "NEXT_PUBLIC_ROBINHOOD_MAINNET_RPC",
      "https://rpc.mainnet.chain.robinhood.com"
    ),
    explorerUrl: env(
      "NEXT_PUBLIC_ROBINHOOD_MAINNET_EXPLORER",
      "https://robinhoodchain.blockscout.com"
    ),
    testnet: false,
    // Production deploys stay disabled until explicit human approval + audit.
    enabled: false,
  },
  "bsc-testnet": {
    key: "bsc-testnet",
    label: "BNB Smart Chain Testnet",
    id: 97,
    nativeSymbol: "tBNB",
    rpcUrl: env(
      "NEXT_PUBLIC_BSC_TESTNET_RPC",
      "https://data-seed-prebsc-1-s1.bnbchain.org:8545"
    ),
    explorerUrl: env(
      "NEXT_PUBLIC_BSC_TESTNET_EXPLORER",
      "https://testnet.bscscan.com"
    ),
    testnet: true,
    enabled: true,
  },
  "bsc-mainnet": {
    key: "bsc-mainnet",
    label: "BNB Smart Chain",
    id: 56,
    nativeSymbol: "BNB",
    rpcUrl: env("NEXT_PUBLIC_BSC_MAINNET_RPC", "https://bsc-dataseed.bnbchain.org"),
    explorerUrl: env("NEXT_PUBLIC_BSC_MAINNET_EXPLORER", "https://bscscan.com"),
    testnet: false,
    enabled: false,
  },
};

export const ACTIVE_CHAIN_KEY = ((): SingularisChainKey => {
  const raw = process.env.NEXT_PUBLIC_ACTIVE_CHAIN as SingularisChainKey | undefined;
  if (raw && raw in CHAINS) return raw;
  return "robinhood-testnet";
})();

export const ACTIVE_CHAIN = CHAINS[ACTIVE_CHAIN_KEY];

export const viemChains = Object.fromEntries(
  Object.values(CHAINS).map((c) => [
    c.key,
    defineChain({
      id: c.id,
      name: c.label,
      nativeCurrency: { name: c.nativeSymbol, symbol: c.nativeSymbol, decimals: 18 },
      rpcUrls: { default: { http: [c.rpcUrl] } },
      blockExplorers: { default: { name: `${c.label} Explorer`, url: c.explorerUrl } },
      testnet: c.testnet,
    }),
  ])
);

export function explorerTxUrl(chainKey: SingularisChainKey, hash: string): string {
  return `${CHAINS[chainKey].explorerUrl.replace(/\/$/, "")}/tx/${hash}`;
}

export function explorerAddressUrl(chainKey: SingularisChainKey, address: string): string {
  return `${CHAINS[chainKey].explorerUrl.replace(/\/$/, "")}/address/${address}`;
}

export function chainById(chainId: number | undefined): ChainMeta | undefined {
  if (chainId === undefined) return undefined;
  return Object.values(CHAINS).find((c) => c.id === chainId);
}
