import { lendingPoolAddress } from '@/config/contracts-generated'
import { withdrawalValidationIssueToMessage } from '@/domain/market-validators/validateWithdraw'
import { BorrowPageObject } from '@/pages/Borrow.PageObject'
import { MyPortfolioPageObject } from '@/pages/MyPortfolio.PageObject'
import { DEFAULT_BLOCK_NUMBER, TOKENS_ON_FORK } from '@/test/e2e/constants'
import { TestContext, setup } from '@/test/e2e/setup'
import { test } from '@playwright/test'
import { setAaveUsingAsCollateral } from '@sparkdotfi/common-testnets'
import { CheckedAddress } from '@sparkdotfi/common-universal'
import { mainnet } from 'viem/chains'
import { CollateralDialogPageObject } from '../collateral/CollateralDialog.PageObject'
import { DialogPageObject } from '../common/Dialog.PageObject'
import { EModeDialogPageObject } from '../e-mode/EModeDialog.PageObject'

const header = /Withdr*/

test.describe('Withdraw dialog', () => {
  const initialBalances = {
    wstETH: 100,
    rETH: 100,
    ETH: 100,
  }

  test.describe('Position with deposit and borrow', () => {
    const initialDeposits = {
      wstETH: 2,
      rETH: 2,
    } as const
    const daiToBorrow = 3500

    let withdrawDialog: DialogPageObject
    let myPortfolioPage: MyPortfolioPageObject

    test.beforeEach(async ({ page }) => {
      const testContext = await setup(page, {
        blockchain: {
          blockNumber: DEFAULT_BLOCK_NUMBER,
          chain: mainnet,
        },
        initialPage: 'easyBorrow',
        account: {
          type: 'connected-random',
          assetBalances: { ...initialBalances },
        },
      })

      const borrowPage = new BorrowPageObject(testContext)
      myPortfolioPage = new MyPortfolioPageObject(testContext)
      withdrawDialog = new DialogPageObject({ testContext, header })

      await borrowPage.depositAssetsActions({ assetsToDeposit: initialDeposits, daiToBorrow })
      await borrowPage.viewInMyPortfolioAction()

      // @todo This waits for the refetch of the data after successful borrow transaction to happen.
      // This is no ideal, probably we need to refactor expectDepositTable so it takes advantage from
      // playwright's timeouts instead of parsing it's current state. Then we would be able to
      // easily wait for the table to be updated.
      await myPortfolioPage.expectAssetToBeInDepositTable('DAI')
    })

    test('opens dialog with selected asset', async () => {
      await myPortfolioPage.clickWithdrawButtonAction('rETH')

      await withdrawDialog.expectSelectedAsset('rETH')
      await withdrawDialog.expectDialogHeader('Withdraw rETH')
      await withdrawDialog.expectHealthFactorBeforeVisible()
    })

    test('calculates health factor changes correctly', async () => {
      await myPortfolioPage.clickWithdrawButtonAction('rETH')

      await withdrawDialog.fillAmountAction(1)
      await withdrawDialog.expectRiskLevelBefore('Healthy')
      await withdrawDialog.expectHealthFactorBefore('4.15')
      await withdrawDialog.expectRiskLevelAfter('Healthy')
      await withdrawDialog.expectHealthFactorAfter('3.14')
    })

    test('has correct action plan for erc-20', async () => {
      await myPortfolioPage.clickWithdrawButtonAction('rETH')

      await withdrawDialog.fillAmountAction(1)
      await withdrawDialog.actionsContainer.expectActions([{ type: 'withdraw', asset: 'rETH' }])
    })

    test('can withdraw erc-20', async () => {
      const withdraw = {
        asset: 'rETH',
        amount: 1,
      } as const

      await myPortfolioPage.clickWithdrawButtonAction(withdraw.asset)

      await withdrawDialog.fillAmountAction(withdraw.amount)
      await withdrawDialog.actionsContainer.acceptAllActionsAction(1)
      await withdrawDialog.expectSuccessPage({
        tokenWithValue: [{ asset: 'rETH', amount: '1.00', usdValue: '$4,413.26' }],
      })
      await withdrawDialog.viewInMyPortfolioAction()

      await myPortfolioPage.expectDepositTable({
        ...initialDeposits,
        [withdraw.asset]: initialDeposits[withdraw.asset] - withdraw.amount,
      })
    })
  })

  test.describe('Form validation', () => {
    const initialDeposits = {
      wstETH: 5,
      rETH: 1,
    } as const
    const daiToBorrow = 4500

    let withdrawDialog: DialogPageObject
    let myPortfolioPage: MyPortfolioPageObject

    test.beforeEach(async ({ page }) => {
      const testContext = await setup(page, {
        blockchain: {
          blockNumber: DEFAULT_BLOCK_NUMBER,
          chain: mainnet,
        },
        initialPage: 'easyBorrow',
        account: {
          type: 'connected-random',
          assetBalances: { ...initialBalances },
        },
      })

      const borrowPage = new BorrowPageObject(testContext)
      myPortfolioPage = new MyPortfolioPageObject(testContext)
      withdrawDialog = new DialogPageObject({ testContext, header })

      await borrowPage.depositAssetsActions({ assetsToDeposit: initialDeposits, daiToBorrow })
      await borrowPage.viewInMyPortfolioAction()

      await myPortfolioPage.expectAssetToBeInDepositTable('DAI')
    })

    test('cannot withdraw amount that will result in health factor under 1', async () => {
      const withdrawAsset = 'wstETH'
      await myPortfolioPage.expectDepositTable(initialDeposits)
      await myPortfolioPage.clickWithdrawButtonAction(withdrawAsset)

      await withdrawDialog.expectHealthFactorBefore('4.93')
      await withdrawDialog.fillAmountAction(initialDeposits[withdrawAsset] - 0.1) // we subtract small amount to ensure that we have enough balance in test, which may not be the case due to timestamp issues
      await withdrawDialog.expectAssetInputError('Remaining collateral cannot support the loan')
    })

    test('cannot withdraw more than deposited', async () => {
      const withdrawAsset = 'rETH'
      await myPortfolioPage.expectDepositTable(initialDeposits)
      await myPortfolioPage.clickWithdrawButtonAction(withdrawAsset)

      await withdrawDialog.expectHealthFactorBefore('4.93')
      await withdrawDialog.fillAmountAction(initialDeposits[withdrawAsset] + 1)
      await withdrawDialog.expectAssetInputError(withdrawalValidationIssueToMessage['exceeds-balance'])
    })
  })

  test.describe('Position with native deposit and borrow', () => {
    const ETHdeposit = {
      asset: 'ETH',
      amount: 10,
    }
    const borrow = {
      asset: 'DAI',
      amount: 1000,
    }

    let withdrawDialog: DialogPageObject
    let myPortfolioPage: MyPortfolioPageObject

    test.beforeEach(async ({ page }) => {
      const testContext = await setup(page, {
        blockchain: {
          blockNumber: DEFAULT_BLOCK_NUMBER,
          chain: mainnet,
        },
        initialPage: 'easyBorrow',
        account: {
          type: 'connected-random',
          assetBalances: { ...initialBalances },
        },
      })

      const borrowPage = new BorrowPageObject(testContext)
      myPortfolioPage = new MyPortfolioPageObject(testContext)
      withdrawDialog = new DialogPageObject({ testContext, header })

      await borrowPage.fillDepositAssetAction(0, ETHdeposit.asset, ETHdeposit.amount)
      await borrowPage.fillBorrowAssetAction(borrow.amount)
      await borrowPage.submitAction()
      await borrowPage.actionsContainer.acceptAllActionsAction(2)
      await borrowPage.expectSuccessPage({
        deposited: [{ asset: 'ETH', amount: '10.00', usdValue: '$39,283.13' }],
        borrowed: { asset: 'DAI', amount: '1,000.00', usdValue: '$1,000.00' },
      })

      await myPortfolioPage.goToMyPortfolioAction()
    })

    // @note When ETH is deposited, deposit table shows WETH instead of ETH
    test('has correct action plan for native asset', async () => {
      await myPortfolioPage.clickWithdrawButtonAction('WETH')

      await withdrawDialog.selectAssetAction('ETH')
      await withdrawDialog.fillAmountAction(1)
      await withdrawDialog.expectHealthFactorVisible()
      await withdrawDialog.actionsContainer.expectActions([
        { type: 'approve', asset: 'spWETH' },
        { type: 'withdraw', asset: 'ETH' },
      ])
    })

    // @note When ETH is deposited, deposit table shows WETH instead of ETH
    test('can withdraw native asset', async () => {
      const withdrawAmount = 1

      await myPortfolioPage.clickWithdrawButtonAction('WETH')

      await withdrawDialog.selectAssetAction('ETH')
      await withdrawDialog.fillAmountAction(withdrawAmount)
      await withdrawDialog.actionsContainer.acceptAllActionsAction(2)
      await withdrawDialog.expectSuccessPage({
        tokenWithValue: [
          {
            asset: 'ETH',
            amount: '1.00',
            usdValue: '$3,928.31',
          },
        ],
      })
      await withdrawDialog.viewInMyPortfolioAction()

      await myPortfolioPage.expectDepositTable({
        WETH: ETHdeposit.amount - withdrawAmount,
      })
    })
  })

  test.describe('Position with only deposit', () => {
    const initialDeposits = {
      wstETH: 10,
      ETH: 2,
    } as const

    let withdrawDialog: DialogPageObject
    let myPortfolioPage: MyPortfolioPageObject

    test.beforeEach(async ({ page }) => {
      const testContext = await setup(page, {
        blockchain: {
          blockNumber: DEFAULT_BLOCK_NUMBER,
          chain: mainnet,
        },
        initialPage: 'easyBorrow',
        account: {
          type: 'connected-random',
          assetBalances: { ...initialBalances },
        },
      })

      const borrowPage = new BorrowPageObject(testContext)
      myPortfolioPage = new MyPortfolioPageObject(testContext)
      withdrawDialog = new DialogPageObject({ testContext, header })
      // to simulate a position with only deposits, we go through the easy borrow flow
      // but interrupt it before the borrow action, going directly to the myPortfolio
      // this way we have deposit transactions executed, but no borrow transaction
      // resulting in a position with only deposits
      await borrowPage.fillDepositAssetAction(0, 'wstETH', initialDeposits.wstETH)
      await borrowPage.addNewDepositAssetAction()
      await borrowPage.fillBorrowAssetAction(1) // doesn't matter, we're not borrowing anything
      await borrowPage.fillDepositAssetAction(1, 'ETH', initialDeposits.ETH)
      await borrowPage.submitAction()

      await borrowPage.actionsContainer.acceptAllActionsAction(3)
      await borrowPage.actionsContainer.expectEnabledActionAtIndex(3)

      await myPortfolioPage.goToMyPortfolioAction()
    })

    test('can withdraw erc-20', async () => {
      const withdraw = {
        asset: 'wstETH',
        amount: 1,
      } as const

      await myPortfolioPage.clickWithdrawButtonAction(withdraw.asset)

      await withdrawDialog.fillAmountAction(withdraw.amount)
      await withdrawDialog.actionsContainer.acceptAllActionsAction(1)
      await withdrawDialog.expectSuccessPage({
        tokenWithValue: [{ asset: 'wstETH', amount: '1.00', usdValue: '$4,665.46' }],
      })
      await withdrawDialog.viewInMyPortfolioAction()

      await myPortfolioPage.expectDepositTable({
        WETH: initialDeposits.ETH,
        [withdraw.asset]: initialDeposits[withdraw.asset] - withdraw.amount,
      })
    })

    test('can fully withdraw erc-20', async () => {
      const withdraw = {
        asset: 'wstETH',
        amount: 10,
      } as const

      await myPortfolioPage.clickWithdrawButtonAction(withdraw.asset)

      await withdrawDialog.clickMaxAmountAction()
      await withdrawDialog.actionsContainer.acceptAllActionsAction(1)
      await withdrawDialog.expectSuccessPage({
        tokenWithValue: [{ asset: 'wstETH', amount: '10.00', usdValue: '$46,654.64' }],
      })
      await withdrawDialog.viewInMyPortfolioAction()

      await myPortfolioPage.expectDepositTable({
        WETH: initialDeposits.ETH,
        [withdraw.asset]: 0,
      })
    })

    test('does not display health factor', async () => {
      await myPortfolioPage.clickWithdrawButtonAction('wstETH')

      await withdrawDialog.fillAmountAction(1)
      await withdrawDialog.expectHealthFactorNotVisible()
    })

    test('can fully withdraw native asset', async () => {
      await myPortfolioPage.clickWithdrawButtonAction('WETH')

      await withdrawDialog.selectAssetAction('ETH')
      await withdrawDialog.clickMaxAmountAction()
      await withdrawDialog.actionsContainer.acceptAllActionsAction(2)
      await withdrawDialog.expectSuccessPage({
        tokenWithValue: [{ asset: 'ETH', amount: '2.00', usdValue: '$7,856.63' }],
      })

      await withdrawDialog.viewInMyPortfolioAction()

      await myPortfolioPage.expectDepositTable({
        WETH: 0,
        wstETH: initialDeposits.wstETH,
      })
    })
  })

  test.describe('Liquidation risk warning', () => {
    let testContext: TestContext<'connected-random'>
    let withdrawDialog: DialogPageObject
    let myPortfolioPage: MyPortfolioPageObject

    test.beforeEach(async ({ page }) => {
      testContext = await setup(page, {
        blockchain: {
          blockNumber: DEFAULT_BLOCK_NUMBER,
          chain: mainnet,
        },
        initialPage: 'easyBorrow',
        account: {
          type: 'connected-random',
          assetBalances: { ETH: 1, rETH: 100, wstETH: 100 },
        },
      })

      withdrawDialog = new DialogPageObject({ testContext, header })
      myPortfolioPage = new MyPortfolioPageObject(testContext)

      const borrowPage = new BorrowPageObject(testContext)
      await borrowPage.depositWithoutBorrowActions({ assetsToDeposit: { rETH: 2, wstETH: 10 } })
      await myPortfolioPage.goToMyPortfolioAction()

      await myPortfolioPage.clickBorrowButtonAction('WETH')
      const borrowDialog = new DialogPageObject({ testContext, header: /Borrow/ })
      await borrowDialog.fillAmountAction(7)
      await borrowDialog.actionsContainer.acceptAllActionsAction(1)
      await borrowDialog.expectSuccessPage({
        tokenWithValue: [{ asset: 'WETH', amount: '7.00', usdValue: '$27,498.19' }],
      })
      await borrowDialog.viewInMyPortfolioAction()
      await myPortfolioPage.expectAssetToBeInBorrowTable('WETH')
    })

    test('shows risk warning', async () => {
      await myPortfolioPage.clickWithdrawButtonAction('rETH')

      await withdrawDialog.clickMaxAmountAction()
      await withdrawDialog.expectLiquidationRiskWarning(
        'Withdrawing this amount puts you at risk of quick liquidation. You may lose part of your collateral.',
      )
    })

    test('actions stay disabled until risk warning is acknowledged', async () => {
      await myPortfolioPage.clickWithdrawButtonAction('rETH')

      await withdrawDialog.clickMaxAmountAction()
      await withdrawDialog.actionsContainer.expectDisabledActionAtIndex(0)
      await withdrawDialog.clickAcknowledgeRisk()
      await withdrawDialog.actionsContainer.expectEnabledActionAtIndex(0)
    })

    test('hf above danger zone threshold; risk warning is not shown', async () => {
      await myPortfolioPage.clickWithdrawButtonAction('rETH')

      await withdrawDialog.fillAmountAction(0.1)
      await withdrawDialog.actionsContainer.expectEnabledActionAtIndex(0)
      await withdrawDialog.expectLiquidationRiskWarningNotVisible()
    })

    test('input validation error; risk warning is not shown', async () => {
      await myPortfolioPage.clickWithdrawButtonAction('rETH')

      await withdrawDialog.fillAmountAction(0)
      await withdrawDialog.expectAssetInputError(withdrawalValidationIssueToMessage['value-not-positive'])
      await withdrawDialog.expectLiquidationRiskWarningNotVisible()
    })

    test('hf in danger zone; asset not collateral; risk warning is not shown', async () => {
      // disabling collateral and entering danger zone
      await myPortfolioPage.clickCollateralSwitchAction('rETH')

      const collateralDialog = new CollateralDialogPageObject(testContext)
      await collateralDialog.clickAcknowledgeRisk()
      await collateralDialog.actionsContainer.acceptAllActionsAction(1)
      await collateralDialog.expectSetUseAsCollateralSuccessPage('rETH', 'disabled')

      await myPortfolioPage.goToMyPortfolioAction()
      await myPortfolioPage.expectCollateralSwitch('rETH', false)
      await myPortfolioPage.clickWithdrawButtonAction('rETH')

      await withdrawDialog.clickMaxAmountAction()
      await withdrawDialog.actionsContainer.expectEnabledActionAtIndex(0)
      await withdrawDialog.expectLiquidationRiskWarningNotVisible()
    })
  })

  test.describe('MAX button', () => {
    let withdrawDialog: DialogPageObject
    let borrowDialog: DialogPageObject
    let depositDialog: DialogPageObject
    let myPortfolioPage: MyPortfolioPageObject
    let collateralDialog: CollateralDialogPageObject
    let testContext: TestContext<'connected-random'>

    test.beforeEach(async ({ page }) => {
      testContext = await setup(page, {
        blockchain: {
          blockNumber: DEFAULT_BLOCK_NUMBER,
          chain: mainnet,
        },
        initialPage: 'myPortfolio',
        account: {
          type: 'connected-random',
          assetBalances: { ETH: 10, wstETH: 5, rETH: 1, cbBTC: 1 },
        },
      })

      withdrawDialog = new DialogPageObject({ testContext, header })
      myPortfolioPage = new MyPortfolioPageObject(testContext)
      borrowDialog = new DialogPageObject({ testContext, header: /Borrow/ })
      depositDialog = new DialogPageObject({ testContext, header: /Deposit/ })
      collateralDialog = new CollateralDialogPageObject(testContext)

      await myPortfolioPage.clickDepositButtonAction('wstETH')
      await depositDialog.fillAmountAction(5)
      await depositDialog.actionsContainer.acceptAllActionsAction(2)
      await depositDialog.viewInMyPortfolioAction()
      await myPortfolioPage.expectDepositedAssets('$23.33K')
    })

    test('withdraws amount up to HF 1.01', async () => {
      await myPortfolioPage.clickBorrowButtonAction('DAI')
      await borrowDialog.fillAmountAction(5000)
      await borrowDialog.actionsContainer.acceptAllActionsAction(1)
      await borrowDialog.viewInMyPortfolioAction()
      await myPortfolioPage.expectHealthFactor('3.73')

      await myPortfolioPage.clickWithdrawButtonAction('wstETH')

      await withdrawDialog.clickMaxAmountAction()
      await withdrawDialog.clickAcknowledgeRisk()

      await withdrawDialog.expectInputValue('3.646973')
      await withdrawDialog.expectHealthFactorBefore('3.73')
      await withdrawDialog.expectHealthFactorAfter('1.01')
      await withdrawDialog.actionsContainer.expectActions([{ type: 'withdraw', asset: 'wstETH' }])
      await withdrawDialog.actionsContainer.expectEnabledActionAtIndex(0)
    })

    test('works for collaterals with different liquidation thresholds', async () => {
      await myPortfolioPage.clickDepositButtonAction('cbBTC')
      await depositDialog.fillAmountAction(1)
      await depositDialog.actionsContainer.acceptAllActionsAction(2)
      await depositDialog.viewInMyPortfolioAction()
      await myPortfolioPage.expectDepositedAssets('$125K')

      await myPortfolioPage.clickBorrowButtonAction('DAI')
      await borrowDialog.fillAmountAction(35000)
      await borrowDialog.actionsContainer.acceptAllActionsAction(1)
      await borrowDialog.viewInMyPortfolioAction()
      await myPortfolioPage.expectHealthFactor('2.71')

      await myPortfolioPage.clickWithdrawButtonAction('cbBTC')

      await withdrawDialog.clickMaxAmountAction()
      await withdrawDialog.clickAcknowledgeRisk()

      await withdrawDialog.expectInputValue('0.781174')
      await withdrawDialog.expectHealthFactorBefore('2.71')
      await withdrawDialog.expectHealthFactorAfter('1.01')
      await withdrawDialog.actionsContainer.expectActions([{ type: 'withdraw', asset: 'cbBTC' }])
      await withdrawDialog.actionsContainer.expectEnabledActionAtIndex(0)
    })

    test('works in e-mode', async () => {
      await myPortfolioPage.clickBorrowButtonAction('WETH')
      await borrowDialog.fillAmountAction(2)
      await borrowDialog.actionsContainer.acceptAllActionsAction(1)
      await borrowDialog.viewInMyPortfolioAction()
      await myPortfolioPage.expectHealthFactor('2.38')
      await myPortfolioPage.clickEModeButtonAction()
      const eModeDialog = new EModeDialogPageObject(testContext)
      await eModeDialog.clickEModeCategoryTileAction('ETH Correlated')
      await eModeDialog.actionsContainer.acceptAllActionsAction(1)
      await eModeDialog.viewInMyPortfolioAction()
      await myPortfolioPage.expectHealthFactor('2.76')

      await myPortfolioPage.clickWithdrawButtonAction('wstETH')
      await withdrawDialog.clickMaxAmountAction()
      await withdrawDialog.clickAcknowledgeRisk()

      await withdrawDialog.expectInputValue('3.171143')
      await withdrawDialog.expectHealthFactorBefore('2.76')
      await withdrawDialog.expectHealthFactorAfter('1.01')
      await withdrawDialog.actionsContainer.expectActions([{ type: 'withdraw', asset: 'wstETH' }])
      await withdrawDialog.actionsContainer.expectEnabledActionAtIndex(0)
    })

    test('works for asset with usage as collateral disabled', async () => {
      await myPortfolioPage.clickBorrowButtonAction('DAI')
      await borrowDialog.clickMaxAmountAction()
      await borrowDialog.clickAcknowledgeRisk()
      await borrowDialog.actionsContainer.acceptAllActionsAction(1)
      await borrowDialog.viewInMyPortfolioAction()
      await myPortfolioPage.expectHealthFactor('1.02')

      await myPortfolioPage.clickDepositButtonAction('rETH')
      await depositDialog.fillAmountAction(1)
      await depositDialog.actionsContainer.acceptAllActionsAction(2)
      await depositDialog.viewInMyPortfolioAction()
      await myPortfolioPage.expectHealthFactor('1.22')

      await myPortfolioPage.clickCollateralSwitchAction('rETH')
      await collateralDialog.clickAcknowledgeRisk()
      await collateralDialog.setUseAsCollateralAction({ assetName: 'rETH', setting: 'disabled' })
      await myPortfolioPage.goToMyPortfolioAction()
      await myPortfolioPage.expectHealthFactor('1.02')

      await myPortfolioPage.clickWithdrawButtonAction('rETH')
      await withdrawDialog.clickMaxAmountAction()

      await withdrawDialog.expectInputValue('1')
      await withdrawDialog.expectMaxButtonDisabled()
      await withdrawDialog.expectHealthFactorBefore('1.02')
      await withdrawDialog.expectHealthFactorAfter('1.02')
      await withdrawDialog.actionsContainer.expectActions([{ type: 'withdraw', asset: 'rETH' }])
      await withdrawDialog.actionsContainer.expectEnabledActionAtIndex(0)
    })

    test('native asset withdrawal requires enough approval', async () => {
      await myPortfolioPage.clickDepositButtonAction('WETH')
      await depositDialog.selectAssetAction('ETH')
      await depositDialog.fillAmountAction(5)
      await depositDialog.actionsContainer.acceptAllActionsAction(1)
      await depositDialog.viewInMyPortfolioAction()
      await myPortfolioPage.expectDepositedAssets('$42.97K')

      await myPortfolioPage.clickWithdrawButtonAction('WETH')
      await withdrawDialog.selectAssetAction('ETH')
      await withdrawDialog.clickMaxAmountAction()

      await withdrawDialog.actionsContainer.expectActions([
        { type: 'approve', asset: 'spWETH' },
        { type: 'withdraw', asset: 'ETH' },
      ])

      await withdrawDialog.actionsContainer.acceptActionAtIndex(0)
      await withdrawDialog.actionsContainer.expectEnabledActionAtIndex(1)
      await withdrawDialog.closeDialog()

      await myPortfolioPage.clickDepositButtonAction('WETH')
      await depositDialog.selectAssetAction('ETH')
      await depositDialog.fillAmountAction(4)
      await depositDialog.actionsContainer.acceptAllActionsAction(1)
      await depositDialog.viewInMyPortfolioAction()
      await myPortfolioPage.expectDepositedAssets('$58.68K')

      // following checks leverage the fact that approval is cached, therefore we input different values to estimate the approval value
      await myPortfolioPage.clickWithdrawButtonAction('WETH')
      await withdrawDialog.selectAssetAction('ETH')
      await withdrawDialog.fillAmountAction(5.000004)
      await withdrawDialog.actionsContainer.expectEnabledActionAtIndex(1)
      await withdrawDialog.fillAmountAction(5.000005)
      await withdrawDialog.actionsContainer.expectEnabledActionAtIndex(1)
      await withdrawDialog.fillAmountAction(5.00006)
      await withdrawDialog.actionsContainer.expectEnabledActionAtIndex(0)
    })
  })
})

