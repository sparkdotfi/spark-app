import { Locator, expect } from '@playwright/test'

import { BasePageObject } from '@/test/e2e/BasePageObject'
import { testIds } from '@/ui/utils/testIds'

export type DialogType = 'Lend' | 'Deposit' | 'Borrow'

export class MarketDetailsPageObject extends BasePageObject {
  // #region locators
  locateMarketOverview(): Locator {
    return this.locatePanelByHeader('Market overview')
  }

  locateMyWallet(): Locator {
    return this.locatePanelByHeader('My wallet')
  }

  locateSupplyStatusPanel(): Locator {
    return this.locatePanelByHeader('Can be supplied')
  }

  locateBorrowStatusPanel(): Locator {
    return this.locatePanelByHeader('Can be borrowed')
  }

  locateCollateralStatusPanel(): Locator {
    return this.locatePanelByHeader('Can be used as collateral')
  }

  locateDisabledCollateralStatusPanel(): Locator {
    return this.locatePanelByHeader('Cannot be used as collateral')
  }

  locateOraclePanel(): Locator {
    return this.locatePanelByHeader(/Yielding Fixed Price|Market Price|Underlying Asset Price|Fixed Price/)
  }

  locateInstantlyAvailableToSupply(panelLocator: Locator): Locator {
    return panelLocator.getByTestId(testIds.marketDetails.supplyStatusPanel.instantlyAvailableToSupply)
  }

  locateBorrowLiquidity(panelLocator: Locator): Locator {
    return panelLocator.getByTestId(testIds.marketDetails.borrowStatusPanel.liquidity)
  }

  locateSupplyCap(panelLocator: Locator): Locator {
    return panelLocator.getByTestId(testIds.marketDetails.supplyStatusPanel.cap)
  }

  locateBorrowCap(panelLocator: Locator): Locator {
    return panelLocator.getByTestId(testIds.marketDetails.borrowStatusPanel.cap)
  }

  locatePanelAutomatorCooldownTimer(panelLocator: Locator): Locator {
    return panelLocator.getByTestId(testIds.marketDetails.capAutomator.cooldownTimer)
  }
  // #endregion

  // #region actions
  async openDialogAction(type: DialogType): Promise<void> {
    await this.page.locator('main').getByRole('button', { name: type }).click()
  }
  // #endregion

  // #region assertions
  async expectMarketOverviewValue(key: string, value: string): Promise<void> {
    await expect(
      this.locateMarketOverview()
        .getByRole('listitem')
        .filter({ has: this.page.getByText(key) })
        .last(),
    ).toContainText(value)
  }

  async expectConnectWalletButton(): Promise<void> {
    await expect(
      this.page.getByTestId(testIds.component.ConnectOrSandboxCTAPanel).getByRole('button', { name: 'Connect wallet' }),
    ).toBeEnabled()
  }

  async expectDialogButtonToBeActive(type: DialogType): Promise<void> {
    await expect(this.locateMyWallet().getByRole('button', { name: type })).toBeEnabled()
  }

  async expectDialogButtonToBeInactive(type: DialogType): Promise<void> {
    await expect(this.locateMyWallet().getByRole('button', { name: type })).toBeDisabled()
  }

  async expectDialogButtonToBeInvisible(type: DialogType): Promise<void> {
    await expect(this.locateMyWallet().getByRole('button', { name: type })).not.toBeVisible()
  }

  async expectBorrowNotAvailableDisclaimer(): Promise<void> {
    await expect(this.locateMyWallet().getByText('To borrow you need to deposit any other asset first.')).toBeVisible()
  }

  async expectWalletBalance(value: string): Promise<void> {
    await expect(this.locateMyWallet().getByTestId(testIds.marketDetails.walletPanel.balance)).toHaveText(value)
  }

  async expectToBeLoaded(): Promise<void> {
    await expect(this.locateMarketOverview()).toBeVisible()
  }

  async expectMarketOverviewToBeHidden(): Promise<void> {
    await expect(this.locateMarketOverview()).not.toBeVisible()
  }

  async expectDebtCeiling(value: string): Promise<void> {
    await expect(this.page.getByTestId(testIds.marketDetails.collateralStatusPanel.debtCeiling)).toHaveText(value)
  }

