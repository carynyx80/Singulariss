"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { RainbowKitProvider, darkTheme, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, http } from "wagmi";
import { useState } from "react";
import { CHAINS } from "@/lib/chains";

/**
 * Wallet stack (wagmi + RainbowKit + WalletConnect).
 * Client-only: WalletConnect touches indexedDB at setup, which does not
 * exist during SSR. This module is loaded via dynamic(ssr:false) in Providers.
 *
 * Mainnet-only: exposes Robinhood Chain mainnet (4663) and BNB Smart Chain
 * mainnet (56). No testnets, no other networks — the RainbowKit network
 * switcher will only ever offer these two.
 *
 * NOTE: connecting a wallet only reads accounts and switches networks.
 * Vault deployments on mainnet stay disabled (`enabled: false` in
 * lib/chains.ts) until audit + explicit approval, so no deposits can occur.
 */
const chains = [
  {
    id: CHAINS["robinhood-mainnet"].id,
    name: CHAINS["robinhood-mainnet"].label,
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    rpcUrls: { default: { http: [CHAINS["robinhood-mainnet"].rpcUrl] } },
    blockExplorers: {
      default: { name: "Explorer", url: CHAINS["robinhood-mainnet"].explorerUrl },
    },
  },
  {
    id: CHAINS["bsc-mainnet"].id,
    name: CHAINS["bsc-mainnet"].label,
    nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
    rpcUrls: { default: { http: [CHAINS["bsc-mainnet"].rpcUrl] } },
    blockExplorers: {
      default: { name: "Explorer", url: CHAINS["bsc-mainnet"].explorerUrl },
    },
  },
] as const;

const config = getDefaultConfig({
  appName: "SINGULARIS",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "singularis-dev",
  chains: chains as never,
  transports: {
    [CHAINS["robinhood-mainnet"].id]: http(CHAINS["robinhood-mainnet"].rpcUrl),
    [CHAINS["bsc-mainnet"].id]: http(CHAINS["bsc-mainnet"].rpcUrl),
  } as never,
  ssr: true,
});

export function WalletProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({ accentColor: "#10B981", accentColorForeground: "#05281C" })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
