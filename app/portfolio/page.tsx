"use client";

import { useAccount, usePublicClient } from "wagmi";
import { useEffect, useState } from "react";
import { getContract } from "viem";
import { vaultAbi } from "@/lib/contracts";
import { vaultCatalogue } from "@/lib/vaults";
import { formatUnits } from "@/lib/utils";
import Link from "next/link";

export default function PortfolioPage() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const [rows, setRows] = useState<{ id: string; name: string; shares: string; assets: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!isConnected || !address || !publicClient) return;
      setLoading(true);
      setNote(null);
      try {
        const out: typeof rows = [];
        for (const v of vaultCatalogue()) {
          if (!v.address) continue;
          try {
            const c = getContract({ address: v.address as `0x${string}`, abi: vaultAbi, client: publicClient });
            const [sb, sa] = await Promise.all([
              c.read.balanceOf([address]),
              c.read.convertToAssets([await c.read.balanceOf([address])]),
            ]);
            out.push({
              id: v.id, name: v.name,
              shares: formatUnits(sb as bigint, v.assetDecimals),
              assets: formatUnits(sa as bigint, v.assetDecimals),
            });
          } catch {
            out.push({ id: v.id, name: v.name, shares: "read failed", assets: "read failed" });
          }
        }
        if (!cancelled) setRows(out);
        if (!cancelled && out.length === 0) setNote("No deployed vaults on configured chains yet — nothing to read on-chain.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [isConnected, address, publicClient]);

  if (!isConnected) {
    return (
      <div className="card mt-6 p-8 text-center">
        <h1 className="text-2xl font-bold">Portfolio requires a wallet</h1>
        <p className="mt-2 text-sm text-muted">Holdings are never fabricated — positions appear only after on-chain reads.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-6">
      <h1 className="text-3xl font-bold text-paper">Portfolio</h1>
      {loading && <p className="text-sm text-muted">Reading vault contracts…</p>}
      {note && <p className="text-sm text-muted">{note}</p>}
      <div className="grid gap-4">
        {rows.map((r) => (
          <div key={r.id} className="card flex items-center justify-between p-5">
            <div>
              <p className="font-semibold">{r.name}</p>
              <p className="num text-sm text-muted">shares {r.shares} · ≈ assets {r.assets}</p>
            </div>
            <Link href={`/vaults/${r.id}`} className="btn-ghost">Manage</Link>
          </div>
        ))}
        {!loading && rows.length === 0 && !note && (
          <div className="card p-6 text-sm text-muted">No positions found in deployed vaults.</div>
        )}
      </div>
      <p className="text-xs text-muted">P&amp;L is derived from share value changes only. No simulated rewards.</p>
    </div>
  );
}
