import { FarmDetailsPageObject } from '@/features/farm-details/FarmDetails.PageObject'
import { StakeDialogPageObject } from '@/features/farm-details/dialogs/stake/StakeDialog.PageObject'
import { DEFAULT_BLOCK_NUMBER } from '@/test/e2e/constants'
import { overrideInfoSkyRouteWithHAR } from '@/test/e2e/info-sky'
import { setup } from '@/test/e2e/setup'
import { test } from '@playwright/test'
import { NormalizedNumber } from '@sparkdotfi/common-universal'
import { Address } from 'viem'
import { mainnet } from 'viem/chains'
import { ClaimDialogPageObject } from '../../ClaimDialog.PageObject'

test.describe('Claim SKY rewards', () => {
  let farmDetailsPage: FarmDetailsPageObject
  let claimDialog: ClaimDialogPageObject
  let account: Address

  test.beforeEach(async ({ page }) => {
    const testContext = await setup(page, {
      blockchain: {
        chain: mainnet,
        blockNumber: DEFAULT_BLOCK_NUMBER,
      },
      initialPage: 'farmDetails',
      initialPageParams: {
        chainId: mainnet.id.toString(),
        address: '0x0650CAF159C5A49f711e8169D4336ECB9b950275',
      },
      account: {
        type: 'connected-random',
        assetBalances: {
          ETH: 1,
          USDS: 10_000,
        },
      },
    })
    account = testContext.account

    await overrideInfoSkyRouteWithHAR({ page, key: '1-sky-farm-with-8_51-apy' })

    farmDetailsPage = new FarmDetailsPageObject(testContext)
    await farmDetailsPage.clickInfoPanelStakeButtonAction()
    const stakeDialog = new StakeDialogPageObject(testContext)
    await stakeDialog.fillAmountAction(10_000)
    await stakeDialog.actionsContainer.acceptAllActionsAction(2)
    await stakeDialog.clickBackToFarmAction()
    await testContext.testnetController.progressSimulationAndMine(24 * 60 * 60) // 24 hours
    await page.reload()

    await farmDetailsPage.clickInfoPanelClaimButtonAction()
    claimDialog = new ClaimDialogPageObject(testContext)
  })

  test('has correct action plan', async () => {
    await claimDialog.actionsContainer.expectEnabledActionAtIndex(0)
    await claimDialog.actionsContainer.expectActions([{ type: 'claimFarmRewards', asset: 'SKY' }])
  })

  test('displays transaction overview', async () => {
    await claimDialog.expectTransactionOverview({
      reward: {
        amount: '49.44',
        amountUSD: '2.98',
      },
    })
  })

  test('executes transaction', async () => {
    await claimDialog.actionsContainer.acceptAllActionsAction(1)

    await claimDialog.expectSuccessPage()
    await claimDialog.clickBackToFarmAction()

    await farmDetailsPage.expectTokenToDepositBalance('USDS', '-')
    await farmDetailsPage.expectReward({
      reward: '0.00000',
      rewardUsd: '$0.00',
    })
    await farmDetailsPage.expectTokenBalance({
      address: account,
      symbol: 'SKY',
      balance: NormalizedNumber('49.4365427929088'),
    })
    await farmDetailsPage.expectStaked({ amount: '10,000.00', asset: 'USDS' })
  })
})
