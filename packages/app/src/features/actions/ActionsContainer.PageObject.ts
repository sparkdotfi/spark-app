import { Locator, expect } from '@playwright/test'

import { formatPercentage } from '@/domain/common/format'
import { BasePageObject } from '@/test/e2e/BasePageObject'
import { TestContext } from '@/test/e2e/setup'
import { testIds } from '@/ui/utils/testIds'
import { Percentage } from '@marsfoundation/common-universal'
import { ActionType } from './logic/types'

export class ActionsPageObject extends BasePageObject {
  constructor(testContext: TestContext, locator?: Locator) {
    super(testContext, locator)
    if (!locator) {
      this.region = this.locatePanelByHeader('Actions')
    }
  }

  locateSettingsDialog(): Locator {
    return this.locateDialogByHeader('Settings')
  }

  locateActionAtIndex(index: number): Locator {
    return this.region.getByTestId(testIds.actions.row(index))
  }

  // #region actions
  async acceptAllActionsAction(expectedNumberOfActions: number): Promise<void> {
    for (let index = 0; index < expectedNumberOfActions; index++) {
      const row = this.region.getByTestId(testIds.actions.row(index))

      await row.getByRole('button', { name: actionButtonRegex }).click()
      await expect(row.getByRole('button', { name: actionButtonRegex })).not.toBeVisible()
      // @note: we are setting block timestamp of the next tx (especially after executing all txs)
      await this.testContext.testnetController.progressSimulation(5)
    }
  }

  async acceptActionAtIndex(index: number): Promise<void> {
    const row = this.region.getByTestId(testIds.actions.row(index))
    await row.getByRole('button', { name: actionButtonRegex }).click()
    await expect(row.getByRole('button', { name: actionButtonRegex })).not.toBeVisible()
    // @note: we are setting block timestamp of the next tx (especially after executing all txs)
    await this.testContext.testnetController.progressSimulation(5)
  }

  async acceptBatchedActions(): Promise<void> {
    this.testContext.testnetController.autoProgressSimulationController.enable(5)
    const button = this.region.getByRole('button', { name: 'Execute' })
    await button.click()
    await expect(button).not.toBeVisible()
    this.testContext.testnetController.autoProgressSimulationController.disable()
    await this.testContext.testnetController.progressSimulation(5)
  }

  async switchPreferPermitsAction(): Promise<void> {
    await this.region.getByTestId(testIds.actions.settings.dialog).click()
    const settingsDialog = this.locateSettingsDialog()
    await settingsDialog.getByRole('switch', { disabled: false }).click()
    await settingsDialog.getByTestId(testIds.dialog.closeButton).first().click()
  }

  async openSettingsDialogAction(): Promise<void> {
    await this.region.getByTestId(testIds.actions.settings.dialog).click()
  }

  async fillSlippageAction(slippage: string | number): Promise<void> {
    if (typeof slippage === 'number') {
      slippage = formatPercentage(Percentage(slippage), { skipSign: true })
    }
    await this.locateSettingsDialog().getByRole('textbox').fill(slippage)
  }
  // #endregion actions

  // #region assertions
  async expectActions(actions: SimplifiedAction[]): Promise<void> {
    for (const [index, expectedAction] of actions.entries()) {
      await this.expectActionAtIndex(index, expectedAction)
    }

    await expect(this.region.getByTestId(testIds.actions.row(actions.length))).toBeHidden() // this ensures that there are no more rows
  }

  async expectDisabledActions(actions: SimplifiedAction[]): Promise<void> {
    for (const [index, expectedAction] of actions.entries()) {
      await this.expectActionAtIndex(index, expectedAction)
      await this.expectDisabledActionAtIndex(index)
    }

    await expect(this.region.getByTestId(testIds.actions.row(actions.length))).toBeHidden() // this ensures that there are no more rows
  }

  async expectActionAtIndex(index: number, expectedAction: SimplifiedAction): Promise<void> {
    const row = this.locateActionAtIndex(index)
    await expect(row).toContainText(actionToTitle(expectedAction))
  }

  async expectEnabledActionAtIndex(index: number, expectedAction?: SimplifiedAction): Promise<void> {
    if (expectedAction) {
      await this.expectActionAtIndex(index, expectedAction)
    }

    const row = this.locateActionAtIndex(index)
    await expect(row.getByRole('button', { name: actionButtonRegex, disabled: false })).toBeVisible()
  }

  async expectDisabledActionAtIndex(index: number): Promise<void> {
    const row = this.locateActionAtIndex(index)
    await expect(row.getByRole('button', { name: actionButtonRegex, disabled: true })).toBeVisible()
  }

  async expectExtendedActions(actions: SimplifiedExtendedAction[]): Promise<void> {
    for (const [index, expectedAction] of actions.entries()) {
      await this.expectExtendedActionAtIndex(index, expectedAction)
    }

    await expect(this.locateActionAtIndex(actions.length)).toBeHidden() // this ensures that there are no more rows
  }

