import { describe, it, expect } from "vitest";
import {
  ASSETS_BY_CHAIN,
  BSC_MAINNET_ID,
  ROBINHOOD_MAINNET_ID,
  USDC_BSC,
  USDG,
  assetsForChain,
} from "../lib/tokens";

describe("supported-asset registry", () => {
  it("covers exactly the two mainnets", () => {
    expect(Object.keys(ASSETS_BY_CHAIN).map(Number).sort((a, b) => a - b)).toEqual([56, 4663]);
  });

  it("robinhood supports only ETH and USDG", () => {
    expect(assetsForChain(ROBINHOOD_MAINNET_ID).map((a) => a.symbol)).toEqual(["ETH", "USDG"]);
  });

  it("bsc supports only BNB and USDC", () => {
    expect(assetsForChain(BSC_MAINNET_ID).map((a) => a.symbol)).toEqual(["BNB", "USDC"]);
  });

  it("usdg address is the verified robinhood contract", () => {
    expect(USDG.address).toBe("0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168");
    expect(USDG.decimals).toBe(6);
    expect(USDG.chainId).toBe(4663);
  });

  it("usdc address is the verified bsc contract", () => {
    expect(USDC_BSC.address).toBe("0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d");
    expect(USDC_BSC.decimals).toBe(18);
    expect(USDC_BSC.chainId).toBe(56);
  });

  it("returns empty for unknown chains or undefined", () => {
    expect(assetsForChain(1)).toEqual([]);
    expect(assetsForChain(undefined)).toEqual([]);
  });
});
