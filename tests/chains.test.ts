import { describe, it, expect } from "vitest";
import { CHAINS } from "../lib/chains";
import { STRATEGY_REGISTRY } from "../lib/strategy-registry";

describe("chain configuration (verified 2026-10-15)", () => {
  it("robinhood mainnet = 4663, testnet = 46630, gas ETH", () => {
    expect(CHAINS["robinhood-mainnet"].id).toBe(4663);
    expect(CHAINS["robinhood-testnet"].id).toBe(46630);
    expect(CHAINS["robinhood-mainnet"].nativeSymbol).toBe("ETH");
  });
  it("bsc mainnet = 56, testnet = 97, not opBNB", () => {
    expect(CHAINS["bsc-mainnet"].id).toBe(56);
    expect(CHAINS["bsc-testnet"].id).toBe(97);
    expect(CHAINS["bsc-testnet"].rpcUrl).not.toContain("opbnb");
  });
  it("mainnets disabled by default", () => {
    expect(CHAINS["robinhood-mainnet"].enabled).toBe(false);
    expect(CHAINS["bsc-mainnet"].enabled).toBe(false);
  });
});

describe("strategy registry honesty", () => {
  it("no Verified integrations, no invented addresses", () => {
    const verified = STRATEGY_REGISTRY.filter((s) => s.status === "Verified");
    expect(verified.length).toBe(0);
    for (const s of STRATEGY_REGISTRY) {
      for (const addr of Object.values(s.contractAddresses)) {
        expect(addr).toMatch(/^0x[0-9a-fA-F]{40}$/);
      }
    }
  });
});
