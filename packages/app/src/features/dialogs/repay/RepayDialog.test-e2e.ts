import { repayValidationIssueToMessage } from '@/domain/market-validators/validateRepay'
import { BorrowPageObject } from '@/pages/Borrow.PageObject'
import { MyPortfolioPageObject } from '@/pages/MyPortfolio.PageObject'
import { DEFAULT_BLOCK_NUMBER, TOKENS_ON_FORK } from '@/test/e2e/constants'
import { TestContext, setup } from '@/test/e2e/setup'
import { test } from '@playwright/test'
import { BaseUnitNumber, NormalizedUnitNumber, toBigInt } from '@sparkdotfi/common-universal'
import { mainnet } from 'viem/chains'
import { DialogPageObject } from '../common/Dialog.PageObject'

const headerRegExp = /Repa*/

test.describe('Repay dialog', () => {
  const initialBalances = {
    wstETH: 100,
    rETH: 100,
    WETH: 100,
    ETH: 100,
    DAI: 100000,
  }

  test.describe('Position with borrowed DAI', () => {
    const initialDeposits = {
      rETH: 10,
    } as const
    const daiToBorrow = 3500

    let testContext: TestContext<'connected-random'>
    let repayDialog: DialogPageObject
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
          assetBalances: { ...initialBalances },
        },
      })

      const borrowPage = new BorrowPageObject(testContext)
      await borrowPage.depositAssetsActions({ assetsToDeposit: initialDeposits, daiToBorrow })
      await borrowPage.viewInMyPortfolioAction()
      repayDialog = new DialogPageObject({ testContext, header: headerRegExp })
      myPortfolioPage = new MyPortfolioPageObject(testContext)
      await myPortfolioPage.expectAssetToBeInDepositTable('DAI')
    })

    test('opens dialog with selected asset', async () => {
      await myPortfolioPage.clickRepayButtonAction('DAI')

      await repayDialog.expectSelectedAsset('DAI')
      await repayDialog.expectDialogHeader('Repay DAI')
      await repayDialog.expectHealthFactorBeforeVisible()
    })

    test('calculates health factor changes correctly when repaying part', async () => {
      await myPortfolioPage.clickRepayButtonAction('DAI')

      await repayDialog.fillAmountAction(100)
      await repayDialog.expectRiskLevelBefore('Healthy')
      await repayDialog.expectHealthFactorBefore('10.09')
      await repayDialog.expectRiskLevelAfter('Healthy')
      await repayDialog.expectHealthFactorAfter('10.38')
    })

    test('calculates health factor changes correctly when repaying all', async () => {
      await myPortfolioPage.clickRepayButtonAction('DAI')

      await repayDialog.clickMaxAmountAction()
      await repayDialog.expectRiskLevelBefore('Healthy')
      await repayDialog.expectHealthFactorBefore('10.09')
      await repayDialog.expectRiskLevelAfter('No debt')
      await repayDialog.expectHealthFactorAfter(String.fromCharCode(0x221e))
    })

    test('after repay, health factor matches myPortfolio', async () => {
      await myPortfolioPage.clickRepayButtonAction('DAI')

      await repayDialog.fillAmountAction(100)
      await repayDialog.actionsContainer.acceptAllActionsAction(2)
      await repayDialog.viewInMyPortfolioAction()
      await myPortfolioPage.expectHealthFactor('10.38')
    })

    test('has correct action plan for DAI', async () => {
      await myPortfolioPage.clickRepayButtonAction('DAI')

      await repayDialog.fillAmountAction(100)
      await repayDialog.actionsContainer.expectActions([
        { type: 'approve', asset: 'DAI' },
        { type: 'repay', asset: 'DAI' },
      ])
    })

    test('can repay DAI', async () => {
      const repay = {
        asset: 'DAI',
        amount: 100,
      } as const

      await myPortfolioPage.clickRepayButtonAction(repay.asset)

      await repayDialog.fillAmountAction(repay.amount)
      await repayDialog.actionsContainer.acceptAllActionsAction(2)
      await repayDialog.expectSuccessPage({ tokenWithValue: [{ asset: 'DAI', amount: '100.00', usdValue: '$100.00' }] })
      await repayDialog.viewInMyPortfolioAction()

      await myPortfolioPage.expectBorrowTable({
        [repay.asset]: daiToBorrow - repay.amount,
      })
    })

    test('can fully repay DAI', async () => {
      const repay = {
        asset: 'DAI',
        amount: 3500,
      } as const

      await myPortfolioPage.clickRepayButtonAction(repay.asset)

      await repayDialog.clickMaxAmountAction()
      await repayDialog.actionsContainer.acceptAllActionsAction(2)
      await repayDialog.expectSuccessPage({
        tokenWithValue: [{ asset: 'DAI', amount: '3,500.00', usdValue: '$3,500.00' }],
      })
      await repayDialog.viewInMyPortfolioAction()

      await myPortfolioPage.expectBorrowTable({
        [repay.asset]: 0,
      })
    })

    test('exact approvals are not required when repaying all', async ({ page }) => {
      const repay = {
        asset: 'DAI',
        amount: 3500,
      } as const

      await myPortfolioPage.clickRepayButtonAction(repay.asset)
      await repayDialog.clickMaxAmountAction()
      await repayDialog.actionsContainer.acceptActionAtIndex(0)
      await repayDialog.actionsContainer.expectEnabledActionAtIndex(1)

      await page.reload()
      await myPortfolioPage.clickRepayButtonAction(repay.asset)
      await repayDialog.clickMaxAmountAction()
      await repayDialog.actionsContainer.acceptActionAtIndex(1)

      await repayDialog.expectSuccessPage({
        tokenWithValue: [{ asset: 'DAI', amount: '3,500.00', usdValue: '$3,500.00' }],
      })
    })
  })

  test.describe('Position when borrowed asset was not in user wallet before', () => {
    const initialDeposits = {
      wstETH: 10,
    } as const

    const daiToBorrow = 10_000
    const daiDebtIncreaseIn1Epoch = 1.0000067529 // hardcoded for DAI borrow rate 12.55%
    const daiDebtIncreaseIn2Epochs = 1.000013502 // hardcoded for DAI borrow rate 12.55%

    let myPortfolioPage: MyPortfolioPageObject
    let repayDialog: DialogPageObject
    let testContext: TestContext<'connected-random'>

    test.beforeEach(async ({ page }) => {
      testContext = await setup(page, {
        blockchain: {
          blockNumber: DEFAULT_BLOCK_NUMBER,
          chain: mainnet,
        },
        initialPage: 'easyBorrow',
        account: {
          type: 'connected-random',
          assetBalances: { wstETH: 10 },
        },
      })

      const borrowPage = new BorrowPageObject(testContext)
      await borrowPage.depositAssetsActions({ assetsToDeposit: initialDeposits, daiToBorrow })
      await borrowPage.viewInMyPortfolioAction()

      myPortfolioPage = new MyPortfolioPageObject(testContext)
      repayDialog = new DialogPageObject({ testContext, header: headerRegExp })

      await myPortfolioPage.expectHealthFactor('3.73')
    })

    test('can repay if balance is less than debt', async ({ page }) => {
      const newBalance = 0.9 * daiToBorrow
      const repay = {
        asset: 'DAI',
        amount: newBalance,
      } as const

      await overrideDaiBalance({
        balance: NormalizedUnitNumber(newBalance),
        testContext,
      })
      await page.reload()

      await myPortfolioPage.clickRepayButtonAction(repay.asset)

      await repayDialog.clickMaxAmountAction()
      await repayDialog.actionsContainer.acceptAllActionsAction(2)
      await repayDialog.expectSuccessPage({
        tokenWithValue: [{ asset: 'DAI', amount: '9,000.00', usdValue: '$9,000.00' }],
      })
      await repayDialog.viewInMyPortfolioAction()

      await myPortfolioPage.expectNonZeroAmountInBorrowTable(repay.asset)
    })

    test('can repay if balance gt debt but lt debt after 1 epoch', async ({ page }) => {
      // The test asserts and edge case where user's balance is greater than debt, but less than debt after 1 epoch (30 minutes).
      // In this case the current implementation does not try to repay the debt including the interest accrued in the following time period
      // before the repay transaction is mined. Only the current debt is repaid. Therefore after the repay transaction some dust
      // (accrued interest) is left in the user's borrow table.
      const repay = {
        asset: 'DAI',
        amount: daiToBorrow,
      } as const
      const daiDebtIn1Epoch = NormalizedUnitNumber(daiToBorrow).times(daiDebtIncreaseIn1Epoch)
      // newBalance = (daiToBorrow, daiDebtIn1Epoch) / 2 - a number somewhere between daiToBorrow and daiDebtIn1Epoch
      const newBalance = NormalizedUnitNumber(daiDebtIn1Epoch.plus(daiToBorrow).div(2))
      await overrideDaiBalance({
        balance: newBalance,
        testContext,
      })
      await page.reload()

      await myPortfolioPage.clickRepayButtonAction(repay.asset)

      await repayDialog.clickMaxAmountAction()
      await repayDialog.actionsContainer.acceptAllActionsAction(2)
      await repayDialog.expectSuccessPage({
        tokenWithValue: [
          {
            asset: 'DAI',
            amount: '10,000.00',
            usdValue: '$10,000.00',
          },
        ],
      })

      await repayDialog.viewInMyPortfolioAction()

      await myPortfolioPage.expectNonZeroAmountInBorrowTable(repay.asset)
    })

    test('can repay if balance gt debt after 1 epoch but lt debt after 2 epochs', async ({ page }) => {
      const repay = {
        asset: 'DAI',
        amount: daiToBorrow,
      } as const

      const daiDebtIn1Epoch = NormalizedUnitNumber(daiToBorrow).times(daiDebtIncreaseIn1Epoch)
      const daiDebtIn2Epochs = NormalizedUnitNumber(daiToBorrow).times(daiDebtIncreaseIn2Epochs)
      // newBalance = (daiDebtIn1Epoch + daiDebtIn2Epochs) / 2 - a number somewhere between daiDebtIn1Epoch and daiDebtIn2Epochs
      const newBalance = NormalizedUnitNumber(daiDebtIn2Epochs.plus(daiDebtIn1Epoch).div(2))
      await overrideDaiBalance({
        balance: newBalance,
        testContext,
      })
      await page.reload()

      await myPortfolioPage.clickRepayButtonAction(repay.asset)

      await repayDialog.clickMaxAmountAction()
      await repayDialog.actionsContainer.acceptAllActionsAction(2)
      await repayDialog.expectSuccessPage({
        tokenWithValue: [
          {
            asset: 'DAI',
            amount: '10,000.00',
            usdValue: '$10,000.00',
          },
        ],
      })

      await repayDialog.viewInMyPortfolioAction()

      await myPortfolioPage.expectBorrowTable({
        [repay.asset]: 0,
      })
    })
  })

  test.describe('Position with multiple borrowed assets', () => {
    const initialDeposits = {
      wstETH: initialBalances.wstETH, // deposit whole balance
    } as const

    const wstETHBorrow = {
      asset: 'wstETH',
      amount: 10,
    }

    const WETHBorrow = {
      asset: 'WETH',
      amount: 10,
    }

    let testContext: TestContext<'connected-random'>
    let repayDialog: DialogPageObject
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
          assetBalances: { ...initialBalances },
        },
      })

      const borrowPage = new BorrowPageObject(testContext)
      myPortfolioPage = new MyPortfolioPageObject(testContext)
      repayDialog = new DialogPageObject({ testContext, header: headerRegExp })

      await borrowPage.depositWithoutBorrowActions({ assetsToDeposit: initialDeposits }) // deposit whole wallet balance
      await myPortfolioPage.goToMyPortfolioAction()

      // borrow wstETH and WETH
      const borrowDialog = new DialogPageObject({ testContext, header: /Borrow */ })
      // borrow wstETH
      await myPortfolioPage.clickBorrowButtonAction(wstETHBorrow.asset)
      await borrowDialog.fillAmountAction(wstETHBorrow.amount)
      await borrowDialog.actionsContainer.acceptAllActionsAction(1)
      await borrowDialog.viewInMyPortfolioAction()
      // borrow WETH
      await myPortfolioPage.clickBorrowButtonAction(WETHBorrow.asset)
      await borrowDialog.fillAmountAction(WETHBorrow.amount)
      await borrowDialog.actionsContainer.acceptAllActionsAction(1)
      await borrowDialog.viewInMyPortfolioAction()
    })

    test('can change asset to aToken', async () => {
      await myPortfolioPage.clickRepayButtonAction('wstETH')

      await repayDialog.selectAssetAction('spwstETH')
      await repayDialog.expectSelectedAsset('spwstETH')
      await repayDialog.expectDialogHeader('Repay wstETH')
      await repayDialog.expectHealthFactorBeforeVisible()
    })

    test('has correct action plan for repaying erc-20 using aToken', async () => {
      const repay = {
        asset: 'spwstETH',
        amount: 5,
      } as const

      await myPortfolioPage.clickRepayButtonAction('wstETH')

      await repayDialog.selectAssetAction(repay.asset)
      await repayDialog.fillAmountAction(repay.amount)
      await repayDialog.actionsContainer.expectActions([{ type: 'repay', asset: repay.asset }])
    })

    test('can repay erc-20 using aToken', async () => {
      const repay = {
        asset: 'spwstETH',
        amount: 5,
      } as const

      await myPortfolioPage.clickRepayButtonAction('wstETH')

      await repayDialog.selectAssetAction(repay.asset)
      await repayDialog.fillAmountAction(repay.amount)
      await repayDialog.actionsContainer.acceptAllActionsAction(1)
      await repayDialog.viewInMyPortfolioAction()

      await myPortfolioPage.expectBorrowTable({
        wstETH: wstETHBorrow.amount - repay.amount,
      })
    })

    test('can repay debt using native asset', async () => {
      const repay = {
        asset: 'ETH',
        amount: 1,
      } as const

      await myPortfolioPage.clickRepayButtonAction('WETH')

      await repayDialog.selectAssetAction(repay.asset)
      await repayDialog.fillAmountAction(repay.amount)
      await repayDialog.actionsContainer.acceptAllActionsAction(1)
      await repayDialog.viewInMyPortfolioAction()

      await myPortfolioPage.expectBorrowTable({
        WETH: WETHBorrow.amount - repay.amount,
      })
    })

    test('has correct action plan for erc-20 repay with permits', async () => {
      const repay = {
        asset: 'wstETH',
        amount: 5,
      } as const

      await myPortfolioPage.clickRepayButtonAction(repay.asset)

      await repayDialog.fillAmountAction(repay.amount)
      await repayDialog.actionsContainer.expectActions([
        { type: 'permit', asset: repay.asset },
        { type: 'repay', asset: repay.asset },
      ])
    })

    test('has correct action plan for erc-20 repay with approves', async () => {
      const repay = {
        asset: 'wstETH',
        amount: 5,
      } as const

      await myPortfolioPage.clickRepayButtonAction(repay.asset)

      await repayDialog.actionsContainer.switchPreferPermitsAction()
      await repayDialog.fillAmountAction(repay.amount)
      await repayDialog.actionsContainer.expectActions([
        { type: 'approve', asset: repay.asset },
        { type: 'repay', asset: repay.asset },
      ])
    })

    test('can repay erc-20 using permits', async () => {
      const repay = {
        asset: 'wstETH',
        amount: 5,
      } as const

      await myPortfolioPage.clickRepayButtonAction(repay.asset)

      await repayDialog.fillAmountAction(repay.amount)
      await repayDialog.actionsContainer.acceptAllActionsAction(2)
      await repayDialog.expectSuccessPage({
        tokenWithValue: [{ asset: 'wstETH', amount: '5.00', usdValue: '$23,327.32' }],
      })
      await repayDialog.viewInMyPortfolioAction()

      await myPortfolioPage.expectBorrowTable({
        [repay.asset]: wstETHBorrow.amount - repay.amount,
      })
    })

    test('can repay erc-20 using approves', async () => {
      const repay = {
        asset: 'wstETH',
        amount: 5,
      } as const

      await myPortfolioPage.clickRepayButtonAction(repay.asset)

      await repayDialog.actionsContainer.switchPreferPermitsAction()
      await repayDialog.fillAmountAction(repay.amount)
      await repayDialog.actionsContainer.acceptAllActionsAction(2)
      await repayDialog.expectSuccessPage({
        tokenWithValue: [{ asset: 'wstETH', amount: '5.00', usdValue: '$23,327.32' }],
      })
      await repayDialog.viewInMyPortfolioAction()

      await myPortfolioPage.expectBorrowTable({
        [repay.asset]: wstETHBorrow.amount - repay.amount,
      })
    })
  })

  test.describe('Form validation', () => {
    const initialDeposits = {
      wstETH: initialBalances.wstETH, // deposit whole balance
    } as const

    const wstETHBorrow = {
      asset: 'wstETH',
      amount: 50,
    }

    const wstETHDeposit = {
      asset: 'wstETH',
      amount: 50,
    }

    const WETHBorrow = {
      asset: 'WETH',
      amount: 10,
    }

    let testContext: TestContext<'connected-random'>
    let repayDialog: DialogPageObject
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
          assetBalances: { ...initialBalances },
        },
      })

      const borrowPage = new BorrowPageObject(testContext)
      repayDialog = new DialogPageObject({ testContext, header: headerRegExp })
      myPortfolioPage = new MyPortfolioPageObject(testContext)

      await borrowPage.depositWithoutBorrowActions({ assetsToDeposit: initialDeposits }) // deposit whole wallet balance
      await myPortfolioPage.goToMyPortfolioAction()

      // borrow wstETH and WETH
      const borrowDialog = new DialogPageObject({ testContext, header: /Borrow */ })
      // borrow wstETH
      await myPortfolioPage.clickBorrowButtonAction(wstETHBorrow.asset)
      await borrowDialog.fillAmountAction(wstETHBorrow.amount)
      await borrowDialog.actionsContainer.acceptAllActionsAction(1)
      await borrowDialog.viewInMyPortfolioAction()
      // borrow WETH
      await myPortfolioPage.clickBorrowButtonAction(WETHBorrow.asset)
      await borrowDialog.fillAmountAction(WETHBorrow.amount)
      await borrowDialog.clickAcknowledgeRisk()
      await borrowDialog.actionsContainer.acceptAllActionsAction(1)
      await borrowDialog.viewInMyPortfolioAction()

      // deposit wstETH to have balance not enough to later repay debt using wstETH
      const depositDialog = new DialogPageObject({ testContext, header: /Deposit */ })
      await myPortfolioPage.clickDepositButtonAction(wstETHDeposit.asset)
      await depositDialog.fillAmountAction(wstETHDeposit.amount)
      await depositDialog.actionsContainer.acceptAllActionsAction(2)
      await depositDialog.viewInMyPortfolioAction()
    })

    test('cannot repay repay more than owe', async () => {
      await myPortfolioPage.clickRepayButtonAction(WETHBorrow.asset)

      await repayDialog.expectHealthFactorBefore('2.05')
      await repayDialog.fillAmountAction(WETHBorrow.amount + 1)
      await repayDialog.expectAssetInputError(repayValidationIssueToMessage['exceeds-debt'])
    })

    test('cannot repay more than wallet balance', async () => {
      await myPortfolioPage.clickRepayButtonAction(wstETHBorrow.asset)

      await repayDialog.expectHealthFactorBefore('2.05')
      await repayDialog.fillAmountAction(1)
      await repayDialog.expectAssetInputError(repayValidationIssueToMessage['exceeds-balance'])
    })
  })

  test.describe('Position with only deposit', () => {
    const initialDeposits = {
      wstETH: 10,
    } as const

    let testContext: TestContext<'connected-random'>
    let repayDialog: DialogPageObject
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
          assetBalances: { ...initialBalances, ETH: 0 },
        },
      })

      const borrowPage = new BorrowPageObject(testContext)
      myPortfolioPage = new MyPortfolioPageObject(testContext)
      repayDialog = new DialogPageObject({ testContext, header: headerRegExp })

      await borrowPage.depositWithoutBorrowActions({ assetsToDeposit: initialDeposits })
      await myPortfolioPage.goToMyPortfolioAction()
    })

    test('nothing to repay', async () => {
      await myPortfolioPage.expectBorrowedAssetsToBeEmpty()
    })

    test('when repaying native asset retain some in wallet', async () => {
      await myPortfolioPage.clickBorrowButtonAction('WETH')

      const borrowDialog = new DialogPageObject({ testContext, header: /Borrow */ })
      await borrowDialog.selectAssetAction('ETH')
      await borrowDialog.fillAmountAction(5)
      await borrowDialog.actionsContainer.acceptAllActionsAction(2)
      await borrowDialog.viewInMyPortfolioAction()
      await myPortfolioPage.expectBorrowTable({ WETH: 5 })

      await myPortfolioPage.clickRepayButtonAction('WETH')
      await repayDialog.selectAssetAction('ETH')
      // wait for select to switch to ETH
      await repayDialog.actionsContainer.expectActions([
        {
          type: 'repay',
          asset: 'ETH',
        },
      ])
      await repayDialog.clickMaxAmountAction()

      await repayDialog.expectInputValue('4.999')
    })
  })
})

async function overrideDaiBalance({
  balance,
  testContext,
}: { balance: NormalizedUnitNumber; testContext: TestContext<'connected-random'> }): Promise<void> {
  const dai = TOKENS_ON_FORK[mainnet.id].DAI
  const daiBalance = toBigInt(BaseUnitNumber(balance.shiftedBy(dai.decimals)))
  return testContext.testnetController.client.setErc20Balance(dai.address, testContext.account, daiBalance)
}
