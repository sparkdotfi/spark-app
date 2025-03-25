import { D3MInfo } from '@/domain/d3m-info/types'
import { MarketInfo } from '@/domain/market-info/marketInfo'
import { bigNumberify } from '@sparkdotfi/common-universal'
import { NormalizedUnitNumber, Percentage } from '@sparkdotfi/common-universal'
import BigNumber from 'bignumber.js'

export interface MarketStats {
  totalMarketSizeUSD: NormalizedUnitNumber
  totalValueLockedUSD: NormalizedUnitNumber | undefined
  totalAvailableUSD: NormalizedUnitNumber
  totalBorrowsUSD: NormalizedUnitNumber
}

export function aggregateStats(marketInfo: MarketInfo, D3MInfo: D3MInfo | undefined): MarketStats {
  const aggregatedValues = marketInfo.reserves.reduce(
    (acc, reserve) => {
      acc.totalDebtUSD = acc.totalDebtUSD.plus(reserve.totalDebtUSD)
      acc.totalLiquidityUSD = acc.totalLiquidityUSD.plus(reserve.totalLiquidityUSD)
      return acc
    },
    {
      totalLiquidityUSD: bigNumberify(0),
      totalDebtUSD: bigNumberify(0),
    },
  )
  const totalAvailableUSD = aggregatedValues.totalLiquidityUSD.minus(aggregatedValues.totalDebtUSD)
  const daiReserve = marketInfo.findReserveByToken(marketInfo.DAI)
  const daiAvailable = daiReserve
    ? NormalizedUnitNumber(daiReserve.totalLiquidityUSD.minus(daiReserve.totalDebtUSD))
    : NormalizedUnitNumber(0)

  // @note: D3M current debt data comes from different smart contract.
  // Theoretically, there might be a situation, that for one block, D3M debt is higher than
  // what market info for dai reserve total liquidity is reported.
  // In this case, we cap the D3M proportion in DAI supply at 100%.
  const D3MProportionInDaiSupply =
    daiReserve?.totalLiquidity.gt(0) && D3MInfo
      ? Percentage(BigNumber.minimum(D3MInfo.D3MCurrentDebtUSD.div(daiReserve.totalLiquidity), 1))
      : Percentage(0)

  // Here we assume D3M's share of available DAI is proportional to its share in total supply.
  const totalValueLockedUSD = NormalizedUnitNumber(
    totalAvailableUSD.minus(D3MProportionInDaiSupply.multipliedBy(daiAvailable)),
  )

  return {
    totalMarketSizeUSD: NormalizedUnitNumber(aggregatedValues.totalLiquidityUSD),
    totalValueLockedUSD,
    totalAvailableUSD: NormalizedUnitNumber(totalAvailableUSD),
    totalBorrowsUSD: NormalizedUnitNumber(aggregatedValues.totalDebtUSD),
  }
}
