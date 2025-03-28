import { spark2ApiUrl } from '@/config/consts'
import { testSparkRewardsAbi, testSparkRewardsAddress } from '@/config/contracts-generated'
import { setSparkRewards } from '@/domain/spark-rewards/setSparkRewards'
import { TestnetClient } from '@/features/dialogs/sandbox/tenderly/TenderlyClient'
import { TOKENS_ON_FORK } from '@/test/e2e/constants'
import { randomHexId } from '@/utils/random'
import { BaseUnitNumber, Hex } from '@sparkdotfi/common-universal'
import { CheckedAddress, NormalizedUnitNumber, raise } from '@sparkdotfi/common-universal'
import { http, HttpResponse } from 'msw'
import type { SetupWorker } from 'msw/browser'
import { mainnet } from 'viem/chains'
import { Config } from 'wagmi'
import { readContract } from 'wagmi/actions'

export interface SetupSparkRewardsParams {
  msw: SetupWorker
  testnetClient: TestnetClient
  account: CheckedAddress
  wagmiConfig: Config
  sandboxChainId: number
}

type MockedRewardConfig = {
  rewardTokenSymbol: keyof (typeof TOKENS_ON_FORK)[typeof mainnet.id]
  cumulativeAmount: NormalizedUnitNumber
  rewardTokenPrice?: NormalizedUnitNumber
  restrictedCountryCodes: string[]
}

const REWARDS_CONFIG: MockedRewardConfig[] = [
  {
    rewardTokenSymbol: 'USDC',
    cumulativeAmount: NormalizedUnitNumber(152),
    rewardTokenPrice: NormalizedUnitNumber(1),
    restrictedCountryCodes: [],
  },
  {
    rewardTokenSymbol: 'wstETH',
    cumulativeAmount: NormalizedUnitNumber(0.0178),
    rewardTokenPrice: NormalizedUnitNumber(2893.09),
    restrictedCountryCodes: ['US'],
  },
]

const MAINNET_REWARDS_CONFIG: MockedRewardConfig[] = [
  {
    rewardTokenSymbol: 'USDS',
    cumulativeAmount: NormalizedUnitNumber(83),
    rewardTokenPrice: NormalizedUnitNumber(1),
    restrictedCountryCodes: [],
  },
]

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function getCampaignsConfig(sandboxChainId: number) {
  return [
    {
      campaign_uid: randomHexId(),
      short_description: 'Supply WETH and get wstETH',
      long_description: 'Supply WETH and get wstETH',
      reward_chain_id: sandboxChainId,
      chain_id: sandboxChainId,
      type: 'sparklend',
      apy: '0.012',
      reward_token_address: '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0',
      deposit_token_addresses: ['0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'],
      borrow_token_addresses: [],
      restricted_country_codes: ['US'],
    },
    {
      campaign_uid: randomHexId(),
      short_description: 'Borrow USDS and get USDC',
      long_description: 'Borrow USDS and get USDC',
      reward_chain_id: sandboxChainId,
      chain_id: sandboxChainId,
      type: 'sparklend',
      apy: '0.008',
      reward_token_address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      deposit_token_addresses: [],
      borrow_token_addresses: ['0xdC035D45d973E3EC169d2276DDab16f1e407384F'],
      restricted_country_codes: [],
    },
    {
      campaign_uid: randomHexId(),
      short_description: 'Deposit USDS to Savings and get USDS',
      long_description: 'Deposit USDS to Savings and get USDS',
      reward_chain_id: sandboxChainId,
      chain_id: sandboxChainId,
      type: 'savings',
      apy: '0.005',
      reward_token_address: '0xdc035d45d973e3ec169d2276ddab16f1e407384f',
      savings_token_addresses: ['0xa3931d71877C0E7a3148CB7Eb4463524FEc27fbD'],
      restricted_country_codes: [],
    },
    {
      campaign_uid: randomHexId(),
      short_description: 'Follow us on X and get USDS',
      long_description: 'Follow us on X and get USDS',
      reward_chain_id: mainnet.id,
      chain_id: mainnet.id,
      type: 'social',
      platform: 'x',
      link: 'https://x.com/sparkdotfi',
      reward_token_address: '0xdc035d45d973e3ec169d2276ddab16f1e407384f',
      restricted_country_codes: [],
    },
  ]
}

