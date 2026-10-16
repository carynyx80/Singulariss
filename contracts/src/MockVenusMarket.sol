// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title MockVenusMarket
 * @notice DEVELOPMENT-ONLY Venus market stand-in. Mimics the Venus error-code
 *         API (0 = success) with a configurable exchange rate. NEVER use for
 *         real funds. Production target: vUSDC 0xeca8…67c8 on BSC mainnet.
 */
contract MockVenusMarket {
    using SafeERC20 for IERC20;

    IERC20 public immutable asset;
    uint256 public exchangeRate = 2e16; // 0.02 underlying per vToken, like vUSDC scale
    mapping(address => uint256) public balances;
    bool public failMode;

    constructor(address asset_) {
        asset = IERC20(asset_);
    }

    function setExchangeRate(uint256 rate_) external {
        exchangeRate = rate_;
    }

    function setFailNext(bool fail_) external {
        failMode = fail_;
    }

    function balanceOf(address owner) external view returns (uint256) {
        return balances[owner];
    }

    function exchangeRateStored() external view returns (uint256) {
        return exchangeRate;
    }

    function underlying() external view returns (address) {
        return address(asset);
    }

    function mint(uint256 amount) external returns (uint256) {
        if (failMode) {
            return 1;
        }
        asset.safeTransferFrom(msg.sender, address(this), amount);
        balances[msg.sender] += (amount * 1e18) / exchangeRate;
        return 0;
    }

    function redeemUnderlying(uint256 amount) external returns (uint256) {
        if (failMode) {
            return 1;
        }
        uint256 vTokens = (amount * 1e18) / exchangeRate;
        require(balances[msg.sender] >= vTokens, "insufficient v balance");
        balances[msg.sender] -= vTokens;
        asset.safeTransfer(msg.sender, amount);
        return 0;
    }
}
