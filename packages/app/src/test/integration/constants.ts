import BigNumber from 'bignumber.js'

import { NativeAssetInfo } from '@/config/chain/types'
import { AaveUserReserve } from '@/domain/market-info/aave-data-layer/query'
import {
  MarketInfo,
  Reserve,
  UserConfiguration,
  UserPosition,
  UserPositionSummary,
} from '@/domain/market-info/marketInfo'
import { TokenRepository } from '@/domain/token-repository/TokenRepository'
import { Token } from '@/domain/types/Token'
import { TokenSymbol } from '@/domain/types/TokenSymbol'
import { NormalizedUnitNumber, Percentage } from '@sparkdotfi/common-universal'
import { CheckedAddress } from '@sparkdotfi/common-universal'
import { zeroAddress } from 'viem'

export const testAddresses = {
  alice: createDummyAddress('a11ce'),
  bob: createDummyAddress('b0b'),
  token: createDummyAddress('7041311'), // if you squint, it looks like "token"
  token2: createDummyAddress('70413112'),
  token3: createDummyAddress('70413113'),
  token4: createDummyAddress('70413114'),
}

function createDummyAddress(prefix: string): CheckedAddress {
  const address = prefix + '0'.repeat(40 - prefix.length)

  return CheckedAddress(`0x${address}`)
}

export function getMockAaveUserReserve(overrides: Partial<AaveUserReserve> = {}): AaveUserReserve {
  return {
    underlyingAsset: '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0',
    name: 'Wrapped liquid staked Ether 2.0',
    symbol: 'wstETH',
    decimals: 18,
    baseLTVasCollateral: '6850',
    reserveLiquidationThreshold: '7950',
    reserveLiquidationBonus: '10700',
    reserveFactor: '0.15',
    usageAsCollateralEnabled: true,
    borrowingEnabled: true,
    stableBorrowRateEnabled: false,
    isActive: true,
    isFrozen: false,
    liquidityIndex: '1000040121636005118530217371',
    variableBorrowIndex: '1002639258351271728705309220',
    liquidityRate: '2394836129343291714447',
    variableBorrowRate: '2608029980148289558043989',
    stableBorrowRate: '45000000000000000000000000',
    lastUpdateTimestamp: 1707226247,
    aTokenAddress: '0x12B54025C112Aa61fAce2CDB7118740875A566E9',
    stableDebtTokenAddress: '0x9832D969a0c8662D98fFf334A4ba7FeE62b109C2',
    variableDebtTokenAddress: '0xd5c3E3B566a42A6110513Ac7670C1a86D76E13E6',
    interestRateStrategyAddress: '0x0D56700c90a690D8795D6C148aCD94b12932f4E3',
    availableLiquidity: '442037025543508881719022',
    totalPrincipalStableDebt: '0',
    averageStableRate: '0',
    stableDebtLastUpdateTimestamp: 0,
    totalScaledVariableDebt: '476.790573622181008097',
    priceInMarketReferenceCurrency: '262935513695',
    priceOracle: '0xA9F30e6ED4098e9439B2ac8aEA2d3fc26BcEbb45',
    variableRateSlope1: '45000000000000000000000000',
    variableRateSlope2: '800000000000000000000000000',
    stableRateSlope1: '0',
    stableRateSlope2: '0',
    baseStableBorrowRate: '45000000000000000000000000',
    baseVariableBorrowRate: '2500000000000000000000000',
    optimalUsageRatio: '450000000000000000000000000',
    isPaused: false,
    isSiloedBorrowing: false,
    accruedToTreasury: '252777594703129452',
    unbacked: '0',
    isolationModeTotalDebt: '0',
    flashLoanEnabled: true,
    debtCeiling: '0',
    debtCeilingDecimals: 2,
    eModeCategoryId: 1,
    borrowCap: '3000',
    supplyCap: '800000',
    eModeLtv: 9000,
    eModeLiquidationThreshold: 9300,
    eModeLiquidationBonus: 10100,
    eModePriceSource: '0x0000000000000000000000000000000000000000',
    eModeLabel: 'ETH',
    borrowableInIsolation: false,
    id: '1-0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0-0x02C3eA4e34C0cBd694D2adFa2c690EECbC1793eE',
    totalDebt: '478.059161298460858355',
    totalStableDebt: '0',
    totalVariableDebt: '478.059161298460858355',
    totalLiquidity: '442515.084704807342577377',
    borrowUsageRatio: '0.00108032285863738235',
    supplyUsageRatio: '0.00108032285863738235',
    formattedReserveLiquidationBonus: '0.07',
    formattedEModeLiquidationBonus: '0.01',
    formattedEModeLiquidationThreshold: '0.93',
    formattedEModeLtv: '0.9',
    supplyAPY: '0.00000239483899696551',
    variableBorrowAPY: '0.00261143384871612347',
    stableBorrowAPY: '0.04602785987513300031',
    formattedAvailableLiquidity: '442037.025543508881719022',
    unborrowedLiquidity: '442037.025543508881719022',
    formattedBaseLTVasCollateral: '0.685',
    supplyAPR: '0.00000239483612934329',
    variableBorrowAPR: '0.00260802998014828956',
    stableBorrowAPR: '0.045',
    formattedReserveLiquidationThreshold: '0.795',
    debtCeilingUSD: '0',
    isolationModeTotalDebtUSD: '0',
    availableDebtCeilingUSD: '0',
    isIsolated: false,
    totalLiquidityUSD: '1163529311.14644956056590466781',
    availableLiquidityUSD: '6631078.09932388330995314507',
    totalDebtUSD: '1256987.31152611669004422558',
    totalVariableDebtUSD: '1256987.31152611669004422558',
    totalStableDebtUSD: '0',
    formattedPriceInMarketReferenceCurrency: '2629.35513695',
    priceInUSD: '2629.35513695',
    borrowCapUSD: '7888065.41085',
    supplyCapUSD: '2103484109.56',
    unbackedUSD: '0',
    aIncentivesData: [],
    vIncentivesData: [],
    sIncentivesData: [],
    ...overrides,
  }
}

