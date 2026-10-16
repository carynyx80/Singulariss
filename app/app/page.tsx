"use client";

import Link from "next/link";
import { useAccount, useChainId } from "wagmi";
import { CHAINS } from "@/lib/chains";
import { vaultCatalogue } from "@/lib/vaults";

const SUPPORTED_MAINNET_IDS = [CHAINS["robinhood-mainnet"].id, CHAINS["bsc-mainnet"].id];

export default function AppDashboard() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const vaults = vaultCatalogue();
  const onSupportedNetwork = SUPPORTED_MAINNET_IDS.includes(chainId);

  if (!isConnected) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="card mt-6 p-8 text-center">
          <h1 className="text-2xl font-bold text-white">Connect a wallet to continue</h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            SINGULARIS is non-custodial. Use the Connect Wallet button in the header —
            Robinhood Chain and BNB Chain mainnets are supported.
          </p>
          <Link href="/" className="btn-ghost mt-6 inline-block">
            Explore without connecting
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6">
      <div className="card p-6">
        <p className="label">Connected wallet</p>
        <p className="num break-all text-sm text-white">{address}</p>
        <p className="label mt-4">Selected chain</p>
        <p className="text-sm text-white/85">
          {onSupportedNetwork
            ? `Chain ${chainId} — supported`
            : `Chain ${chainId} — unsupported in this app`}
        </p>
        {!onSupportedNetwork && (
          <p className="mt-3 rounded-xl border border-amber-400/40 bg-amber-400/10 p-3 text-sm text-amber-100">
            Your wallet is on an unsupported network. Open the network switcher in the header
            and select Robinhood Chain or BNB Chain.
          </p>
        )}
        <p className="mt-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 text-sm text-muted">
          Wallet connection supports Robinhood Chain and BNB Chain mainnets. Vault deployments
          on mainnet are not live yet — contracts are unaudited testnet drafts, so deposits
          stay disabled until audit + explicit approval.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {Object.values(CHAINS).map((c) => (
          <div key={c.key} className="card p-5">
            <p className="font-semibold text-white">{c.label}</p>
            <p className="num text-xs text-muted">
              chain {c.id} · {c.nativeSymbol} · {c.testnet ? "testnet" : "mainnet"}
            </p>
            <p className="mt-2 text-xs text-muted">
              {SUPPORTED_MAINNET_IDS.includes(c.id)
                ? "Wallet connection supported"
                : c.enabled
                  ? "Reference only — connect via mainnets"
                  : "Deployment disabled until approval + audit"}
            </p>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <h2 className="font-semibold text-white">Available actions</h2>
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
