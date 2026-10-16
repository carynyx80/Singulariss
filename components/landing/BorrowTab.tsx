"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { formatUnits } from "viem";
import {
  useAccount,
  useChainId,
  useReadContracts,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import {
  COMPTROLLER_ABI,
  VBNB_ABI,
  VENUS_CHAIN_ID,
  VENUS_COMPTROLLER,
  VENUS_VBNB,
  VENUS_VUSDC,
  VTOKEN_ABI,
  ratePerBlockToNominalApy,
} from "@/lib/venus";
import { USDC_BSC } from "@/lib/tokens";
import { ERC20_ABI } from "@/lib/tokens";
import { friendlyError, parseUnitsStrict, shortAddr } from "@/lib/utils";
import { cn } from "@/lib/utils";

function fmtApy(rate: bigint | undefined): string {
  if (rate === undefined) return "…";
  return `${ratePerBlockToNominalApy(rate).toFixed(2)}%`;
}

export function BorrowTab() {
  const { address } = useAccount();
  const chainId = useChainId();
  const [supplyAsset, setSupplyAsset] = useState<"BNB" | "USDC">("BNB");
  const [supplyAmount, setSupplyAmount] = useState("");
  const [borrowAsset, setBorrowAsset] = useState<"BNB" | "USDC">("USDC");
  const [borrowAmount, setBorrowAmount] = useState("");
  const [repayAmount, setRepayAmount] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const { writeContract, data: hash, error: writeError, isPending, reset } = useWriteContract();
  const receipt = useWaitForTransactionReceipt({ hash, chainId });

  const live = chainId === VENUS_CHAIN_ID;
  const q = { enabled: live, refetchInterval: 20000 } as const;

  const usdcRates = useReadContracts({
    contracts: [
      { address: VENUS_VUSDC, abi: VTOKEN_ABI, functionName: "supplyRatePerBlock", chainId: VENUS_CHAIN_ID },
      { address: VENUS_VUSDC, abi: VTOKEN_ABI, functionName: "borrowRatePerBlock", chainId: VENUS_CHAIN_ID },
    ],
    query: q,
  });
  const bnbRates = useReadContracts({
    contracts: [
      { address: VENUS_VBNB, abi: VBNB_ABI, functionName: "supplyRatePerBlock", chainId: VENUS_CHAIN_ID },
      { address: VENUS_VBNB, abi: VBNB_ABI, functionName: "borrowRatePerBlock", chainId: VENUS_CHAIN_ID },
    ],
    query: q,
  });
  const usdcUser = useReadContracts({
    contracts: address
      ? [
          { address: VENUS_VUSDC, abi: VTOKEN_ABI, functionName: "balanceOf", args: [address], chainId: VENUS_CHAIN_ID },
          { address: VENUS_VUSDC, abi: VTOKEN_ABI, functionName: "exchangeRateStored", chainId: VENUS_CHAIN_ID },
          { address: VENUS_VUSDC, abi: VTOKEN_ABI, functionName: "borrowBalanceStored", args: [address], chainId: VENUS_CHAIN_ID },
        ]
      : [],
    query: q,
  });
  const bnbUser = useReadContracts({
    contracts: address
      ? [
          { address: VENUS_VBNB, abi: VBNB_ABI, functionName: "balanceOf", args: [address], chainId: VENUS_CHAIN_ID },
          { address: VENUS_VBNB, abi: VBNB_ABI, functionName: "exchangeRateStored", chainId: VENUS_CHAIN_ID },
          { address: VENUS_VBNB, abi: VBNB_ABI, functionName: "borrowBalanceStored", args: [address], chainId: VENUS_CHAIN_ID },
        ]
      : [],
    query: q,
  });
  const acct = useReadContracts({
    contracts: address
      ? [
          { address: VENUS_COMPTROLLER, abi: COMPTROLLER_ABI, functionName: "getAccountLiquidity", args: [address], chainId: VENUS_CHAIN_ID },
          { address: VENUS_COMPTROLLER, abi: COMPTROLLER_ABI, functionName: "getAssetsIn", args: [address], chainId: VENUS_CHAIN_ID },
        ]
      : [],
    query: q,
  });

  const d = useMemo(() => {
    const one = (r: { status: string; result?: unknown } | undefined) =>
      r && r.status === "success" ? (r.result as bigint) : undefined;
    const get = (data: readonly { status: string; result?: unknown }[] | undefined, i: number) =>
      one(data?.[i]);
    return {
      usdcSupply: get(usdcRates.data, 0), usdcBorrow: get(usdcRates.data, 1),
      bnbSupply: get(bnbRates.data, 0), bnbBorrow: get(bnbRates.data, 1),
      vUsdcBal: get(usdcUser.data, 0), usdcRate: get(usdcUser.data, 1), usdcDebt: get(usdcUser.data, 2),
      vBnbBal: get(bnbUser.data, 0), bnbRate: get(bnbUser.data, 1), bnbDebt: get(bnbUser.data, 2),
      liquidity: (() => {
        const r = acct.data?.[0];
        return r && r.status === "success" ? (r.result as [bigint, bigint, bigint]) : undefined;
      })(),
      assetsIn: (() => {
        const r = acct.data?.[1];
        return r && r.status === "success" ? (r.result as `0x${string}`[]) : undefined;
      })(),
    };
  }, [usdcRates.data, bnbRates.data, usdcUser.data, bnbUser.data, acct.data]);

  if (chainId !== VENUS_CHAIN_ID) {
    return (
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-8 text-center">
        <p className="font-semibold text-white">Borrowing lives on BNB Chain</p>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted">
          Collateralized borrowing runs on the audited Venus Core Pool, which exists only on BNB
          Smart Chain. Switch networks from the wallet menu to borrow. Robinhood Chain has no
          audited lending venue integrated yet.
        </p>
      </div>
    );
  }

  const suppliedUsdc = d.vUsdcBal !== undefined && d.usdcRate !== undefined
    ? (d.vUsdcBal * d.usdcRate) / 10n ** 18n : undefined;
  const suppliedBnb = d.vBnbBal !== undefined && d.bnbRate !== undefined
    ? (d.vBnbBal * d.bnbRate) / 10n ** 18n : undefined;
  const liquidity = d.liquidity?.[1];
  const shortfall = d.liquidity?.[2];
  const inUsdc = d.assetsIn?.some((a) => a.toLowerCase() === VENUS_VUSDC.toLowerCase()) ?? false;
  const inBnb = d.assetsIn?.some((a) => a.toLowerCase() === VENUS_VBNB.toLowerCase()) ?? false;
  const busy = isPending || receipt.isLoading;

  function submit(fn: () => void) {
    setFormError(null);
    reset();
    fn();
  }

  function doSupply() {
    const dec = supplyAsset === "USDC" ? 18 : 18;
    const value = parseUnitsStrict(supplyAmount, dec);
    if (value === null || value <= 0n) return setFormError(`Enter an amount of ${supplyAsset} greater than 0.`);
    submit(() => {
      if (supplyAsset === "BNB") {
        writeContract({ address: VENUS_VBNB, abi: VBNB_ABI, functionName: "mint", chainId: VENUS_CHAIN_ID, value } as never);
      } else {
        writeContract({ address: USDC_BSC.address, abi: ERC20_ABI, functionName: "approve", args: [VENUS_VUSDC, value], chainId: VENUS_CHAIN_ID } as never, {
          onSuccess: () => writeContract({ address: VENUS_VUSDC, abi: VTOKEN_ABI, functionName: "mint", args: [value], chainId: VENUS_CHAIN_ID } as never),
          onError: (e) => setFormError(friendlyError(e)),
        });
      }
    });
  }

  function doEnter(asset: "BNB" | "USDC") {
    submit(() => {
      writeContract({
        address: VENUS_COMPTROLLER, abi: COMPTROLLER_ABI, functionName: "enterMarkets",
        args: [[asset === "BNB" ? VENUS_VBNB : VENUS_VUSDC]], chainId: VENUS_CHAIN_ID,
      } as never);
    });
  }

  function doBorrow() {
    const value = parseUnitsStrict(borrowAmount, 18);
    if (value === null || value <= 0n) return setFormError(`Enter an amount of ${borrowAsset} greater than 0.`);
    submit(() => {
      writeContract({
        address: borrowAsset === "USDC" ? VENUS_VUSDC : VENUS_VBNB,
        abi: borrowAsset === "USDC" ? VTOKEN_ABI : VBNB_ABI,
        functionName: "borrow", args: [value], chainId: VENUS_CHAIN_ID,
      } as never);
    });
  }

  function doRepay() {
    const value = parseUnitsStrict(repayAmount, 18);
    if (value === null || value <= 0n) return setFormError("Enter a repay amount greater than 0.");
    submit(() => {
      if (borrowAsset === "BNB") {
        writeContract({ address: VENUS_VBNB, abi: VBNB_ABI, functionName: "repayBorrow", chainId: VENUS_CHAIN_ID, value } as never);
      } else {
        writeContract({ address: USDC_BSC.address, abi: ERC20_ABI, functionName: "approve", args: [VENUS_VUSDC, value], chainId: VENUS_CHAIN_ID } as never, {
          onSuccess: () => writeContract({ address: VENUS_VUSDC, abi: VTOKEN_ABI, functionName: "repayBorrow", args: [value], chainId: VENUS_CHAIN_ID } as never),
          onError: (e) => setFormError(friendlyError(e)),
        });
      }
    });
  }

  const err = formError ?? (writeError ? friendlyError(writeError) : null);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {([
          { s: "USDC", sup: d.usdcSupply, bor: d.usdcBorrow, bal: suppliedUsdc, debt: d.usdcDebt, dec: 18 },
          { s: "BNB", sup: d.bnbSupply, bor: d.bnbBorrow, bal: suppliedBnb, debt: d.bnbDebt, dec: 18 },
        ] as const).map((m) => (
          <div key={m.s} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
            <p className="font-semibold text-white">{m.s} market <span className="text-xs font-normal text-muted">· Venus live rates</span></p>
            <div className="num mt-3 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-lg border border-white/[0.06] px-2.5 py-2">
                <p className="text-[11px] uppercase tracking-wider text-muted">Supply APY</p>
                <p className="font-bold text-[#6EE7B7]">{fmtApy(m.sup)}</p>
              </div>
              <div className="rounded-lg border border-white/[0.06] px-2.5 py-2">
                <p className="text-[11px] uppercase tracking-wider text-muted">Borrow APY</p>
                <p className="font-bold text-white">{fmtApy(m.bor)}</p>
              </div>
            </div>
            {address && (
              <div className="num mt-2 text-xs text-muted">
                Supplied: {m.bal === undefined ? "…" : formatUnits(m.bal, m.dec)} {m.s} · Borrowed:{" "}
                {m.debt === undefined ? "…" : formatUnits(m.debt, m.dec)} {m.s}
              </div>
            )}
          </div>
        ))}
      </div>

      {address && (
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
          <p className="text-xs uppercase tracking-wider text-muted">Borrow health · live</p>
          {shortfall !== undefined && shortfall > 0n ? (
            <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-rose-300">
              <AlertTriangle size={15} aria-hidden="true" /> Underwater — repay or add collateral to avoid liquidation.
            </p>
          ) : (
            <p className="num mt-2 text-sm text-white/85">
              Available liquidity: {liquidity === undefined ? "…" : `$${formatUnits(liquidity, 18)}`}
            </p>
          )}
          <p className="mt-1 text-xs text-muted">
            Rates are nominal from live per-block values. Borrowing beyond your limit or a price
            drop can trigger liquidation by third-party liquidators — that is how Venus stays solvent.
          </p>
        </div>
      )}

      {!address ? (
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 text-center text-sm text-muted">
          Connect a wallet on BNB Chain to supply collateral and borrow.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
            <p className="text-xs uppercase tracking-wider text-muted">1 · Supply collateral</p>
            <div className="mt-3 flex gap-2">
              {(["BNB", "USDC"] as const).map((a) => (
                <button key={a} type="button" onClick={() => setSupplyAsset(a)}
                  className={cn("flex-1 rounded-xl border px-3 py-2 text-sm font-semibold",
                    supplyAsset === a ? "border-[#10B981]/50 bg-[#10B981]/10 text-white" : "border-white/10 text-muted hover:text-white")}>
                  {a}
                </button>
              ))}
            </div>
            <input className="input num mt-3" placeholder="0.00" inputMode="decimal" value={supplyAmount} onChange={(e) => setSupplyAmount(e.target.value)} />
            <button type="button" onClick={doSupply} disabled={busy} className="btn-primary mt-3 w-full">
              {busy ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : `Supply ${supplyAsset}`}
            </button>
            <div className="mt-3 flex gap-2 text-xs">
              <button type="button" onClick={() => doEnter("BNB")} disabled={busy || inBnb}
                className="flex-1 rounded-lg border border-white/10 px-2 py-2 font-medium text-muted hover:text-white disabled:opacity-50">
                {inBnb ? "BNB collateral ✓" : "Enable BNB collateral"}
              </button>
              <button type="button" onClick={() => doEnter("USDC")} disabled={busy || inUsdc}
                className="flex-1 rounded-lg border border-white/10 px-2 py-2 font-medium text-muted hover:text-white disabled:opacity-50">
                {inUsdc ? "USDC collateral ✓" : "Enable USDC collateral"}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
            <p className="text-xs uppercase tracking-wider text-muted">2 · Borrow & repay</p>
            <div className="mt-3 flex gap-2">
              {(["USDC", "BNB"] as const).map((a) => (
                <button key={a} type="button" onClick={() => setBorrowAsset(a)}
                  className={cn("flex-1 rounded-xl border px-3 py-2 text-sm font-semibold",
                    borrowAsset === a ? "border-[#10B981]/50 bg-[#10B981]/10 text-white" : "border-white/10 text-muted hover:text-white")}>
                  {a}
                </button>
              ))}
            </div>
            <label className="label mt-3" htmlFor="bw-amt">Borrow {borrowAsset}</label>
            <div className="flex gap-2">
              <input id="bw-amt" className="input num" placeholder="0.00" inputMode="decimal" value={borrowAmount} onChange={(e) => setBorrowAmount(e.target.value)} />
              <button type="button" onClick={doBorrow} disabled={busy} className="btn-primary shrink-0">Borrow</button>
            </div>
            <label className="label mt-3" htmlFor="rp-amt">Repay {borrowAsset}</label>
            <div className="flex gap-2">
              <input id="rp-amt" className="input num" placeholder="0.00" inputMode="decimal" value={repayAmount} onChange={(e) => setRepayAmount(e.target.value)} />
              <button type="button" onClick={doRepay} disabled={busy} className="btn-ghost shrink-0">Repay</button>
            </div>
          </div>
        </div>
      )}

      {err && <p className="text-sm text-rose-300">{err}</p>}
      {hash && (
        <div className="rounded-xl border border-[#10B981]/25 bg-[#10B981]/[0.06] p-3.5 text-sm">
          {receipt.isSuccess ? (
            <p className="inline-flex items-center gap-1.5 font-semibold text-white">
              <CheckCircle2 size={16} className="text-accent-bright" aria-hidden="true" /> Confirmed on Venus
            </p>
          ) : (
            <p className="inline-flex items-center gap-1.5 text-white/85">
              <Loader2 size={15} className="animate-spin" aria-hidden="true" /> Submitted — waiting for confirmation…
            </p>
          )}
          <p className="num mt-1 break-all text-xs text-muted">{hash}</p>
          <p className="mt-1 text-xs text-muted">Your position is {shortAddr(address ?? "")} on the audited Venus Core Pool.</p>
        </div>
      )}
    </div>
  );
}
