/**
 * RPC health check — verifies configured endpoints respond with matching chain IDs.
 * Never substitutes another chain on failure; reports outage.
 * Usage: node scripts/rpc-check.mjs
 */
const TARGETS = [
  { key: "robinhood-testnet", url: process.env.NEXT_PUBLIC_ROBINHOOD_TESTNET_RPC || "https://rpc.testnet.chain.robinhood.com", expect: 46630 },
  { key: "robinhood-mainnet", url: process.env.NEXT_PUBLIC_ROBINHOOD_MAINNET_RPC || "https://rpc.mainnet.chain.robinhood.com", expect: 4663 },
  { key: "bsc-testnet", url: process.env.NEXT_PUBLIC_BSC_TESTNET_RPC || "https://data-seed-prebsc-1-s1.bnbchain.org:8545", expect: 97 },
  { key: "bsc-mainnet", url: process.env.NEXT_PUBLIC_BSC_MAINNET_RPC || "https://bsc-dataseed.bnbchain.org", expect: 56 },
];

async function check(t) {
  try {
    const res = await fetch(t.url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_chainId", params: [] }),
      signal: AbortSignal.timeout(12000),
    });
    const j = await res.json();
    const got = parseInt(j.result, 16);
    const ok = got === t.expect;
    console.log(`${ok ? "OK  " : "FAIL"} ${t.key}: got ${got} want ${t.expect} via ${t.url}`);
    return ok;
  } catch (e) {
    console.log(`DOWN ${t.key} (${t.url}): ${e.message}`);
    return false;
  }
}

let all = true;
for (const t of TARGETS) all = (await check(t)) && all;
process.exit(all ? 0 : 1);
