import { DialogPageObject } from '@/features/dialogs/common/Dialog.PageObject'
import { DEFAULT_BLOCK_NUMBER, GNOSIS_DEFAULT_BLOCK_NUMBER } from '@/test/e2e/constants'
import { buildUrl, setup } from '@/test/e2e/setup'
import { test } from '@playwright/test'
import { gnosis, mainnet } from 'viem/chains'

import { BorrowPageObject } from './Borrow.PageObject'
import { MarketDetailsPageObject } from './MarketDetails.PageObject'

test.describe('Market details Mainnet', () => {
  const DAI = '0x6B175474E89094C44Da98b954EedeAC495271d0F'
  const WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
  const WEETH = '0xcd5fe23c85820f7b72d0926fc9b05b43e359b7ee'
  const USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
  const WBTC = '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'

  test.describe('Market overview', () => {
    test('DAI', async ({ page }) => {
      const testContext = await setup(page, {
        blockchain: { blockNumber: DEFAULT_BLOCK_NUMBER, chain: mainnet },
        initialPage: 'marketDetails',
        initialPageParams: { asset: DAI, chainId: mainnet.id.toString() },
        account: {
          type: 'not-connected',
        },
      })

      const marketDetailsPage = new MarketDetailsPageObject(testContext)
      await marketDetailsPage.expectMarketOverviewValue('Borrowed', '$1.626B')
      await marketDetailsPage.expectMarketOverviewValue('Instantly available', '$112.8M')
      await marketDetailsPage.expectMarketOverviewValue('Sky capacity', '$793.4M')
    })

    test('WETH', async ({ page }) => {
      const testContext = await setup(page, {
        blockchain: { blockNumber: DEFAULT_BLOCK_NUMBER, chain: mainnet },
        initialPage: 'marketDetails',
        initialPageParams: { asset: WETH, chainId: mainnet.id.toString() },
        account: {
          type: 'not-connected',
        },
      })

      const marketDetailsPage = new MarketDetailsPageObject(testContext)
      await marketDetailsPage.expectMarketOverviewValue('Borrowed', '$1.365B')
      await marketDetailsPage.expectMarketOverviewValue('Instantly available', '$171M')
    })

    test.describe('token that cannot be borrowed', () => {
      test('overview is visible when borrowed balance greater than non-zero', async ({ page }) => {
        const testContext = await setup(page, {
          blockchain: {
            blockNumber: DEFAULT_BLOCK_NUMBER,
            chain: mainnet,
          },
          initialPage: 'marketDetails',
          initialPageParams: { asset: WBTC, chainId: mainnet.id.toString() },
          account: {
            type: 'not-connected',
          },
        })

        const marketDetailsPage = new MarketDetailsPageObject(testContext)
        await marketDetailsPage.expectToBeLoaded()
      })

      test('overview is hidden when borrowed balance equal zero', async ({ page }) => {
        const testContext = await setup(page, {
          blockchain: {
            blockNumber: DEFAULT_BLOCK_NUMBER,
            chain: mainnet,
          },
          initialPage: 'marketDetails',
          initialPageParams: { asset: WEETH, chainId: mainnet.id.toString() },
          account: {
            type: 'not-connected',
          },
        })

        const marketDetailsPage = new MarketDetailsPageObject(testContext)
        await marketDetailsPage.expectMarketOverviewToBeHidden()
      })
    })
  })

  test.describe('Dialogs', () => {
    const initialDeposits = {
      wstETH: 10,
    }

    test('guest state', async ({ page }) => {
      const testContext = await setup(page, {
        blockchain: { blockNumber: DEFAULT_BLOCK_NUMBER, chain: mainnet },
        initialPage: 'marketDetails',
        initialPageParams: { asset: DAI, chainId: mainnet.id.toString() },
        account: {
          type: 'not-connected',
        },
      })

      const marketDetailsPage = new MarketDetailsPageObject(testContext)

      await marketDetailsPage.expectToBeLoaded()

      await marketDetailsPage.expectConnectWalletButton()
      await marketDetailsPage.expectDialogButtonToBeInvisible('Lend')
      await marketDetailsPage.expectDialogButtonToBeInvisible('Deposit')
      await marketDetailsPage.expectDialogButtonToBeInvisible('Borrow')
    })

    test("can't deposit if not enough balance", async ({ page }) => {
      const testContext = await setup(page, {
        blockchain: { blockNumber: DEFAULT_BLOCK_NUMBER, chain: mainnet },
        initialPage: 'marketDetails',
        initialPageParams: { asset: WETH, chainId: mainnet.id.toString() },
        account: {
          type: 'connected-random',
        },
      })

      const marketDetailsPage = new MarketDetailsPageObject(testContext)

      await marketDetailsPage.expectToBeLoaded()

      await marketDetailsPage.expectDialogButtonToBeInactive('Deposit')
    })

    test("can't lend if not enough balance", async ({ page }) => {
      const testContext = await setup(page, {
        blockchain: { blockNumber: DEFAULT_BLOCK_NUMBER, chain: mainnet },
        initialPage: 'marketDetails',
        initialPageParams: { asset: DAI, chainId: mainnet.id.toString() },
        account: {
          type: 'connected-random',
        },
      })

      const marketDetailsPage = new MarketDetailsPageObject(testContext)

      await marketDetailsPage.expectToBeLoaded()

      await marketDetailsPage.expectDialogButtonToBeInactive('Lend')
    })

    test("can't borrow if not enough balance", async ({ page }) => {
      const testContext = await setup(page, {
        blockchain: { blockNumber: DEFAULT_BLOCK_NUMBER, chain: mainnet },
        initialPage: 'marketDetails',
        initialPageParams: { asset: DAI, chainId: mainnet.id.toString() },
        account: {
          type: 'connected-random',
        },
      })

      const marketDetailsPage = new MarketDetailsPageObject(testContext)

      await marketDetailsPage.expectToBeLoaded()

      await marketDetailsPage.expectBorrowNotAvailableDisclaimer()
      await marketDetailsPage.expectDialogButtonToBeInvisible('Borrow')
    })

    test('opens dialogs for DAI', async ({ page }) => {
      const testContext = await setup(page, {
        blockchain: { blockNumber: DEFAULT_BLOCK_NUMBER, chain: mainnet },
        initialPage: 'easyBorrow',
        account: {
          type: 'connected-random',
          assetBalances: {
            ...initialDeposits,
            DAI: 1000,
            sDAI: 1000,
          },
        },
      })

      const borrowPage = new BorrowPageObject(testContext)
      await borrowPage.depositWithoutBorrowActions({ assetsToDeposit: initialDeposits })

      await page.goto(buildUrl('marketDetails', { asset: DAI, chainId: mainnet.id.toString() }))

      const marketDetailsPage = new MarketDetailsPageObject(testContext)

      await marketDetailsPage.openDialogAction('Lend')
      const lendDialog = new DialogPageObject({ testContext, header: /Deposit/i })
      await lendDialog.expectDialogHeader('Deposit DAI')
      await lendDialog.closeDialog()

      await marketDetailsPage.openDialogAction('Deposit')
      const depositDialog = new DialogPageObject({ testContext, header: /Deposit/i })
      await depositDialog.expectDialogHeader('Deposit sDAI')
      await depositDialog.closeDialog()

      await marketDetailsPage.openDialogAction('Borrow')
      const borrowDialog = new DialogPageObject({ testContext, header: /Borrow/i })
      await borrowDialog.expectDialogHeader('Borrow DAI')
      await borrowDialog.closeDialog()
    })

    test('opens dialogs for WETH', async ({ page }) => {
      const testContext = await setup(page, {
        blockchain: { blockNumber: DEFAULT_BLOCK_NUMBER, chain: mainnet },
        initialPage: 'easyBorrow',
        account: {
          type: 'connected-random',
          assetBalances: {
            ...initialDeposits,
            WETH: 10,
          },
        },
      })

      const borrowPage = new BorrowPageObject(testContext)
      await borrowPage.depositWithoutBorrowActions({ assetsToDeposit: initialDeposits })

      await page.goto(buildUrl('marketDetails', { asset: WETH, chainId: mainnet.id.toString() }))

      const marketDetailsPage = new MarketDetailsPageObject(testContext)

      await marketDetailsPage.openDialogAction('Deposit')
      const lendDialog = new DialogPageObject({ testContext, header: /Deposit/i })
      await lendDialog.expectDialogHeader('Deposit WETH')
      await lendDialog.closeDialog()

      await marketDetailsPage.openDialogAction('Borrow')
      const borrowDialog = new DialogPageObject({ testContext, header: /Borrow/i })
      await borrowDialog.expectDialogHeader('Borrow WETH')
      await borrowDialog.closeDialog()
    })

    // @todo: this scenario is inaccurate, because user has only ETH - in future dialog should open on ETH tab
    test('opens dialogs for WETH when having only ETH', async ({ page }) => {
      const testContext = await setup(page, {
        blockchain: { blockNumber: DEFAULT_BLOCK_NUMBER, chain: mainnet },
        initialPage: 'easyBorrow',
        account: {
          type: 'connected-random',
          assetBalances: {
            ...initialDeposits,
            ETH: 5,
          },
        },
      })

      const borrowPage = new BorrowPageObject(testContext)
      await borrowPage.depositWithoutBorrowActions({ assetsToDeposit: initialDeposits })

      await page.goto(buildUrl('marketDetails', { asset: WETH, chainId: mainnet.id.toString() }))

      const marketDetailsPage = new MarketDetailsPageObject(testContext)

      await marketDetailsPage.expectWalletBalance('5.00 WETH')

      await marketDetailsPage.openDialogAction('Deposit')
      const lendDialog = new DialogPageObject({ testContext, header: /Deposit/i })
      await lendDialog.expectDialogHeader('Deposit WETH')
      await lendDialog.closeDialog()

      await marketDetailsPage.openDialogAction('Borrow')
      const borrowDialog = new DialogPageObject({ testContext, header: /Borrow/i })
      await borrowDialog.expectDialogHeader('Borrow WETH')
      await borrowDialog.closeDialog()
    })

    test('wallet displays sum of WETH and ETH', async ({ page }) => {
      const testContext = await setup(page, {
        blockchain: { blockNumber: DEFAULT_BLOCK_NUMBER, chain: mainnet },
        initialPage: 'marketDetails',
        initialPageParams: {
          asset: WETH,
          chainId: mainnet.id.toString(),
        },
        account: {
          type: 'connected-random',
          assetBalances: {
            ...initialDeposits,
            ETH: 5,
            WETH: 10,
          },
        },
      })

      const marketDetailsPage = new MarketDetailsPageObject(testContext)

      await marketDetailsPage.expectWalletBalance('15.00 WETH')
    })
  })

  test.describe('Isolated assets', () => {
    test('Correctly displays debt ceiling', async ({ page }) => {
      const testContext = await setup(page, {
        blockchain: { blockNumber: DEFAULT_BLOCK_NUMBER, chain: mainnet },
        initialPage: 'marketDetails',
        initialPageParams: { asset: WEETH, chainId: mainnet.id.toString() },
        account: {
          type: 'not-connected',
        },
      })

      const marketDetailsPage = new MarketDetailsPageObject(testContext)
      await marketDetailsPage.expectDebt('$89M')
      await marketDetailsPage.expectDebtCeiling('$200M')
    })
  })

  test.describe('Errors', () => {
    const NOT_A_RESERVE = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'

    test('displays 404 page for unknown chain', async ({ page }) => {
      const testContext = await setup(page, {
        blockchain: { blockNumber: DEFAULT_BLOCK_NUMBER, chain: mainnet },
        initialPage: 'marketDetails',
        initialPageParams: { asset: DAI, chainId: '12345' },
        account: {
          type: 'not-connected',
        },
      })

      const marketDetailsPage = new MarketDetailsPageObject(testContext)
      await marketDetailsPage.expect404()
    })

    test('displays 404 page for unknown asset', async ({ page }) => {
      const testContext = await setup(page, {
        blockchain: { blockNumber: DEFAULT_BLOCK_NUMBER, chain: mainnet },
        initialPage: 'marketDetails',
        initialPageParams: { asset: NOT_A_RESERVE, chainId: mainnet.id.toString() },
        account: {
          type: 'not-connected',
        },
      })

      const marketDetailsPage = new MarketDetailsPageObject(testContext)
      await marketDetailsPage.expect404()
    })
  })

  test.describe('Cap automator', () => {
    test('WETH', async ({ page }) => {
      const testContext = await setup(page, {
        blockchain: { blockNumber: DEFAULT_BLOCK_NUMBER, chain: mainnet },
        initialPage: 'marketDetails',
        initialPageParams: { asset: WETH, chainId: mainnet.id.toString() },
        account: {
          type: 'not-connected',
        },
      })

      const marketDetailsPage = new MarketDetailsPageObject(testContext)

      await marketDetailsPage.expectSupplyCap('2M WETH')
      await marketDetailsPage.expectInstantlyAvailableToSupply('178.8K WETH')
      await marketDetailsPage.expectSupplyCapCooldown('0h 00m 00s')

      await marketDetailsPage.expectBorrowLiquidity('20.65K WETH')
      await marketDetailsPage.expectBorrowCap('1M WETH')
      await marketDetailsPage.expectBorrowCapCooldown('0h 00m 00s')
    })

    test('USDC', async ({ page }) => {
      const testContext = await setup(page, {
        blockchain: { blockNumber: DEFAULT_BLOCK_NUMBER, chain: mainnet },
        initialPage: 'marketDetails',
        initialPageParams: { asset: USDC, chainId: mainnet.id.toString() },
        account: {
          type: 'not-connected',
        },
      })

      const marketDetailsPage = new MarketDetailsPageObject(testContext)

      await marketDetailsPage.expectSupplyPanelNotVisible()

      await marketDetailsPage.expectBorrowLiquidity('67.12K USDC')
      await marketDetailsPage.expectBorrowCap('57M USDC')
    })

    test('WBTC', async ({ page }) => {
      const testContext = await setup(page, {
        blockchain: { blockNumber: DEFAULT_BLOCK_NUMBER, chain: mainnet },
        initialPage: 'marketDetails',
        initialPageParams: { asset: WBTC, chainId: mainnet.id.toString() },
        account: {
          type: 'not-connected',
        },
      })

      const marketDetailsPage = new MarketDetailsPageObject(testContext)

      await marketDetailsPage.expectInstantlyAvailableToSupply('199.3 WBTC')
      await marketDetailsPage.expectSupplyCap('5,000 WBTC')
      await marketDetailsPage.expectSupplyCapCooldown('0h 00m 00s')

      await marketDetailsPage.expectBorrowPanelNotVisible()
      await marketDetailsPage.expectToBeDisabledAsCollateral()
      await marketDetailsPage.expectDisabledCollateralInfoVisible()
    })
  })

  test.describe('Oracles', () => {
    test('Fixed price', async ({ page }) => {
      const testContext = await setup(page, {
        blockchain: { blockNumber: DEFAULT_BLOCK_NUMBER, chain: mainnet },
        initialPage: 'marketDetails',
        initialPageParams: { asset: DAI, chainId: mainnet.id.toString() },
        account: {
          type: 'not-connected',
        },
      })

      const marketDetailsPage = new MarketDetailsPageObject(testContext)

      await marketDetailsPage.expectOraclePanelToHaveTitle('Fixed Price')

      await marketDetailsPage.expectOracleInfo({
        price: '$1.00',
        asset: 'DAI',
        oracleContract: '0x42a03F81dd8A1cEcD746dc262e4d1CD9fD39F777',
      })
    })
    test('Market price - not redundant', async ({ page }) => {
      const testContext = await setup(page, {
        blockchain: { blockNumber: DEFAULT_BLOCK_NUMBER, chain: mainnet },
        initialPage: 'marketDetails',
        initialPageParams: { asset: WBTC, chainId: mainnet.id.toString() },
        account: {
          type: 'not-connected',
        },
      })

      const marketDetailsPage = new MarketDetailsPageObject(testContext)

      await marketDetailsPage.expectOraclePanelToHaveTitle('Market Price')
      await marketDetailsPage.expectOracleToBeNotRedundant()

      await marketDetailsPage.expectOracleInfo({
        price: '$101,496.42',
        asset: 'WBTC',
        oracleContract: '0x230E0321Cf38F09e247e50Afc7801EA2351fe56F',
      })
    })

    test('Yielding fixed price - redundant', async ({ page }) => {
      const testContext = await setup(page, {
        blockchain: { blockNumber: DEFAULT_BLOCK_NUMBER, chain: mainnet },
        initialPage: 'marketDetails',
        initialPageParams: { asset: WEETH, chainId: mainnet.id.toString() },
        account: {
          type: 'not-connected',
        },
      })

      const marketDetailsPage = new MarketDetailsPageObject(testContext)

      await marketDetailsPage.expectOraclePanelToHaveTitle('Yielding Fixed Price')
      await marketDetailsPage.expectOracleToBeRedundant()

      await marketDetailsPage.expectOracleInfo({
        price: '$4,145.06',
        asset: 'weETH',
        oracleContract: '0x28897036f8459bFBa886083dD6b4Ce4d2f14a57F',
      })
      await marketDetailsPage.expectYieldingFixedOracleBaseAssetInfo({
        asset: 'WETH',
        price: '$3,928.31',
        oracleContract: '0xb20A1374EfCaFa32F701Ab14316fA2E5b3400eD5',
      })
      await marketDetailsPage.expectYieldingFixedOracleRatioInfo({
        ratio: '1.0552',
        ratioContract: '0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee',
      })
    })
  })
})

