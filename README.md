# Farming

## Network:
polygon-mumbai

## Contract:
0x5001412906590F1Df2b64391721983dC49338615

## Test Tokens:
0xB3cd6e0B74dBE7CB14585d35c86dc791aA1295aC - staking token
0xF85C57E80eFb185A6984fDe1ae3644a25Cdfdc19 - reward token

## Tests:
npx hardhat test

## Дeплой:
npx hardhat run scripts/deploy.ts --network polygon-mumbai

## Deposit task:
npx hardhat deposit --contract 0x5001412906590F1Df2b64391721983dC49338615 --staking 0xB3cd6e0B74dBE7CB14585d35c86dc791aA1295aC --amount 100000000000000 --network polygon-mumbai

## Withdraw task:
npx hardhat withdraw --contract 0x5001412906590F1Df2b64391721983dC49338615 --network polygon-mumbai

## Claim Reward task:
npx hardhat claimRewards --contract 0x5001412906590F1Df2b64391721983dC49338615 --network polygon-mumbai
