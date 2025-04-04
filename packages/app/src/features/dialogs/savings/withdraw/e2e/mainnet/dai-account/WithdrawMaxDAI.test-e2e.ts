import { SavingsDialogPageObject } from '@/features/dialogs/savings/common/e2e/SavingsDialog.PageObject'
import { SavingsPageObject } from '@/pages/Savings.PageObject'
import { DEFAULT_BLOCK_NUMBER } from '@/test/e2e/constants'
import { setup } from '@/test/e2e/setup'
import { test } from '@playwright/test'
import { mainnet } from 'viem/chains'

test.describe('Withdraw max DAI', () => {
  let savingsPage: SavingsPageObject
  let withdrawalDialog: SavingsDialogPageObject

  test.beforeEach(async ({ page }) => {
    const testContext = await setup(page, {
      blockchain: {
        chain: mainnet,
        blockNumber: DEFAULT_BLOCK_NUMBER,
      },
      initialPage: 'savings',
      account: {
        type: 'connected-random',
        assetBalances: {
          ETH: 1,
          sDAI: 10_000,
        },
      },
    })

    savingsPage = new SavingsPageObject(testContext)
    await savingsPage.clickSavingsNavigationItemAction('DAI')
    await savingsPage.clickWithdrawFromAccountButtonAction()

    withdrawalDialog = new SavingsDialogPageObject({ testContext, type: 'withdraw' })
    await withdrawalDialog.clickMaxAmountAction()
  })

  test('has correct action plan', async () => {
    await withdrawalDialog.actionsContainer.expectActions([
      { type: 'withdrawFromSavings', asset: 'DAI', savingsAsset: 'sDAI', mode: 'withdraw' },
    ])
  })

  test('displays transaction overview', async () => {
    await withdrawalDialog.expectNativeRouteTransactionOverview({
      routeItems: [
        {
          tokenAmount: '10,000.00 sDAI',
          tokenUsdValue: '$11,255.99',
        },
        {
          tokenAmount: '11,255.99 DAI',
          tokenUsdValue: '$11,255.99',
        },
      ],
      outcome: '11,255.99 DAI',
      outcomeUsd: '$11,255.99',
    })
  })

  test('executes max withdrawal', async () => {
    await withdrawalDialog.actionsContainer.acceptAllActionsAction(1)

    await withdrawalDialog.expectSuccessPage()
    await withdrawalDialog.clickBackToSavingsButton()

    await savingsPage.expectSupportedStablecoinBalance('DAI', '11,255.99')
  })
})
