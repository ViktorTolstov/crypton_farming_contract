//SPDX-License-Identifier: Unlicense
pragma solidity =0.8.19;

import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract Farming {
    using SafeERC20 for IERC20Metadata;

    struct User {
        uint256 amount;
        uint256 depositTime;
        bool claimed;
    }

    uint256 public constant HUNDRED_PERCENT = 10_000; // 100.00%

    address public owner;

    IERC20Metadata public stakingToken; // LP token

    IERC20Metadata public rewardToken; // token A or erc20

    uint256 public tokensLeft;

    uint256 public percentage;

    uint256 public startTime;

    uint256 public epochDuration;

    uint256 public amountOfEpochs;

    bool public initialized;

    mapping (address => User) public users;

    event Deposited(address addr, uint256 amount);
    event Withdraw(address addr);
    event Claimed(address addr, uint256 amount);

    constructor(address _stakingToken, address _rewardToken) {
        owner = msg.sender;
        stakingToken = IERC20Metadata(_stakingToken);
        rewardToken = IERC20Metadata(_rewardToken);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not an owner");
        _;
    }

    function initialize(
        uint256 _totalAmount,
        uint256 _percentage, // 0 ~ 100.00% => 0 ~ 10000
        uint256 _epochDuration,
        uint256 _amountOfEpochs,
        uint256 _startTime
    ) external onlyOwner {
        require(!initialized, "Already initialized");
        initialized = true;
        tokensLeft = _totalAmount;
        percentage = _percentage;
        startTime = _startTime;
        amountOfEpochs = _amountOfEpochs;
        epochDuration = _epochDuration;

        rewardToken.transferFrom(
            msg.sender,
            address(this),
            ((_totalAmount * _percentage * _amountOfEpochs) / HUNDRED_PERCENT)
        );
    }

    function deposit(uint256 _amount) external {
        require(startTime <= block.timestamp, "Farming is not up yet!");
        require(_amount <= tokensLeft, "Too many tokens contributed");
        users[msg.sender] = User({
            amount: _amount,
            depositTime: block.timestamp,
            claimed: false
        });
        tokensLeft -= _amount;
        stakingToken.safeTransferFrom(msg.sender, address(this), _amount);
        emit Deposited(msg.sender, _amount);
    }

    function withdraw() external {
        User storage sender = users[msg.sender];

        require(sender.amount > 0, "No tokens to withdraw");

        uint256 depositTime = sender.depositTime;
        uint256 elapsedTime = block.timestamp - depositTime;

        uint256 epochsPassed = elapsedTime / epochDuration;
        require(epochsPassed >= amountOfEpochs, "Epochs not completed yet");

        uint256 amountToWithdraw = sender.amount;
        sender.amount = 0;
        tokensLeft += amountToWithdraw;

        stakingToken.safeTransfer(msg.sender, amountToWithdraw);
        emit Withdraw(msg.sender);
    }

    function claimRewards() external {
        User storage sender = users[msg.sender];

        require(sender.claimed == false, "Rewards already claimed");
        require(sender.amount > 0, "No tokens to claim");

        uint256 depositTime = sender.depositTime;
        uint256 elapsedTime = block.timestamp - depositTime;

        uint256 epochsPassed = elapsedTime / epochDuration;
        require(epochsPassed >= amountOfEpochs, "Epochs not completed yet");

        uint256 rewardsToClaim = (sender.amount * percentage * amountOfEpochs) / HUNDRED_PERCENT;
        sender.claimed = true;

        rewardToken.safeTransfer(msg.sender, rewardsToClaim);
        emit Claimed(msg.sender, rewardsToClaim);
    }
}
