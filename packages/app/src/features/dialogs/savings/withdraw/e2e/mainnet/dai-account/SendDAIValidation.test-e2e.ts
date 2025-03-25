import { receiverValidationIssueToMessage } from '@/domain/savings/validateReceiver'
import { SavingsDialogPageObject } from '@/features/dialogs/savings/common/e2e/SavingsDialog.PageObject'
import { SavingsPageObject } from '@/pages/Savings.PageObject'
import { DEFAULT_BLOCK_NUMBER } from '@/test/e2e/constants'
import { setup } from '@/test/e2e/setup'
import { test } from '@playwright/test'
import { CheckedAddress } from '@sparkdotfi/common-universal'
import { Address } from 'viem'
import { mainnet } from 'viem/chains'
import { withdrawValidationIssueToMessage } from '../../../logic/validation'

test.describe('Asset input validation', () => {
  let savingsPage: SavingsPageObject
  let sendDialog: SavingsDialogPageObject
  const receiver = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'

  test.describe('Input value exceeds sDAI value', () => {
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
            sDAI: 100,
          },
        },
      })

      savingsPage = new SavingsPageObject(testContext)
      await savingsPage.clickSavingsNavigationItemAction('DAI')
      await savingsPage.clickSendFromAccountButtonAction()

      sendDialog = new SavingsDialogPageObject({ testContext, type: 'send' })
      await sendDialog.fillAmountAction(200)
      await sendDialog.fillReceiverAction(receiver)
    })

    test('displays validation error', async () => {
      await sendDialog.expectAssetInputError(withdrawValidationIssueToMessage['exceeds-balance'])
    })

    test('actions are disabled', async () => {
      await sendDialog.actionsContainer.expectDisabledActions([
        { type: 'withdrawFromSavings', asset: 'DAI', savingsAsset: 'sDAI', mode: 'send' },
      ])
    })

    test('displays sensible tx overview', async () => {
      await sendDialog.expectNativeRouteTransactionOverview({
        routeItems: [
          {
            tokenAmount: '177.68 sDAI',
            tokenUsdValue: '$200.00',
          },
          {
            tokenAmount: '200.00 DAI',
            tokenUsdValue: '$200.00',
          },
        ],
        outcome: '200.00 DAI',
        outcomeUsd: '$200.00',
      })
    })
  })

  test('displays validation error for dirty input with 0 value', async ({ page }) => {
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
          sDAI: 100,
        },
      },
    })

    savingsPage = new SavingsPageObject(testContext)
    await savingsPage.clickSavingsNavigationItemAction('DAI')
    await savingsPage.clickSendFromAccountButtonAction()
    sendDialog = new SavingsDialogPageObject({ testContext, type: 'send' })

    await sendDialog.fillAmountAction(10)
    await sendDialog.fillAmountAction(0)

    await sendDialog.expectAssetInputError(withdrawValidationIssueToMessage['value-not-positive'])
  })
})

