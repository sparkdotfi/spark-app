import {
  fetchEzethOracleInfo,
  fetchRethOracleInfo,
  fetchRsethOracleInfo,
  fetchWeethOracleInfo,
  fetchWstethOracleInfoMainnet,
} from '@/domain/oracles/oracleInfoFetchers'
import {
  mainnetSdaiMyEarningsQueryOptions,
  mainnetSusdcMyEarningsQueryOptions,
  mainnetSusdsMyEarningsQueryOptions,
} from '@/domain/savings-charts/my-earnings-query/mainnet'
import {
  mainnetSdaiSavingsRateQueryOptions,
  mainnetSusdcSavingsRateQueryOptions,
  mainnetSusdsSavingsRateQueryOptions,
} from '@/domain/savings-charts/savings-rate-query/mainnet'
import {
  mainnetSavingsDaiConverterQuery,
  mainnetSavingsUsdcConverterQuery,
  mainnetSavingsUsdsConverterQuery,
} from '@/domain/savings-converters/mainnetSavingsConverter'
import { Token } from '@/domain/types/Token'
import { TokenSymbol } from '@/domain/types/TokenSymbol'
import { assets } from '@/ui/assets'
import { CheckedAddress, NormalizedUnitNumber } from '@sparkdotfi/common-universal'
import { mainnet } from 'viem/chains'
import { infoSkyApiUrl } from '../../consts'
import { usdcVaultAddress } from '../../contracts-generated'
import { commonTokenSymbolToReplacedName } from '../common'
import { farmAddresses, farmStablecoinsEntryGroup, susdsAddresses } from '../constants'
import { USDC_ACCOUNT_ENABLED } from '../flags'
import { ChainConfigEntry } from '../types'
import { defineToken } from '../utils/defineToken'

const dai = defineToken({
  address: CheckedAddress('0x6b175474e89094c44da98b954eedeac495271d0f'),
  oracleType: 'fixed-usd',
  symbol: TokenSymbol('DAI'),
})

const usdc = defineToken({
  address: CheckedAddress('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'),
  oracleType: 'fixed-usd',
  symbol: TokenSymbol('USDC'),
})

const sdai = defineToken({
  address: CheckedAddress('0x83f20f44975d03b1b09e64809b757c47f942beea'),
  oracleType: 'vault',
  symbol: TokenSymbol('sDAI'),
})

const usds = defineToken({
  address: CheckedAddress('0xdC035D45d973E3EC169d2276DDab16f1e407384F'),
  oracleType: 'fixed-usd',
  symbol: TokenSymbol('USDS'),
})

const susds = defineToken({
  address: susdsAddresses[mainnet.id],
  oracleType: 'vault',
  symbol: TokenSymbol('sUSDS'),
})

const susdc = defineToken({
  address: CheckedAddress(usdcVaultAddress[mainnet.id]),
  oracleType: 'vault',
  assetsDecimals: 6,
  symbol: TokenSymbol('sUSDC'),
})

const sky = defineToken({
  address: CheckedAddress('0x56072C95FAA701256059aa122697B133aDEd9279'),
  oracleType: 'zero-price',
  symbol: TokenSymbol('SKY'),
})

const spk = defineToken({
  address: CheckedAddress('0x56072C95FAA701256059aa122697B133aDEd9279'), // @todo: add correct address
  oracleType: 'zero-price',
  symbol: TokenSymbol('SPK'),
})

