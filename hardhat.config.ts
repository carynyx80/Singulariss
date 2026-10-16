import { defineConfig } from "hardhat/config";
import hardhatEthers from "@nomicfoundation/hardhat-ethers";
import hardhatNodeTestRunner from "@nomicfoundation/hardhat-node-test-runner";

/**
 * Hardhat 3 config — local EVM test runs only.
 * No mainnet keys, no forking, no deployment from here.
 * Mainnet deploys use scripts/deploy-mainnet.mjs (viem) with explicit flags.
 */
export default defineConfig({
  plugins: [hardhatEthers, hardhatNodeTestRunner],
  solidity: {
    version: "0.8.28",
    settings: { optimizer: { enabled: true, runs: 200 }, evmVersion: "cancun" },
  },
  paths: {
    sources: "./contracts/src",
    tests: "./contracts/test",
    artifacts: "./contracts/hh-artifacts",
    cache: "./contracts/hh-cache",
  },
});
