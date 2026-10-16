"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, CheckCircle2, Copy, Loader2 } from "lucide-react";
import { isAddress, parseUnits } from "viem";
import {
  useAccount,
  useChainId,
  useSendTransaction,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { chainById } from "@/lib/chains";
import { ERC20_ABI, assetsForChain } from "@/lib/tokens";
import { useAssetBalances } from "@/lib/useBalances";
import { addTx } from "@/lib/tx-history";
import { friendlyError, parseUnitsStrict, shortAddr } from "@/lib/utils";
import { cn } from "@/lib/utils";

const ZERO = "0x0000000000000000000000000000000000000000";

export function TransferForm() {
  const { address } = useAccount();
  const chainId = useChainId();
  const meta = chainById(chainId);
  const assets = useMemo(() => assetsForChain(chainId), [chainId]);
  const { balances, refetch } = useAssetBalances();

  const [symbol, setSymbol] = useState<string>("");
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);

  const asset = assets.find((a) => a.symbol === (symbol || assets[0]?.symbol)) ?? assets[0];
  const balance = balances.find((b) => b.asset.symbol === asset?.symbol);

  const {
    sendTransaction,
    data: nativeHash,
    isPending: sendingNative,
    error: nativeError,
    reset: resetNative,
  } = useSendTransaction();
  const {
    writeContract,
    data: tokenHash,
    isPending: sendingToken,
    error: tokenError,
    reset: resetToken,
  } = useWriteContract();

  const hash = nativeHash ?? tokenHash;
  const receipt = useWaitForTransactionReceipt({ hash, chainId });

  const sending = sendingNative || sendingToken || receipt.isLoading;

  const explorerBase = meta?.explorerUrl.replace(/\/$/, "");

  function validate(): { to: `0x${string}`; value: bigint } | null {
    setError(null);
    if (!asset || !address) return null;
    if (!isAddress(to)) {
      setError("Enter a valid recipient address.");
      return null;
    }
    const dest = to as `0x${string}`;
    if (dest.toLowerCase() === ZERO) {
      setError("Recipient cannot be the zero address.");
      return null;
    }
    const value = parseUnitsStrict(amount, asset.decimals);
    if (value === null || value <= 0n) {
      setError(`Enter an amount greater than 0 ${asset.symbol}.`);
      return null;
    }
    if (balance?.value !== null && balance?.value !== undefined && value > (balance.value ?? 0n)) {
      setError(`Amount exceeds your balance of ${balance.formatted} ${asset.symbol}.`);
      return null;
    }
    return { to: dest, value };
  }

  function handleSend() {
    setError(null);
    resetNative();
    resetToken();
    const ok = validate();
    if (!ok || !address) return;
    if (asset!.kind === "native") {
      sendTransaction(
        { to: ok.to, value: ok.value, chainId },
        {
          onSuccess: (h) => {
            addTx({
              hash: h,
              chainId,
              from: address,
              to: ok.to,
              symbol: asset!.symbol,
              amount,
              timestamp: Date.now(),
              status: "submitted",
            });
            refetch();
          },
        }
      );
    } else {
      writeContract(
        {
          address: asset!.kind === "erc20" ? asset!.address : undefined,
          abi: ERC20_ABI,
          functionName: "transfer",
          args: [ok.to, ok.value],
          chainId,
        } as never,
        {
          onSuccess: (h) => {
            addTx({
              hash: h,
              chainId,
              from: address,
              to: ok.to,
              symbol: asset!.symbol,
              amount,
              timestamp: Date.now(),
              status: "submitted",
            });
            refetch();
          },
        }
      );
    }
  }

  function handleMax() {
    if (balance?.value == null || !asset) return;
    // Leave a small buffer for gas on native sends.
    let v = balance.value;
    if (asset.kind === "native") {
      const buffer = parseUnits("0.001", asset.decimals);
      v = v > buffer ? v - buffer : 0n;
    }
    const s = v.toString();
    const d = asset.decimals;
    setAmount(v === 0n ? "0" : d === 0 ? s : `${s.slice(0, -d) || "0"}.${s.slice(-d)}`.replace(/\.?0+$/, ""));
  }

  if (!address || assets.length === 0) {
    return (
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 text-center text-sm text-muted">
        Connect a wallet on Robinhood Chain or BNB Chain to send funds.
      </div>
    );
  }

  const submitError = nativeError ?? tokenError;
  const lowGas =
    asset?.kind === "native" &&
    balance?.value != null &&
    (() => {
      try {
        return parseUnits(amount || "0", asset.decimals) >= (balance.value * 95n) / 100n && parseUnits(amount || "0", asset.decimals) > 0n;
      } catch {
        return false;
      }
    })();

  return (
    <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
        <p className="text-xs uppercase tracking-wider text-muted">Send · real transaction</p>

        <label className="label mt-4" htmlFor="tf-asset">Asset</label>
        <div className="flex gap-2" role="group" aria-label="Asset">
          {assets.map((a) => (
            <button
              key={a.symbol}
              type="button"
              onClick={() => { setSymbol(a.symbol); setError(null); }}
              className={cn(
                "flex-1 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors",
                (asset?.symbol ?? "") === a.symbol
                  ? "border-[#10B981]/50 bg-[#10B981]/10 text-white"
                  : "border-white/10 text-muted hover:bg-white/[0.05] hover:text-white"
              )}
            >
              {a.symbol}
            </button>
          ))}
        </div>
        <p className="num mt-1.5 text-xs text-muted" id="tf-asset">
          Balance: {balance?.isLoading ? "loading…" : balance?.formatted ?? "—"} {asset?.symbol}
        </p>

        <label className="label mt-4" htmlFor="tf-to">Recipient address</label>
        <input
          id="tf-to"
          className="input font-mono !text-sm"
          placeholder="0x…"
          value={to}
          onChange={(e) => setTo(e.target.value.trim())}
          spellCheck={false}
        />

        <label className="label mt-4" htmlFor="tf-amount">Amount</label>
        <div className="flex gap-2">
          <input
            id="tf-amount"
            className="input num"
            placeholder="0.00"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button
            type="button"
            onClick={handleMax}
            className="shrink-0 rounded-xl border border-white/10 px-4 text-sm font-semibold text-accent-bright hover:bg-white/[0.05]"
          >
            Max
          </button>
        </div>

        {lowGas && (
          <p className="mt-2 text-xs text-amber-200">
            You are sending almost your full {asset?.symbol} balance — keep a little for network fees.
          </p>
        )}
        {error && <p className="mt-2 text-sm text-rose-300">{error}</p>}
        {submitError && !error && <p className="mt-2 text-sm text-rose-300">{friendlyError(submitError)}</p>}

        <button
          type="button"
          onClick={handleSend}
          disabled={sending}
          className="btn-primary mt-5 w-full"
        >
          {sending ? (
            <>
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              {receipt.isLoading ? "Confirming on-chain…" : "Confirm in wallet…"}
            </>
          ) : (
            <>Send {asset?.symbol}</>
          )}
        </button>
        <p className="mt-2 text-center text-xs text-muted">
          This submits a real {meta?.label ?? "mainnet"} transaction. Fees apply.
        </p>

        {hash && (
          <div className="mt-4 rounded-xl border border-[#10B981]/25 bg-[#10B981]/[0.06] p-3.5 text-sm">
            {receipt.isSuccess ? (
              <p className="inline-flex items-center gap-1.5 font-semibold text-white">
                <CheckCircle2 size={16} className="text-accent-bright" aria-hidden="true" />
                Sent — confirmed on-chain
              </p>
            ) : receipt.isError ? (
              <p className="font-semibold text-rose-300">Transaction failed on-chain.</p>
            ) : (
              <p className="inline-flex items-center gap-1.5 text-white/85">
                <Loader2 size={15} className="animate-spin" aria-hidden="true" />
                Submitted — waiting for confirmation…
              </p>
            )}
            <p className="num mt-1 break-all text-xs text-muted">{hash}</p>
            {explorerBase && (
              <a
                href={`${explorerBase}/tx/${hash}`}
                target="_blank"
                rel="noreferrer"
                className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-accent-bright hover:underline"
              >
                View on explorer <ArrowUpRight size={13} aria-hidden="true" />
              </a>
            )}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
        <p className="text-xs uppercase tracking-wider text-muted">Receive</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Send {assets.map((a) => a.symbol).join(" or ")} to this address from any wallet or
          exchange{meta ? ` on ${meta.label}` : ""}.
        </p>
        <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-white/[0.07] bg-black/30 px-3 py-2.5">
          <span className="num truncate text-sm text-white">{shortAddr(address ?? "")}</span>
          <button
            type="button"
            onClick={() => { if (address) void navigator.clipboard.writeText(address); }}
            className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs font-medium text-muted hover:bg-white/[0.06] hover:text-white"
          >
            <Copy size={13} aria-hidden="true" /> Copy
          </button>
        </div>
        <p className="num mt-2 break-all text-[11px] leading-relaxed text-muted">{address}</p>
        <p className="mt-3 border-t border-white/[0.07] pt-3 text-xs leading-relaxed text-muted">
          Only send supported assets on the connected network. Sending other assets or using the
          wrong network can lose funds permanently.
        </p>
      </div>
    </div>
  );
}