  async expectExtendedActionAtIndex(index: number, expectedAction: SimplifiedExtendedAction): Promise<void> {
    const row = this.locateActionAtIndex(index)
    await expect(row).toContainText(actionToTitle(expectedAction))
    await expect(row).toContainText(`${expectedAction.amount} ${expectedAction.asset}`)
  }
  // #endregion assertions
}

type BaseAction = {
  asset: string
}

type SimplifiedWithdrawFromSavingsAction = BaseAction & {
  type: 'withdrawFromSavings'
  savingsAsset: string
  mode: 'send' | 'withdraw'
}

type SimplifiedUpgradeAction = {
  type: 'upgrade'
  fromToken: string
  toToken: string
}

type SimplifiedDowngradeAction = {
  type: 'downgrade'
  fromToken: string
  toToken: string
}

type SimplifiedStakeAction = {
  type: 'stake'
  stakingToken: string
  rewardToken: string
}

type SimplifiedUnstakeAction = {
  type: 'unstake'
  stakingToken: string
  rewardToken: string
  exit: boolean
}

type SimplifiedPsmConvertAction = {
  type: 'psmConvert'
  inToken: string
  outToken: string
}

type SimplifiedSetUserEModeAction = {
  type: 'setUserEMode'
  eModeCategoryId: number
}

type SimplifiedMakerStableToSavingsAction = BaseAction & {
  type: 'depositToSavings'
  savingsAsset: string
}

type SimplifiedStakeSparkAction = {
  type: 'stakeSpark'
  spk: string
  amount: string
}

type SimplifiedUnstakeSparkAction = {
  type: 'unstakeSpark'
  spk: string
  amount: string
}

type SimplifiedGenericAction = BaseAction & {
  type: Exclude<
    ActionType,
    | 'exchange'
    | 'depositToSavings'
    | 'withdrawFromSavings'
    | 'setUserEMode'
    | 'upgrade'
    | 'downgrade'
    | 'stake'
    | 'unstake'
    | 'psmConvert'
    | 'stakeSpark'
    | 'unstakeSpark'
  >
}

type SimplifiedAction =
  | SimplifiedGenericAction
  | SimplifiedWithdrawFromSavingsAction
  | SimplifiedMakerStableToSavingsAction
  | SimplifiedSetUserEModeAction
  | SimplifiedUpgradeAction
  | SimplifiedDowngradeAction
  | SimplifiedStakeAction
  | SimplifiedUnstakeAction
  | SimplifiedPsmConvertAction
  | SimplifiedStakeSparkAction
  | SimplifiedUnstakeSparkAction

function actionToTitle(action: SimplifiedAction): string {
  switch (action.type) {
    case 'approve':
      return `Approve ${action.asset}`
    case 'deposit':
      return `Deposit ${action.asset}`
    case 'withdraw':
      return `Withdraw ${action.asset}`
    case 'approveDelegation':
      return `Approve delegation ${action.asset}`
    case 'borrow':
      return `Borrow ${action.asset}`
    case 'permit':
      return `Permit ${action.asset}`
    case 'repay':
      return `Repay with ${action.asset}`
    case 'setUseAsCollateral':
      return '' // not used in collateral dialog tests
    case 'setUserEMode':
      return action.eModeCategoryId === 0 ? 'Disable E-Mode' : 'Enable E-Mode'
    case 'depositToSavings':
      return `Convert ${action.asset} to ${action.savingsAsset}`
    case 'withdrawFromSavings':
      return `Convert ${action.savingsAsset} to ${action.asset}${action.mode === 'send' ? ' and send' : ''}`
    case 'claimMarketRewards':
      return 'Claim'
    case 'upgrade':
      return `Upgrade ${action.fromToken} to ${action.toToken}`
    case 'downgrade':
      return `Downgrade ${action.fromToken} to ${action.toToken}`
    case 'stake':
      return `Deposit ${action.stakingToken} into ${action.rewardToken} Farm`
    case 'unstake':
      return action.exit
        ? `Exit from ${action.rewardToken} Farm`
        : `Withdraw ${action.stakingToken} from ${action.rewardToken} Farm`
    case 'claimFarmRewards':
      return 'Claim rewards'
    case 'claimSparkRewards':
      return 'Claim rewards'
    case 'psmConvert':
      return `Convert ${action.inToken} to ${action.outToken}`
    case 'stakeSpark':
      return `Stake ${action.spk}`
    case 'unstakeSpark':
      return `Unstake ${action.spk}`
  }
}

const actionVerbs = [
  'Approve',
  'Deposit',
  'Withdraw',
  'Send',
  'Borrow',
  'Permit',
  'Repay',
  'Enable',
  'Disable',
  'Convert',
  'Claim',
  'Upgrade',
  'Downgrade',
  'Exit',
]
const actionButtonRegex = new RegExp(`^(${actionVerbs.join('|')})$`)

type SimplifiedExtendedAction =
  | { type: 'approve'; asset: string; amount: string }
  | { type: 'permit'; asset: string; amount: string }
  | { type: 'deposit'; asset: string; amount: string }
  | { type: 'borrow'; asset: string; amount: string }
