import { SPK_STAKING_ACTIVE_BLOCK_NUMBER } from '@/test/e2e/constants'
import { setup } from '@/test/e2e/setup'
import { test } from '@playwright/test'
import { mainnet } from 'viem/chains'
import { SpkStakingPageObject } from '../SpkStaking.PageObject'
import { StakeDialogPageObject } from './StakeDialog.PageObject'

test.describe('Stake SPK', () => {
  let spkStakingPage: SpkStakingPageObject
  let stakeDialog: StakeDialogPageObject

  test.beforeEach(async ({ page }) => {
    const testContext = await setup(page, {
      blockchain: {
        blockNumber: SPK_STAKING_ACTIVE_BLOCK_NUMBER,
        chain: mainnet,
      },
      initialPage: 'spkStaking',
      account: {
        type: 'connected-random',
        assetBalances: {
          ETH: 1,
          SPK: 10_000,
        },
        spkStaking: {
          stats: {
            tvl: '1000000',
            number_of_wallets: 100,
            apr: '0.00544',
          },
          walletData: {
            amount_staked: '0',
            pending_amount_normalized: '0',
            pending_amount_rate: '0',
            cumulative_amount_normalized: '0',
            timestamp: 1717334400,
            epoch: 1,
            proof: [],
          },
        },
      },
    })
    spkStakingPage = new SpkStakingPageObject(testContext)
    await spkStakingPage.clickStakeButtonAction()
    stakeDialog = new StakeDialogPageObject(testContext)
    await stakeDialog.selectAssetAction('SPK')
    await stakeDialog.fillAmountAction(10_000)
  })

  test('has correct SPK balance before stake', async () => {
    await spkStakingPage.closeDialog()
    await spkStakingPage.expectAvailableToStakeTokenBalance('SPK', '10,000.00')
  })

  test('has correct action plan', async () => {
    await stakeDialog.actionsContainer.expectActions([
      { type: 'approve', asset: 'SPK' },
      { type: 'stakeSpk', spk: 'SPK', amount: '10,000.00' },
    ])
  })

  test('displays transaction overview', async () => {
    await stakeDialog.expectTransactionOverview({
      estimatedRewards: {
        apy: '4.73%',
        description: 'Earn ~473 USDS/year',
      },
      unstakingDelay: '14 days',
    })
  })

  test('executes transaction', async () => {
    await stakeDialog.actionsContainer.acceptAllActionsAction(2)

    await stakeDialog.expectSuccessPage({
      tokenWithValue: [{ asset: 'SPK', amount: '10,000.00', usdValue: '$N/A' }],
    })

    await stakeDialog.clickBackToStakingAction()

    await spkStakingPage.expectAvailableToStakeTokenBalance('SPK', '10,000.00')
    await spkStakingPage.expectStaked({ amount: '10,000.00', asset: 'SPK' })
  })
})
