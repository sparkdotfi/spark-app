import { TestContext, setup } from '@/test/e2e/setup'
import { test } from '@playwright/test'
import { mainnet } from 'viem/chains'

import { SparkRewardsPageObject } from '@/pages/SparkRewards.PageObject'
import { SPARK_REWARDS_ACTIVE_BLOCK_NUMBER } from '@/test/e2e/constants'
import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'
import { ClaimSparkRewardsDialogPageObject } from './ClaimSparkRewardsDialog.PageObject'

test.describe('Spark Rewards', () => {
  test.describe('One reward', () => {
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
      })

      sparkRewardsPage = new SparkRewardsPageObject(testContext)
    })

    test('can claim', async () => {
      await sparkRewardsPage.expectAmountToClaim(0, '101.00')
      await sparkRewardsPage.clickClaimButton(0)

      const claimDialog = new ClaimSparkRewardsDialogPageObject(testContext)

      await claimDialog.actionsContainer.acceptAllActionsAction(1)
      await claimDialog.clickCloseButtonAction()
      await sparkRewardsPage.expectAmountToClaim(0, '0.00')
    })

    test('claim all claims one', async () => {
      await sparkRewardsPage.expectAmountToClaim(0, '101.00')
      await sparkRewardsPage.clickClaimAllButton()

      const claimDialog = new ClaimSparkRewardsDialogPageObject(testContext)

      await claimDialog.actionsContainer.acceptAllActionsAction(1)
      await claimDialog.clickCloseButtonAction()
      await sparkRewardsPage.expectAmountToClaim(0, '0.00')
    })
  })

  test.describe('Multiple rewards', () => {
    test.describe('No wallet batching', () => {
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
              {
                rewardTokenSymbol: 'USDC',
                cumulativeAmount: NormalizedUnitNumber(202),
              },
            ],
          },
        })

        sparkRewardsPage = new SparkRewardsPageObject(testContext)
      })

      test('can claim one reward', async () => {
        await sparkRewardsPage.expectAmountToClaim(0, '101.00')
        await sparkRewardsPage.expectAmountToClaim(1, '202.00')
        await sparkRewardsPage.clickClaimButton(1)

        const claimDialog = new ClaimSparkRewardsDialogPageObject(testContext)

        await claimDialog.actionsContainer.acceptAllActionsAction(1)
        await claimDialog.clickCloseButtonAction()
        await sparkRewardsPage.expectAmountToClaim(0, '101.00')
        await sparkRewardsPage.expectAmountToClaim(1, '0.00')
      })

      test('can claim all', async () => {
        await sparkRewardsPage.expectAmountToClaim(0, '101.00')
        await sparkRewardsPage.expectAmountToClaim(1, '202.00')
        await sparkRewardsPage.clickClaimAllButton()

        const claimDialog = new ClaimSparkRewardsDialogPageObject(testContext)

        await claimDialog.actionsContainer.acceptAllActionsAction(2)
        await claimDialog.clickCloseButtonAction()
        await sparkRewardsPage.expectAmountToClaim(0, '0.00')
        await sparkRewardsPage.expectAmountToClaim(1, '0.00')
      })

      test('can claim all after claiming one', async () => {
        await sparkRewardsPage.expectAmountToClaim(0, '101.00')
        await sparkRewardsPage.expectAmountToClaim(1, '202.00')
        await sparkRewardsPage.clickClaimButton(0)

        const claimDialog = new ClaimSparkRewardsDialogPageObject(testContext)

        await claimDialog.actionsContainer.acceptAllActionsAction(1)
        await claimDialog.clickCloseButtonAction()
        await sparkRewardsPage.expectAmountToClaim(0, '0.00')
        await sparkRewardsPage.expectAmountToClaim(1, '202.00')

        await sparkRewardsPage.clickClaimAllButton()

        await claimDialog.actionsContainer.acceptAllActionsAction(1)
        await claimDialog.clickCloseButtonAction()
        await sparkRewardsPage.expectAmountToClaim(0, '0.00')
        await sparkRewardsPage.expectAmountToClaim(1, '0.00')
      })
    })

    test.describe('Wallet batching', () => {
      let sparkRewardsPage: SparkRewardsPageObject
      let testContext: TestContext<'connected-random'>

      test.beforeEach(async ({ page }) => {
        testContext = await setup(page, {
          blockchain: { blockNumber: SPARK_REWARDS_ACTIVE_BLOCK_NUMBER, chain: mainnet },
          initialPage: 'sparkRewards',
          account: {
            type: 'connected-random',
            atomicBatchSupported: true,
            sparkRewards: [
              {
                rewardTokenSymbol: 'USDS',
                cumulativeAmount: NormalizedUnitNumber(101),
              },
              {
                rewardTokenSymbol: 'USDC',
                cumulativeAmount: NormalizedUnitNumber(202),
              },
            ],
          },
        })

        sparkRewardsPage = new SparkRewardsPageObject(testContext)
      })

      test('can claim all', async () => {
        await sparkRewardsPage.expectAmountToClaim(0, '101.00')
        await sparkRewardsPage.expectAmountToClaim(1, '202.00')
        await sparkRewardsPage.clickClaimAllButton()

        const claimDialog = new ClaimSparkRewardsDialogPageObject(testContext)

        await claimDialog.actionsContainer.acceptBatchedActions()
        await claimDialog.clickCloseButtonAction()
        await sparkRewardsPage.expectAmountToClaim(0, '0.00')
        await sparkRewardsPage.expectAmountToClaim(1, '0.00')
      })
    })
  })
})
