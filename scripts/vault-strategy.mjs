/**
 * Point a SingularisVault at a strategy adapter and/or change its allocation
 * cap. Admin-only (signer must hold the vault's roles).
 *
 * Each step prints the before/after on-chain value and aborts on mismatch.
 * NOTHING is broadcast without:
 *   --broadcast --i-understand-this-moves-funds
 *
 * Examples:
 *   # Review current wiring (read-only):
 *   node scripts/vault-strategy.mjs --chain bsc --vault 0x... --show
 *
 *   # Enable the reviewed Venus adapter with a 50% cap:
 *   node scripts/vault-strategy.mjs --chain bsc --vault 0x... \
 *     --strategy 0xADAPTER --allocation 5000 \
 *     --broadcast --i-understand-this-moves-funds
 *
 *   # Emergency: set allocation back to 0 (funds stay idle, withdrawals unaffected):
 *   node scripts/vault-strategy.mjs --chain bsc --vault 0x... \
 *     --allocation 0 --broadcast --i-understand-this-moves-funds
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createPublicClient, createWalletClient, defineChain, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const artifact = JSON.parse(
  readFileSync(join(root, "contracts", "out", "SingularisVault.json"), "utf8")
);

const CHAINS = {
  robinhood: defineChain({
    id: 4663,
    name: "Robinhood Chain",
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    rpcUrls: {
      default: {
        http: [process.env.NEXT_PUBLIC_ROBINHOOD_MAINNET_RPC || "https://rpc.mainnet.chain.robinhood.com"],
      },
    },
  }),
  bsc: defineChain({
    id: 56,
    name: "BNB Smart Chain",
    nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
    rpcUrls: {
      default: { http: [process.env.NEXT_PUBLIC_BSC_MAINNET_RPC || "https://bsc-dataseed.bnbchain.org"] },
    },
  }),
};

const args = process.argv.slice(2);
function flag(name) {
  return args.includes(name);
}
function opt(name, fallback) {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
}
function isAddr(v) {
  return /^0x[0-9a-fA-F]{40}$/.test(v || "");
}

const which = opt("--chain", "");
const vaultAddr = opt("--vault", "");
const strategyAddr = opt("--strategy", "");
const allocation = opt("--allocation", "");
const chain = CHAINS[which];
if (!chain || !isAddr(vaultAddr)) {
  console.error("Usage: node scripts/vault-strategy.mjs --chain robinhood|bsc --vault 0x... [--show] [--strategy 0x...] [--allocation BPS]");
  process.exit(1);
}
if (strategyAddr && !isAddr(strategyAddr)) {
  console.error("Invalid --strategy address.");
  process.exit(1);
}
if (allocation !== "" && (!/^\d+$/.test(allocation) || Number(allocation) > 10000)) {
  console.error("--allocation must be 0..10000 (bps).");
  process.exit(1);
}
const broadcast = flag("--broadcast") && flag("--i-understand-this-moves-funds");
if ((strategyAddr || allocation !== "") && !flag("--show") && !broadcast) {
  if (flag("--broadcast") && !flag("--i-understand-this-moves-funds")) {
    console.error("Refusing: --broadcast requires --i-understand-this-moves-funds.");
    process.exit(1);
  }
  console.log("DRY-RUN (no --broadcast): showing current wiring only. Nothing will change.");
}

const publicClient = createPublicClient({ chain, transport: http() });
const onChainId = await publicClient.getChainId();
if (onChainId !== chain.id) {
  console.error(`RPC chain ${onChainId} != expected ${chain.id}. Aborting.`);
  process.exit(1);
}

const reads = {
  strategy: await publicClient.readContract({ address: vaultAddr, abi: artifact.abi, functionName: "strategy" }),
  alloc: await publicClient.readContract({ address: vaultAddr, abi: artifact.abi, functionName: "maxAllocationBps" }),
  liq: await publicClient.readContract({ address: vaultAddr, abi: artifact.abi, functionName: "availableLiquidity" }),
  ta: await publicClient.readContract({ address: vaultAddr, abi: artifact.abi, functionName: "totalAssets" }),
};
console.log(`Vault ${vaultAddr} on ${chain.name}:`);
console.log(`  strategy=${reads.strategy} alloc=${reads.alloc}bps liquidity=${reads.liq} total=${reads.ta}`);

if (flag("--show") || (!strategyAddr && allocation === "")) {
  process.exit(0);
}

const key = process.env.DEPLOYER_PRIVATE_KEY;
if (!key || !/^0x[0-9a-fA-F]{64}$/.test(key)) {
  console.error("Set DEPLOYER_PRIVATE_KEY in the environment. Never commit it.");
  process.exit(1);
}
const account = privateKeyToAccount(key);
const walletClient = createWalletClient({ account, chain, transport: http() });

if (!broadcast) {
  console.log("DRY-RUN COMPLETE — pass --broadcast --i-understand-this-moves-funds to apply.");
  process.exit(0);
}

if (strategyAddr) {
  const h = await walletClient.writeContract({
    address: vaultAddr, abi: artifact.abi, functionName: "setStrategy", args: [strategyAddr], chain,
  });
  await publicClient.waitForTransactionReceipt({ hash: h });
  console.log(`setStrategy tx: ${h}`);
}
if (allocation !== "") {
  const h = await walletClient.writeContract({
    address: vaultAddr, abi: artifact.abi, functionName: "setMaxAllocationBps", args: [BigInt(allocation)], chain,
  });
  await publicClient.waitForTransactionReceipt({ hash: h });
  console.log(`setMaxAllocationBps tx: ${h}`);
}

const after = {
  strategy: await publicClient.readContract({ address: vaultAddr, abi: artifact.abi, functionName: "strategy" }),
  alloc: await publicClient.readContract({ address: vaultAddr, abi: artifact.abi, functionName: "maxAllocationBps" }),
};
console.log(`Verified: strategy=${after.strategy} alloc=${after.alloc}bps`);
if (strategyAddr && after.strategy.toLowerCase() !== strategyAddr.toLowerCase()) {
  console.error("Strategy verification MISMATCH — investigate.");
  process.exit(1);
}
if (allocation !== "" && String(after.alloc) !== allocation) {
  console.error("Allocation verification MISMATCH — investigate.");
  process.exit(1);
}
console.log("Done. Allocate funds only via allocateToStrategy in a separate, deliberate step.");
