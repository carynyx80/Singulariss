import { LogoMark } from "./LogoMark";

const COLUMNS = [
  {
    title: "Protocol",
    links: [
      { label: "Markets overview", href: "#markets" },
      { label: "How it works", href: "#how-it-works" },
      { label: "Dashboard preview", href: "#preview" },
    ],
  },
  {
    title: "Ecosystem",
    links: [
      { label: "Networks", href: "#ecosystem" },
      { label: "$TITAN concept", href: "#titan" },
      { label: "Security & risk", href: "#risk" },
    ],
  },
  {
    title: "Documentation",
    links: [
      { label: "Product overview", href: "#markets" },
      { label: "Strategies (preview)", href: "#strategies" },
      { label: "Live wallet", href: "/preview" },
    ],
  },
  {
    title: "Risk Disclosure",
    links: [
      { label: "Risk overview", href: "#risk" },
      { label: "About the vision", href: "#about" },
      { label: "Back to top", href: "#top" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-white/[0.07] bg-[#060807]">
      <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <LogoMark size={34} />
              <span className="text-sm font-bold tracking-[0.22em] text-white">SINGULARIS</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
              A multichain capital protocol: live wallet balances and transfers on Robinhood
              Chain and BNB Chain today; collateralized borrowing, lending, and approved yield
              strategies to follow after contracts deploy.
            </p>
            <p className="mt-4 inline-flex">
              <span className="status-chip">Live transfers · Lending not deployed</span>
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                  {col.title}
                </p>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        className="text-sm text-muted transition-colors hover:text-white"
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-white/[0.07] pt-6 text-xs leading-relaxed text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Singularis. Balances shown are live on-chain data.</p>
          <p>Protocol contracts not audited or deployed. No token exists.</p>
        </div>
      </div>
    </footer>
  );
}
