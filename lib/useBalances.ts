"use client";

import { useMemo } from "react";
import { useAccount, useBalance, useChainId, useReadContracts } from "wagmi";
import { formatUnits } from "viem";
import { ERC20_ABI, assetsForChain, type SupportedAsset } from "./tokens";

export interface AssetBalance {
  asset: SupportedAsset;
  /** Raw balance, null while loading or on error. */
  value: bigint | null;
  /** Human-readable, e.g. "2.40". Null while loading. */
  formatted: string | null;
  isLoading: boolean;
  isError: boolean;
}

/**
 * Live balances of the connected wallet for the supported assets
 * on the active chain (ETH+USDG on Robinhood, BNB+USDC on BSC).
 * Returns an empty list when disconnected or on an unsupported chain.
 */
export function useAssetBalances(): {
  address: `0x${string}` | undefined;
  chainId: number;
  balances: AssetBalance[];
  isLoading: boolean;
  refetch: () => void;
} {
  const { address } = useAccount();
  const chainId = useChainId();
  const assets = useMemo(() => assetsForChain(chainId), [chainId]);

  const native = assets.find((a) => a.kind === "native");
  const erc20s = useMemo(() => assets.filter((a) => a.kind === "erc20"), [assets]);

  const nativeQuery = useBalance({
    address,
    chainId,
    query: { enabled: !!address && !!native },
  });

  const erc20Query = useReadContracts({
    contracts: erc20s.map((t) => ({
      address: t.kind === "erc20" ? t.address : undefined,
      abi: ERC20_ABI,
      functionName: "balanceOf",
      args: address ? [address] : undefined,
      chainId,
    })),
    query: { enabled: !!address && erc20s.length > 0 },
  });

  const balances: AssetBalance[] = useMemo(
    () =>
      assets.map((asset) => {
        if (asset.kind === "native") {
          const v = nativeQuery.data?.value ?? null;
          return {
            asset,
            value: v,
            formatted: v === null ? null : formatUnits(v, asset.decimals),
            isLoading: nativeQuery.isLoading,
            isError: nativeQuery.isError,
          };
        }
        const idx = erc20s.indexOf(asset);
        const result = erc20Query.data?.[idx];
        const v =
          result && result.status === "success" ? (result.result as bigint) : null;
        return {
          asset,
          value: v,
          formatted: v === null ? null : formatUnits(v, asset.decimals),
          isLoading: erc20Query.isLoading,
            isError: erc20Query.isError || (result !== undefined && result.status === "failure"),
        };
      }),
    [assets, erc20s, nativeQuery, erc20Query]
  );

  return {
    address,
    chainId,
    balances,
    isLoading: nativeQuery.isLoading || erc20Query.isLoading,
    refetch: () => {
      void nativeQuery.refetch();
      void erc20Query.refetch();
    },
  };
}
