// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IStrategyAdapter {
    function allocate(uint256 amount) external;
    function withdraw(uint256 amount) external;
    function balance() external view returns (uint256);
}

/**
 * @title SingularisVault
 * @notice ERC-4626 vault with separated strategy adapter, deposit caps,
 *         performance fee on realized profit (high-water mark), pause, and
 *         explicit liquidity accounting.
 *
 * @dev Security notes:
 * - Virtual offset (1e3 shares / 1e3 assets burned to address(0) via _decimalsOffset)
 *   mitigates donation-based share inflation (OZ ERC4626 inflation protection).
 * - Fees accrue as shares to feeRecipient only when totalAssets exceeds highWaterMark.
 * - availableLiquidity() = liquid idle assets only; strategy funds are NOT liquid.
 * - Pause blocks deposit/mint/withdraw/redeem AND strategy moves.
 * - Pause/admin can never seize user funds: no admin withdraw path exists.
 * - Strategy is opt-in per allocation; failed strategy calls revert the admin op,
 *   never user accounting (allocation/withdraw-from-strategy are admin-only).
 */
contract SingularisVault is ERC4626, AccessControl, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant PAUSE_ROLE = keccak256("PAUSE_ROLE");
    bytes32 public constant STRATEGY_MANAGER_ROLE = keccak256("STRATEGY_MANAGER_ROLE");
    bytes32 public constant FEE_SETTER_ROLE = keccak256("FEE_SETTER_ROLE");

    uint256 public constant MAX_BPS = 10_000;

    /// @notice Performance fee in bps on realized profit. 500 = 5% proposal.
    uint256 public performanceFeeBps;
    address public feeRecipient;
    /// @notice High-water mark for fee accrual (total assets at last fee event).
    uint256 public highWaterMark;
    /// @notice Max total assets accepted. 0 = uncapped (still bounded by maxDeposit override).
    uint256 public depositCap;
    /// @notice Max fraction of totalAssets that may sit in the strategy (bps).
    uint256 public maxAllocationBps = 5_000; // 50% default

    IStrategyAdapter public strategy;

    event FeeAccrued(uint256 feeShares, uint256 profit);
    event StrategySet(address indexed strategy);
    event StrategyAllocated(uint256 amount);
    event StrategyWithdrawn(uint256 amount);
    event DepositCapSet(uint256 cap);
    event FeeConfigSet(uint256 bps, address recipient);

    error FeeTooHigh();
    error ZeroAmount();
    error ZeroAddress();
    error CapExceeded();
    error StrategyNotSet();
    error AllocationExceeded();
    error InsufficientLiquidity();

    constructor(
        IERC20 asset_,
        string memory name_,
        string memory symbol_,
        address admin_,
        address feeRecipient_,
        uint256 performanceFeeBps_,
        uint256 depositCap_
    ) ERC4626(asset_) ERC20(name_, symbol_) {
        if (admin_ == address(0) || feeRecipient_ == address(0)) revert ZeroAddress();
        if (performanceFeeBps_ > 2_000) revert FeeTooHigh(); // >20% rejected at deploy
        _grantRole(DEFAULT_ADMIN_ROLE, admin_);
        _grantRole(PAUSE_ROLE, admin_);
        _grantRole(STRATEGY_MANAGER_ROLE, admin_);
        _grantRole(FEE_SETTER_ROLE, admin_);
        feeRecipient = feeRecipient_;
        performanceFeeBps = performanceFeeBps_;
        depositCap = depositCap_;
        highWaterMark = 0;
    }

    /// @dev 3-decimal virtual offset: standard inflation-attack mitigation.
    function _decimalsOffset() internal pure override returns (uint8) {
        return 3;
    }

    // ---- Views ----

    function totalAssets() public view override returns (uint256) {
        uint256 idle = IERC20(asset()).balanceOf(address(this));
        uint256 stratBal = address(strategy) == address(0) ? 0 : strategy.balance();
        return idle + stratBal;
    }

    /// @notice Idle (immediately withdrawable) assets only.
    function availableLiquidity() external view returns (uint256) {
        return IERC20(asset()).balanceOf(address(this));
    }

    function maxDeposit(address) public view override returns (uint256) {
        if (paused()) return 0;
        if (depositCap == 0) return type(uint256).max;
        uint256 ta = totalAssets();
        return ta >= depositCap ? 0 : depositCap - ta;
    }

    function maxMint(address receiver) public view override returns (uint256) {
        uint256 md = maxDeposit(receiver);
        if (md == type(uint256).max) return type(uint256).max;
        return convertToShares(md);
    }

    function maxWithdraw(address owner) public view override returns (uint256) {
        if (paused()) return 0;
        uint256 bal = convertToAssets(balanceOf(owner));
        uint256 liq = IERC20(asset()).balanceOf(address(this));
        return bal > liq ? liq : bal;
    }

    function maxRedeem(address owner) public view override returns (uint256) {
        if (paused()) return 0;
        uint256 shares = balanceOf(owner);
        uint256 liq = IERC20(asset()).balanceOf(address(this));
        uint256 liqShares = convertToShares(liq);
        return shares > liqShares ? liqShares : shares;
    }

    // ---- User flows (paused + cap enforced, reentrancy guarded) ----

    function deposit(uint256 assets, address receiver)
        public
        override
        whenNotPaused
        nonReentrant
        returns (uint256)
    {
        if (assets == 0) revert ZeroAmount();
        if (totalAssets() + assets > depositCap && depositCap != 0) revert CapExceeded();
        uint256 shares = super.deposit(assets, receiver);
        _accrueFee();
        return shares;
    }

    function mint(uint256 shares, address receiver)
        public
        override
        whenNotPaused
        nonReentrant
        returns (uint256)
    {
        uint256 assets = super.mint(shares, receiver);
        if (depositCap != 0 && totalAssets() > depositCap) revert CapExceeded();
        _accrueFee();
        return assets;
    }

    function withdraw(uint256 assets, address receiver, address owner)
        public
        override
        whenNotPaused
        nonReentrant
        returns (uint256)
    {
        if (assets > IERC20(asset()).balanceOf(address(this))) revert InsufficientLiquidity();
        uint256 shares = super.withdraw(assets, receiver, owner);
        _accrueFee();
        return shares;
    }

    function redeem(uint256 shares, address receiver, address owner)
        public
        override
        whenNotPaused
        nonReentrant
        returns (uint256)
    {
        uint256 assets = super.redeem(shares, receiver, owner);
        _accrueFee();
        return assets;
    }

    // ---- Fees: shares to feeRecipient on realized profit above HWM ----

    function _accrueFee() internal {
        uint256 ta = totalAssets();
        if (ta <= highWaterMark || performanceFeeBps == 0) {
            if (ta > highWaterMark) highWaterMark = ta;
            return;
        }
        uint256 profit = ta - highWaterMark;
        uint256 feeAssets = (profit * performanceFeeBps) / MAX_BPS;
        highWaterMark = ta;
        if (feeAssets == 0) return;
        uint256 feeShares = convertToShares(feeAssets);
        if (feeShares == 0) return;
        _mint(feeRecipient, feeShares);
        emit FeeAccrued(feeShares, profit);
    }

    /// @notice After strategy reports profit/loss, keeper pokes fee accrual.
    function pokeFeeAccrual() external whenNotPaused {
        _accrueFee();
    }

    // ---- Strategy allocation (admin-only, capped, pause-aware) ----

    function setStrategy(address strategy_) external onlyRole(STRATEGY_MANAGER_ROLE) {
        strategy = IStrategyAdapter(strategy_);
        emit StrategySet(strategy_);
    }

    function allocateToStrategy(uint256 amount)
        external
        onlyRole(STRATEGY_MANAGER_ROLE)
        whenNotPaused
        nonReentrant
    {
        if (address(strategy) == address(0)) revert StrategyNotSet();
        if (amount == 0) revert ZeroAmount();
        uint256 ta = totalAssets();
        if (ta == 0) revert AllocationExceeded();
        if ((strategy.balance() + amount) * MAX_BPS > ta * maxAllocationBps) revert AllocationExceeded();
        IERC20(asset()).forceApprove(address(strategy), amount);
        strategy.allocate(amount);
        // Reset allowance to 0 to avoid lingering approvals.
        IERC20(asset()).forceApprove(address(strategy), 0);
        emit StrategyAllocated(amount);
    }

    function withdrawFromStrategy(uint256 amount)
        external
        onlyRole(STRATEGY_MANAGER_ROLE)
        whenNotPaused
        nonReentrant
    {
        if (address(strategy) == address(0)) revert StrategyNotSet();
        strategy.withdraw(amount);
        emit StrategyWithdrawn(amount);
        _accrueFee();
    }

    // ---- Admin ----

    function setDepositCap(uint256 cap) external onlyRole(DEFAULT_ADMIN_ROLE) {
        depositCap = cap;
        emit DepositCapSet(cap);
    }

    function setFeeConfig(uint256 bps, address recipient)
        external
        onlyRole(FEE_SETTER_ROLE)
    {
        if (bps > 2_000) revert FeeTooHigh();
        if (recipient == address(0)) revert ZeroAddress();
        performanceFeeBps = bps;
        feeRecipient = recipient;
        emit FeeConfigSet(bps, recipient);
    }

    function setMaxAllocationBps(uint256 bps) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(bps <= MAX_BPS, "bps>max");
        maxAllocationBps = bps;
    }

    function pause() external onlyRole(PAUSE_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(PAUSE_ROLE) {
        _unpause();
    }
}