test.describe('Market details Gnosis', () => {
  const XDAI = '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d'
  const EURe = '0xcB444e90D8198415266c6a2724b7900fb12FC56E'
  const WETH = '0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1'
  const sDAI = '0xaf204776c7245bF4147c2612BF6e5972Ee483701'

  test.describe('Cap automator', () => {
    test('WETH', async ({ page }) => {
      const testContext = await setup(page, {
        blockchain: { blockNumber: GNOSIS_DEFAULT_BLOCK_NUMBER, chain: gnosis },
        initialPage: 'marketDetails',
        initialPageParams: { asset: WETH, chainId: gnosis.id.toString() },
        account: {
          type: 'not-connected',
        },
      })

      const marketDetailsPage = new MarketDetailsPageObject(testContext)

      await marketDetailsPage.expectSupplyCap('5,000 WETH')
      await marketDetailsPage.expectInstantlyAvailableToSupply('3,302 WETH')

      await marketDetailsPage.expectBorrowCap('3,000 WETH')
      await marketDetailsPage.expectBorrowLiquidity('1,333 WETH')
    })

    test('XDAI', async ({ page }) => {
      const testContext = await setup(page, {
        blockchain: { blockNumber: GNOSIS_DEFAULT_BLOCK_NUMBER, chain: gnosis },
        initialPage: 'marketDetails',
        initialPageParams: { asset: XDAI, chainId: gnosis.id.toString() },
        account: {
          type: 'not-connected',
        },
      })

      const marketDetailsPage = new MarketDetailsPageObject(testContext)

      await marketDetailsPage.expectSupplyCap('20M WXDAI')
      await marketDetailsPage.expectInstantlyAvailableToSupply('14.78M WXDAI')

      await marketDetailsPage.expectBorrowCap('16M WXDAI')

      await marketDetailsPage.expectCollateralPanelNotVisible()
    })
  })

  test.describe('Oracles', () => {
    test('Fixed price', async ({ page }) => {
      const testContext = await setup(page, {
        blockchain: { blockNumber: GNOSIS_DEFAULT_BLOCK_NUMBER, chain: gnosis },
        initialPage: 'marketDetails',
        initialPageParams: { asset: XDAI, chainId: gnosis.id.toString() },
        account: {
          type: 'not-connected',
        },
      })

      const marketDetailsPage = new MarketDetailsPageObject(testContext)

      await marketDetailsPage.expectOraclePanelToHaveTitle('Fixed Price')

      await marketDetailsPage.expectOracleInfo({
        price: '$1.00',
        asset: 'WXDAI',
        oracleContract: '0x6FC2871B6d9A94866B7260896257Fd5b50c09900',
      })
    })

    test('Underlying asset price', async ({ page }) => {
      const testContext = await setup(page, {
        blockchain: { blockNumber: GNOSIS_DEFAULT_BLOCK_NUMBER, chain: gnosis },
        initialPage: 'marketDetails',
        initialPageParams: { asset: EURe, chainId: gnosis.id.toString() },
        account: {
          type: 'not-connected',
        },
      })

      const marketDetailsPage = new MarketDetailsPageObject(testContext)

      await marketDetailsPage.expectOraclePanelToHaveTitle('Underlying Asset Price')

      await marketDetailsPage.expectOracleInfo({
        price: '$1.07',
        asset: 'EUR',
        oracleContract: '0xab70BCB260073d036d1660201e9d5405F5829b7a',
      })
    })

    test('Yielding fixed price - not redundant', async ({ page }) => {
      const testContext = await setup(page, {
        blockchain: { blockNumber: GNOSIS_DEFAULT_BLOCK_NUMBER, chain: gnosis },
        initialPage: 'marketDetails',
        initialPageParams: { asset: sDAI, chainId: gnosis.id.toString() },
        account: {
          type: 'not-connected',
        },
      })

      const marketDetailsPage = new MarketDetailsPageObject(testContext)

      await marketDetailsPage.expectOraclePanelToHaveTitle('Yielding Fixed Price')
      await marketDetailsPage.expectOracleToBeNotRedundant()

      await marketDetailsPage.expectOracleInfo({
        price: '$1.0875',
        asset: 'sDAI',
        oracleContract: '0x1D0f881Ce1a646E2f27Dec3c57Fa056cB838BCC2',
      })
      await marketDetailsPage.expectYieldingFixedOracleBaseAssetInfo({
        asset: 'DAI',
        price: '$0.9997',
        oracleContract: '0x678df3415fc31947dA4324eC63212874be5a82f8',
      })
      await marketDetailsPage.expectYieldingFixedOracleRatioInfo({
        ratio: '1.0878',
        ratioContract: '0xaf204776c7245bF4147c2612BF6e5972Ee483701',
      })
    })
  })
})
