import { task } from 'hardhat/config';
import { BigNumber, ContractTransaction, ContractReceipt } from 'ethers';
import { Address } from 'cluster';

task('claimRewards', 'Claim rewards from the Farming contract')
    .addParam('contract', 'Contract address')
    .setAction(async ({ contract }, { ethers }) => {
      const farmingContract = await ethers.getContractAt('Farming', contract);

      let contractResult = await farmingContract.claimRewards();
      
      const contractReceipt: ContractReceipt = await contractResult.wait();
      const event = contractReceipt.events?.find(event => event.event === 'Claimed');
      const address: Address = event?.args!['addr'];
      const amount: Address = event?.args!['amount'];
      console.log(`Rewards ${amount} claimed to ${address}`);
    });
