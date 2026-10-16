import { BorrowTab } from "@/components/landing/BorrowTab";

export const metadata = {
  title: "Borrow — Singularis",
  description:
    "Borrow USDC or BNB against collateral on BNB Chain through the audited Venus Core Pool.",
};

export default function BorrowPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-10 sm:px-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-bright">Borrowing</p>
        <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">Borrow against collateral</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Live on BNB Chain through the audited Venus Core Pool: supply BNB or USDC as
          collateral, borrow within your limit, repay anytime. Borrowing beyond your limit or a
          price drop can trigger liquidation — never borrow more than you can repay.
        </p>
      </div>
      <BorrowTab />
    </div>
  );
}
