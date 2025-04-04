import { BasePageObject } from '@/test/e2e/BasePageObject'
import { testIds } from '@/ui/utils/testIds'
import { Locator, expect } from '@playwright/test'

export class SpkStakingPageObject extends BasePageObject {
  // #region locators
  locateAvailableToStakePanel(): Locator {
    return this.locatePanelByHeader('Available to stake')
  }
  // #endregion

  // #region actions
  async clickStakeButtonAction(): Promise<void> {
    await this.page.getByTestId(testIds.spkStaking.ctaPanel.stakeButton).click()
  }
  // #endregion

  // #region assertions
  async expectAvailableToStakeTokenBalance(assetName: string, value: string): Promise<void> {
    const panel = this.locateAvailableToStakePanel()
    const row = panel.getByRole('row').filter({ has: this.page.getByRole('cell', { name: assetName, exact: true }) })
    await expect(row.getByRole('cell', { name: value })).toBeVisible()
  }

  async expectStaked({ amount, asset }: { amount: string; asset: string }): Promise<void> {
    const stakedLocator = this.page.getByTestId(testIds.spkStaking.rewardsPanel.staked)
    await expect(stakedLocator).toContainText(amount)
    await expect(stakedLocator.getByRole('img')).toHaveAttribute('alt', asset)
  }
  // #endregion
}
