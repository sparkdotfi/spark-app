import { testSparkRewardsAddress, testStakingRewardsAbi } from '@/config/contracts-generated'
import { Page } from '@playwright/test'
import { TestnetClient } from '@sparkdotfi/common-testnets'
import { CheckedAddress } from '@sparkdotfi/common-universal'
import { Address } from 'viem'
import { mainnet } from 'viem/chains'

export interface SetSpkStakingBaDataParams {
  page: Page
  testnetClient: TestnetClient
  stats: {
    tvl: string
    number_of_wallets: number
    apr: string
  }
  walletData: {
    amount_staked: string
    pending_amount_normalized: string
    pending_amount_rate: string
    cumulative_amount_normalized: string
    timestamp: number
    epoch: number
    proof: string[]
  }
  account: Address
}

export async function setSpkStakingBaData({
  page,
  testnetClient,
  stats,
  walletData,
  account,
}: SetSpkStakingBaDataParams): Promise<void> {
  const merkleRoot = await testnetClient.readContract({
    address: CheckedAddress(testSparkRewardsAddress[mainnet.id]),
    abi: testStakingRewardsAbi,
    functionName: 'merkleRoot',
  })

  await page.route(`${process.env.VITE_INFO_SKY_API_URL}/spk-staking/stats/`, async (route) => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify(stats),
    })
  })

  await page.route(
    `${process.env.VITE_INFO_SKY_API_URL}/spk-staking/${mainnet.id}/${merkleRoot}/${account}/`,
    async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify(walletData),
      })
    },
  )
}
