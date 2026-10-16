/**
 * Lock a deployed SingularisVault to its launch-safe posture:
 * maxAllocationBps = 0 (strategy allocation impossible until an adapter
 * is reviewed and the allocation is deliberately raised).
 *
 * Usage (broadcasts ONE real admin transaction — the signer must hold
 * DEFAULT_ADMIN_ROLE on the vault, i.e. the original deployer):
 *
 *   node scripts/vault-lock.mjs --chain robinhood --vault 0x...
 *   node scripts/vault-lock.mjs --chain bsc --vault 0x...
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
    blockExplorers: {
      default: {
        name: "Blockscout",
        url: process.env.NEXT_PUBLIC_ROBINHOOD_MAINNET_EXPLORER || "https://robinhoodchain.blockscout.com",
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
    blockExplorers: {
      default: { name: "BscScan", url: "https://bscscan.com" },
    },
  }),
};

const args = process.argv.slice(2);
function opt(name, fallback) {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
}

const which = opt("--chain", "");
const vaultAddr = opt("--vault", "");
const chain = CHAINS[which];
if (!chain || !/^0x[0-9a-fA-F]{40}$/.test(vaultAddr)) {
  console.error("Usage: node scripts/vault-lock.mjs --chain robinhood|bsc --vault 0x...");
  process.exit(1);
}

const key = process.env.DEPLOYER_PRIVATE_KEY;
if (!key || !/^0x[0-9a-fA-F]{64}$/.test(key)) {
  console.error("Set DEPLOYER_PRIVATE_KEY in the environment (admin signer). Never commit it.");
  process.exit(1);
}
const account = privateKeyToAccount(key);
const publicClient = createPublicClient({ chain, transport: http() });
const walletClient = createWalletClient({ account, chain, transport: http() });

const onChainId = await publicClient.getChainId();
if (onChainId !== chain.id) {
  console.error(`RPC chain ${onChainId} != expected ${chain.id}. Aborting.`);
  process.exit(1);
}
const code = await publicClient.getBytecode({ address: vaultAddr });
if (!code || code === "0x") {
  console.error(`No contract at ${vaultAddr} on chain ${chain.id}. Aborting.`);
  process.exit(1);
}

const before = await publicClient.readContract({
  address: vaultAddr,
  abi: artifact.abi,
  functionName: "maxAllocationBps",
});
console.log(`Current maxAllocationBps: ${before}`);
if (before === 0n) {
  console.log("Already locked. Nothing to do.");
  process.exit(0);
}

const hash = await walletClient.writeContract({
  address: vaultAddr,
  abi: artifact.abi,
  functionName: "setMaxAllocationBps",
  args: [0],
  chain,
});
console.log(`Lock tx: ${hash}`);
const receipt = await publicClient.waitForTransactionReceipt({ hash });
if (receipt.status !== "success") {
  console.error("Lock transaction FAILED on-chain. Investigate before proceeding.");
  process.exit(1);
}
const after = await publicClient.readContract({
  address: vaultAddr,
  abi: artifact.abi,
  functionName: "maxAllocationBps",
});
console.log(`Verified maxAllocationBps: ${after}`);
if (after !== 0n) {
  console.error("Verification mismatch — investigate before proceeding.");
  process.exit(1);
}
console.log("Vault locked: no strategy allocation possible.");
