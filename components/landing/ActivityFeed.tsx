"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, History } from "lucide-react";
import { useAccount, useChainId, usePublicClient } from "wagmi";
import { chainById } from "@/lib/chains";
import { loadTxHistory, updateTxStatus, type TxRecord } from "@/lib/tx-history";
import { shortAddr } from "@/lib/utils";
import { cn } from "@/lib/utils";

function timeAgo(ts: number): string {
  const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function ActivityFeed() {
  const { address } = useAccount();
  const chainId = useChainId();
  const meta = chainById(chainId);
  const publicClient = usePublicClient({ chainId });
  const [records, setRecords] = useState<TxRecord[]>([]);

  useEffect(() => {
    setRecords(loadTxHistory(address, chainId));
  }, [address, chainId]);

  // Settle pending entries against the chain.
  useEffect(() => {
    if (!publicClient) return;
    const pending = records.filter((r) => r.status === "submitted");
    if (pending.length === 0) return;
    let cancelled = false;
    (async () => {
      for (const r of pending) {
        try {
          const receipt = await publicClient.getTransactionReceipt({ hash: r.hash });
          updateTxStatus(r.hash, receipt.status === "success" ? "confirmed" : "failed");
        } catch {
          // Still pending — leave as submitted.
        }
        if (cancelled) return;
      }
      if (!cancelled) setRecords(loadTxHistory(address, chainId));
    })();
    return () => {
      cancelled = true;
    };
  }, [records, publicClient, address, chainId]);

  const explorerBase = meta?.explorerUrl.replace(/\/$/, "");

  if (!address) {
    return (
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 text-center text-sm text-muted">
        Connect a wallet to see your transfer activity.
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-8 text-center">
        <History size={22} className="mx-auto text-muted" aria-hidden="true" />
        <p className="mt-3 font-semibold text-white">No transfers yet</p>
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted">
          Transfers you make in the Send tab appear here, with links to the chain explorer for
          the full on-chain record.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.07]">
      <div className="divide-y divide-white/[0.06]">
        {records.map((r) => (
          <div key={r.hash} className="flex flex-col gap-1.5 px-5 py-4 text-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-white">
                Sent {r.amount} {r.symbol}{" "}
                <span className="font-normal text-muted">to {shortAddr(r.to)}</span>
              </p>
              <p className="num mt-0.5 break-all text-xs text-muted">
                {r.hash} · {timeAgo(r.timestamp)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                  r.status === "confirmed" && "border-[#10B981]/30 bg-[#10B981]/10 text-[#6EE7B7]",
                  r.status === "submitted" && "border-amber-400/30 bg-amber-400/10 text-amber-200",
                  r.status === "failed" && "border-rose-400/30 bg-rose-400/10 text-rose-200"
                )}
              >
                {r.status === "confirmed" ? "Confirmed" : r.status === "failed" ? "Failed" : "Pending"}
              </span>
              {explorerBase && (
                <a
                  href={`${explorerBase}/tx/${r.hash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-accent-bright hover:underline"
                >
                  Explorer <ArrowUpRight size={13} aria-hidden="true" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
      <p className="border-t border-white/[0.07] bg-white/[0.01] px-5 py-3 text-xs text-muted">
        Showing transfers made in this app on this device. Full history lives on the chain explorer.
      </p>
    </div>
  );
}
