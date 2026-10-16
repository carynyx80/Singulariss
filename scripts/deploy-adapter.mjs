/**
 * Deploy the VenusAdapter for the USDC vault on BNB Smart Chain.
 *
 * The adapter is MANAGER-gated to the vault itself (manager = vault address),
 * so only the vault contract can ever move funds through it — the deployer
 * keeps no spending power. Deploying moves NO funds; enabling yield later
 * requires separate admin transactions (scripts/vault-strategy.mjs).
 *
 * DEFAULT MODE IS DRY-RUN. Broadcast with:
 *   node scripts/deploy-adapter.mjs --broadcast --i-understand-this-uses-real-mainnet-funds [--vault 0x...]
 *
 * Vault address resolves from --vault or NEXT_PUBLIC_VAULT_BSC_MAINNET.
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createPublicClient, createWalletClient, defineChain, encodeDeployData, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const artifact = JSON.parse(
  readFileSync(join(root, "contracts", "out", "VenusAdapter.json"), "utf8")
);

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

// Verified 2026-10-16 (Comptroller market enumeration + vUSDC.underlying()).
const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
const VUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";

const args = process.argv.slice(2);
function flag(name) {
  return args.includes(name);
}
function opt(name, fallback) {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
}

const vaultAddr = opt("--vault", process.env.NEXT_PUBLIC_VAULT_BSC_MAINNET || "");
if (!/^0x[0-9a-fA-F]{40}$/.test(vaultAddr)) {
  console.error("Provide the USDC vault address via --vault 0x... or NEXT_PUBLIC_VAULT_BSC_MAINNET.");
  process.exit(1);
}
const broadcast = flag("--broadcast") && flag("--i-understand-this-uses-real-mainnet-funds");
if (flag("--broadcast") && !flag("--i-understand-this-uses-real-mainnet-funds")) {
  console.error("Refusing: --broadcast requires --i-understand-this-uses-real-mainnet-funds.");
  process.exit(1);
}

const key = process.env.DEPLOYER_PRIVATE_KEY;
if (!key || !/^0x[0-9a-fA-F]{64}$/.test(key)) {
  console.error("Set DEPLOYER_PRIVATE_KEY in the environment. Never commit it.");
  process.exit(1);
}
const account = privateKeyToAccount(key);
const publicClient = createPublicClient({ chain: bscMainnet, transport: http() });
const walletClient = createWalletClient({ account, chain: bscMainnet, transport: http() });

// Preflight: vault must exist and point at USDC; market must be live.
const vaultAbi = [
  { type: "function", name: "asset", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
];
const marketAbi = [
  { type: "function", name: "underlying", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "exchangeRateStored", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
];
const [vaultCode, vaultAsset, marketRate] = await Promise.all([
  publicClient.getBytecode({ address: vaultAddr }),
  publicClient.readContract({ address: vaultAddr, abi: vaultAbi, functionName: "asset" }),
  publicClient.readContract({ address: VUSDC, abi: marketAbi, functionName: "exchangeRateStored" }),
]);
if (!vaultCode || vaultCode === "0x") {
  console.error(`No contract at vault ${vaultAddr} on BSC. Aborting.`);
  process.exit(1);
}
if (vaultAsset.toLowerCase() !== USDC.toLowerCase()) {
  console.error(`Vault asset ${vaultAsset} != USDC ${USDC}. Aborting.`);
  process.exit(1);
}
console.log(`Vault  : ${vaultAddr} (asset USDC verified)`);
console.log(`Market : vUSDC ${VUSDC} (rate ${marketRate}, live)`);
console.log(`Manager: vault itself (immutable, deployer keeps no spending power)`);

const ctorArgs = [USDC, VUSDC, vaultAddr];
let deployGas = null;
try {
  deployGas = await publicClient.estimateGas({
    account: account.address,
    data: encodeDeployData({ abi: artifact.abi, bytecode: artifact.bytecode, args: ctorArgs }),
  });
} catch (e) {
  console.error(`Deployment estimation failed: ${e.message?.slice(0, 300)}`);
  process.exit(1);
}

if (!broadcast) {
  console.log(`Est. deployment gas: ${deployGas} units`);
  console.log("\nDRY-RUN COMPLETE — nothing broadcast.");
  process.exit(0);
}

console.log("\nBroadcasting adapter deployment…");
const deployHash = await walletClient.deployContract({
  abi: artifact.abi,
  bytecode: artifact.bytecode,
  args: ctorArgs,
  chain: bscMainnet,
});
const receipt = await publicClient.waitForTransactionReceipt({ hash: deployHash });
if (!receipt.contractAddress) {
  console.error("No contract address in receipt — resolve manually from the deploy tx.");
  process.exit(1);
}
console.log(`Adapter deployed: ${receipt.contractAddress}`);
console.log("Next: point the vault at it with scripts/vault-strategy.mjs (after review).");
