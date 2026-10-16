/**
 * Singularis — illustrative static demo data.
 *
 * Every value in this file is a hard-coded UI placeholder for the landing-page
 * mockup and dashboard preview. It is NOT real protocol TVL, user funds,
 * yield, or market data. UI components must render an "Illustrative Demo"
 * label alongside any of these numbers.
 */

export interface DemoAssetRow {
  symbol: string;
  name: string;
  balance: string;
  value: string;
  glyph: string;
}

export interface DemoMarketRow {
  asset: string;
  glyph: string;
  supplyLabel: string;
  borrowLabel: string;
  liquidityLabel: string;
  status: string;
}

export interface DemoStrategyRow {
  name: string;
  type: string;
  risk: "Low" | "Moderate" | "Elevated";
  status: string;
  description: string;
}

export const DEMO_PORTFOLIO_VALUE = "$12,480.00";

export const DEMO_SUPPLIED: DemoAssetRow[] = [
  { symbol: "ETH", name: "Ethereum", balance: "2.40 ETH", value: "$6,120.00", glyph: "Ξ" },
  { symbol: "BNB", name: "BNB Chain", balance: "8.75 BNB", value: "$4,210.00", glyph: "B" },
  { symbol: "USDC", name: "USD Coin", balance: "1,480.00 USDC", value: "$1,480.00", glyph: "$" },
];

export const DEMO_BORROWED: DemoAssetRow[] = [
  { symbol: "USDC", name: "USD Coin", balance: "1,150.00 USDC", value: "$1,150.00", glyph: "$" },
  { symbol: "BNB", name: "BNB Chain", balance: "0.90 BNB", value: "$432.00", glyph: "B" },
];

export const DEMO_LIQUIDITY = "$84,200.00";

export const DEMO_ALLOCATION = [
  { label: "ETH", pct: 49, color: "#10B981" },
  { label: "BNB", pct: 34, color: "#34D399" },
  { label: "USDC", pct: 12, color: "#6EE7B7" },
  { label: "Other", pct: 5, color: "#2A3B34" },
];

export const DEMO_MARKETS: DemoMarketRow[] = [
  { asset: "ETH", glyph: "Ξ", supplyLabel: "Illustrative", borrowLabel: "Illustrative", liquidityLabel: "$38,400 demo", status: "Planned" },
  { asset: "BNB", glyph: "B", supplyLabel: "Illustrative", borrowLabel: "Illustrative", liquidityLabel: "$27,900 demo", status: "Planned" },
  { asset: "USDC", glyph: "$", supplyLabel: "Illustrative", borrowLabel: "Illustrative", liquidityLabel: "$17,900 demo", status: "Planned" },
];

export const DEMO_STRATEGIES: DemoStrategyRow[] = [
  {
    name: "Conservative Lending Loop",
    type: "Illustrative concept",
    risk: "Low",
    status: "Planned — subject to review",
    description: "Illustrative example of how an approved low-exposure strategy could be presented with transparent risk factors.",
  },
  {
    name: "Stablecoin Liquidity Route",
    type: "Illustrative concept",
    risk: "Moderate",
    status: "Planned — subject to review",
    description: "Illustrative example showing how strategy parameters, exposure limits, and exit conditions would be disclosed.",
  },
  {
    name: "Blue-Chip Collateral Yield",
    type: "Illustrative concept",
    risk: "Elevated",
    status: "Planned — subject to review",
    description: "Illustrative example of a higher-risk concept that would require explicit risk controls before any launch.",
  },
];

export const DEMO_COLLATERAL = [
  { asset: "ETH", glyph: "Ξ", eligibility: "Planned eligible", maxLabel: "Illustrative", note: "Demo loan-to-value shown for layout only." },
  { asset: "BNB", glyph: "B", eligibility: "Planned eligible", maxLabel: "Illustrative", note: "Demo liquidation threshold shown for layout only." },
  { asset: "USDC", glyph: "$", eligibility: "Under evaluation", maxLabel: "Illustrative", note: "Eligibility subject to final risk design." },
];
