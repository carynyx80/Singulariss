"use client";

import { useState } from "react";
import { ArrowUpRight, Check, Copy, Rocket } from "lucide-react";
import { Reveal } from "./Reveal";

const UPCOMING_CA = "0xa115218919f75fef363daafed4cb2965f43b2c2c";
const EXPLORER = `https://bscscan.com/address/${UPCOMING_CA}`;

export function ComingSoon() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(UPCOMING_CA);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section aria-label="Upcoming BNB Chain contract">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <Reveal>
          <div className="flex flex-col gap-3 rounded-2xl border border-[#10B981]/25 bg-[#10B981]/[0.05] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <p className="inline-flex items-center gap-2.5 text-sm">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#10B981]/15 text-accent-bright">
                <Rocket size={17} aria-hidden="true" />
              </span>
              <span>
                <span className="font-semibold text-white">Upcoming contract on BNB Chain — coming soon. </span>
                <span className="text-muted">Nothing is live at this address yet.</span>
              </span>
            </p>
            <div className="flex items-center gap-2">
              <code className="num hidden truncate rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5 text-xs text-white/85 md:block">
                {UPCOMING_CA.slice(0, 10)}…{UPCOMING_CA.slice(-8)}
              </code>
              <button
                type="button"
                onClick={copy}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                {copied ? <Check size={13} aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />}
                {copied ? "Copied" : "Copy CA"}
              </button>
              <a
                href={EXPLORER}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs font-semibold text-accent-bright transition-colors hover:bg-white/[0.06]"
              >
                BscScan <ArrowUpRight size={13} aria-hidden="true" />
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