export const mainnetConfig: ChainConfigEntry = {
  originChainId: mainnet.id,
  daiSymbol: dai.symbol,
  sdaiSymbol: sdai.symbol,
  usdsSymbol: usds.symbol,
  susdsSymbol: susds.symbol,
  meta: {
    name: 'Ethereum',
    logo: assets.chain.ethereum,
  },
  permitSupport: {
    [CheckedAddress('0x6b175474e89094c44da98b954eedeac495271d0f')]: false, // DAI
    [CheckedAddress('0x83f20f44975d03b1b09e64809b757c47f942beea')]: true, // sDAI
    [CheckedAddress('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48')]: false, // USDC
    [CheckedAddress('0xdAC17F958D2ee523a2206206994597C13D831ec7')]: false, // USDT
    [CheckedAddress('0x2260fac5e5542a773aa44fbcfedf7c193bc2c599')]: false, // WBTC
    [CheckedAddress('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2')]: false, // WETH
    [CheckedAddress('0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0')]: true, // wstETH
    [CheckedAddress('0xae78736Cd615f374D3085123A210448E74Fc6393')]: false, // rETH
    [CheckedAddress('0x6810e776880C02933D47DB1b9fc05908e5386b96')]: false, // GNO
  },
  tokensWithMalformedApprove: [CheckedAddress('0xdac17f958d2ee523a2206206994597c13d831ec7')], // USDT
  airdrop: {
    [TokenSymbol('ETH')]: {
      deposit: [TokenSymbol('SPK')],
      borrow: [],
    },
    [TokenSymbol('WETH')]: {
      deposit: [TokenSymbol('SPK')],
      borrow: [],
    },
    [TokenSymbol('DAI')]: {
      deposit: [],
      borrow: [TokenSymbol('SPK')],
    },
    [TokenSymbol('USDS')]: {
      deposit: [],
      borrow: [TokenSymbol('SPK')],
    },
  },
  markets: {
    defaultAssetToBorrow: dai.symbol,
    highlightedTokensToBorrow: [dai.symbol, usds.symbol, usdc.symbol],
    nativeAssetInfo: {
      nativeAssetName: 'Ethereum',
      wrappedNativeAssetSymbol: TokenSymbol('WETH'),
      wrappedNativeAssetAddress: CheckedAddress('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'),
      nativeAssetSymbol: TokenSymbol('ETH'),
      minRemainingNativeAssetBalance: NormalizedUnitNumber(0.001),
    },
    tokenSymbolToReplacedName: {
      ...commonTokenSymbolToReplacedName,
    },
    oracles: {
      [TokenSymbol('WETH')]: {
        type: 'market-price',
        providedBy: ['chainlink', 'chronicle', 'redstone'],
      },
      [TokenSymbol('WBTC')]: {
        type: 'market-price',
        providedBy: ['chainlink'],
      },
      [TokenSymbol('wstETH')]: {
        type: 'yielding-fixed',
        baseAssetSymbol: TokenSymbol('WETH'),
        providedBy: ['chainlink', 'chronicle', 'redstone'],
        oracleFetcher: fetchWstethOracleInfoMainnet,
      },
      [TokenSymbol('rETH')]: {
        type: 'yielding-fixed',
        baseAssetSymbol: TokenSymbol('WETH'),
        providedBy: ['chainlink', 'chronicle', 'redstone'],
        oracleFetcher: fetchRethOracleInfo,
      },
      [TokenSymbol('weETH')]: {
        type: 'yielding-fixed',
        baseAssetSymbol: TokenSymbol('WETH'),
        providedBy: ['chainlink', 'chronicle', 'redstone'],
        oracleFetcher: fetchWeethOracleInfo,
      },
      [TokenSymbol('USDC')]: {
        type: 'fixed',
      },
      [TokenSymbol('USDT')]: {
        type: 'fixed',
      },
      [TokenSymbol('DAI')]: {
        type: 'fixed',
      },
      [TokenSymbol('cbBTC')]: {
        type: 'underlying-asset',
        asset: 'BTC',
        providedBy: ['chainlink', 'chronicle', 'redstone'],
      },
      [TokenSymbol('LBTC')]: {
        type: 'underlying-asset',
        asset: 'BTC',
        providedBy: ['chainlink', 'chronicle', 'redstone'],
      },
      [TokenSymbol('tBTC')]: {
        type: 'underlying-asset',
        asset: 'BTC',
        providedBy: ['chainlink', 'chronicle', 'redstone'],
      },
      [TokenSymbol('ezETH')]: {
        type: 'yielding-fixed',
        baseAssetSymbol: TokenSymbol('WETH'),
        providedBy: ['chainlink', 'chronicle', 'redstone'],
        oracleFetcher: fetchEzethOracleInfo,
      },
      [TokenSymbol('rsETH')]: {
        type: 'yielding-fixed',
        baseAssetSymbol: TokenSymbol('WETH'),
        providedBy: ['chainlink', 'chronicle', 'redstone'],
        oracleFetcher: fetchRsethOracleInfo,
      },
    },
  },
  savings: {
    accounts: [
      {
        savingsToken: susds.symbol,
        underlyingToken: usds.symbol,
        supportedStablecoins: [usds.symbol, usdc.symbol, dai.symbol],
        fetchConverterQuery: mainnetSavingsUsdsConverterQuery,
        savingsRateQueryOptions: mainnetSusdsSavingsRateQueryOptions,
        myEarningsQueryOptions: mainnetSusdsMyEarningsQueryOptions,
      },
      ...(USDC_ACCOUNT_ENABLED
        ? [
            {
              savingsToken: susdc.symbol,
              underlyingToken: usdc.symbol,
              supportedStablecoins: [usdc.symbol],
              fetchConverterQuery: mainnetSavingsUsdcConverterQuery,
              savingsRateQueryOptions: mainnetSusdcSavingsRateQueryOptions,
              myEarningsQueryOptions: mainnetSusdcMyEarningsQueryOptions,
            },
          ]
        : []),
      {
        savingsToken: sdai.symbol,
        underlyingToken: dai.symbol,
        supportedStablecoins: [dai.symbol, usdc.symbol],
        fetchConverterQuery: mainnetSavingsDaiConverterQuery,
        savingsRateQueryOptions: mainnetSdaiSavingsRateQueryOptions,
        myEarningsQueryOptions: mainnetSdaiMyEarningsQueryOptions,
      },
    ],
    psmStables: [dai.symbol, usdc.symbol, usds.symbol],
  },
  farms: {
    configs: [
      {
        rewardType: 'token',
        address: farmAddresses[mainnet.id].skyUsds,
        entryAssetsGroup: {
          type: 'stablecoins',
          name: 'Stablecoins',
          assets: [dai.symbol, usdc.symbol, usds.symbol, sdai.symbol, susds.symbol],
        },
        rewardToken: sky.symbol,
        historyCutoff: new Date('2024-09-17T00:00:00.000Z'),
      },
      {
        // Chronicle farm
        rewardType: 'points',
        address: farmAddresses[mainnet.id].chroniclePoints,
        entryAssetsGroup: farmStablecoinsEntryGroup[mainnet.id],
        historyCutoff: new Date('2024-09-17T00:00:00.000Z'),
        rewardPoints: new Token({
          address: CheckedAddress.ZERO(),
          decimals: 18,
          name: 'Chronicle',
          symbol: TokenSymbol('CLE'),
          unitPriceUsd: '0',
        }),
      },
    ],
    getFarmDetailsApiUrl: (address) => `${infoSkyApiUrl}/farms/${address.toLowerCase()}/historic/`,
  },
  sparkToken: {
    spkSymbol: spk.symbol,
    usdsSymbol: usds.symbol,
  },
  definedTokens: [dai, usdc, usds, susds, sdai, susdc, sky, spk],
}