export function getMockReserve(overrides: Partial<Reserve> = {}): Reserve {
  const priceInUsd = 2000
  const token = new Token({
    address: testAddresses.token,
    symbol: TokenSymbol('wstETH'),
    name: 'Wrapped liquid staked Ether 2.0',
    decimals: 18,
    unitPriceUsd: priceInUsd.toString(),
  })

  return {
    token,

    aToken: token.clone({ symbol: TokenSymbol('spwstETH') }),
    variableDebtTokenAddress: CheckedAddress('0xd5c3E3B566a42A6110513Ac7670C1a86D76E13E6'),

    status: 'active',

    supplyAvailabilityStatus: 'yes',
    collateralEligibilityStatus: 'yes',
    borrowEligibilityStatus: 'yes',

    isIsolated: false,
    eModeCategory: undefined,

    availableLiquidity: NormalizedUnitNumber(100),
    availableLiquidityUSD: NormalizedUnitNumber(100 * priceInUsd),
    unborrowedLiquidity: NormalizedUnitNumber(1000),
    supplyCap: undefined,
    totalLiquidity: NormalizedUnitNumber(200),
    totalLiquidityUSD: NormalizedUnitNumber(200 * priceInUsd),
    totalDebt: NormalizedUnitNumber(100),
    totalDebtUSD: NormalizedUnitNumber(100 * priceInUsd),
    totalVariableDebt: NormalizedUnitNumber(100),
    totalVariableDebtUSD: NormalizedUnitNumber(100 * priceInUsd),
    isolationModeTotalDebt: NormalizedUnitNumber(0),
    debtCeiling: NormalizedUnitNumber(200),
    supplyAPY: Percentage(0.05),
    maxLtv: Percentage(0.8),
    liquidationThreshold: Percentage(0.8),
    liquidationBonus: Percentage(0.05),
    aTokenBalance: NormalizedUnitNumber(0),

    lastUpdateTimestamp: 0,

    variableBorrowIndex: new BigNumber(0),
    variableBorrowRate: new BigNumber(0),
    liquidityIndex: new BigNumber(0),
    liquidityRate: new BigNumber(0),
    variableRateSlope1: new BigNumber(0),
    variableRateSlope2: new BigNumber(0),
    baseVariableBorrowRate: new BigNumber(0),
    optimalUtilizationRate: Percentage(0.8),
    utilizationRate: Percentage(0.5),
    reserveFactor: Percentage(0.05),
    isBorrowableInIsolation: false,

    variableBorrowApy: Percentage(0.05),

    priceInUSD: NormalizedUnitNumber(priceInUsd),
    priceOracle: CheckedAddress(zeroAddress),

    usageAsCollateralEnabled: true,
    usageAsCollateralEnabledOnUser: true,
    isSiloedBorrowing: false,

    incentives: { borrow: [], deposit: [] },
    ...overrides,
  }
}

