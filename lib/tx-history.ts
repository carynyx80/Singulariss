"use client";

/**
 * Local record of transfers made through this app, per wallet address.
 * This is the user's own session history — the complete on-chain history
 * lives on the chain explorer (linked from every entry).
 */

export type TxStatus = "submitted" | "confirmed" | "failed";

export interface TxRecord {
  hash: `0x${string}`;
  chainId: number;
  from: `0x${string}`;
  to: `0x${string}`;
  symbol: string;
  amount: string;
  timestamp: number;
  status: TxStatus;
}

const KEY = "singularis-tx-history-v1";

function readAll(): TxRecord[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as TxRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(records: TxRecord[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(records.slice(0, 100)));
  } catch {
    // Storage full or unavailable — history is a convenience, not critical.
  }
}

export function loadTxHistory(address: string | undefined, chainId: number | undefined): TxRecord[] {
  if (!address || chainId === undefined) return [];
  const lower = address.toLowerCase();
  return readAll()
    .filter((t) => t.from.toLowerCase() === lower && t.chainId === chainId)
    .sort((a, b) => b.timestamp - a.timestamp);
}

export function addTx(record: TxRecord): void {
  writeAll([record, ...readAll()]);
}

export function updateTxStatus(hash: string, status: TxStatus): void {
  writeAll(readAll().map((t) => (t.hash === hash ? { ...t, status } : t)));
}
