import { task } from 'hardhat/config';
import { BigNumber, ContractTransaction, ContractReceipt } from 'ethers';
import { Address } from 'cluster';

task('withdraw', 'Withdraw tokens from the Farming contract')
  .addParam('contract', 'Contract address')
  .setAction(async ({ contract }, { ethers }) => {
    const farmingContract = await ethers.getContractAt('Farming', contract);
    
    let contractResult = await farmingContract.withdraw();;

    const contractReceipt: ContractReceipt = await contractResult.wait();
    const event = contractReceipt.events?.find(event => event.event === 'Withdraw');
    const address: Address = event?.args!['addr'];
    console.log(`Withdrawn to ${address}`);
  });