export function getMockUserPosition(overrides?: Partial<UserPosition>): UserPosition {
  return {
    reserve: getMockReserve(),
    scaledATokenBalance: NormalizedUnitNumber(0),
    scaledVariableDebt: NormalizedUnitNumber(0),
    borrowBalance: NormalizedUnitNumber(0),
    collateralBalance: NormalizedUnitNumber(0),
    ...overrides,
  }
}

export function getMockUserPositionSummary(overrides?: Partial<UserPositionSummary>): UserPositionSummary {
  return {
    loanToValue: Percentage(0),
    maxLoanToValue: Percentage(0),
    healthFactor: new BigNumber(0),
    availableBorrowsUSD: NormalizedUnitNumber(0),
    totalBorrowsUSD: NormalizedUnitNumber(0),
    currentLiquidationThreshold: Percentage(0),
    totalCollateralUSD: NormalizedUnitNumber(0),
    totalLiquidityUSD: NormalizedUnitNumber(0),
    ...overrides,
  }
}

export function getMockToken(overrides?: Partial<ConstructorParameters<typeof Token>[0]>): Token {
  return new Token({
    address: testAddresses.token,
    symbol: TokenSymbol('TKN'),
    name: 'Token',
    decimals: 18,
    unitPriceUsd: '2000',
    ...overrides,
  })
}

export function getMockMarketInfo(
  reserves: Reserve[] = [daiLikeReserve, wethLikeReserve],
  userPosition?: UserPosition[],
  userPositionSummary?: UserPositionSummary,
  userConfiguration?: UserConfiguration,
  chainId?: number,
  nativeAssetInfo?: NativeAssetInfo,
  daiSymbol?: TokenSymbol,
  sdaiSymbol?: TokenSymbol,
): MarketInfo {
  return new MarketInfo(
    reserves,
    userPosition ?? reserves.map((r) => getMockUserPosition({ reserve: r })),
    userPositionSummary ?? getMockUserPositionSummary(),
    userConfiguration ?? {
      eModeState: { enabled: false },
      isolationModeState: { enabled: false },
      siloBorrowingState: { enabled: false },
    },
    {},
    new Date('2024-06-04T10:21:19Z').getTime() / 1000,
    chainId ?? 1,
    [], // no user rewards
    nativeAssetInfo ?? {
      nativeAssetName: 'Ethereum',
      wrappedNativeAssetSymbol: TokenSymbol('WETH'),
      wrappedNativeAssetAddress: CheckedAddress('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'),
      nativeAssetSymbol: TokenSymbol('ETH'),
      minRemainingNativeAssetBalance: NormalizedUnitNumber(0.001),
    },
    daiSymbol ?? TokenSymbol('DAI'),
    sdaiSymbol ?? TokenSymbol('sDAI'),
  )
}

export const daiLikeReserve = getMockReserve({
  token: new Token({
    symbol: TokenSymbol('DAI'),
    name: 'Dai Stablecoin',
    decimals: 18,
    address: CheckedAddress('0x6B175474E89094C44Da98b954EedeAC495271d0F'),
    unitPriceUsd: '1',
  }),
  status: 'active',
  supplyAvailabilityStatus: 'yes',
  collateralEligibilityStatus: 'no',
  borrowEligibilityStatus: 'yes',
  isIsolated: false,
  isBorrowableInIsolation: true,
  eModeCategory: undefined,
  isSiloedBorrowing: false,
  availableLiquidity: NormalizedUnitNumber('24662247.809387867477416918'),
  availableLiquidityUSD: NormalizedUnitNumber('24662247.809387867477416918'),
  totalLiquidity: NormalizedUnitNumber('1022367834.197032800423989866'),
  totalLiquidityUSD: NormalizedUnitNumber('1022367834.197032800423989866'),
  totalDebt: NormalizedUnitNumber('997705586.387644932946572948'),
  totalDebtUSD: NormalizedUnitNumber('997705586.387644932946572948'),
  totalVariableDebt: NormalizedUnitNumber('997705586.387644932946572948'),
  totalVariableDebtUSD: NormalizedUnitNumber('997705586.387644932946572948'),
  isolationModeTotalDebt: NormalizedUnitNumber('0'),
  debtCeiling: NormalizedUnitNumber('0'),
  supplyAPY: Percentage('0.06299360148523566431'),
  maxLtv: Percentage('0'),
  variableBorrowApy: Percentage('0.06459999999999999996'),
  lastUpdateTimestamp: 1708334846,
  variableBorrowIndex: new BigNumber('1.035736103938278845101422738e+27'),
  variableBorrowRate: new BigNumber('6.2599141818649791361008e+25'),
  liquidityIndex: new BigNumber('1.028914737353923264312907136e+27'),
  liquidityRate: new BigNumber('6.1089080101931682768749404e+25'),
  priceInUSD: NormalizedUnitNumber('1'),
  usageAsCollateralEnabled: false,
  usageAsCollateralEnabledOnUser: false,
  incentives: { deposit: [], borrow: [] },
})

