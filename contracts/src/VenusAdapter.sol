// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IVenusMarket {
    function mint(uint256 mintAmount) external returns (uint256);
    function redeemUnderlying(uint256 redeemAmount) external returns (uint256);
    function balanceOf(address owner) external view returns (uint256);
    function exchangeRateStored() external view returns (uint256);
    function underlying() external view returns (address);
}

/**
 * @title VenusAdapter
 * @notice MANAGER-gated adapter between a SingularisVault and one Venus
 *         Core Pool BEP-20 market (e.g. vUSDC on BNB Smart Chain).
 *
 * @dev Venus integration notes:
 * - Venus market functions return uint error codes (0 = success) instead of
 *   reverting. Every call is checked and reverts on non-zero codes.
 * - balance() uses exchangeRateStored (no interest accrual on read), so it
 *   slightly understates the position. The vault therefore never over-counts
 *   strategy funds — conservative by construction.
 * - Only the vault (MANAGER_ROLE) may move funds. No user-facing functions.
 * - Deploy one adapter per market. The vault's maxAllocationBps still caps
 *   exposure; launch posture keeps it at 0 until explicitly raised.
 */
contract VenusAdapter is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");

    IERC20 public immutable asset;
    IVenusMarket public immutable market;

    event Allocated(uint256 amount);
    event Withdrawn(uint256 amount);

    error ZeroAmount();
    error ZeroAddress();
    error VenusError(uint256 code);

    constructor(address asset_, address market_, address manager_) {
        if (asset_ == address(0) || market_ == address(0) || manager_ == address(0)) {
            revert ZeroAddress();
        }
        asset = IERC20(asset_);
        market = IVenusMarket(market_);
        _grantRole(DEFAULT_ADMIN_ROLE, manager_);
        _grantRole(MANAGER_ROLE, manager_);
    }

    /// @notice Push idle assets into the Venus market. Manager (vault) only.
    function allocate(uint256 amount) external onlyRole(MANAGER_ROLE) nonReentrant {
        if (amount == 0) revert ZeroAmount();
        asset.forceApprove(address(market), amount);
        uint256 err = market.mint(amount);
        asset.forceApprove(address(market), 0);
        if (err != 0) revert VenusError(err);
        emit Allocated(amount);
    }

    /// @notice Pull assets back from the Venus market. Manager (vault) only.
    function withdraw(uint256 amount) external onlyRole(MANAGER_ROLE) nonReentrant {
        if (amount == 0) revert ZeroAmount();
        uint256 err = market.redeemUnderlying(amount);
        if (err != 0) revert VenusError(err);
        emit Withdrawn(amount);
    }

    /// @notice Underlying value of the position (stored rate; conservative).
    function balance() external view returns (uint256) {
        uint256 vBal = market.balanceOf(address(this));
        if (vBal == 0) return 0;
        return (vBal * market.exchangeRateStored()) / 1e18;
    }
}
