"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { AlertTriangle, ChevronDown, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Fully functional wallet button (connect, network switch, account, disconnect)
 * backed by RainbowKit. Limited by configuration to two networks only:
 * Robinhood Chain mainnet and BNB Smart Chain mainnet.
 */
export function ConnectWalletButton({ className }: { className?: string }) {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: { opacity: 0, pointerEvents: "none" as const, userSelect: "none" as const },
            })}
            className={cn("flex items-center gap-2", className)}
          >
            {(() => {
              if (!connected) {
                return (
                  <button type="button" onClick={openConnectModal} className="btn-primary !min-h-0 !px-4 !py-2 text-sm">
                    <Wallet size={16} aria-hidden="true" /> Connect Wallet
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    type="button"
                    onClick={openChainModal}
                    className="inline-flex min-h-[36px] items-center gap-1.5 rounded-xl border border-amber-400/40 bg-amber-400/10 px-3.5 py-2 text-sm font-semibold text-amber-200 transition-colors hover:bg-amber-400/15"
                  >
                    <AlertTriangle size={15} aria-hidden="true" /> Wrong network
                  </button>
                );
              }

              return (
                <>
                  <button
                    type="button"
                    onClick={openChainModal}
                    className="inline-flex min-h-[36px] items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/[0.08]"
                    title="Switch network (Robinhood Chain / BNB Chain)"
                  >
                    {chain.iconUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        alt={chain.name ?? "chain icon"}
                        src={chain.iconUrl}
                        style={{ width: 16, height: 16, background: chain.iconBackground, borderRadius: 9999 }}
                      />
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" aria-hidden="true" />
                    )}
                    <span className="hidden xl:inline">{chain.name}</span>
                    <ChevronDown size={14} className="text-muted" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={openAccountModal}
                    className="btn-primary !min-h-0 !px-3.5 !py-2 font-mono text-sm"
                    title="View account and disconnect"
                  >
                    {account.displayName}
                  </button>
                </>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
