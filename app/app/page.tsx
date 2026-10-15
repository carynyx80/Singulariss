"use client";

import Link from "next/link";
import { useAccount, useChainId } from "wagmi";
import { ACTIVE_CHAIN, CHAINS, chainById } from "@/lib/chains";
import { vaultCatalogue } from "@/lib/vaults";

export default function AppDashboard() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const current = chainById(chainId);
  const vaults = vaultCatalogue();

  if (!isConnected) {
    return (
      <div className="card mt-6 p-8 text-center">
        <h1 className="text-2xl font-bold">Connect a wallet to continue</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
          SINGULARIS is non-custodial — positions are read directly from vault contracts on the
          selected chain. Use the Connect button in the header.
        </p>
        <Link href="/vaults" className="btn-ghost mt-6 inline-block">
          Browse vaults without connecting
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-6">
      <div className="card p-6">
        <p className="label">Connected wallet</p>
        <p className="num break-all text-sm">{address}</p>
        <p className="label mt-4">Selected chain</p>
        <p className="text-sm">
          {current ? `${current.label} (${current.id})` : `Unsupported network (${chainId})`} · default{" "}
          {ACTIVE_CHAIN.label}
        </p>
        {current && current.id !== 46630 && current.id !== 97 && (
          <p className="mt-3 rounded-xl border border-warn/40 bg-warn/10 p-3 text-sm">
            Mainnet deployments are disabled in this build. Switch to a supported testnet
            (Robinhood 46630 or BSC 97) to test vaults.
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {Object.values(CHAINS).map((c) => (
          <div key={c.key} className="card p-5">
            <p className="font-semibold">{c.label}</p>
            <p className="num text-xs text-muted">
              chain {c.id} · {c.nativeSymbol} · {c.testnet ? "testnet" : "mainnet"}
            </p>
            <p className="mt-2 text-xs text-muted">{c.enabled ? "Supported for testing" : "Deployment disabled until approval + audit"}</p>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <h2 className="font-semibold">Available actions</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          <Link href="/vaults" className="btn-primary">Open vault explorer</Link>
          <Link href="/portfolio" className="btn-ghost">View portfolio</Link>
        </div>
        <p className="mt-3 text-xs text-muted">
          {vaults.length} vault(s) configured. Deposits require a deployed address on the active chain.
        </p>
      </div>
    </div>
  );
}
