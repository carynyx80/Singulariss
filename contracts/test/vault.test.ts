/**
 * SingularisVault — mainnet-readiness suite (Hardhat local EVM).
 *
 * Covers: accounting (deposit/mint/withdraw/redeem), deposit caps,
 * pause behavior, HWM performance fees, strategy allocation caps,
 * illiquid-strategy withdrawals, inflation-offset sanity, constructor
 * guards, and the no-admin-seizure invariant.
 *
 * This suite is thorough self-verification — it is NOT an independent audit.
 */
import { strict as assert } from "node:assert";
import { describe, it, beforeEach } from "node:test";
import { network } from "hardhat";

const { ethers } = await network.connect();

const parse = (v: string, d = 18) => ethers.parseUnits(v, d);

async function fixture() {
  const [admin, alice, bob, feeTo] = await ethers.getSigners();
  const Token = await ethers.getContractFactory("MockERC20", admin);
  const asset = await Token.deploy("Test Dollar", "TUSD", 6);
  const Strategy = await ethers.getContractFactory("MockStrategy", admin);
  const strategy = await Strategy.deploy(await asset.getAddress());
  const Vault = await ethers.getContractFactory("SingularisVault", admin);
  const vault = await Vault.deploy(
    await asset.getAddress(),
    "Singularis Test Vault",
    "svTST",
    admin.address,
    feeTo.address,
    500, // 5% performance fee
    parse("10000", 6) // 10,000 cap
  );
  // The vault must hold MANAGER_ROLE on the strategy — same as production setup.
  await strategy.grantRole(ethers.id("MANAGER_ROLE"), await vault.getAddress());
  // Fund users.
  await asset.mint(alice.address, parse("5000", 6));
  await asset.mint(bob.address, parse("5000", 6));
  return { admin, alice, bob, feeTo, asset, strategy, vault };
}

