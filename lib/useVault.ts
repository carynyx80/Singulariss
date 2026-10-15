"use client";

import { useEffect, useState, useCallback } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { getContract, formatUnits, parseUnits } from "viem";
import { erc20Abi, vaultAbi } from "@/lib/contracts";

export interface VaultReads {
  assetAddr: `0x${string}` | null;
  totalAssets: bigint | null;
  totalSupply: bigint | null;
  shareBalance: bigint | null;
  assetBalance: bigint | null;
  allowance: bigint | null;
  maxDeposit: bigint | null;
  maxWithdraw: bigint | null;
  paused: boolean | null;
  liquidity: bigint | null;
  error: string | null;
  loading: boolean;
  refetch: () => void;
}

export function useVaultReads(vaultAddr: string | null, assetDecimals: number): VaultReads {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [state, setState] = useState<Omit<VaultReads, "refetch">>({
    assetAddr: null, totalAssets: null, totalSupply: null, shareBalance: null,
    assetBalance: null, allowance: null, maxDeposit: null, maxWithdraw: null,
    paused: null, liquidity: null, error: null, loading: !!vaultAddr,
  });
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!vaultAddr || !publicClient || !/^0x[0-9a-fA-F]{40}$/.test(vaultAddr)) {
        setState((s) => ({ ...s, loading: false, error: vaultAddr ? "Invalid vault address" : null }));
        return;
      }
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const vault = getContract({ address: vaultAddr as `0x${string}`, abi: vaultAbi, client: publicClient });
        const [assetAddr, totalAssets, totalSupply, paused, liquidity] = await Promise.all([
          vault.read.asset(),
          vault.read.totalAssets(),
          vault.read.totalSupply(),
          vault.read.paused(),
          vault.read.availableLiquidity(),
        ]);
        let shareBalance: bigint | null = null;
        let assetBalance: bigint | null = null;
        let allowance: bigint | null = null;
        let maxDeposit: bigint | null = null;
        let maxWithdraw: bigint | null = null;
        if (address) {
          const [sb, md, mw] = await Promise.all([
            vault.read.balanceOf([address]),
            vault.read.maxDeposit([address]),
            vault.read.maxWithdraw([address]),
          ]);
          shareBalance = sb as bigint; maxDeposit = md as bigint; maxWithdraw = mw as bigint;
        }
        if (assetAddr && address) {
          const erc = getContract({ address: assetAddr as `0x${string}`, abi: erc20Abi, client: publicClient });
          const [ab, al] = await Promise.all([
            erc.read.balanceOf([address]),
            erc.read.allowance([address, vaultAddr as `0x${string}`]),
          ]);
          assetBalance = ab as bigint; allowance = al as bigint;
        }
        if (!cancelled) {
          setState({
            assetAddr: assetAddr as `0x${string}`, totalAssets: totalAssets as bigint,
            totalSupply: totalSupply as bigint, shareBalance, assetBalance, allowance,
            maxDeposit, maxWithdraw, paused: paused as boolean, liquidity: liquidity as bigint,
            error: null, loading: false,
          });
        }
      } catch (e) {
        if (!cancelled) setState((s) => ({ ...s, loading: false, error: e instanceof Error ? e.message.slice(0, 200) : "Contract read failed" }));
      }
    }
    load();
    return () => { cancelled = true; };
  }, [vaultAddr, address, publicClient, nonce, assetDecimals]);

  const refetch = useCallback(() => setNonce((n) => n + 1), []);
  return { ...state, refetch };
}

export type TxStage = "idle" | "awaiting-approval" | "pending" | "success" | "error";

export function useVaultTx(vaultAddr: string | null, assetAddr: `0x${string}` | null) {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const [stage, setStage] = useState<TxStage>("idle");
  const [hash, setHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function ensureAllowance(amount: bigint): Promise<boolean> {
    if (!assetAddr || !address || !walletClient || !publicClient || !vaultAddr) return false;
    const erc = getContract({ address: assetAddr, abi: erc20Abi, client: publicClient });
    const cur = (await erc.read.allowance([address, vaultAddr as `0x${string}`])) as bigint;
    if (cur >= amount) return true;
    setStage("awaiting-approval");
    const werc = getContract({ address: assetAddr, abi: erc20Abi, client: walletClient });
    const h = await werc.write.approve([vaultAddr as `0x${string}`, amount]);
    await publicClient.waitForTransactionReceipt({ hash: h });
    return true;
  }

  async function deposit(assets: bigint) {
    setError(null); setHash(null);
    try {
      if (!vaultAddr || !address || !walletClient || !publicClient) throw new Error("Connect wallet and vault first.");
      if (assets <= 0n) throw new Error("Enter an amount greater than zero.");
      await ensureAllowance(assets);
      setStage("pending");
      const vault = getContract({ address: vaultAddr as `0x${string}`, abi: vaultAbi, client: walletClient });
      const h = await vault.write.deposit([assets, address]);
      setHash(h);
      await publicClient.waitForTransactionReceipt({ hash: h });
      setStage("success");
    } catch (e) {
      setStage("error");
      setError(e instanceof Error ? e.message.slice(0, 300) : "Deposit failed");
    }
  }

  async function withdrawAssets(assets: bigint) {
    setError(null); setHash(null);
    try {
      if (!vaultAddr || !address || !walletClient || !publicClient) throw new Error("Connect wallet and vault first.");
      if (assets <= 0n) throw new Error("Enter an amount greater than zero.");
      setStage("pending");
      const vault = getContract({ address: vaultAddr as `0x${string}`, abi: vaultAbi, client: walletClient });
      const h = await vault.write.withdraw([assets, address, address]);
      setHash(h);
      await publicClient.waitForTransactionReceipt({ hash: h });
      setStage("success");
    } catch (e) {
      setStage("error");
      setError(e instanceof Error ? e.message.slice(0, 300) : "Withdraw failed");
    }
  }

  function reset() { setStage("idle"); setHash(null); setError(null); }

  return { stage, hash, error, deposit, withdrawAssets, reset,
    fmtAssets: (v: bigint | null, d: number) => (v === null ? "—" : formatUnits(v, d)),
    parse: (s: string, d: number) => { try { return parseUnits(s, d); } catch { return null; } } };
}
