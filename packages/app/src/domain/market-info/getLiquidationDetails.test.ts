import { describe } from 'vitest'

import { MarketInfo } from '@/domain/market-info/marketInfo'
import { Token } from '@/domain/types/Token'
import { TokenSymbol } from '@/domain/types/TokenSymbol'
import { testAddresses } from '@/test/integration/constants'
import { NormalizedUnitNumber, Percentage } from '@sparkdotfi/common-universal'

import { getLiquidationDetails } from './getLiquidationDetails'

describe(getLiquidationDetails.name, () => {
  it('returns undefined when no collaterals and no borrows', () => {
    const marketInfo = getMockedMarketInfo()

    const result = getLiquidationDetails({
      collaterals: [],
      borrows: [],
      marketInfo,
      liquidationThreshold: Percentage(0.8),
    })
    expect(result).toBeUndefined()
  })

  it('returns undefined when no borrows', () => {
    const marketInfo = getMockedMarketInfo()
    const collaterals = [{ token: ethLike, value: NormalizedUnitNumber(1) }]

    const result = getLiquidationDetails({
      collaterals,
      borrows: [],
      marketInfo,
      liquidationThreshold: Percentage(0.8),
    })
    expect(result).toBeUndefined()
  })

  it('returns undefined when borrow is not dai', () => {
    const marketInfo = getMockedMarketInfo()
    const collaterals = [{ token: ethLike, value: NormalizedUnitNumber(1) }]
    const borrows = [{ token: wstETHLike, value: NormalizedUnitNumber(0.5) }]

    const result = getLiquidationDetails({
      collaterals,
      borrows,
      marketInfo,
      liquidationThreshold: Percentage(0.8),
    })
    expect(result).toBeUndefined()
  })

  it('returns undefined when multiple borrows', () => {
    const marketInfo = getMockedMarketInfo()
    const collaterals = [{ token: ethLike, value: NormalizedUnitNumber(1) }]
    const borrows = [
      { token: daiLike, value: NormalizedUnitNumber(20000) },
      { token: btcLike, value: NormalizedUnitNumber(1) },
    ]

    const result = getLiquidationDetails({
      collaterals,
      borrows,
      marketInfo,
      liquidationThreshold: Percentage(0.8),
    })
    expect(result).toBeUndefined()
  })

  it('returns undefined when mixed collaterals', () => {
    const marketInfo = getMockedMarketInfo()
    const collaterals = [
      { token: btcLike, value: NormalizedUnitNumber(1) },
      { token: ethLike, value: NormalizedUnitNumber(1) },
    ]
    const borrows = [{ token: daiLike, value: NormalizedUnitNumber(20000) }]

    const result = getLiquidationDetails({
      collaterals,
      borrows,
      marketInfo,
      liquidationThreshold: Percentage(0.8),
    })
    expect(result).toBeUndefined()
  })

  it('calculates liquidation price for btc like', () => {
    const marketInfo = getMockedMarketInfo()
    const collaterals = [{ token: btcLike, value: NormalizedUnitNumber(1) }]
    const borrows = [{ token: daiLike, value: NormalizedUnitNumber(20000) }]

    const result = getLiquidationDetails({
      collaterals,
      borrows,
      marketInfo,
      liquidationThreshold: Percentage(0.8),
    })
    expect(result).toStrictEqual({
      liquidationPrice: NormalizedUnitNumber(25000),
      tokenWithPrice: {
        priceInUSD: NormalizedUnitNumber(40000),
        symbol: TokenSymbol('BTC'),
      },
    })
  })

  it('calculates liquidation price for eth correlated assets', () => {
    const marketInfo = getMockedMarketInfo()
    const collaterals = [
      { token: ethLike, value: NormalizedUnitNumber(2) },
      { token: wstETHLike, value: NormalizedUnitNumber(2) },
    ]
    const borrows = [{ token: daiLike, value: NormalizedUnitNumber(4000) }]

    const result = getLiquidationDetails({
      collaterals,
      borrows,
      marketInfo,
      liquidationThreshold: Percentage(0.8),
    })
    expect(result).toStrictEqual({
      liquidationPrice: NormalizedUnitNumber(1000),
      tokenWithPrice: {
        priceInUSD: NormalizedUnitNumber(2000),
        symbol: TokenSymbol('ETH'),
      },
    })
  })
})

function getMockedMarketInfo(): MarketInfo {
  function findReserveBySymbol(symbol: string): { token: Token; eModeCategory?: { id: number } } {
    if (['ETH', 'WETH'].includes(symbol)) {
      return {
        token: ethLike,
        eModeCategory: {
          id: 1, // ETH Correlated
        },
      }
    }

    if (symbol === 'wstETH') {
      return {
        token: wstETHLike,
        eModeCategory: {
          id: 1, // ETH Correlated
        },
      }
    }

    if (symbol === 'DAI') {
      return {
        token: daiLike,
        eModeCategory: undefined,
      }
    }

    if (symbol === 'BTC') {
      return {
        token: btcLike,
        eModeCategory: undefined,
      }
    }

    throw new Error(`Unknown symbol: ${symbol}`)
  }

  function findTokenBySymbol(symbol: string): Token {
    return findReserveBySymbol(symbol).token
  }

  return {
    findOneReserveBySymbol: findReserveBySymbol,
    findReserveBySymbol,
    findOneTokenBySymbol: findTokenBySymbol,
    findTokenBySymbol,
    chainId: 1,
  } as unknown as MarketInfo
}

const address = testAddresses.token
const ethLike = new Token({
  address,
  symbol: TokenSymbol('ETH'),
  decimals: 18,
  name: 'ETH Token',
  unitPriceUsd: '2000',
})
const wstETHLike = new Token({
  address,
  symbol: TokenSymbol('wstETH'),
  decimals: 18,
  name: 'Lido',
  unitPriceUsd: '3000',
})
const btcLike = new Token({
  address,
  symbol: TokenSymbol('BTC'),
  decimals: 18,
  name: 'BTC Token',
  unitPriceUsd: '40000',
})
const daiLike = new Token({
  address,
  symbol: TokenSymbol('DAI'),
  decimals: 18,
  name: 'DAI Token',
  unitPriceUsd: '1',
})
