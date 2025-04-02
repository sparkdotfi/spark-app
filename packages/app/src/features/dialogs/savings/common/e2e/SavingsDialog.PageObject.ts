import { TestContext } from '@/test/e2e/setup'
import { getBalance, getTokenBalance } from '@/test/e2e/utils'
import { testIds } from '@/ui/utils/testIds'
import { Locator, expect } from '@playwright/test'
import { Address } from 'viem'
import { DialogPageObject, TxOverviewWithRoute } from '../../../common/Dialog.PageObject'

export interface SavingsDialogPageObjectParams {
  testContext: TestContext
  type: 'deposit' | 'withdraw' | 'send'
}

export class SavingsDialogPageObject extends DialogPageObject {
  private readonly type: 'deposit' | 'withdraw' | 'send'

  constructor({ testContext, type }: SavingsDialogPageObjectParams) {
    super({
      testContext,
      header: new RegExp(`${type === 'deposit' ? 'Deposit to' : type === 'send' ? 'Send from' : 'Withdraw from'}`),
    })
    this.type = type
  }

  // # region locators
  locateUpgradeSwitch(): Locator {
    return this.page.getByTestId(testIds.dialog.savings.upgradeSwitch)
  }
  // #endregion locators

  // #region actions
  async clickBackToSavingsButton(): Promise<void> {
    await this.page.getByRole('button', { name: 'Back to Savings' }).click()
    await this.region.waitFor({
      state: 'detached',
    })
  }

  async fillReceiverAction(receiver: string): Promise<void> {
    await this.region.getByTestId(testIds.component.AddressInput.input).fill(receiver)
  }

  // #endregion actions

  // #region assertions
  async expectDiscrepancyWarning(discrepancy: string): Promise<void> {
    const explanation =
      this.type === 'deposit'
        ? 'The final amount received may be less than the deposit amount by up to'
        : 'You may be charged more than the withdraw amount by up to'
    await expect(
      this.region.getByText(`Market fluctuations can impact your transaction value. ${explanation} ${discrepancy}`),
    ).toBeVisible()
  }

  async expectTransactionOverviewToBeVisible(): Promise<void> {
    await expect(this.locatePanelByHeader('Transaction overview')).toBeVisible()
  }

  async expectAssetSelectorOptions(options: string[]): Promise<void> {
    const selectorOptions = await this.page.getByTestId(testIds.component.AssetSelector.option).all()
    expect(selectorOptions).toHaveLength(options.length)

    for (const [index, option] of selectorOptions.entries()) {
      await expect(option).toContainText(options[index]!)
    }
  }

  async expectTransactionOverview(transactionOverview: TransactionOverview): Promise<void> {
    const panel = this.locatePanelByHeader('Transaction overview')
    await expect(panel).toBeVisible()

    for (const [index, [label, value]] of transactionOverview.entries()) {
      const row = panel.getByTestId(testIds.dialog.depositSavings.transactionDetailsRow(index))
      await expect(row).toBeVisible()
      await expect(row).toContainText(label)
      await expect(row).toContainText(value)
    }
  }

  async expectNativeRouteTransactionOverview(transactionOverview: NativeRouteTransactionOverview): Promise<void> {
    const panel = this.locatePanelByHeader('Transaction overview')
    await expect(panel).toBeVisible()
    const savingsTxOverviewTestIds = testIds.dialog.savings.transactionOverview

    if (transactionOverview.apy) {
      const apyValue = panel.getByTestId(savingsTxOverviewTestIds.apy.value)
      const apyDescription = panel.getByTestId(savingsTxOverviewTestIds.apy.description)
      await expect(apyValue).toContainText(transactionOverview.apy.value)
      await expect(apyDescription).toContainText(transactionOverview.apy.description)
    }

    await this.expectTransactionOverviewRoute(transactionOverview.routeItems)
    if (transactionOverview.badgeTokens) {
      await this.expectSkyBadgeForTokens(transactionOverview.badgeTokens)
    }
    await this.expectOutcomeText(transactionOverview.outcome)
  }

  async expectSuccessPage(): Promise<void> {
    // for now we only check if the success message is visible
    await expect(this.page.getByText('Congrats, all done!')).toBeVisible()
  }

  async expectAddressInputError(error: string): Promise<void> {
    await expect(this.page.getByTestId(testIds.component.AddressInput.error)).toHaveText(error)
  }

  async expectReceiverIsSmartContractWarning(): Promise<void> {
    await expect(this.page.getByTestId(testIds.dialog.savings.send.addressIsSmartContractWarning)).toBeVisible()
  }

  async expectReceiverBalance({
    receiver,
    expectedBalance,
  }: {
    receiver: Address
    expectedBalance: number
  }): Promise<void> {
    const currentBalance = await getBalance({
      client: this.testContext.testnetController.client,
      address: receiver,
    })
    expect(currentBalance.eq(expectedBalance)).toBe(true)
  }

  async expectReceiverTokenBalance({
    receiver,
    token,
    expectedBalance,
  }: {
    receiver: Address
    token: { address: Address; decimals: number }
    expectedBalance: number
  }): Promise<void> {
    const currentTokenBalance = await getTokenBalance({
      client: this.testContext.testnetController.client,
      address: receiver,
      token,
    })
    expect(currentTokenBalance.eq(expectedBalance)).toBe(true)
  }

  expectUpgradeSwitchToBeHidden(): Promise<void> {
    return expect(this.locateUpgradeSwitch()).toBeHidden()
  }

  clickUpgradeSwitch(): Promise<void> {
    return this.locateUpgradeSwitch().click()
  }
  // #endregion assertions
}

type TransactionOverview = [string, string][]

interface NativeRouteTransactionOverview extends TxOverviewWithRoute {
  apy?: {
    value: string
    description: string
  }
}
