//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./IERC721.sol";
import "./IERC20.sol";

contract smartStaking {
    IERC721 internal boredApe;
    IUSDT internal USDC;
    IUSDT internal rewardToken;

    event staked(address indexed, uint256, string);
    event claimRewardEvent(address indexed, uint256, string);
    event withdrawStake(address indexed, uint256, string);
    address admin;

    struct userDetails {
        uint256 stakedAmount;
        uint256 StakeTime;
        uint256 Reward;
    }

    mapping(address => userDetails) USER;

    constructor() {
        boredApe = IERC721(0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D);
        USDC = IUSDT(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48);
        admin = msg.sender;
    }

    function setTokenAddress(address _tokenAddress) public onlyadmin {
        rewardToken = IUSDT(_tokenAddress);
    }

    function stake(uint256 _amount) public boredApeHolder {
        if (USER[msg.sender].stakedAmount > 0) {
            updateReward();
        }
        bool success = USDC.transferFrom(msg.sender, address(this), _amount);
        require(success, "STAKE CALL FAILED, TRY AGAIN");
        userDetails memory staker;
        staker.stakedAmount += _amount;
        staker.StakeTime = block.timestamp;
        USER[msg.sender] = staker;
        //USER[msg.sender].Reward = 1000;
        emit staked(msg.sender, _amount, "staked successfully");
    }

    function updateReward() public {
        uint256 reward = calcReward();
        USER[msg.sender].Reward += reward;
        USER[msg.sender].StakeTime = block.timestamp;
    }

    function calcReward() internal view returns (uint256 AccruedReward) {
        uint256 Tstakedtime = block.timestamp - USER[msg.sender].StakeTime;
        uint256 rewardPercentage = ((USER[msg.sender].stakedAmount * 10) / 100);
        AccruedReward = ((rewardPercentage / 31563000) * Tstakedtime);
    }

    function claimReward(uint256 _amount) public {
        updateReward();
        require(USER[msg.sender].Reward >= _amount, "INSUFFICIENT REWARD");
        USER[msg.sender].Reward -= _amount;
        rewardToken.transfer(payable(msg.sender), _amount);
        emit claimRewardEvent(
            msg.sender,
            _amount,
            "REWARD CLAIMED SUCCESSFULLY"
        );
    }

    function withdraw(uint256 _amount) public {
        require(USER[msg.sender].stakedAmount >= _amount, "INSUFFICIENT STAKE");
        USER[msg.sender].stakedAmount -= _amount;
        USDC.transfer(payable(msg.sender), _amount);
        updateReward();
        emit withdrawStake(msg.sender, _amount, "STAKE WITHDRAWN SUCCESSFULLY");
    }

    function displayReward() public view returns (uint256) {
        //updateReward();
        uint256 reward = (USER[msg.sender].Reward);
        return reward;
    }

    modifier boredApeHolder() {
        uint256 balance = boredApe.balanceOf(msg.sender);
        require(balance > 0, "NOT A BORED APE HOLDER, PURCHASE ONE");
        _;
    }

    modifier onlyadmin() {
        require(msg.sender == admin, "NOT ADMIN");
        _;
    }
}
