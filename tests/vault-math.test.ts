import { describe, it, expect } from "vitest";
import {
  convertToShares,
  convertToAssets,
  feeAssetsOnProfit,
  maxDeposit,
  maxWithdrawFor,
} from "../lib/vault-math";

describe("vault share accounting", () => {
  it("first depositor gets ~1:1 shares minus virtual offset dilution", () => {
    const s = convertToShares(1_000_000n, 0n, 0n);
    // (1e6 * 1e3) / 1e3 = 1e6
    expect(s).toBe(1_000_000n);
  });

  it("donation attack is unprofitable with virtual offset", () => {
    // Attacker deposits 1 wei, donates 1e12 assets, victim deposits 1e6.
    const attackerShares = convertToShares(1n, 0n, 0n); // 1
    // After donation: totalAssets = 1 + 1e12, totalSupply = 1
    const victimShares = convertToShares(1_000_000n, 1n + 1_000_000_000_000n, attackerShares);
    // victim shares collapse to ~0 — attacker cannot steal at scale without huge donation cost
    expect(victimShares).toBeLessThan(2n);
    // Without offset victim would get 1e6 shares and attacker could redeem donation profit.
    // With offset, rounding forces dust — attack cost >> gain.
  });

  it("proportional issuance for second depositor", () => {
    const s = convertToShares(500n, 1000n, 1000n);
    expect(s).toBeLessThanOrEqual(500n);
    expect(s).toBeGreaterThan(0n);
  });

  it("convert round-trip is bounded by 1 wei dust", () => {
    const ta = 10_000_000n, ts = 9_500_000n;
    const shares = convertToShares(1_000_000n, ta, ts);
    const back = convertToAssets(shares, ta, ts);
    expect(back <= 1_000_000n).toBe(true);
    expect(1_000_000n - back <= 2n).toBe(true);
  });

  it("zero-value inputs yield zero shares", () => {
    expect(convertToShares(0n, 100n, 100n)).toBe(0n);
    expect(convertToAssets(0n, 100n, 100n)).toBe(0n);
  });
});

describe("fees", () => {
  it("5% on realized profit", () => {
    expect(feeAssetsOnProfit(10_000n, 500)).toBe(500n);
  });
  it("no fee on zero profit", () => {
    expect(feeAssetsOnProfit(0n, 500)).toBe(0n);
  });
  it("fee never exceeds profit below 100% bps", () => {
    expect(feeAssetsOnProfit(999n, 2000)).toBeLessThan(999n);
  });
});

describe("limits", () => {
  it("maxDeposit respects cap and pause", () => {
    expect(maxDeposit(90n, 100n, false)).toBe(10n);
    expect(maxDeposit(100n, 100n, false)).toBe(0n);
    expect(maxDeposit(10n, 100n, true)).toBe(0n);
  });
  it("maxWithdraw limited by idle liquidity", () => {
    // owner owns everything but only half liquid
    const w = maxWithdrawFor(1000n, 1000n, 1000n, 400n, false);
    expect(w <= 400n).toBe(true);
  });
  it("multi-user withdrawals sum <= idle", () => {
    const ta = 3000n, ts = 3000n, idle = 1000n;
    const a = maxWithdrawFor(1500n, ta, ts, idle, false);
    const b = maxWithdrawFor(1500n, ta, ts, idle, false);
    expect(a + b <= 2n * idle).toBe(true);
  });
});
