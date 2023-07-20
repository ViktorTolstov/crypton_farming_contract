import { task } from 'hardhat/config';
import { Contract } from 'ethers';

task('deposit', 'Deposits tokens into the Farming contract')
    .addParam('contract', 'Contract address')
    .addParam('staking', 'Staking token address')
    .addParam('amount', 'The amount of tokens to deposit',)
    .setAction(async ({ contract, staking, amount }, { ethers }) => {
        const farmingContract = await ethers.getContractAt('Farming', contract);

        try {
            const stakingToken = await ethers.getContractAt('MyToken', staking);

            await stakingToken.approve(contract, amount);
            const tx = await farmingContract.deposit(amount);
            await tx.wait();
            console.log(`Successfully deposited ${amount} tokens into the Farming contract`);
        } catch (error) {
            console.error('Error depositing tokens:', error);
        }
    });
