/**
 * VenusAdapter — unit suite against a mock Venus market (Hardhat local EVM).
 * Production target: vUSDC 0xeca88125a5ADbe82614ffC12D0DB554E2e2867c8,
 * Comptroller 0xfD36E2c2a6789Db23113685031d7F16329158384 (both verified
 * on-chain 2026-10-16). Interface semantics (error codes, stored rate)
 * cross-checked against Venus docs (mint/redeemUnderlying).
 */
import { strict as assert } from "node:assert";
import { describe, it, beforeEach } from "node:test";
import { network } from "hardhat";

const { ethers } = await network.connect();
const parse = (v: string, d = 18) => ethers.parseUnits(v, d);

async function fixture() {
  const [admin, stranger] = await ethers.getSigners();
  const Token = await ethers.getContractFactory("MockERC20", admin);
  const asset = await Token.deploy("Test Dollar", "TUSD", 18);
  const Market = await ethers.getContractFactory("MockVenusMarket", admin);
  const market = await Market.deploy(await asset.getAddress());
  const Adapter = await ethers.getContractFactory("VenusAdapter", admin);
  const adapter = await Adapter.deploy(
    await asset.getAddress(),
    await market.getAddress(),
    admin.address
  );
  await asset.mint(await adapter.getAddress(), parse("1000"));
  return { admin, stranger, asset, market, adapter };
}

describe("VenusAdapter", () => {
  it("constructor rejects zero addresses", async () => {
    const { admin, asset, market } = await fixture();
    const Adapter = await ethers.getContractFactory("VenusAdapter", admin);
    await assert.rejects(
      Adapter.deploy(ethers.ZeroAddress, await market.getAddress(), admin.address)
    );
    await assert.rejects(
      Adapter.deploy(await asset.getAddress(), ethers.ZeroAddress, admin.address)
    );
  });

  it("allocate supplies the market and balance() tracks the position", async () => {
    const { asset, market, adapter } = await fixture();
    await adapter.allocate(parse("400"));
    assert.equal(await asset.balanceOf(await adapter.getAddress()), parse("600"));
    assert.equal(await asset.balanceOf(await market.getAddress()), parse("400"));
    // rate 0.02 => 400 underlying = 20000 vTokens => balance() = 400 back.
    assert.equal(await adapter.balance(), parse("400"));
  });

  it("withdraw redeems underlying back to the adapter", async () => {
    const { asset, adapter } = await fixture();
    await adapter.allocate(parse("400"));
    await adapter.withdraw(parse("150"));
    assert.equal(await adapter.balance(), parse("250"));
    assert.equal(await asset.balanceOf(await adapter.getAddress()), parse("750"));
  });

  it("rejects callers without MANAGER_ROLE", async () => {
    const { stranger, adapter } = await fixture();
    await assert.rejects(adapter.connect(stranger).allocate(parse("1")));
    await assert.rejects(adapter.connect(stranger).withdraw(parse("1")));
  });

  it("propagates Venus error codes instead of hiding them", async () => {
    const { market, adapter } = await fixture();
    await market.setFailNext(true);
    await assert.rejects(adapter.allocate(parse("10")));
    await market.setFailNext(false);
    await adapter.allocate(parse("10"));
    await market.setFailNext(true);
    await assert.rejects(adapter.withdraw(parse("10")));
    await market.setFailNext(false);
  });

  it("balance() follows the stored rate conservatively", async () => {
    const { market, adapter } = await fixture();
    await adapter.allocate(parse("400"));
    await market.setExchangeRate(parse("0.03")); // rate up: position worth more
    assert.equal(await adapter.balance(), parse("600"));
  });
});