  async expectDebt(value: string): Promise<void> {
    await expect(this.page.getByTestId(testIds.marketDetails.collateralStatusPanel.debt)).toHaveText(value)
  }

  async expect404(): Promise<void> {
    await expect(this.page.getByText('404')).toBeVisible()
    await expect(this.page.getByText('The requested page could not be found.')).toBeVisible()
  }

  async expectSupplyPanelNotVisible(): Promise<void> {
    await expect(this.locateSupplyStatusPanel()).not.toBeVisible()
  }

  async expectBorrowPanelNotVisible(): Promise<void> {
    await expect(this.locateBorrowStatusPanel()).not.toBeVisible()
  }

  async expectCollateralPanelNotVisible(): Promise<void> {
    await expect(this.locateCollateralStatusPanel()).not.toBeVisible()
  }

  async expectToBeDisabledAsCollateral(): Promise<void> {
    await expect(this.locateDisabledCollateralStatusPanel()).toBeVisible()
  }

  async expectSupplyCap(value: string): Promise<void> {
    await expect(this.page.getByTestId(testIds.marketDetails.supplyStatusPanel.cap)).toHaveText(value)
  }

  async expectInstantlyAvailableToSupply(value: string): Promise<void> {
    await expect(this.page.getByTestId(testIds.marketDetails.supplyStatusPanel.instantlyAvailableToSupply)).toHaveText(
      value,
    )
  }

  async expectSupplyCapNotVisible(): Promise<void> {
    await expect(this.page.getByTestId(testIds.marketDetails.supplyStatusPanel.cap)).not.toBeVisible()
  }

  async expectSupplyCapCooldown(value: string): Promise<void> {
    const timerTriggerLocator = this.locatePanelAutomatorCooldownTimer(this.locateSupplyStatusPanel())
    await timerTriggerLocator.hover()
    const tooltipLocator = this.page.getByRole('tooltip')

    await expect(tooltipLocator).toContainText(value)
    // Move mouse away to dismiss the tooltip
    await this.page.keyboard.press('Escape')
    await expect(tooltipLocator).not.toBeVisible()
  }

  async expectCollateralCap(value: string): Promise<void> {
    await expect(this.locateSupplyCap(this.locateCollateralStatusPanel())).toHaveText(value)
  }

  async expectDisabledCollateralInfoVisible(): Promise<void> {
    const panel = this.locateDisabledCollateralStatusPanel()

    await expect(panel.getByText('Max LTV')).toBeVisible()
    await expect(panel.getByText('Liquidation threshold')).toBeVisible()
    await expect(panel.getByText('Liquidation penalty')).toBeVisible()
  }

  async expectCollateralMaxCap(value: string): Promise<void> {
    await expect(this.locateSupplyCap(this.locateCollateralStatusPanel())).toHaveText(value)
  }

  async expectCollateralMaxCapNotVisible(): Promise<void> {
    await expect(this.locateSupplyCap(this.locateCollateralStatusPanel())).not.toBeVisible()
  }

  async expectCollateralCapCooldown(value: string): Promise<void> {
    const timerTriggerLocator = this.locatePanelAutomatorCooldownTimer(this.locateCollateralStatusPanel())
    await timerTriggerLocator.hover()
    const tooltipLocator = this.page.getByRole('tooltip')

    await expect(tooltipLocator).toContainText(value)
    // Move mouse away to dismiss the tooltip
    await this.page.keyboard.press('Escape')
    await expect(tooltipLocator).not.toBeVisible()
  }

  async expectBorrowLiquidity(value: string): Promise<void> {
    await expect(this.locateBorrowLiquidity(this.locateBorrowStatusPanel())).toHaveText(value)
  }

  async expectBorrowCap(value: string): Promise<void> {
    await expect(this.locateBorrowCap(this.locateBorrowStatusPanel())).toHaveText(value)
  }

  async expectBorrowCapNotVisible(): Promise<void> {
    await expect(this.locateBorrowCap(this.locateBorrowStatusPanel())).not.toBeVisible()
  }

