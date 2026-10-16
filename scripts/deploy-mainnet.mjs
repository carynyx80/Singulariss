/**
 * Mainnet vault deployment (viem, no Foundry needed).
 *
 * Deploys SingularisVault for USDG on Robinhood Chain mainnet (4663) and
 * USDC on BNB Smart Chain mainnet (56), then locks each vault to its
 * launch-safe posture: deposit cap enforced, NO strategy set, max allocation
 * 0 bps (allocation impossible until an adapter is reviewed + enabled).
 *
 * DEFAULT MODE IS DRY-RUN: validates everything, estimates gas, prints the
 * exact transactions — broadcasts NOTHING.
 *
 * To broadcast (spends real gas, deploys real contracts holding real funds):
 *   1. Copy .env.example to .env.local and set DEPLOYER_PRIVATE_KEY (+ FEE_RECIPIENT).
 *   2. Fund the deployer with native gas (ETH on Robinhood, BNB on BSC).
 *   3. Run with: --broadcast --i-understand-this-uses-real-mainnet-funds
 *
 *   node scripts/deploy-mainnet.mjs --chain robinhood
 *   node scripts/deploy-mainnet.mjs --chain bsc --broadcast --i-understand-this-uses-real-mainnet-funds
 *
 * These contracts are covered by the Hardhat suite (npm run hh:test) but have
 * NOT had an independent security audit. Launch caps are conservative.
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  createPublicClient,
  createWalletClient,
  defineChain,
  formatUnits,
  http,
  parseUnits,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const artifact = JSON.parse(
  readFileSync(join(root, "contracts", "out", "SingularisVault.json"), "utf8")
);

const robinhoodMainnet = defineChain({
  id: 4663,
  name: "Robinhood Chain",
  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_ROBINHOOD_MAINNET_RPC || "https://rpc.mainnet.chain.robinhood.com"],
    },
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: process.env.NEXT_PUBLIC_ROBINHOOD_MAINNET_EXPLORER || "https://robinhoodchain.blockscout.com",
    },
  },
});

const bscMainnet = defineChain({
  id: 56,
  name: "BNB Smart Chain",
  nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_BSC_MAINNET_RPC || "https://bsc-dataseed.bnbchain.org"] },
  },
  blockExplorers: {
    default: { name: "BscScan", url: "https://bscscan.com" },
  },
});

const PLANS = {
  robinhood: {
    chain: robinhoodMainnet,
    asset: "0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168", // USDG, verified 2026-10-16
    assetSymbol: "USDG",
    assetDecimals: 6,
    name: "Singularis USDG Vault",
    symbol: "svUSDG",
    capHuman: "10000",
    feeBps: 500,
    envVar: "NEXT_PUBLIC_VAULT_ROBINHOOD_MAINNET",
  },
  bsc: {
    chain: bscMainnet,
    asset: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", // USDC, verified 2026-10-16
    assetSymbol: "USDC",
    assetDecimals: 18,
    name: "Singularis USDC Vault",
    symbol: "svUSDC",
    capHuman: "10000",
    feeBps: 500,
    envVar: "NEXT_PUBLIC_VAULT_BSC_MAINNET",
  },
};

const args = process.argv.slice(2);
function flag(name) {
  return args.includes(name);
}
function opt(name, fallback) {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
}

const which = opt("--chain", "robinhood");
const plan = PLANS[which];
if (!plan) {
  console.error(`Unknown --chain "${which}". Use --chain robinhood|bsc.`);
  process.exit(1);
}
const broadcast = flag("--broadcast") && flag("--i-understand-this-uses-real-mainnet-funds");
if (flag("--broadcast") && !flag("--i-understand-this-uses-real-mainnet-funds")) {
  console.error("Refusing: --broadcast requires --i-understand-this-uses-real-mainnet-funds.");
  process.exit(1);
}

const key = process.env.DEPLOYER_PRIVATE_KEY;
if (!key || !/^0x[0-9a-fA-F]{64}$/.test(key)) {
  console.error("Set DEPLOYER_PRIVATE_KEY=0x... (64 hex chars) in the environment. Never commit it.");
  process.exit(1);
}
const account = privateKeyToAccount(key);
const feeRecipient = /^0x[0-9a-fA-F]{40}$/.test(process.env.FEE_RECIPIENT || "")
  ? process.env.FEE_RECIPIENT
  : account.address;
const depositCap = parseUnits(plan.capHuman, plan.assetDecimals);

const publicClient = createPublicClient({ chain: plan.chain, transport: http() });
const walletClient = createWalletClient({ account, chain: plan.chain, transport: http() });

// --- Preflight checks (run in both modes) ---
const onChainId = await publicClient.getChainId();
if (onChainId !== plan.chain.id) {
  console.error(`RPC chain ${onChainId} != expected ${plan.chain.id}. Aborting.`);
  process.exit(1);
}
const assetCode = await publicClient.getBytecode({ address: plan.asset });
if (!assetCode || assetCode === "0x") {
  console.error(`No contract at asset ${plan.asset} on chain ${plan.chain.id}. Aborting.`);
  process.exit(1);
}
const gasBalance = await publicClient.getBalance({ address: account.address });
console.log(`Deployer : ${account.address}`);
console.log(`Network  : ${plan.chain.name} (${plan.chain.id})`);
console.log(`Asset    : ${plan.assetSymbol} ${plan.asset} (${plan.assetDecimals}d, code verified)`);
console.log(`Vault    : "${plan.name}" (${plan.symbol}), cap ${plan.capHuman}, fee ${plan.feeBps}bps`);
console.log(`Fee to   : ${feeRecipient}`);
console.log(`Gas bal  : ${formatUnits(gasBalance, 18)} ${plan.chain.nativeCurrency.symbol}`);

const ctorArgs = [plan.asset, plan.name, plan.symbol, account.address, feeRecipient, plan.feeBps, depositCap];
let deployGas = null;
try {
  const { encodeDeployData } = await import("viem");
  deployGas = await publicClient.estimateGas({
    account: account.address,
    data: encodeDeployData({ abi: artifact.abi, bytecode: artifact.bytecode, args: ctorArgs }),
  });
} catch (e) {
  console.error(`Deployment gas estimation failed (would revert on-chain): ${e.message?.slice(0, 300)}`);
  process.exit(1);
}

if (!broadcast) {
  console.log(`Est. deployment gas: ${deployGas} units`);
  console.log("\nDRY-RUN COMPLETE — nothing broadcast. Re-run with --broadcast --i-understand-this-uses-real-mainnet-funds to deploy.");
  console.log(`Constructor args: ${JSON.stringify(ctorArgs.map(String))}`);
  process.exit(0);
}

// --- Broadcast ---
// NOTE (viem 2.21): deployContract returns the TRANSACTION HASH, not the
// address. The vault address comes from the deployment receipt.
console.log("\nBroadcasting vault deployment…");
const deployHash = await walletClient.deployContract({
  abi: artifact.abi,
  bytecode: artifact.bytecode,
  args: ctorArgs,
  chain: plan.chain,
});
console.log(`Deploy tx: ${deployHash}`);
const deployReceipt = await publicClient.waitForTransactionReceipt({ hash: deployHash });
const vaultAddr = deployReceipt.contractAddress;
if (!vaultAddr) {
  console.error("Deployment receipt has no contract address. Resolve manually from the deploy tx.");
  process.exit(1);
}
console.log(`Vault deployed: ${vaultAddr}`);

const lockHash = await walletClient.writeContract({
  address: vaultAddr,
  abi: artifact.abi,
  functionName: "setMaxAllocationBps",
  args: [0],
  chain: plan.chain,
});
await publicClient.waitForTransactionReceipt({ hash: lockHash });
console.log("Launch lock set: maxAllocationBps = 0 (no strategy allocation possible).");

const [cap, fee, alloc] = await Promise.all([
  publicClient.readContract({ address: vaultAddr, abi: artifact.abi, functionName: "depositCap" }),
  publicClient.readContract({ address: vaultAddr, abi: artifact.abi, functionName: "performanceFeeBps" }),
  publicClient.readContract({ address: vaultAddr, abi: artifact.abi, functionName: "maxAllocationBps" }),
]);
console.log(`On-chain check: cap=${cap} fee=${fee}bps alloc=${alloc}bps`);

const explorer = plan.chain.blockExplorers.default.url.replace(/\/$/, "");
console.log(`Explorer: ${explorer}/address/${vaultAddr}`);
console.log(`\nAdd to .env.local:\n${plan.envVar}=${vaultAddr}`);
