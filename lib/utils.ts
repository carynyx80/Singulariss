import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatUnits(n: bigint, decimals: number, maxFrac = 6): string {
  const neg = n < 0n;
  const v = neg ? -n : n;
  const base = 10n ** BigInt(decimals);
  const whole = v / base;
  const frac = v % base;
  const fracStr = frac.toString().padStart(decimals, "0").slice(0, maxFrac).replace(/0+$/, "");
  return `${neg ? "-" : ""}${whole.toString()}${fracStr ? "." + fracStr : ""}`;
}

export function parseUnitsStrict(input: string, decimals: number): bigint | null {
  const s = input.trim();
  if (!/^\d+(\.\d+)?$/.test(s)) return null;
  const [w, f = ""] = s.split(".");
  if (f.length > decimals) return null;
  return BigInt(w) * 10n ** BigInt(decimals) + BigInt((f + "0".repeat(decimals)).slice(0, decimals) || "0");
}

export function shortAddr(addr: string): string {
  return addr.length > 12 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr;
}

export function friendlyError(e: unknown): string {
  if (e instanceof Error) {
    const m = e.message;
    if (/User rejected|User denied|rejected the request/i.test(m)) return "Signature rejected in wallet. No transaction was sent.";
    if (/insufficient funds|exceeds balance/i.test(m)) return "Insufficient balance for this transaction (including gas).";
    if (/wrong|unsupported|switch|chain/i.test(m)) return m.slice(0, 220);
    return m.slice(0, 280);
  }
  return "Transaction failed. Check wallet, network, and balances, then retry.";
}