test.describe('Withdraw with actions batched', () => {
  test('can withdraw native asset', async ({ page }) => {
    const testContext = await setup(page, {
      blockchain: {
        chain: mainnet,
        blockNumber: DEFAULT_BLOCK_NUMBER,
      },
      initialPage: 'easyBorrow',
      account: {
        type: 'connected-random',
        assetBalances: {
          ETH: 20,
        },
        atomicBatchSupported: true,
      },
    })

    const borrowPage = new BorrowPageObject(testContext)
    const myPortfolioPage = new MyPortfolioPageObject(testContext)
    const withdrawDialog = new DialogPageObject({ testContext, header: /Withdr/ })

    await borrowPage.fillDepositAssetAction(0, 'ETH', 10)
    await borrowPage.fillBorrowAssetAction(1000)
    await borrowPage.submitAction()
    await borrowPage.actionsContainer.acceptBatchedActions()
    await borrowPage.expectSuccessPage({
      deposited: [{ asset: 'ETH', amount: '10.00', usdValue: '$39,283.13' }],
      borrowed: { asset: 'DAI', amount: '1,000.00', usdValue: '$1,000.00' },
    })

    await myPortfolioPage.goToMyPortfolioAction()

    await myPortfolioPage.clickWithdrawButtonAction('WETH')

    await withdrawDialog.selectAssetAction('ETH')
    await withdrawDialog.fillAmountAction(1)
    await withdrawDialog.actionsContainer.acceptBatchedActions()
    await withdrawDialog.expectSuccessPage({
      tokenWithValue: [
        {
          asset: 'ETH',
          amount: '1.00',
          usdValue: '$3,928.31',
        },
      ],
    })
    await withdrawDialog.viewInMyPortfolioAction()

    await myPortfolioPage.expectDepositTable({
      WETH: 9,
    })
  })
})

