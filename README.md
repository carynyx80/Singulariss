# SINGULARIS — Capital in motion.

Non-custodial multi-chain yield vault protocol. Robinhood Chain first, BNB Smart Chain second.

> Contracts are **unaudited testnet drafts**. No mainnet deployment, no real funds, without audit + explicit human approval. No fabricated TVL/APY — the UI shows only configured or on-chain values.

## Stage A — Repository state (2026-10-15)

Existing workspace (`C:\Users\HP\Documents\Default Project`) contained unrelated projects: Pondex indexer, portfolio site, `byteforge`/`bytelabs`/`hook-labs`/`levium`/`opveil` experiments. Nothing for SINGULARIS existed. `levium/` was reused as a structural reference (Next.js 14 + wagmi/viem patterns) — no code was blindly replaced; SINGULARIS lives in `singularis/` as a fresh, self-contained app.

Network parameters verified against official docs:
- Robinhood Chain: https://docs.robinhood.com/chain/connecting — mainnet **4663**, testnet **46630**, gas ETH.
- BNB Smart Chain: https://docs.bnbchain.org — mainnet **56**, testnet **97**, gas BNB/tBNB. Target is BSC, not opBNB.

## Quickstart

```powershell
Copy-Item .env.example .env.local
& "C:\Program Files\nodejs\npm.cmd" install
& "C:\Program Files\nodejs\npm.cmd" run dev
# open http://localhost:3000
```

Scripts: `dev | build | start | typecheck | test | compile | rpc:check`

## Layout

- `app/` — `/`, `/app`, `/vaults`, `/vaults/[id]`, `/portfolio`, `/staking` (disabled preview), `/docs`, `/terms`
- `components/` — Providers (wagmi/RainbowKit), Navbar, VaultActions (approve→deposit→withdraw flow)
- `lib/` — `chains.ts` (per-chain config), `vaults.ts`, `strategy-registry.ts`, `contracts.ts` ABIs, `vault-math.ts`, `useVault.ts`
- `contracts/src/` — `SingularisVault.sol`, `MockStrategy.sol` (dev only), `MockERC20.sol`
- `scripts/` — `compile.mjs` (solc-js, no forge binary needed), `rpc-check.mjs`
- `tests/` — vault-math + chain/registry honesty

## Testnet deployment (requires explicit approval)

1. `node scripts/rpc-check.mjs` — all endpoints must report correct chain IDs.
2. Fund deployer from faucet (Robinhood testnet faucet) — test ETH only.
3. Deploy MockERC20 → MockStrategy → SingularisVault with cap + 5% fee proposal.
4. Record addresses in `.env.local` (`NEXT_PUBLIC_VAULT_*`), never commit secrets.
5. End-to-end: approve → deposit → check shares → withdraw → explorer links.

Production deploys stay disabled (`enabled: false` for mainnets) until audit + approval.

## What is NOT done

- No $SING token (design proposal in `docs/TOKEN-DESIGN.md`, not implemented).
- No verified real-yield adapter (Morpho/Uniswap entries are Planned/Under review, no addresses).
- No audit, no mainnet, no bridge, no Swarm orchestration.
- Foundry tests: `foundry.toml` provided; `forge` not installed on Windows builder — TypeScript `vault-math` tests mirror contract formulas; run `forge test` where Foundry is available after adding `test/*.t.sol`.
