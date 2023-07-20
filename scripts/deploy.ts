import { ethers } from 'hardhat';

const HUNDRED_PERCENT = 10000;
const AMOUNT_TO_FARM = ethers.utils.parseEther('100');
const AMOUNT_TO_REWARD = ethers.utils.parseEther('1');
const PERCENTAGE = 5000; // 50.00%
const EPOCH_DURATION = 60; // 1 minute
const AMOUNT_OF_EPOCHS = 10;
const START_TIME = Math.floor(Date.now() / 1000) + 10;

async function main() {
    const [deployer] = await ethers.getSigners();

    const Token = await ethers.getContractFactory('MyToken');

    // Деплой ERC20 токена #1
    const token1 = await Token.deploy();
    await token1.deployed();
    console.log(`Token1 deployed to: ${token1.address}`);
    let address1 = token1.address;
    // let address1 = "0xB3cd6e0B74dBE7CB14585d35c86dc791aA1295aC"

    await new Promise(resolve => setTimeout(resolve, 1));

    // Деплой ERC20 токена #2
    const token2 = await Token.deploy();
    await token2.deployed();
    console.log(`Token2 deployed to: ${token2.address}`);
    let address2 = token2.address;
    // let address2 = "0xF85C57E80eFb185A6984fDe1ae3644a25Cdfdc19"
    

    await new Promise(resolve => setTimeout(resolve, 1));

    // Деплой контракта "Farming"
    const Farming = await ethers.getContractFactory('Farming');
    const farming = await Farming.deploy(address1, address2);
    await farming.deployed();
    console.log(`Farming contract deployed to: ${farming.address}`);

    await new Promise(resolve => setTimeout(resolve, 1));

    await initialize(farming.address, address2);
}

async function initialize(contract: any, rewardTokenAddress: any) {
    const farmingContract = await ethers.getContractAt('Farming', contract);
    const rewardToken = await ethers.getContractAt('MyToken', rewardTokenAddress);

    await rewardToken.approve(contract, ethers.utils.parseEther('1000'));
    await farmingContract.initialize(AMOUNT_TO_FARM, PERCENTAGE, EPOCH_DURATION, AMOUNT_OF_EPOCHS, START_TIME);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

