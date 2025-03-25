import { setUserEModeValidationIssueToMessage } from '@/domain/market-validators/validateSetUserEMode'
import { BorrowPageObject } from '@/pages/Borrow.PageObject'
import { MyPortfolioPageObject } from '@/pages/MyPortfolio.PageObject'
import { DEFAULT_BLOCK_NUMBER } from '@/test/e2e/constants'
import { setup } from '@/test/e2e/setup'
import { test } from '@playwright/test'
import { mainnet } from 'viem/chains'
import { DialogPageObject } from '../common/Dialog.PageObject'
import { EModeDialogPageObject } from './EModeDialog.PageObject'

test.describe('E-Mode dialog', () => {
  test.describe('ETH correlated assets borrowed', () => {
    let eModeDialog: EModeDialogPageObject
    let borrowDialog: DialogPageObject
    let myPortfolioPage: MyPortfolioPageObject

    test.beforeEach(async ({ page }) => {
      const testContext = await setup(page, {
        blockchain: {
          chain: mainnet,
          blockNumber: DEFAULT_BLOCK_NUMBER,
        },
        initialPage: 'easyBorrow',
        account: {
          type: 'connected-random',
          assetBalances: { ETH: 1, wstETH: 100 },
        },
      })

      eModeDialog = new EModeDialogPageObject(testContext)
      borrowDialog = new DialogPageObject({
        testContext,
        header: /Borrow/,
      })
      myPortfolioPage = new MyPortfolioPageObject(testContext)

      const borrowPage = new BorrowPageObject(testContext)
      await borrowPage.depositWithoutBorrowActions({ assetsToDeposit: { wstETH: 20 } })
      await myPortfolioPage.goToMyPortfolioAction()

      await myPortfolioPage.clickBorrowButtonAction('rETH')
      await borrowDialog.fillAmountAction(5)
      await borrowDialog.actionsContainer.acceptAllActionsAction(1)
      await borrowDialog.viewInMyPortfolioAction()
      await myPortfolioPage.clickBorrowButtonAction('WETH')
      await borrowDialog.fillAmountAction(5)
      await borrowDialog.actionsContainer.acceptAllActionsAction(1)
      await borrowDialog.viewInMyPortfolioAction()
    })

    test('can switch from no e-mode to eth correlated', async () => {
      await myPortfolioPage.clickEModeButtonAction()
      await eModeDialog.expectEModeCategoryTileStatus('No E-Mode', 'Active')
      await eModeDialog.expectEModeCategoryTileStatus('ETH Correlated', 'Inactive')
      await eModeDialog.expectEModeTransactionOverview({
        variant: 'e-mode-no-change',
        availableAssets: {
          assets: 'All assets',
        },
        hf: '1.79',
        maxLtv: '79.00%',
      })

      await eModeDialog.clickEModeCategoryTileAction('ETH Correlated')
      await eModeDialog.actionsContainer.expectActions([{ type: 'setUserEMode', eModeCategoryId: 1 }])
      await eModeDialog.expectEModeTransactionOverview({
        variant: 'e-mode-change',
        availableAssets: {
          category: 'ETH Correlated',
          assets: 'WETH, wstETH, rETH',
        },
        hf: {
          before: '1.79',
          after: '2.08',
        },
        maxLtv: {
          before: '79.00%',
          after: '92.00%',
        },
      })

      await eModeDialog.actionsContainer.acceptAllActionsAction(1)
      await eModeDialog.expectEModeSuccessPage('ETH Correlated')
      await eModeDialog.viewInMyPortfolioAction()
      await myPortfolioPage.expectEModeBadgeText('ETH Correlated')
    })

    test('cannot switch from no e-mode to stablecoins', async () => {
      await myPortfolioPage.clickEModeButtonAction()
      await eModeDialog.clickEModeCategoryTileAction('Stablecoins')
      await eModeDialog.expectAlertMessage(
        setUserEModeValidationIssueToMessage['borrowed-assets-emode-category-mismatch'],
      )
      await eModeDialog.actionsContainer.expectDisabledActions([{ type: 'setUserEMode', eModeCategoryId: 2 }])
    })

    test('can enter eth correlated e-mode and switch back to no e-mode', async () => {
      await myPortfolioPage.clickEModeButtonAction()
      await eModeDialog.setEModeAction('ETH Correlated')
      await myPortfolioPage.expectEModeBadgeText('ETH Correlated')
      await myPortfolioPage.clickEModeButtonAction()

      await eModeDialog.expectEModeCategoryTileStatus('ETH Correlated', 'Active')
      await eModeDialog.expectEModeCategoryTileStatus('No E-Mode', 'Inactive')
      await eModeDialog.clickEModeCategoryTileAction('No E-Mode')

      await eModeDialog.expectEModeTransactionOverview({
        variant: 'e-mode-change',
        availableAssets: {
          assets: 'All assets',
        },
        hf: {
          before: '2.08',
          after: '1.79',
        },
        maxLtv: {
          before: '92.00%',
          after: '79.00%',
        },
      })
      await eModeDialog.actionsContainer.acceptAllActionsAction(1)
      await eModeDialog.expectEModeSuccessPage('No E-Mode')
      await eModeDialog.viewInMyPortfolioAction()
      await myPortfolioPage.expectEModeBadgeText('E-Mode Off')
    })

    test('cannot switch back to no e-mode if hf below 1', async () => {
      await myPortfolioPage.clickEModeButtonAction()
      await eModeDialog.setEModeAction('ETH Correlated')
      await myPortfolioPage.expectEModeBadgeText('ETH Correlated')

      await myPortfolioPage.clickBorrowButtonAction('WETH')
      await borrowDialog.fillAmountAction(10)
      await eModeDialog.clickAcknowledgeRisk()
      await borrowDialog.actionsContainer.acceptAllActionsAction(1)
      await borrowDialog.viewInMyPortfolioAction()

      await myPortfolioPage.clickEModeButtonAction()
      await eModeDialog.clickEModeCategoryTileAction('No E-Mode')
      await eModeDialog.expectAlertMessage(setUserEModeValidationIssueToMessage['exceeds-ltv'])
      await eModeDialog.actionsContainer.expectDisabledActions([{ type: 'setUserEMode', eModeCategoryId: 0 }])
    })
  })

  test.describe('BTC correlated assets borrowed', () => {
    let eModeDialog: EModeDialogPageObject
    let borrowDialog: DialogPageObject
    let myPortfolioPage: MyPortfolioPageObject

    test.beforeEach(async ({ page }) => {
      const testContext = await setup(page, {
        blockchain: {
          chain: mainnet,
          blockNumber: 22121000n, // btc e-mode category available
        },
        initialPage: 'easyBorrow',
        account: {
          type: 'connected-random',
          assetBalances: { ETH: 1, LBTC: 100 },
        },
      })

      eModeDialog = new EModeDialogPageObject(testContext)
      borrowDialog = new DialogPageObject({
        testContext,
        header: /Borrow/,
      })
      myPortfolioPage = new MyPortfolioPageObject(testContext)

      const borrowPage = new BorrowPageObject(testContext)
      await borrowPage.depositWithoutBorrowActions({ assetsToDeposit: { LBTC: 20 } })
      await myPortfolioPage.goToMyPortfolioAction()

      await myPortfolioPage.clickBorrowButtonAction('cbBTC')
      await borrowDialog.fillAmountAction(8)
      await borrowDialog.actionsContainer.acceptAllActionsAction(1)
      await borrowDialog.viewInMyPortfolioAction()
    })

    test('can switch from no e-mode to btc correlated', async () => {
      await myPortfolioPage.clickEModeButtonAction()
      await eModeDialog.expectEModeCategoryTileStatus('No E-Mode', 'Active')
      await eModeDialog.expectEModeCategoryTileStatus('BTC Correlated', 'Inactive')
      await eModeDialog.expectEModeTransactionOverview({
        variant: 'e-mode-no-change',
        availableAssets: {
          assets: 'All assets',
        },
        hf: '1.75',
        maxLtv: '65.00%',
      })

      await eModeDialog.clickEModeCategoryTileAction('BTC Correlated')
      await eModeDialog.actionsContainer.expectActions([{ type: 'setUserEMode', eModeCategoryId: 1 }])
      await eModeDialog.expectEModeTransactionOverview({
        variant: 'e-mode-change',
        availableAssets: {
          category: 'BTC Correlated',
          assets: 'cbBTC, LBTC',
        },
        hf: {
          before: '1.75',
          after: '2.25',
        },
        maxLtv: {
          before: '65.00%',
          after: '85.00%',
        },
      })

      await eModeDialog.actionsContainer.acceptAllActionsAction(1)
      await eModeDialog.expectEModeSuccessPage('BTC Correlated')
      await eModeDialog.viewInMyPortfolioAction()
      await myPortfolioPage.expectEModeBadgeText('BTC Correlated')
    })

    test('cannot switch from btc correlated to stablecoins', async () => {
      await myPortfolioPage.clickEModeButtonAction()
      await eModeDialog.clickEModeCategoryTileAction('Stablecoins')
      await eModeDialog.expectAlertMessage(
        setUserEModeValidationIssueToMessage['borrowed-assets-emode-category-mismatch'],
      )
      await eModeDialog.actionsContainer.expectDisabledActions([{ type: 'setUserEMode', eModeCategoryId: 2 }])
    })

    test('can enter btc correlated e-mode and switch back to no e-mode', async () => {
      await myPortfolioPage.clickEModeButtonAction()
      await eModeDialog.setEModeAction('BTC Correlated')
      await myPortfolioPage.expectEModeBadgeText('BTC Correlated')
      await myPortfolioPage.clickEModeButtonAction()

      await eModeDialog.expectEModeCategoryTileStatus('BTC Correlated', 'Active')
      await eModeDialog.expectEModeCategoryTileStatus('No E-Mode', 'Inactive')
      await eModeDialog.clickEModeCategoryTileAction('No E-Mode')

      await eModeDialog.expectEModeTransactionOverview({
        variant: 'e-mode-change',
        availableAssets: {
          assets: 'All assets',
        },
        hf: {
          before: '2.25',
          after: '1.75',
        },
        maxLtv: {
          before: '85.00%',
          after: '65.00%',
        },
      })
      await eModeDialog.actionsContainer.acceptAllActionsAction(1)
      await eModeDialog.expectEModeSuccessPage('No E-Mode')
      await eModeDialog.viewInMyPortfolioAction()
      await myPortfolioPage.expectEModeBadgeText('E-Mode Off')
    })
  })

  test.describe('Stablecoins borrowed', () => {
    let eModeDialog: EModeDialogPageObject
    let borrowDialog: DialogPageObject
    let myPortfolioPage: MyPortfolioPageObject

    test.beforeEach(async ({ page }) => {
      const testContext = await setup(page, {
        blockchain: {
          chain: mainnet,
          blockNumber: DEFAULT_BLOCK_NUMBER,
        },
        initialPage: 'easyBorrow',
        account: {
          type: 'connected-random',
          assetBalances: { ETH: 1, wstETH: 100 },
        },
      })

      eModeDialog = new EModeDialogPageObject(testContext)
      borrowDialog = new DialogPageObject({
        testContext,
        header: /Borrow/,
      })
      myPortfolioPage = new MyPortfolioPageObject(testContext)

      const borrowPage = new BorrowPageObject(testContext)
      await borrowPage.depositWithoutBorrowActions({ assetsToDeposit: { wstETH: 1 } })
      await myPortfolioPage.goToMyPortfolioAction()

      await myPortfolioPage.clickBorrowButtonAction('USDC')
      await borrowDialog.fillAmountAction(1000)
      await borrowDialog.actionsContainer.acceptAllActionsAction(1)
      await borrowDialog.viewInMyPortfolioAction()
    })

    test('can switch from no e-mode to stablecoins', async () => {
      await myPortfolioPage.clickEModeButtonAction()
      await eModeDialog.expectEModeCategoryTileStatus('No E-Mode', 'Active')
      await eModeDialog.expectEModeCategoryTileStatus('Stablecoins', 'Inactive')
      await eModeDialog.expectEModeTransactionOverview({
        variant: 'e-mode-no-change',
        availableAssets: {
          assets: 'All assets',
        },
        hf: '3.73',
        maxLtv: '79.00%',
      })

      await eModeDialog.clickEModeCategoryTileAction('Stablecoins')
      await eModeDialog.actionsContainer.expectActions([{ type: 'setUserEMode', eModeCategoryId: 2 }])
      await eModeDialog.expectEModeTransactionOverview({
        variant: 'e-mode-change',
        availableAssets: {
          category: 'Stablecoins',
          assets: 'sDAI, USDC, USDT',
        },
        hf: {
          before: '3.73',
          after: '3.73',
        },
        maxLtv: {
          before: '79.00%',
          after: '79.00%',
        },
      })

      await eModeDialog.actionsContainer.acceptAllActionsAction(1)
      await eModeDialog.expectEModeSuccessPage('Stablecoins')
      await eModeDialog.viewInMyPortfolioAction()
      await myPortfolioPage.expectEModeBadgeText('Stablecoins')
    })

    test('cannot switch from no e-mode to eth correlated', async () => {
      await myPortfolioPage.clickEModeButtonAction()
      await eModeDialog.clickEModeCategoryTileAction('ETH Correlated')
      await eModeDialog.expectAlertMessage(
        setUserEModeValidationIssueToMessage['borrowed-assets-emode-category-mismatch'],
      )
      await eModeDialog.actionsContainer.expectDisabledActions([{ type: 'setUserEMode', eModeCategoryId: 2 }])
    })

    test('can enter stablecoins e-mode and switch back to no e-mode', async () => {
      await myPortfolioPage.clickEModeButtonAction()
      await eModeDialog.setEModeAction('Stablecoins')
      await myPortfolioPage.expectEModeBadgeText('Stablecoins')
      await myPortfolioPage.clickEModeButtonAction()

      await eModeDialog.expectEModeCategoryTileStatus('Stablecoins', 'Active')
      await eModeDialog.expectEModeCategoryTileStatus('No E-Mode', 'Inactive')
      await eModeDialog.clickEModeCategoryTileAction('No E-Mode')

      await eModeDialog.expectEModeTransactionOverview({
        variant: 'e-mode-change',
        availableAssets: {
          assets: 'All assets',
        },
        hf: {
          before: '3.73',
          after: '3.73',
        },
        maxLtv: {
          before: '79.00%',
          after: '79.00%',
        },
      })
      await eModeDialog.actionsContainer.acceptAllActionsAction(1)
      await eModeDialog.expectEModeSuccessPage('No E-Mode')
      await eModeDialog.viewInMyPortfolioAction()
      await myPortfolioPage.expectEModeBadgeText('E-Mode Off')
    })
  })

  test.describe('Assets from multiple categories borrowed', () => {
    let eModeDialog: EModeDialogPageObject
    let borrowDialog: DialogPageObject
    let myPortfolioPage: MyPortfolioPageObject

    test.beforeEach(async ({ page }) => {
      const testContext = await setup(page, {
        blockchain: {
          chain: mainnet,
          blockNumber: DEFAULT_BLOCK_NUMBER,
        },
        initialPage: 'easyBorrow',
        account: {
          type: 'connected-random',
          assetBalances: { ETH: 1, wstETH: 100 },
        },
      })

      eModeDialog = new EModeDialogPageObject(testContext)
      borrowDialog = new DialogPageObject({
        testContext,
        header: /Borrow/,
      })
      myPortfolioPage = new MyPortfolioPageObject(testContext)

      const borrowPage = new BorrowPageObject(testContext)
      await borrowPage.depositWithoutBorrowActions({ assetsToDeposit: { wstETH: 10 } })
      await myPortfolioPage.goToMyPortfolioAction()

      await myPortfolioPage.clickBorrowButtonAction('rETH')
      await borrowDialog.fillAmountAction(1)
      await borrowDialog.actionsContainer.acceptAllActionsAction(1)
      await borrowDialog.viewInMyPortfolioAction()

      await myPortfolioPage.clickBorrowButtonAction('cbBTC')
      await borrowDialog.fillAmountAction(0.1)
      await borrowDialog.actionsContainer.acceptAllActionsAction(1)
      await borrowDialog.viewInMyPortfolioAction()
    })

    test('cannot switch from no e-mode to stablecoins', async () => {
      await myPortfolioPage.clickEModeButtonAction()
      await eModeDialog.expectEModeCategoryTileStatus('No E-Mode', 'Active')
      await eModeDialog.expectEModeCategoryTileStatus('Stablecoins', 'Inactive')

      await eModeDialog.clickEModeCategoryTileAction('Stablecoins')

      await eModeDialog.expectAlertMessage(
        setUserEModeValidationIssueToMessage['borrowed-assets-emode-category-mismatch'],
      )
      await eModeDialog.expectEModeTransactionOverview({
        variant: 'e-mode-change',
        availableAssets: {
          category: 'Stablecoins',
          assets: 'sDAI, USDC, USDT',
        },
        hf: {
          before: '2.56',
          after: '2.56',
        },
        maxLtv: {
          before: '79.00%',
          after: '79.00%',
        },
      })
      await eModeDialog.actionsContainer.expectDisabledActions([{ type: 'setUserEMode', eModeCategoryId: 2 }])
    })

    test('cannot switch from no e-mode to eth correlated', async () => {
      await myPortfolioPage.clickEModeButtonAction()
      await eModeDialog.expectEModeCategoryTileStatus('No E-Mode', 'Active')
      await eModeDialog.expectEModeCategoryTileStatus('ETH Correlated', 'Inactive')

      await eModeDialog.clickEModeCategoryTileAction('ETH Correlated')
      await eModeDialog.expectEModeTransactionOverview({
        variant: 'e-mode-change',
        availableAssets: {
          category: 'ETH Correlated',
          assets: 'WETH, wstETH, rETH',
        },
        hf: {
          before: '2.56',
          after: '2.98',
        },
        maxLtv: {
          before: '79.00%',
          after: '92.00%',
        },
      })
      await eModeDialog.expectAlertMessage(
        setUserEModeValidationIssueToMessage['borrowed-assets-emode-category-mismatch'],
      )
      await eModeDialog.actionsContainer.expectDisabledActions([{ type: 'setUserEMode', eModeCategoryId: 2 }])
    })
  })

  test.describe('Nothing borrowed', () => {
    let eModeDialog: EModeDialogPageObject
    let myPortfolioPage: MyPortfolioPageObject

    test.beforeEach(async ({ page }) => {
      const testContext = await setup(page, {
        blockchain: {
          chain: mainnet,
          blockNumber: DEFAULT_BLOCK_NUMBER,
        },
        initialPage: 'easyBorrow',
        account: {
          type: 'connected-random',
          assetBalances: { ETH: 1, wstETH: 100 },
        },
      })

      eModeDialog = new EModeDialogPageObject(testContext)
      myPortfolioPage = new MyPortfolioPageObject(testContext)

      const borrowPage = new BorrowPageObject(testContext)
      await borrowPage.depositWithoutBorrowActions({ assetsToDeposit: { wstETH: 20 } })
      await myPortfolioPage.goToMyPortfolioAction()
    })

    test('can switch from no e-mode to eth correleated', async () => {
      await myPortfolioPage.clickEModeButtonAction()
      await eModeDialog.expectEModeCategoryTileStatus('No E-Mode', 'Active')
      await eModeDialog.expectEModeCategoryTileStatus('ETH Correlated', 'Inactive')

      await eModeDialog.clickEModeCategoryTileAction('ETH Correlated')
      await eModeDialog.actionsContainer.expectActions([{ type: 'setUserEMode', eModeCategoryId: 1 }])
      await eModeDialog.expectEModeTransactionOverview({
        variant: 'no-borrow',
        availableAssets: {
          category: 'ETH Correlated',
          assets: 'WETH, wstETH, rETH',
        },
        maxLtv: {
          before: '79.00%',
          after: '92.00%',
        },
      })

      await eModeDialog.actionsContainer.acceptAllActionsAction(1)
      await eModeDialog.expectEModeSuccessPage('ETH Correlated')
      await eModeDialog.viewInMyPortfolioAction()
      await myPortfolioPage.expectEModeBadgeText('ETH Correlated')
    })

    test('can switch from no e-mode to stablecoins', async () => {
      await myPortfolioPage.clickEModeButtonAction()
      await eModeDialog.expectEModeCategoryTileStatus('No E-Mode', 'Active')

      await eModeDialog.expectEModeCategoryTileStatus('Stablecoins', 'Inactive')
      await eModeDialog.clickEModeCategoryTileAction('Stablecoins')
      await eModeDialog.actionsContainer.expectActions([{ type: 'setUserEMode', eModeCategoryId: 2 }])
      await eModeDialog.expectEModeTransactionOverview({
        variant: 'no-borrow',
        availableAssets: {
          category: 'Stablecoins',
          assets: 'sDAI, USDC, USDT',
        },
        maxLtv: {
          before: '79.00%',
          after: '79.00%',
        },
      })

      await eModeDialog.actionsContainer.acceptAllActionsAction(1)
      await eModeDialog.expectEModeSuccessPage('Stablecoins')
      await eModeDialog.viewInMyPortfolioAction()
      await myPortfolioPage.expectEModeBadgeText('Stablecoins')
    })

    test('can enter e-mode and switch back to no e-mode', async () => {
      await myPortfolioPage.clickEModeButtonAction()
      await eModeDialog.setEModeAction('Stablecoins')
      await myPortfolioPage.expectEModeBadgeText('Stablecoins')
      await myPortfolioPage.clickEModeButtonAction()

      await eModeDialog.expectEModeCategoryTileStatus('Stablecoins', 'Active')
      await eModeDialog.expectEModeCategoryTileStatus('No E-Mode', 'Inactive')
      await eModeDialog.clickEModeCategoryTileAction('No E-Mode')

      await eModeDialog.expectEModeTransactionOverview({
        variant: 'no-borrow',
        availableAssets: {
          assets: 'All assets',
        },
        maxLtv: {
          before: '79.00%',
          after: '79.00%',
        },
      })
      await eModeDialog.actionsContainer.acceptAllActionsAction(1)
      await eModeDialog.expectEModeSuccessPage('No E-Mode')
      await eModeDialog.viewInMyPortfolioAction()
      await myPortfolioPage.expectEModeBadgeText('E-Mode Off')
    })
  })

  test.describe('Liquidation risk warning', () => {
    test.describe('In danger zone', () => {
      let eModeDialog: EModeDialogPageObject
      let myPortfolioPage: MyPortfolioPageObject

      test.beforeEach(async ({ page }) => {
        const testContext = await setup(page, {
          blockchain: {
            chain: mainnet,
            blockNumber: DEFAULT_BLOCK_NUMBER,
          },
          initialPage: 'easyBorrow',
          account: {
            type: 'connected-random',
            assetBalances: { ETH: 1, rETH: 100, wstETH: 100 },
          },
        })

        eModeDialog = new EModeDialogPageObject(testContext)
        myPortfolioPage = new MyPortfolioPageObject(testContext)

        const borrowPage = new BorrowPageObject(testContext)
        await borrowPage.depositWithoutBorrowActions({ assetsToDeposit: { rETH: 2, wstETH: 10 } })
        await myPortfolioPage.goToMyPortfolioAction()

        await myPortfolioPage.clickBorrowButtonAction('WETH')
        const borrowDialog = new DialogPageObject({
          testContext,
          header: /Borrow/,
        })
        await borrowDialog.fillAmountAction(8)
        await borrowDialog.clickAcknowledgeRisk()
        await borrowDialog.actionsContainer.acceptAllActionsAction(1)
        await borrowDialog.expectSuccessPage({
          tokenWithValue: [{ asset: 'WETH', amount: '8.00', usdValue: '$31,426.51' }],
        })
        await borrowDialog.viewInMyPortfolioAction()
        await myPortfolioPage.expectAssetToBeInBorrowTable('WETH')

        await myPortfolioPage.clickEModeButtonAction()
        await eModeDialog.setEModeAction('ETH Correlated')
        await myPortfolioPage.expectEModeBadgeText('ETH Correlated')
      })

      test('shows risk warning', async () => {
        await myPortfolioPage.clickEModeButtonAction()
        await eModeDialog.clickEModeCategoryTileAction('No E-Mode')
        await eModeDialog.expectLiquidationRiskWarning(
          'Disabling E-Mode decreases health factor of your position and puts you at risk of quick liquidation. You may lose part of your collateral.',
        )
      })

      test('actions stay disabled until risk warning is acknowledged', async () => {
        await myPortfolioPage.clickEModeButtonAction()

        await eModeDialog.clickEModeCategoryTileAction('No E-Mode')
        await eModeDialog.actionsContainer.expectDisabledActionAtIndex(0)
        await eModeDialog.clickAcknowledgeRisk()
        await eModeDialog.actionsContainer.expectEnabledActionAtIndex(0)
      })

      test('validation error; risk warning is not shown', async () => {
        await myPortfolioPage.clickEModeButtonAction()

        await eModeDialog.clickEModeCategoryTileAction('Stablecoins')
        await eModeDialog.expectAlertMessage(
          setUserEModeValidationIssueToMessage['borrowed-assets-emode-category-mismatch'],
        )
        await eModeDialog.expectLiquidationRiskWarningNotVisible()
      })
    })

    test.describe('Not in danger zone', () => {
      let eModeDialog: EModeDialogPageObject
      let myPortfolioPage: MyPortfolioPageObject

      test.beforeEach(async ({ page }) => {
        const testContext = await setup(page, {
          blockchain: {
            chain: mainnet,
            blockNumber: DEFAULT_BLOCK_NUMBER,
          },
          initialPage: 'easyBorrow',
          account: {
            type: 'connected-random',
            assetBalances: { ETH: 1, rETH: 100, wstETH: 100 },
          },
        })

        eModeDialog = new EModeDialogPageObject(testContext)
        myPortfolioPage = new MyPortfolioPageObject(testContext)

        const borrowPage = new BorrowPageObject(testContext)
        await borrowPage.depositWithoutBorrowActions({ assetsToDeposit: { rETH: 2, wstETH: 10 } })
        await myPortfolioPage.goToMyPortfolioAction()

        await myPortfolioPage.clickBorrowButtonAction('WETH')
        const borrowDialog = new DialogPageObject({
          testContext,
          header: /Borrow/,
        })
        await borrowDialog.fillAmountAction(2)
        await borrowDialog.actionsContainer.acceptAllActionsAction(1)
        await borrowDialog.expectSuccessPage({
          tokenWithValue: [{ asset: 'WETH', amount: '2.00', usdValue: '$7,856.63' }],
        })
        await borrowDialog.viewInMyPortfolioAction()
        await myPortfolioPage.expectAssetToBeInBorrowTable('WETH')
      })

      test('hf above danger zone threshold; risk warning is not shown', async () => {
        await myPortfolioPage.clickEModeButtonAction()
        await eModeDialog.clickEModeCategoryTileAction('No E-Mode')
        await eModeDialog.expectLiquidationRiskWarningNotVisible()
      })
    })
  })
})
