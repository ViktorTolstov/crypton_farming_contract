import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";

describe('Farming', function () {
    let Farming;
    let farming: Contract;
    let Token;
    let token: Contract;
    let rewardToken: Contract;
    let owner: SignerWithAddress, user1: SignerWithAddress, user2: SignerWithAddress;

    const HUNDRED_PERCENT = 10000;
    const AMOUNT_TO_MINT = ethers.utils.parseEther('10');
    const AMOUNT_TO_FARM = ethers.utils.parseEther('1');
    const PERCENTAGE = 5000; // 50.00%
    const EPOCH_DURATION = 60; // 1 minute
    const AMOUNT_OF_EPOCHS = 10;
    const SECONDS_TO_START = 2;
    const START_TIME = Math.floor(Date.now() / 1000) + SECONDS_TO_START;
    const AMOUNT_TO_USER_DEPOSIT = ethers.utils.parseEther('0.1');

    beforeEach(async () => {
        [owner, user1, user2] = await ethers.getSigners();
        Farming = await ethers.getContractFactory('Farming');
        Token = await ethers.getContractFactory('MyToken');

        token = await Token.deploy();
        await token.deployed();

        rewardToken = await Token.deploy();
        await rewardToken.deployed();

        farming = await Farming.deploy(token.address, rewardToken.address);
        await farming.deployed();

        await token.mint(owner.address, AMOUNT_TO_MINT);
        await rewardToken.mint(owner.address, AMOUNT_TO_MINT);
        await token.approve(farming.address, AMOUNT_TO_MINT);
        await rewardToken.approve(farming.address, AMOUNT_TO_MINT);
        await farming.initialize(AMOUNT_TO_FARM, PERCENTAGE, EPOCH_DURATION, AMOUNT_OF_EPOCHS, START_TIME);

        await token.mint(user1.address, AMOUNT_TO_USER_DEPOSIT);
        await token.connect(user1).approve(farming.address, AMOUNT_TO_USER_DEPOSIT);
    });

    describe('withdraw', function () {
        it('should allow users to withdraw their tokens after farming', async function () {
            await new Promise(resolve => setTimeout(resolve, SECONDS_TO_START));
            await farming.connect(user1).deposit(AMOUNT_TO_USER_DEPOSIT);
            await ethers.provider.send('evm_increaseTime', [EPOCH_DURATION * AMOUNT_OF_EPOCHS + 1]); // Fast-forward time

            const initialUser1Balance = await token.balanceOf(user1.address);
            await farming.connect(user1).withdraw();
            const finalUser1Balance = await token.balanceOf(user1.address);

            expect(finalUser1Balance.sub(initialUser1Balance)).to.equal(AMOUNT_TO_USER_DEPOSIT);
        });

        it('should revert if user tries to withdraw before farming is finished', async function () {
            await new Promise(resolve => setTimeout(resolve, SECONDS_TO_START));
            await farming.connect(user1).deposit(AMOUNT_TO_USER_DEPOSIT);

            await expect(farming.connect(user1).withdraw()).to.be.revertedWith('Epochs not completed yet');
        });

        it('should revert if user has already make withdraw', async function () {
            await new Promise(resolve => setTimeout(resolve, SECONDS_TO_START));
            await farming.connect(user1).deposit(AMOUNT_TO_USER_DEPOSIT);
                
            await ethers.provider.send('evm_increaseTime', [EPOCH_DURATION * AMOUNT_OF_EPOCHS + 1]); // Fast-forward time
            await farming.connect(user1).withdraw();

            await expect(farming.connect(user1).withdraw()).to.be.revertedWith('No tokens to withdraw');
        });

        it('should revert if user has not deposited any tokens', async function () {
            await expect(farming.connect(user1).withdraw()).to.be.revertedWith('No tokens to withdraw');
        });
    });

    describe('claimRewards', function () {
        it('should allow users to claim rewards after farming', async function () {
            await farming.connect(user1).deposit(AMOUNT_TO_USER_DEPOSIT);
            await ethers.provider.send('evm_increaseTime', [EPOCH_DURATION * AMOUNT_OF_EPOCHS + 1]); // Fast-forward time

            await farming.connect(user1).claimRewards();
            const finalUser1RewardBalance = await rewardToken.balanceOf(user1.address);

            const expectedRewards = (AMOUNT_TO_USER_DEPOSIT.mul(PERCENTAGE).mul(AMOUNT_OF_EPOCHS)).div(HUNDRED_PERCENT);
            expect(finalUser1RewardBalance).to.equal(expectedRewards);
        });

        it('should revert if user tries to claim rewards before farming is finished', async function () {
            await farming.connect(user1).deposit(AMOUNT_TO_USER_DEPOSIT);

            await expect(farming.connect(user1).claimRewards()).to.be.revertedWith('Epochs not completed yet');
        });

        it('should revert if user has already claimed rewards', async function () {
            await farming.connect(user1).deposit(AMOUNT_TO_USER_DEPOSIT);
            await ethers.provider.send('evm_increaseTime', [EPOCH_DURATION * AMOUNT_OF_EPOCHS + 1]); // Fast-forward time
            await farming.connect(user1).claimRewards();

            await expect(farming.connect(user1).claimRewards()).to.be.revertedWith('Rewards already claimed');
        });

        it('should revert if user has not deposited any tokens', async function () {
            await expect(farming.connect(user1).claimRewards()).to.be.revertedWith('No tokens to claim');
        });
    });
});
