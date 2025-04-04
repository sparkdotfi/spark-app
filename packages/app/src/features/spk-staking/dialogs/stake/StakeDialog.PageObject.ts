import { DialogPageObject } from '@/features/dialogs/common/Dialog.PageObject'
import { TestContext } from '@/test/e2e/setup'
import { testIds } from '@/ui/utils/testIds'

export class StakeDialogPageObject extends DialogPageObject {
  constructor(testContext: TestContext) {
    super({
      testContext,
      header: /Stake/,
    })
  }

  // #region actions
  async clickBackToStakingAction(): Promise<void> {
    await this.page.getByRole('button', { name: 'Back to Staking' }).click()
    await this.region.waitFor({
      state: 'detached',
    })
  }
  // #endregion
  // #region assertions
  async expectTransactionOverview(transactionOverview: TransactionOverview): Promise<void> {
    await expect(
      this.page.getByTestId(testIds.spkStaking.stakeDialog.transactionOverview.estimatedRewards.apy),
    ).toContainText(transactionOverview.estimatedRewards.apy)
    await expect(
      this.page.getByTestId(testIds.spkStaking.stakeDialog.transactionOverview.estimatedRewards.description),
    ).toContainText(transactionOverview.estimatedRewards.description)

    await expect(
      this.page.getByTestId(testIds.spkStaking.stakeDialog.transactionOverview.unstakingDelay),
    ).toContainText(transactionOverview.unstakingDelay)
  }
  // #endregion
}

export interface TransactionOverview {
  estimatedRewards: {
    apy: string
    description: string
  }
  unstakingDelay: string
}
