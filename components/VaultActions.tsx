"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { ACTIVE_CHAIN, explorerTxUrl } from "@/lib/chains";
import { formatUnits, friendlyError, parseUnitsStrict } from "@/lib/utils";
import { useVaultReads, useVaultTx } from "@/lib/useVault";
import type { VaultMeta } from "@/lib/vaults";

export function VaultActions({ vault }: { vault: VaultMeta }) {
  const { isConnected } = useAccount();
  const reads = useVaultReads(vault.address, vault.assetDecimals);
  const tx = useVaultTx(vault.address, reads.assetAddr);
  const [mode, setMode] = useState<"deposit" | "withdraw">("deposit");
  const [input, setInput] = useState("");

  const parsed = parseUnitsStrict(input, vault.assetDecimals);
  const sharePrice =
    reads.totalAssets !== null && reads.totalSupply !== null && reads.totalSupply > 0n
      ? Number(reads.totalAssets) / Number(reads.totalSupply)
      : 1;
  const previewShares =
    parsed !== null && reads.totalAssets !== null && reads.totalSupply !== null
      ? reads.totalSupply === 0n
        ? parsed
        : (parsed * reads.totalSupply) / (reads.totalAssets === 0n ? 1n : reads.totalAssets)
      : null;

  const needsApproval =
    mode === "deposit" && parsed !== null && reads.allowance !== null && parsed > reads.allowance;

  const disabled =
    !vault.address || reads.paused === true || vault.status === "Awaiting deployment" || vault.status === "Disabled";

  async function submit() {
    if (parsed === null) return;
    if (mode === "deposit") await tx.deposit(parsed);
    else await tx.withdrawAssets(parsed);
    reads.refetch();
  }

  if (!vault.address) {
    return (
      <div className="card p-6">
        <h2 className="font-semibold">Deposits unavailable</h2>
        <p className="mt-2 text-sm text-muted">
          This vault has no deployed address on {vault.chain}. The contracts have not been deployed
          to this network yet. Deployment requires explicit approval and verified configuration —
          no real funds can be accepted until then.
        </p>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex gap-2">
        {(["deposit", "withdraw"] as const).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); tx.reset(); }}
            className={mode === m ? "btn-primary flex-1 capitalize" : "btn-ghost flex-1 capitalize"}
          >
            {m}
          </button>
        ))}
      </div>

      {!isConnected && (
        <p className="mt-4 rounded-xl border border-ink-700 p-3 text-sm text-muted">
          Connect a wallet to deposit or withdraw. Reads below are unauthenticated where possible.
        </p>
      )}
      {reads.paused && (
        <p className="mt-4 rounded-xl border border-warn/40 bg-warn/10 p-3 text-sm">
          Vault is paused — deposits and withdrawals revert until unpaused by the pause guardian.
        </p>
      )}
      {reads.error && <p className="mt-4 text-sm text-danger">Contract read failed: {reads.error}</p>}

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div><p className="label">Total assets</p><p className="num">{reads.totalAssets === null ? "—" : formatUnits(reads.totalAssets, vault.assetDecimals)}</p></div>
        <div><p className="label">Total shares</p><p className="num">{reads.totalSupply === null ? "—" : formatUnits(reads.totalSupply, vault.assetDecimals)}</p></div>
        <div><p className="label">Your shares</p><p className="num">{reads.shareBalance === null ? "—" : formatUnits(reads.shareBalance, vault.assetDecimals)}</p></div>
        <div><p className="label">Available liquidity</p><p className="num">{reads.liquidity === null ? "—" : formatUnits(reads.liquidity, vault.assetDecimals)}</p></div>
      </div>

      <label className="label mt-5" htmlFor="vault-amount">
        {mode === "deposit" ? "Deposit amount" : "Withdraw amount"} ({vault.assetSymbol})
      </label>
      <input
        id="vault-amount"
        className="input num"
        inputMode="decimal"
        placeholder="0.0"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={disabled || !isConnected}
      />
      {mode === "deposit" && reads.assetBalance !== null && (
        <p className="num mt-1 text-xs text-muted">Wallet balance: {formatUnits(reads.assetBalance, vault.assetDecimals)}</p>
      )}
      {previewShares !== null && (
        <p className="num mt-1 text-xs text-muted">
          Preview: ≈ {formatUnits(previewShares, vault.assetDecimals)} shares @ price {sharePrice.toFixed(6)}
          {needsApproval ? " · approval required" : ""}
        </p>
      )}

      <button
        onClick={submit}
        disabled={disabled || !isConnected || parsed === null || parsed <= 0n || tx.stage === "pending" || tx.stage === "awaiting-approval"}
        className="btn-primary mt-4 w-full"
      >
        {tx.stage === "pending" ? "Confirm in wallet…" : tx.stage === "awaiting-approval" ? "Approving…" : needsApproval ? "Approve + " + mode : mode}
      </button>

      {tx.stage === "success" && tx.hash && (
        <p className="mt-3 text-sm font-medium text-success">
          Confirmed.{" "}
          <a className="underline" target="_blank" rel="noreferrer" href={explorerTxUrl(vault.chain, tx.hash)}>
            View on explorer ({tx.hash.slice(0, 10)}…)
          </a>
        </p>
      )}
      {tx.stage === "error" && tx.error && (
        <p className="mt-3 text-sm text-danger">{friendlyError(new Error(tx.error))}</p>
      )}
      <p className="mt-3 text-xs text-muted">
        Fees: {(vault.performanceFeeBps / 100).toFixed(1)}% performance on realized profit only ·{" "}
        {vault.managementFeeBps === 0 ? "no management fee" : `${vault.managementFeeBps / 100}% management fee`} ·
        chain {ACTIVE_CHAIN.label}. Never confirmed until on-chain receipt.
      </p>
    </div>
  );
}
