import {ethers} from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

async function main() {
    const [owner] = await ethers.getSigners();

    const Staking = await ethers.getContractFactory("smartStaking");
    const staking = await Staking.deploy();
    await staking.deployed();

    const stakingContract = staking.address;
    console.log(`STAKING CONTRACT IS ${stakingContract}`);

    const mint = ethers.utils.parseEther("1000");
    const Token = await ethers.getContractFactory("rewardToken");
    const token = await Token.deploy("REWARD", "RWD", mint, stakingContract);
    await token.deployed();
    const TokenAddress = token.address;
    console.log(`TOKEN CONTRACT IS ${TokenAddress}`)

    const setRewardToken = await staking.setTokenAddress(TokenAddress);

    const helpers = require("@nomicfoundation/hardhat-network-helpers");
    // const helpers = require("@nomicfoundation/hardhat-toolbox");
    const ApeHolder1 = "0xe785aAfD96E23510A7995E16b49C22D15f219B85";
    const ApeHolder2 = "0x4A385286592C97e457A6f54A3734557F4b095A28";
    const NonApeHolder1 = "0xDa9CE944a37d218c3302F6B82a094844C6ECEb17";
    const address1 = ApeHolder1;
    const address2 = ApeHolder2;
    const address3 = NonApeHolder1;
    await helpers.impersonateAccount(address1);
    await helpers.impersonateAccount(address2);
    await helpers.impersonateAccount(address3);
    // await helpers.impersonateAccount(address);
    const impersonatedSigner = await ethers.getSigner(address1);
    const impersonatedSigner2 = await ethers.getSigner(address2);
    const impersonatedSigner3 = await ethers.getSigner(address3);

    await helpers.setBalance(address1, 10000000000000000000000000);
    await helpers.setBalance(address2, 10000000000000000000000000);
    await helpers.setBalance(address3, 10000000000000000000000000);


    const Usdc = await ethers.getContractAt("IUSDT", "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48")
    const approve = Usdc.connect(impersonatedSigner).approve(stakingContract, mint);
    const approve2 = Usdc.connect(impersonatedSigner2).approve(stakingContract, mint);
    const approve3 = Usdc.connect(impersonatedSigner3).approve(stakingContract, mint);

    const amount = ethers.utils.parseEther("0.5");
    const userBalanceB4 = await Usdc.balanceOf(impersonatedSigner.address);
    console.log(`BALANCE BEFORE STAKING ${userBalanceB4}`);

    const stake1 = await staking.connect(impersonatedSigner).stake(1000000000);
    console.log(`address one staked successfully`);
    const userBalanceAfta = await Usdc.balanceOf(impersonatedSigner.address);

    console.log(`BALANCE BEFORE STAKING ${userBalanceAfta}`);


    const stake2 = await staking.connect(impersonatedSigner2).stake(10000000000);
    console.log(`address two staked successfully`);

    // const stake3 = await staking.connect(impersonatedSigner3).stake(amount);
    // console.log(`address three couldn't stake successfully`);

    const contractBalance = await Usdc.balanceOf(stakingContract)
    console.log(` CONTRACT USDC BALANCE IS ${contractBalance}`);

    const updateReward = await staking.connect(impersonatedSigner).updateReward();
    const reward = await staking.connect(impersonatedSigner).displayReward();
    console.log(`ACCOUNT 1 REWARD IS ${reward}`);

    console.log(`time warp started..................`)
    const wapTime = await ethers.provider.send("evm_mine", [1709251199]);
    console.log(`time warp completed..................`)

   
    const updateReward3 = await staking.connect(impersonatedSigner).updateReward();
    const reward3 = await staking.connect(impersonatedSigner).displayReward();
    console.log(`ACCOUNT 1 REWARD AFTER TIME WARP ${reward3}`);

    console.log(`Attempting reward withdrawal..................`)
    const ClaimReward = await staking.connect(impersonatedSigner).claimReward(90000000);
    console.log(`Reward withdrawal completed..................`)

    const updateReward2 = await staking.connect(impersonatedSigner).updateReward();
   


    const reward2 = await staking.connect(impersonatedSigner).displayReward();
    console.log(`ACCOUNT 1 REWARD AFTER WITHDRAWAL IS ${reward2}`);
    
   
    console.log(`Attempting Stake withdrawal..................`)
    const withdraw = await staking.connect(impersonatedSigner).withdraw(1000000000);
    console.log(`Stake withdrawal completed..................`)


    const contractBalance2 = await Usdc.balanceOf(stakingContract);
    console.log(` CONTRACT USDC BALANCE IS ${contractBalance2}`);





}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });