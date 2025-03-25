import { TestContext, setup } from '@/test/e2e/setup'
import { test } from '@playwright/test'
import { mainnet } from 'viem/chains'

import { SparkRewardsPageObject } from '@/pages/SparkRewards.PageObject'
import { SPARK_REWARDS_ACTIVE_BLOCK_NUMBER, TOKENS_ON_FORK } from '@/test/e2e/constants'
import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'

test.describe('Spark Rewards', () => {
  let sparkRewardsPage: SparkRewardsPageObject
  let testContext: TestContext<'connected-random'>

  test.beforeEach(async ({ page }) => {
    testContext = await setup(page, {
      blockchain: { blockNumber: SPARK_REWARDS_ACTIVE_BLOCK_NUMBER, chain: mainnet },
      initialPage: 'sparkRewards',
      account: {
        type: 'connected-random',
        sparkRewards: [
          {
            rewardTokenSymbol: 'USDS',
            cumulativeAmount: NormalizedUnitNumber(101),
          },
        ],
      },
      sparkRewards: {
        ongoingCampaigns: [
          {
            type: 'sparklend',
            campaign_uid: '1',
            short_description: 'Borrow wstETH get USDS',
            long_description: 'Borrow wstETH get USDS',
            restricted_country_codes: [],
            reward_token_address: TOKENS_ON_FORK[mainnet.id].USDS.address,
            reward_chain_id: 1,
            deposit_token_addresses: [TOKENS_ON_FORK[mainnet.id].wstETH.address],
            borrow_token_addresses: [],
            chain_id: 1,
            apy: '0.005',
          },
          {
            type: 'savings',
            campaign_uid: '1',
            short_description: 'Deposit into sUSDS get USDS',
            long_description: 'Deposit into sUSDS get USDS',
            restricted_country_codes: [],
            reward_token_address: TOKENS_ON_FORK[mainnet.id].USDS.address,
            reward_chain_id: 1,
            savings_token_addresses: [TOKENS_ON_FORK[mainnet.id].sUSDS.address],
            chain_id: 1,
            apy: '0.005',
          },
        ],
      },
    })

    sparkRewardsPage = new SparkRewardsPageObject(testContext)
  })

  test('displays ongoing campaigns', async () => {
    await sparkRewardsPage.expectOngoingCampaignsRow(0, 'Borrow wstETH get USDS')
    await sparkRewardsPage.expectOngoingCampaignsRow(1, 'Deposit into sUSDS get USDS')
  })

  test('click start redirects to market details', async () => {
    await sparkRewardsPage.clickStartCampaignButton(0)
    await sparkRewardsPage.expectToBeRedirectedToMarketDetails(TOKENS_ON_FORK[mainnet.id].wstETH.address)
  })
})