export async function setupSparkRewards({
  msw,
  testnetClient,
  account,
  wagmiConfig,
  sandboxChainId,
}: SetupSparkRewardsParams): Promise<void> {
  function prepareRewards(config: MockedRewardConfig[]): {
    tokenSymbol: string
    tokenAddress: CheckedAddress
    cumulativeAmount: NormalizedUnitNumber
    cumulativeAmountBaseUnit: BaseUnitNumber
    rewardTokenPrice?: NormalizedUnitNumber
    restrictedCountryCodes: string[]
  }[] {
    return config.map(({ rewardTokenSymbol, rewardTokenPrice, cumulativeAmount, restrictedCountryCodes }) => {
      const tokenConfig = TOKENS_ON_FORK[mainnet.id][rewardTokenSymbol]

      return {
        tokenSymbol: rewardTokenSymbol,
        tokenAddress: CheckedAddress(tokenConfig.address),
        cumulativeAmount,
        cumulativeAmountBaseUnit: NormalizedUnitNumber.toBaseUnit(cumulativeAmount, tokenConfig.decimals),
        rewardTokenPrice,
        restrictedCountryCodes,
      }
    })
  }
  const rewards = prepareRewards(REWARDS_CONFIG)
  const mainnetRewards = prepareRewards(MAINNET_REWARDS_CONFIG)

  const { merkleRoot, proofs } = await setSparkRewards({
    testnetClient,
    account,
    rewards: rewards.map(({ tokenAddress, cumulativeAmountBaseUnit }) => ({
      token: tokenAddress,
      cumulativeAmount: cumulativeAmountBaseUnit,
    })),
  })

  const mainnetMerkleRoot = await readContract(wagmiConfig, {
    address: testSparkRewardsAddress[mainnet.id],
    abi: testSparkRewardsAbi,
    functionName: 'merkleRoot',
    args: [],
    chainId: mainnet.id,
  })

  msw.use(
    http.get(`${spark2ApiUrl}/rewards/roots/${sandboxChainId}/${merkleRoot}/${account}/`, async () => {
      return HttpResponse.json(
        rewards.map(
          ({
            tokenAddress,
            tokenSymbol,
            rewardTokenPrice,
            cumulativeAmount,
            cumulativeAmountBaseUnit,
            restrictedCountryCodes,
          }) => ({
            root_hash: merkleRoot,
            epoch: 1,
            wallet_address: account,
            token_address: tokenAddress,
            token_price: rewardTokenPrice?.toFixed() ?? null,
            pending_amount: '0',
            pending_amount_normalized: '0',
            claimable_amount: cumulativeAmountBaseUnit.toFixed(),
            claimable_amount_normalized: cumulativeAmount.toFixed(),
            proof:
              proofs.find(({ token }) => token === tokenAddress)?.proof ??
              raise(`Proof for token ${tokenSymbol} not found`),
            restricted_country_codes: restrictedCountryCodes,
          }),
        ),
      )
    }),
    http.get(`${spark2ApiUrl}/rewards/roots/${mainnet.id}/${mainnetMerkleRoot}/${account}/`, async () => {
      return HttpResponse.json(
        mainnetRewards.map(
          ({ tokenAddress, rewardTokenPrice, cumulativeAmount, cumulativeAmountBaseUnit, restrictedCountryCodes }) => ({
            root_hash: mainnetMerkleRoot,
            epoch: 1,
            wallet_address: account,
            token_address: tokenAddress,
            token_price: rewardTokenPrice?.toFixed() ?? null,
            pending_amount: '0',
            pending_amount_normalized: '0',
            claimable_amount: cumulativeAmountBaseUnit.toFixed(),
            claimable_amount_normalized: cumulativeAmount.toFixed(),
            proof: [Hex.random()],
            restricted_country_codes: restrictedCountryCodes,
          }),
        ),
      )
    }),
    http.get(`${spark2ApiUrl}/rewards/campaigns/`, async () => {
      return HttpResponse.json(getCampaignsConfig(sandboxChainId))
    }),
  )
}
