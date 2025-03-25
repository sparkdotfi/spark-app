import { BasePageObject } from '@/test/e2e/BasePageObject'
import { buildUrl } from '@/test/e2e/setup'
import { parseTable } from '@/test/e2e/utils'
import { testIds } from '@/ui/utils/testIds'
import { expect } from '@playwright/test'
import { assert } from '@sparkdotfi/common-universal'
import { z } from 'zod'

export class MyPortfolioPageObject extends BasePageObject {
  // #region actions
  async clickDepositButtonAction(assetName: string): Promise<void> {
    const panel = this.locatePanelByHeader('Deposit')
    const row = panel.getByRole('row').filter({ has: this.page.getByRole('cell', { name: assetName, exact: true }) })
    await row.getByRole('button', { name: 'Deposit' }).click()
  }

  async clickWithdrawButtonAction(assetName: string): Promise<void> {
    const panel = this.locatePanelByHeader('Deposit')
    const row = panel.getByRole('row').filter({ has: this.page.getByRole('cell', { name: assetName, exact: true }) })
    await row.getByRole('button', { name: 'Withdraw' }).click()
  }

  async clickCollateralSwitchAction(assetName: string): Promise<void> {
    const panel = this.locatePanelByHeader('Deposit')
    const row = panel.getByRole('row').filter({ has: this.page.getByRole('cell', { name: assetName, exact: true }) })
    await row.getByRole('switch').click()
  }

  async clickBorrowButtonAction(assetName: string): Promise<void> {
    const panel = this.locatePanelByHeader('Borrow')
    const row = panel.getByRole('row').filter({ has: this.page.getByRole('cell', { name: assetName, exact: true }) })
    await row.getByRole('button', { name: 'Borrow' }).click()
  }

  async clickRepayButtonAction(assetName: string): Promise<void> {
    const panel = this.locatePanelByHeader('Borrow')
    const row = panel.getByRole('row').filter({ has: this.page.getByRole('cell', { name: assetName, exact: true }) })
    await row.getByRole('button', { name: 'Repay' }).click()
  }

  async clickEModeButtonAction(): Promise<void> {
    await this.page.getByTestId(testIds.component.EModeButton).click()
  }

  async parseDepositTable(): Promise<DepositTableRow[]> {
    const table = this.locatePanelByHeader('Deposit')
    return parseTable(table, (row) => {
      return depositTableRowSchema.parse({
        asset: row[0],
        inWallet: row[1]?.trim().split(/[ $]/)[0],
        deposit: row[2]?.trim().split(/[ $]/)[0],
      })
    })
  }

  async parseBorrowTable(): Promise<BorrowTableRow[]> {
    const table = this.locatePanelByHeader('Borrow')
    return parseTable(table, (row) => {
      return borrowTableRowSchema.parse({
        asset: row[0],
        available: row[1]?.trim().split(/[ $]/)[0],
        yourBorrow: row[2]?.trim().split(/[ $]/)[0],
      })
    })
  }

  async parseWalletTable(): Promise<WalletTableRow[]> {
    const table = this.locatePanelByHeader('Your wallet')
    return parseTable(table, (row) => {
      return walletTableRowSchema.parse({
        asset: row[0],
        amount: row[1]?.trim().split(/[ $]/)[0],
      })
    })
  }

  async goToMyPortfolioAction(): Promise<void> {
    await this.page.goto(buildUrl('myPortfolio'))
  }
  // #endregion

  // #region assertions
  async expectPositionToBeEmpty(): Promise<void> {
    const deposit = this.page.getByTestId(testIds.myPortfolio.deposited)
    const borrow = this.page.getByTestId(testIds.myPortfolio.borrowed)
    await expect(deposit).toHaveText('-')
    await expect(borrow).toHaveText('-')
  }

  async expectBorrowedAssetsToBeEmpty(): Promise<void> {
    const borrow = this.page.getByTestId(testIds.myPortfolio.borrowed)
    await expect(borrow).toHaveText('-')
  }

  async expectHealthFactor(hf: string): Promise<void> {
    const locator = this.page.getByTestId(testIds.component.HealthFactorGauge.value)
    await expect(locator).toHaveText(hf)
  }

  async expectDepositedAssets(total: string): Promise<void> {
    const locator = this.page.getByTestId(testIds.myPortfolio.deposited)
    await expect(locator).toHaveText(total)
  }

  async expectBorrowedAssets(total: string): Promise<void> {
    const locator = this.page.getByTestId(testIds.myPortfolio.borrowed)
    await expect(locator).toHaveText(total)
  }