test.describe('Mixed WBTC and cbBTC position', () => {
  let myPortfolioPage: MyPortfolioPageObject
  let testContext: TestContext<'connected-random'>

  test.beforeEach(async ({ page }) => {
    testContext = await setup(page, {
      blockchain: {
        blockNumber: DEFAULT_BLOCK_NUMBER,
        chain: mainnet,
      },
      initialPage: 'myPortfolio',
      account: {
        type: 'connected-random',
        assetBalances: {
          WBTC: 1,
          cbBTC: 1,
        },
      },
    })

    myPortfolioPage = new MyPortfolioPageObject(testContext)

    const depositDialog = new DialogPageObject({ testContext, header: /Deposit/ })

    await myPortfolioPage.clickDepositButtonAction('cbBTC')
    await depositDialog.fillAmountAction(1)
    await depositDialog.actionsContainer.acceptAllActionsAction(2)
    await depositDialog.viewInMyPortfolioAction()
    await myPortfolioPage.expectDepositedAssets('$101.7K')

    const borrowDialog = new DialogPageObject({ testContext, header: /Borrow/ })
    await myPortfolioPage.clickBorrowButtonAction('DAI')
    await borrowDialog.fillAmountAction(50000)
    await borrowDialog.actionsContainer.acceptAllActionsAction(1)
    await borrowDialog.viewInMyPortfolioAction()

    await myPortfolioPage.clickDepositButtonAction('WBTC')
    await depositDialog.fillAmountAction(1)
    await depositDialog.actionsContainer.acceptAllActionsAction(2)
    await depositDialog.viewInMyPortfolioAction()

    await setAaveUsingAsCollateral({
      client: testContext.testnetController.client,
      tokenAddress: CheckedAddress(TOKENS_ON_FORK[mainnet.id].WBTC.address),
      lendingPoolAddress: CheckedAddress(lendingPoolAddress[mainnet.id]),
      account: CheckedAddress(testContext.account),
      usingAsCollateral: true,
    })

    await page.reload()
  })

  test('Cannot withdraw cbBTC', async () => {
    await myPortfolioPage.clickWithdrawButtonAction('cbBTC')
    const withdrawDialog = new DialogPageObject({ testContext, header })
    await withdrawDialog.fillAmountAction(0.5)
    await withdrawDialog.expectAssetInputError(withdrawalValidationIssueToMessage['has-zero-ltv-collateral'])
  })

  test('Can withdraw WBTC', async () => {
    await myPortfolioPage.clickWithdrawButtonAction('WBTC')
    const withdrawDialog = new DialogPageObject({ testContext, header })
    await withdrawDialog.fillAmountAction(0.5)
    await withdrawDialog.actionsContainer.acceptAllActionsAction(1)
    await withdrawDialog.viewInMyPortfolioAction()

    await myPortfolioPage.expectDepositedAssets('$152.4K')
  })
})