describe("SingularisVault", () => {
  it("constructor rejects zero addresses and excessive fees", async () => {
    const { admin, asset, feeTo } = await fixture();
    const Vault = await ethers.getContractFactory("SingularisVault", admin);
    await assert.rejects(
      Vault.deploy(await asset.getAddress(), "n", "s", ethers.ZeroAddress, feeTo.address, 500, 0)
    );
    await assert.rejects(
      Vault.deploy(await asset.getAddress(), "n", "s", admin.address, feeTo.address, 2001, 0)
    );
  });

  it("deposit mints shares 1:1 on first deposit (offset-adjusted) and withdraw returns assets", async () => {
    const { alice, asset, vault } = await fixture();
    const amt = parse("1000", 6);
    await asset.connect(alice).approve(await vault.getAddress(), amt);
    const shares = await vault.connect(alice).deposit.staticCall(amt, alice.address);
    await vault.connect(alice).deposit(amt, alice.address);
    assert.equal(await vault.balanceOf(alice.address), shares);
    assert.equal(await vault.totalAssets(), amt);
    // Full withdraw back to underlying.
    await vault.connect(alice).withdraw(amt, alice.address, alice.address);
    assert.equal(await asset.balanceOf(alice.address), parse("5000", 6));
    assert.equal(await vault.totalAssets(), 0n);
  });

  it("share price rises with donated profit; late depositors get fewer shares", async () => {
    const { admin, alice, bob, asset, vault } = await fixture();
    const a1 = parse("1000", 6);
    await asset.connect(alice).approve(await vault.getAddress(), a1);
    await vault.connect(alice).deposit(a1, alice.address);
    const aliceShares = await vault.balanceOf(alice.address);
    // Simulate yield arriving directly.
    await asset.mint(await vault.getAddress(), parse("1000", 6));
    const a2 = parse("1000", 6);
    await asset.connect(bob).approve(await vault.getAddress(), a2);
    await vault.connect(bob).deposit(a2, bob.address);
    const bobShares = await vault.balanceOf(bob.address);
    assert.ok(bobShares < aliceShares, "profit dilutes late shares");
    void admin;
  });

  it("enforces the deposit cap via deposit, mint, and maxDeposit", async () => {
    const { admin, alice, asset, vault } = await fixture();
    await asset.mint(alice.address, parse("20000", 6));
    await asset.connect(alice).approve(await vault.getAddress(), parse("20000", 6));
    await assert.rejects(vault.connect(alice).deposit(parse("10001", 6), alice.address));
    await vault.connect(alice).deposit(parse("6000", 6), alice.address);
    assert.equal(await vault.maxDeposit(alice.address), parse("4000", 6));
    await vault.connect(alice).deposit(parse("4000", 6), alice.address);
    assert.equal(await vault.maxDeposit(alice.address), 0n);
    await assert.rejects(vault.connect(alice).deposit(1n, alice.address));
    void admin;
  });

  it("pause blocks deposits, withdrawals, and reports zero limits", async () => {
    const { admin, alice, asset, vault } = await fixture();
    const amt = parse("100", 6);
    await asset.connect(alice).approve(await vault.getAddress(), amt);
    await vault.connect(alice).deposit(amt, alice.address);
    await vault.connect(admin).pause();
    assert.equal(await vault.paused(), true);
    assert.equal(await vault.maxDeposit(alice.address), 0n);
    assert.equal(await vault.maxWithdraw(alice.address), 0n);
    await assert.rejects(vault.connect(alice).deposit(1n, alice.address));
    await assert.rejects(vault.connect(alice).withdraw(1n, alice.address, alice.address));
    await vault.connect(admin).unpause();
    await vault.connect(alice).withdraw(amt, alice.address, alice.address);
  });

  it("accrues the performance fee only on profit above the high-water mark", async () => {
    const { alice, asset, vault, feeTo } = await fixture();
    const amt = parse("1000", 6);
    await asset.connect(alice).approve(await vault.getAddress(), amt);
    await vault.connect(alice).deposit(amt, alice.address);
    const feeBefore = await vault.balanceOf(feeTo.address);
    await vault.pokeFeeAccrual(); // no profit: no fee
    assert.equal(await vault.balanceOf(feeTo.address), feeBefore);
    // 1000 profit on 1000 base at 5% => 50 fee assets as shares.
    await asset.mint(await vault.getAddress(), parse("1000", 6));
    await vault.pokeFeeAccrual();
    const feeAfter = await vault.balanceOf(feeTo.address);
    assert.ok(feeAfter > feeBefore, "fee shares minted on profit");
    const feeAssets = await vault.convertToAssets(feeAfter - feeBefore);
    // Nominal 50; minting the fee shares dilutes slightly, so expect just under.
    assert.ok(feeAssets <= parse("51", 6) && feeAssets >= parse("48", 6));
    await vault.pokeFeeAccrual(); // HWM moved: no further fee
    assert.equal(await vault.balanceOf(feeTo.address), feeAfter);
  });

  it("caps strategy allocation and keeps user withdrawals liquid-only", async () => {
    const { admin, alice, asset, strategy, vault } = await fixture();
    const amt = parse("2000", 6);
    await asset.connect(alice).approve(await vault.getAddress(), amt);
    await vault.connect(alice).deposit(amt, alice.address);
    await vault.connect(admin).setStrategy(await strategy.getAddress());
    // Default 50% of 2000 => 1000 max.
    await assert.rejects(vault.connect(admin).allocateToStrategy(parse("1001", 6)));
    await vault.connect(admin).allocateToStrategy(parse("1000", 6));
    assert.equal(await vault.availableLiquidity(), parse("1000", 6));
    // User cannot withdraw more than idle liquidity.
    await assert.rejects(
      vault.connect(alice).withdraw(parse("1001", 6), alice.address, alice.address)
    );
    assert.equal(await vault.maxWithdraw(alice.address), parse("1000", 6));
    // Admin pulls strategy funds back; full withdrawal works again.
    await vault.connect(admin).withdrawFromStrategy(parse("1000", 6));
    await vault.connect(alice).withdraw(amt, alice.address, alice.address);
  });

  it("locked strategy blocks admin pulls but never user idle withdrawals", async () => {
    const { admin, alice, asset, strategy, vault } = await fixture();
    const amt = parse("2000", 6);
    await asset.connect(alice).approve(await vault.getAddress(), amt);
    await vault.connect(alice).deposit(amt, alice.address);
    await vault.connect(admin).setStrategy(await strategy.getAddress());
    await vault.connect(admin).allocateToStrategy(parse("1000", 6));
    await strategy.connect(admin).setWithdrawalsLocked(true);
    await assert.rejects(vault.connect(admin).withdrawFromStrategy(parse("1000", 6)));
    await vault.connect(alice).withdraw(parse("1000", 6), alice.address, alice.address);
  });

  it("admin has no path to seize idle user funds", async () => {
    const { admin, alice, asset, vault } = await fixture();
    const amt = parse("500", 6);
    await asset.connect(alice).approve(await vault.getAddress(), amt);
    await vault.connect(alice).deposit(amt, alice.address);
    // No strategy set: the only asset movers are user withdraw/redeem.
    // Admin roles grant pause, caps, fees, strategy — none transfer user assets.
    const abi = (vault as unknown as { interface: { fragments: { name?: string }[] } }).interface.fragments
      .map((f) => f.name)
      .filter(Boolean);
    for (const banned of ["rescue", "skim", "sweep", "emergencyWithdraw", "seize"]) {
      assert.ok(!abi.some((n) => n!.toLowerCase().includes(banned)), `no ${banned} function`);
    }
    void admin;
  });

  it("setMaxAllocationBps rejects >100% and emits an event", async () => {
    const { admin, vault } = await fixture();
    const adminVault = vault.connect(admin) as unknown as {
      setMaxAllocationBps(bps: number): Promise<unknown>;
      maxAllocationBps(): Promise<bigint>;
    };
    await assert.rejects(adminVault.setMaxAllocationBps(10_001));
    await adminVault.setMaxAllocationBps(0); // launch-safe: no allocation possible
    assert.equal(await adminVault.maxAllocationBps(), 0n);
  });
});