export const usdcLikeReserve = {
  ...daiLikeReserve,
  token: new Token({
    symbol: TokenSymbol('USDC'),
    name: 'USD Coin',
    decimals: 6,
    address: CheckedAddress('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'),
    unitPriceUsd: '1',
  }),
}

export const usdtLikeReserve = {
  ...daiLikeReserve,
  token: new Token({
    symbol: TokenSymbol('USDT'),
    name: 'Tether USD',
    decimals: 6,
    address: CheckedAddress('0xdac17f958d2ee523a2206206994597c13d831ec7'),
    unitPriceUsd: '1',
  }),
}

export const sDaiLikeReserve = getMockReserve({
  token: new Token({
    symbol: TokenSymbol('sDAI'),
    name: 'Dai Stablecoin',
    decimals: 18,
    address: CheckedAddress('0x83F20F44975D03b1b09e64809B757c47f942BEeA'),
    unitPriceUsd: '1.1',
  }),
  status: 'active',
  supplyAvailabilityStatus: 'yes',
  collateralEligibilityStatus: 'no',
  borrowEligibilityStatus: 'no',
  isIsolated: false,
  isBorrowableInIsolation: true,
  eModeCategory: undefined,
  isSiloedBorrowing: false,
  availableLiquidity: NormalizedUnitNumber('24662247.809387867477416918'),
  availableLiquidityUSD: NormalizedUnitNumber('24662247.809387867477416918'),
  totalLiquidity: NormalizedUnitNumber('1022367834.197032800423989866'),
  totalLiquidityUSD: NormalizedUnitNumber('1022367834.197032800423989866'),
  totalDebt: NormalizedUnitNumber('997705586.387644932946572948'),
  totalDebtUSD: NormalizedUnitNumber('997705586.387644932946572948'),
  totalVariableDebt: NormalizedUnitNumber('997705586.387644932946572948'),
  totalVariableDebtUSD: NormalizedUnitNumber('997705586.387644932946572948'),
  isolationModeTotalDebt: NormalizedUnitNumber('0'),
  debtCeiling: NormalizedUnitNumber('0'),
  supplyAPY: Percentage('0.06299360148523566431'),
  maxLtv: Percentage('0'),
  variableBorrowApy: Percentage('0.06459999999999999996'),
  lastUpdateTimestamp: 1708334846,
  variableBorrowIndex: new BigNumber('1.035736103938278845101422738e+27'),
  variableBorrowRate: new BigNumber('6.2599141818649791361008e+25'),
  liquidityIndex: new BigNumber('1.028914737353923264312907136e+27'),
  liquidityRate: new BigNumber('6.1089080101931682768749404e+25'),
  priceInUSD: NormalizedUnitNumber('1'),
  usageAsCollateralEnabled: false,
  usageAsCollateralEnabledOnUser: false,
  incentives: { deposit: [], borrow: [] },
})

