"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { RainbowKitProvider, darkTheme, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, http } from "wagmi";
import { useState } from "react";
import { CHAINS } from "@/lib/chains";

const chains = [
  {
    id: CHAINS["robinhood-testnet"].id,
    name: CHAINS["robinhood-testnet"].label,
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    rpcUrls: { default: { http: [CHAINS["robinhood-testnet"].rpcUrl] } },
    blockExplorers: {
      default: { name: "Explorer", url: CHAINS["robinhood-testnet"].explorerUrl },
    },
    testnet: true,
  },
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
    id: CHAINS["bsc-testnet"].id,
    name: CHAINS["bsc-testnet"].label,
    nativeCurrency: { name: "tBNB", symbol: "tBNB", decimals: 18 },
    rpcUrls: { default: { http: [CHAINS["bsc-testnet"].rpcUrl] } },
    blockExplorers: {
      default: { name: "Explorer", url: CHAINS["bsc-testnet"].explorerUrl },
    },
    testnet: true,
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
    [CHAINS["robinhood-testnet"].id]: http(CHAINS["robinhood-testnet"].rpcUrl),
    [CHAINS["robinhood-mainnet"].id]: http(CHAINS["robinhood-mainnet"].rpcUrl),
    [CHAINS["bsc-testnet"].id]: http(CHAINS["bsc-testnet"].rpcUrl),
    [CHAINS["bsc-mainnet"].id]: http(CHAINS["bsc-mainnet"].rpcUrl),
  } as never,
  ssr: true,
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme({ accentColor: "#2E6BFF", accentColorForeground: "#FFFFFF" })}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