test.describe('Receiver input validation', () => {
  let savingsPage: SavingsPageObject
  let sendDialog: SavingsDialogPageObject
  let selfAddress: Address

  test.describe('Incorrect receiver address', () => {
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
            sDAI: 100,
          },
        },
      })

      selfAddress = testContext.account

      savingsPage = new SavingsPageObject(testContext)
      await savingsPage.clickSavingsNavigationItemAction('DAI')
      await savingsPage.clickSendFromAccountButtonAction()

      sendDialog = new SavingsDialogPageObject({ testContext, type: 'send' })
      await sendDialog.fillAmountAction(50) // valid input amount
    })

    test('displays validation error', async () => {
      // invalid address is not valid
      await sendDialog.fillReceiverAction('0x0')
      await sendDialog.expectAddressInputError(receiverValidationIssueToMessage['invalid-address'])
      await sendDialog.fillReceiverAction('not-an-address')
      await sendDialog.expectAddressInputError(receiverValidationIssueToMessage['invalid-address'])
      await sendDialog.fillReceiverAction('0XD8DA6BF26964AF9D7EED9E03E53415D37AA96045') // uppercase
      await sendDialog.expectAddressInputError(receiverValidationIssueToMessage['invalid-address'])

      // zero address is not valid
      await sendDialog.fillReceiverAction(CheckedAddress.ZERO())
      await sendDialog.expectAddressInputError(receiverValidationIssueToMessage['zero-address'])

      // reserve address is not valid
      await sendDialog.fillReceiverAction('0x6B175474E89094C44Da98b954EedeAC495271d0F') // dai
      await sendDialog.expectAddressInputError(receiverValidationIssueToMessage['token-address'])

      // self address is not valid
      await sendDialog.fillReceiverAction(selfAddress)
      await sendDialog.expectAddressInputError(receiverValidationIssueToMessage['self-address'])

      // empty address is not valid
      await sendDialog.fillReceiverAction('')
      await sendDialog.expectAddressInputError(receiverValidationIssueToMessage['undefined-receiver'])
    })

    test('actions are disabled when receiver input is invalid', async () => {
      await sendDialog.fillReceiverAction('not-an-address')
      await sendDialog.actionsContainer.expectDisabledActions([
        { type: 'withdrawFromSavings', asset: 'DAI', savingsAsset: 'sDAI', mode: 'send' },
      ])
    })

    test('displays sensible tx overview when amount is provided and receiver is invalid', async () => {
      await sendDialog.fillReceiverAction('not-an-address')
      await sendDialog.expectNativeRouteTransactionOverview({
        routeItems: [
          {
            tokenAmount: '44.42 sDAI',
            tokenUsdValue: '$50.00',
          },
          {
            tokenAmount: '50.00 DAI',
            tokenUsdValue: '$50.00',
          },
        ],
        outcome: '50.00 DAI',
        outcomeUsd: '$50.00',
      })
    })
  })

  test('displays warning when receiver is smart contract address', async ({ page }) => {
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
          sDAI: 100,
        },
      },
    })

    savingsPage = new SavingsPageObject(testContext)
    await savingsPage.clickSavingsNavigationItemAction('DAI')
    await savingsPage.clickSendFromAccountButtonAction()
    sendDialog = new SavingsDialogPageObject({ testContext, type: 'send' })
    await sendDialog.fillAmountAction(50) // valid input amount

    await sendDialog.fillReceiverAction('0x197E90f9FAD81970bA7976f33CbD77088E5D7cf7') // pot address
    await sendDialog.expectReceiverIsSmartContractWarning()
  })
})

test.describe('Form validation', () => {
  let savingsPage: SavingsPageObject
  let sendDialog: SavingsDialogPageObject

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
          sDAI: 100,
        },
      },
    })

    savingsPage = new SavingsPageObject(testContext)
    await savingsPage.clickSavingsNavigationItemAction('DAI')
    await savingsPage.clickSendFromAccountButtonAction()

    sendDialog = new SavingsDialogPageObject({ testContext, type: 'send' })
  })

  test('actions are disabled when amount is invalid, but receiver is valid', async () => {
    await sendDialog.fillAmountAction(200)
    await sendDialog.fillReceiverAction('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045')
    await sendDialog.actionsContainer.expectDisabledActions([
      { type: 'withdrawFromSavings', asset: 'DAI', savingsAsset: 'sDAI', mode: 'send' },
    ])
  })

  test('actions are disabled when amount is valid, but receiver is invalid', async () => {
    await sendDialog.fillAmountAction(50)
    await sendDialog.fillReceiverAction('not-an-address')
    await sendDialog.actionsContainer.expectDisabledActions([
      { type: 'withdrawFromSavings', asset: 'DAI', savingsAsset: 'sDAI', mode: 'send' },
    ])
  })

  test('actions are disabled when both amount and receiver are invalid', async () => {
    await sendDialog.fillAmountAction(200)
    await sendDialog.fillReceiverAction('not-an-address')
    await sendDialog.actionsContainer.expectDisabledActions([
      { type: 'withdrawFromSavings', asset: 'DAI', savingsAsset: 'sDAI', mode: 'send' },
    ])
  })

  test('actions are enabled when amount and receiver are valid', async () => {
    await sendDialog.fillAmountAction(50)
    await sendDialog.fillReceiverAction('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045')
    await sendDialog.actionsContainer.expectActions([
      { type: 'withdrawFromSavings', asset: 'DAI', savingsAsset: 'sDAI', mode: 'send' },
    ])
  })
})