  async expectBorrowCapCooldown(value: string): Promise<void> {
    const timerTriggerLocator = this.locatePanelAutomatorCooldownTimer(this.locateBorrowStatusPanel())
    await timerTriggerLocator.hover()
    const tooltipLocator = this.page.getByRole('tooltip')

    await expect(tooltipLocator).toContainText(value)
    // Move mouse away to dismiss the tooltip
    await this.page.keyboard.press('Escape')
    await expect(tooltipLocator).not.toBeVisible()
  }

  async expectOraclePanelToHaveTitle(title: string): Promise<void> {
    const panel = this.locateOraclePanel()

    await expect(panel.getByRole('heading', { name: title })).toBeVisible()
  }

  async expectOracleToBeRedundant(): Promise<void> {
    const panel = this.locateOraclePanel()

    await expect(panel.getByRole('heading', { name: /(Redundant)/ })).toBeVisible()

    const providersAmount = await panel
      .getByTestId(testIds.marketDetails.oraclePanel.providersList)
      .getByAltText('logo')
      .count()

    // should have at least 2 providers
    expect(providersAmount).toBeGreaterThan(1)
  }

  async expectOracleToBeNotRedundant(): Promise<void> {
    const panel = this.locateOraclePanel()

    await expect(panel.getByRole('heading', { name: /(Redundant)/ })).not.toBeVisible()

    const providersAmount = await panel
      .getByTestId(testIds.marketDetails.oraclePanel.providersList)
      .getByAltText('logo')
      .count()

    expect(providersAmount).toBe(1)
  }

  async expectOracleInfo({ price, asset, oracleContract }: OracleInfo): Promise<void> {
    await this.expectOraclePrice(price)
    await this.expectOracleAsset(asset)
    await this.expectOracleContract(oracleContract)
  }

  async expectYieldingFixedOracleBaseAssetInfo({ asset, price, oracleContract }: OracleInfo): Promise<void> {
    await this.expectOracleBaseAssetSymbol(asset)
    await this.expectOracleBaseAssetPrice(price)
    await this.expectOracleBaseAssetContract(oracleContract)
  }

  async expectYieldingFixedOracleRatioInfo({
    ratio,
    ratioContract,
  }: { ratio: string; ratioContract: string }): Promise<void> {
    await this.expectOracleRatio(ratio)
    await this.expectOracleRatioContract(ratioContract)
  }

  async expectOraclePrice(value: string): Promise<void> {
    await expect(this.page.getByTestId(testIds.marketDetails.oraclePanel.price)).toHaveText(value)
  }

  async expectOracleContract(value: string): Promise<void> {
    await expect(this.page.getByTestId(testIds.marketDetails.oraclePanel.oracleContract)).toHaveText(value)
  }

  async expectOracleAsset(value: string): Promise<void> {
    await expect(this.page.getByTestId(testIds.marketDetails.oraclePanel.asset)).toHaveText(value)
  }

  async expectOracleBaseAssetSymbol(value: string): Promise<void> {
    await expect(this.page.getByTestId(testIds.marketDetails.oraclePanel.yieldingFixed.baseAssetSymbol)).toHaveText(
      value,
    )
  }

  async expectOracleBaseAssetPrice(value: string): Promise<void> {
    await expect(this.page.getByTestId(testIds.marketDetails.oraclePanel.yieldingFixed.baseAssetPrice)).toHaveText(
      value,
    )
  }

  async expectOracleBaseAssetContract(value: string): Promise<void> {
    await expect(
      this.page.getByTestId(testIds.marketDetails.oraclePanel.yieldingFixed.baseAssetOracleContract),
    ).toHaveText(value)
  }

  async expectOracleRatio(value: string): Promise<void> {
    await expect(this.page.getByTestId(testIds.marketDetails.oraclePanel.yieldingFixed.ratio)).toHaveText(value)
  }

  async expectOracleRatioContract(value: string): Promise<void> {
    await expect(this.page.getByTestId(testIds.marketDetails.oraclePanel.yieldingFixed.ratioContract)).toHaveText(value)
  }

  // #endregion
}

interface OracleInfo {
  price: string
  asset: string
  oracleContract: string
}
