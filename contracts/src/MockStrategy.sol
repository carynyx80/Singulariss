// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title MockStrategy
 * @notice DEVELOPMENT-ONLY accounting harness. Simulates deposit/withdraw
 *         latency and zero yield. Must never hold mainnet funds or be
 *         presented as a live yield source.
 */
contract MockStrategy is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");

    IERC20 public immutable asset;
    uint256 public totalAllocated;
    bool public withdrawalsLocked;

    event Allocated(uint256 amount);
    event Withdrawn(uint256 amount);
    event LockToggled(bool locked);

    error ZeroAmount();
    error InsufficientBalance();

    constructor(address asset_) {
        require(asset_ != address(0), "zero asset");
        asset = IERC20(asset_);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MANAGER_ROLE, msg.sender);
    }

    /// @notice Vault pushes funds into the strategy.
    function allocate(uint256 amount) external onlyRole(MANAGER_ROLE) nonReentrant {
        if (amount == 0) revert ZeroAmount();
        asset.safeTransferFrom(msg.sender, address(this), amount);
        totalAllocated += amount;
        emit Allocated(amount);
    }

    /// @notice Vault pulls funds back. Reverts while locked to simulate illiquidity.
    function withdraw(uint256 amount) external onlyRole(MANAGER_ROLE) nonReentrant {
        if (amount == 0) revert ZeroAmount();
        require(!withdrawalsLocked, "strategy locked");
        if (amount > totalAllocated) revert InsufficientBalance();
        totalAllocated -= amount;
        asset.safeTransfer(msg.sender, amount);
        emit Withdrawn(amount);
    }

    function setWithdrawalsLocked(bool locked) external onlyRole(DEFAULT_ADMIN_ROLE) {
        withdrawalsLocked = locked;
        emit LockToggled(locked);
    }

    function balance() external view returns (uint256) {
        return asset.balanceOf(address(this));
    }
}
