import { D3MInfo } from '@/domain/d3m-info/types'
import { daiLikeReserve, getMockMarketInfo, getMockReserve, wethLikeReserve } from '@/test/integration/constants'
import { NormalizedUnitNumber, bigNumberify } from '@sparkdotfi/common-universal'
import { aggregateStats } from './aggregate-stats'

describe('aggregateStats', () => {
  test('calculates stats correctly ', () => {
    const daiReserve = getMockReserve({
      ...daiLikeReserve,
      totalLiquidityUSD: NormalizedUnitNumber(1000),
      totalDebtUSD: NormalizedUnitNumber(400),
      totalLiquidity: NormalizedUnitNumber(1000),
    })
    const wethReserve = getMockReserve({
      ...wethLikeReserve,
      totalLiquidityUSD: NormalizedUnitNumber(500),
      totalDebtUSD: NormalizedUnitNumber(200),
    })
    const marketInfo = getMockMarketInfo([daiReserve, wethReserve])

    const d3mInfo: D3MInfo = {
      D3MCurrentDebtUSD: bigNumberify(970), // 97% of dai liquidity
    } as D3MInfo

    const result = aggregateStats(marketInfo, d3mInfo)

    expect(result.totalMarketSizeUSD.toString()).toBe('1500')
    expect(result.totalAvailableUSD.toString()).toBe('900')
    expect(result.totalBorrowsUSD.toString()).toBe('600')
    expect(result.totalValueLockedUSD?.toString()).toBe('318')
  })

  test('calculates stats correctly when D3M is not present', () => {
    const daiReserve = getMockReserve({
      ...daiLikeReserve,
      totalLiquidityUSD: NormalizedUnitNumber(1000),
      totalDebtUSD: NormalizedUnitNumber(400),
    })
    const wethReserve = getMockReserve({
      ...wethLikeReserve,
      totalLiquidityUSD: NormalizedUnitNumber(500),
      totalDebtUSD: NormalizedUnitNumber(200),
    })
    const marketInfo = getMockMarketInfo([daiReserve, wethReserve])

    const result = aggregateStats(marketInfo, undefined)

    expect(result.totalMarketSizeUSD.toString()).toBe('1500')
    expect(result.totalAvailableUSD.toString()).toBe('900')
    expect(result.totalBorrowsUSD.toString()).toBe('600')
    expect(result.totalValueLockedUSD?.toString()).toBe('900')
  })

  test('handles case when value of D3M debt is returned higher that DAI reserve total liquidity', () => {
    const daiReserve = getMockReserve({
      ...daiLikeReserve,
      totalLiquidityUSD: NormalizedUnitNumber(1000),
      totalDebtUSD: NormalizedUnitNumber(400),
      totalLiquidity: NormalizedUnitNumber(1000),
    })
    const wethReserve = getMockReserve({
      ...wethLikeReserve,
      totalLiquidityUSD: NormalizedUnitNumber(500),
      totalDebtUSD: NormalizedUnitNumber(200),
    })
    const marketInfo = getMockMarketInfo([daiReserve, wethReserve])

    const d3mInfo: D3MInfo = {
      D3MCurrentDebtUSD: bigNumberify(1500), // 150% of dai liquidity
    } as D3MInfo

    const result = aggregateStats(marketInfo, d3mInfo)

    expect(result.totalMarketSizeUSD.toString()).toBe('1500')
    expect(result.totalAvailableUSD.toString()).toBe('900')
    expect(result.totalBorrowsUSD.toString()).toBe('600')
    // When D3M debt is higher than DAI liquidity, all available DAI should be considered as D3M
    // So totalValueLockedUSD should be total available minus all available DAI (600)
    expect(result.totalValueLockedUSD?.toString()).toBe('300')
  })

  test('calculates stats correctly when DAI reserve totalLiquidity is 0', () => {
    const daiReserve = getMockReserve({
      ...daiLikeReserve,
      totalLiquidity: NormalizedUnitNumber(0),
      totalLiquidityUSD: NormalizedUnitNumber(0),
      totalDebtUSD: NormalizedUnitNumber(0),
    })
    const wethReserve = getMockReserve({
      ...wethLikeReserve,
      totalLiquidityUSD: NormalizedUnitNumber(500),
      totalDebtUSD: NormalizedUnitNumber(200),
    })
    const marketInfo = getMockMarketInfo([daiReserve, wethReserve])

    const result = aggregateStats(marketInfo, undefined)

    expect(result.totalMarketSizeUSD.toString()).toBe('500')
    expect(result.totalAvailableUSD.toString()).toBe('300')
    expect(result.totalBorrowsUSD.toString()).toBe('200')
    expect(result.totalValueLockedUSD?.toString()).toBe('300')
  })

  test('calculates stats correctly when market has all zero values', () => {
    const daiReserve = getMockReserve({
      ...daiLikeReserve,
      totalLiquidity: NormalizedUnitNumber(0),
      totalLiquidityUSD: NormalizedUnitNumber(0),
      totalDebtUSD: NormalizedUnitNumber(0),
    })
    const wethReserve = getMockReserve({
      ...wethLikeReserve,
      totalLiquidity: NormalizedUnitNumber(0),
      totalLiquidityUSD: NormalizedUnitNumber(0),
      totalDebtUSD: NormalizedUnitNumber(0),
    })
    const marketInfo = getMockMarketInfo([daiReserve, wethReserve])

    const result = aggregateStats(marketInfo, undefined)

    expect(result.totalMarketSizeUSD.toString()).toBe('0')
    expect(result.totalAvailableUSD.toString()).toBe('0')
    expect(result.totalBorrowsUSD.toString()).toBe('0')
    expect(result.totalValueLockedUSD?.toString()).toBe('0')
  })
})