  async expectGuestScreen(): Promise<void> {
    await expect(
      this.page.getByRole('heading', { name: 'Connect your wallet to use Spark', exact: true }),
    ).toBeVisible()
    await expect(this.page.getByRole('button', { name: 'Connect wallet', exact: true })).toBeVisible()
    await expect(this.page.getByRole('button', { name: 'Try in Sandbox', exact: true })).toBeVisible()
  }

  async expectDepositTable(assets: Record<string, number>): Promise<void> {
    await expect(async () => {
      const depositTable = await this.parseDepositTable()

      for (const [asset, expectedAmount] of Object.entries(assets)) {
        const row = depositTable.find((row) => row.asset === asset)
        expect(row, `Couldn't find asset ${asset}`).toBeDefined()
        assert(row)
        expect(expectedAmount, `Couldn't find asset ${row.asset}`).toBeDefined()
        expect(row.deposit).toBe(expectedAmount)
      }

      return true
    }).toPass()
  }

  async expectBalancesInDepositTable(assets: Record<string, number>): Promise<void> {
    await expect(async () => {
      const depositTable = await this.parseDepositTable()

      for (const [asset, expectedAmount] of Object.entries(assets)) {
        const row = depositTable.find((row) => row.asset === asset)
        expect(row, `Couldn't find asset ${asset}`).toBeDefined()
        assert(row)
        expect(expectedAmount, `Couldn't find asset ${row.asset}`).toBeDefined()
        expect(row.inWallet).toBe(expectedAmount)
      }

      return true
    }).toPass()
  }

  async expectCollateralSwitch(asset: string, checked: boolean): Promise<void> {
    const panel = this.locatePanelByHeader('Deposit')
    const row = panel.getByRole('row').filter({ has: this.page.getByRole('cell', { name: asset, exact: true }) })
    const switchLocator = row.getByRole('switch')
    await expect(switchLocator).toHaveAttribute('aria-checked', checked ? 'true' : 'false')
  }

  async expectBorrowTable(assets: Record<string, number>): Promise<void> {
    await expect(async () => {
      const borrowTable = await this.parseBorrowTable()

      for (const [asset, expectedAmount] of Object.entries(assets)) {
        const row = borrowTable.find((row) => row.asset === asset)
        expect(row, `Couldn't find asset ${asset}`).toBeDefined()
        assert(row)
        expect(expectedAmount, `Couldn't find asset ${row.asset}`).toBeDefined()
        expect(row.yourBorrow).toBe(expectedAmount)
      }

      return true
    }).toPass()
  }

  async expectAssetToBeInDepositTable(asset: string): Promise<void> {
    const table = this.locatePanelByHeader('Deposit')
    await expect(
      // @note For some reason you can't do table.getByRole('cell', ...)
      table
        .getByRole('row')
        .filter({ has: this.page.getByRole('cell', { name: asset, exact: true }) }),
    ).toBeVisible()
  }

  async expectAssetToBeInBorrowTable(asset: string): Promise<void> {
    const table = this.locatePanelByHeader('Borrow')
    await expect(
      // @note For some reason you can't do table.getByRole('cell', ...)
      table
        .getByRole('row')
        .filter({ has: this.page.getByRole('cell', { name: asset, exact: true }) }),
    ).toBeVisible()
  }

  async expectNonZeroAmountInBorrowTable(asset: string): Promise<void> {
    const table = this.locatePanelByHeader('Borrow')
    const row = table.getByRole('row').filter({ has: this.page.getByRole('cell', { name: asset, exact: true }) })
    const amount = row.getByRole('cell').nth(2)
    await expect(amount).not.toHaveText('—')
  }

  async expectEModeBadgeText(eModeBadgeText: string): Promise<void> {
    await expect(this.page.getByTestId(testIds.component.EModeBadge)).toHaveText(eModeBadgeText)
  }
  // #endregion assertions
}

const numberOrDash = z.string().pipe(
  z.preprocess((z: unknown): string => {
    if (z === '—') {
      return '0'
    }
    return (z as string).replace(/[\,]/g, '')
  }, z.coerce.number()),
)

const depositTableRowSchema = z.object({
  asset: z.string(),
  inWallet: numberOrDash,
  deposit: numberOrDash,
})
export type DepositTableRow = z.infer<typeof depositTableRowSchema>

const borrowTableRowSchema = z.object({
  asset: z.string(),
  available: numberOrDash,
  yourBorrow: numberOrDash,
})
export type BorrowTableRow = z.infer<typeof borrowTableRowSchema>

const walletTableRowSchema = z.object({
  asset: z.string(),
  amount: numberOrDash,
})
export type WalletTableRow = z.infer<typeof walletTableRowSchema>