export const wethLikeReserve = getMockReserve({
  token: new Token({
    symbol: TokenSymbol('WETH'),
    name: 'Wrapped Ether',
    decimals: 18,
    address: CheckedAddress('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'),
    unitPriceUsd: '2907.40835',
  }),
  status: 'active',
  supplyAvailabilityStatus: 'yes',
  collateralEligibilityStatus: 'yes',
  borrowEligibilityStatus: 'yes',
  isIsolated: false,
  eModeCategory: undefined,
  isSiloedBorrowing: false,
  availableLiquidity: NormalizedUnitNumber('125501.896724995390811222'),
  availableLiquidityUSD: NormalizedUnitNumber('364885262.4790892529560601165'),
  totalLiquidity: NormalizedUnitNumber('240005.463747054418237119'),
  totalLiquidityUSD: NormalizedUnitNumber('697793889.34380830348699206054'),
  totalDebt: NormalizedUnitNumber('114503.567022059027425897'),
  totalDebtUSD: NormalizedUnitNumber('332908626.86471905053093194404'),
  totalVariableDebt: NormalizedUnitNumber('114503.567022059027425897'),
  totalVariableDebtUSD: NormalizedUnitNumber('332908626.86471905053093194404'),
  isolationModeTotalDebt: NormalizedUnitNumber('0'),
  debtCeiling: NormalizedUnitNumber('0'),
  supplyAPY: Percentage('0.00771786450868526367'),
  maxLtv: Percentage('0.8'),
  variableBorrowApy: Percentage('0.01710779075945549687'),
  lastUpdateTimestamp: 1708334829,
  variableBorrowIndex: new BigNumber('1.024848053360502593632035917e+27'),
  variableBorrowRate: new BigNumber('1.6963100401904001627543239e+25'),
  liquidityIndex: new BigNumber('1.013900866792617715471863134e+27'),
  liquidityRate: new BigNumber('7.688234151079366400606947e+24'),
  priceInUSD: NormalizedUnitNumber('2907.40835'),
  usageAsCollateralEnabled: true,
  usageAsCollateralEnabledOnUser: true,
  incentives: {
    deposit: [
      {
        token: new Token({
          symbol: TokenSymbol('wstETH'),
          name: 'Wrapped liquid staked Ether 2.0',
          decimals: 18,
          address: CheckedAddress('0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0'),
          unitPriceUsd: '3365.40595559',
        }),
        APR: Percentage('0'),
      },
    ],
    borrow: [],
  },
})

export function getMockTokenRepository(): TokenRepository {
  return new TokenRepository(
    [
      { token: testTokens.DAI, balance: NormalizedUnitNumber(2000) },
      { token: testTokens.sDAI, balance: NormalizedUnitNumber(2000) },
      { token: testTokens.USDS, balance: NormalizedUnitNumber(500) },
      { token: testTokens.sUSDS, balance: NormalizedUnitNumber(150) },
      { token: testTokens.USDC, balance: NormalizedUnitNumber(400) },
    ],
    {
      DAI: testTokens.DAI.symbol,
      sDAI: testTokens.sDAI.symbol,
      USDS: testTokens.USDS.symbol,
      sUSDS: testTokens.sUSDS.symbol,
    },
  )
}

export const testTokens = {
  DAI: daiLikeReserve.token,
  XDAI: daiLikeReserve.token.clone({
    name: 'XDAI',
    symbol: TokenSymbol('XDAI'),
  }),
  sDAI: sDaiLikeReserve.token,
  USDC: usdcLikeReserve.token,
  USDT: usdtLikeReserve.token,
  WETH: wethLikeReserve.token,
  USDS: new Token({
    address: CheckedAddress('0x798f111c92E38F102931F34D1e0ea7e671BDBE31'),
    symbol: TokenSymbol('USDS'),
    name: 'USDS',
    decimals: 18,
    unitPriceUsd: '1',
  }),
  sUSDS: new Token({
    address: CheckedAddress('0xeA8AE08513f8230cAA8d031D28cB4Ac8CE720c68'),
    symbol: TokenSymbol('sUSDS'),
    name: 'sUSDS',
    decimals: 18,
    unitPriceUsd: '1.05',
  }),
  sUSDC: new Token({
    address: CheckedAddress('0xBc65ad17c5C0a2A4D159fa5a503f4992c7B545FE'),
    symbol: TokenSymbol('sUSDC'),
    name: 'sUSDC',
    decimals: 18,
    unitPriceUsd: '1.05',
  }),
  token1: new Token({
    address: testAddresses.token,
    symbol: TokenSymbol('TKN1'),
    name: 'Token 1',
    decimals: 18,
    unitPriceUsd: '1',
  }),
  token2: new Token({
    address: testAddresses.token2,
    symbol: TokenSymbol('TKN2'),
    name: 'Token 2',
    decimals: 18,
    unitPriceUsd: '1',
  }),
  token3: new Token({
    address: testAddresses.token3,
    symbol: TokenSymbol('TKN3'),
    name: 'Token 3',
    decimals: 18,
    unitPriceUsd: '1',
  }),
  token4: new Token({
    address: testAddresses.token3,
    symbol: TokenSymbol('TKN4'),
    name: 'Token 4',
    decimals: 18,
    unitPriceUsd: '1',
  }),
}
