import { D3MInfo } from '@/domain/d3m-info/types'
import { MarketInfo } from '@/domain/market-info/marketInfo'
import { NormalizedNumber, Percentage } from '@sparkdotfi/common-universal'

export interface MarketStats {
  totalMarketSizeUSD: NormalizedNumber
  totalValueLockedUSD: NormalizedNumber | undefined
  totalAvailableUSD: NormalizedNumber
  totalBorrowsUSD: NormalizedNumber
}

export function aggregateStats(marketInfo: MarketInfo, D3MInfo: D3MInfo | undefined): MarketStats {
  const aggregatedValues = marketInfo.reserves.reduce(
    (acc, reserve) => {
      acc.totalDebtUSD = acc.totalDebtUSD.plus(reserve.totalDebtUSD)
      acc.totalLiquidityUSD = acc.totalLiquidityUSD.plus(reserve.totalLiquidityUSD)
      return acc
    },
    {
      totalLiquidityUSD: NormalizedNumber.ZERO,
      totalDebtUSD: NormalizedNumber.ZERO,
    },
  )
  const totalAvailableUSD = aggregatedValues.totalLiquidityUSD.minus(aggregatedValues.totalDebtUSD)
  const daiReserve = marketInfo.findReserveByToken(marketInfo.DAI)
  const daiAvailable = daiReserve ? daiReserve.totalLiquidityUSD.minus(daiReserve.totalDebtUSD) : NormalizedNumber.ZERO

  // @note: D3M current debt data comes from different smart contract.
  // Theoretically, there might be a situation, that for one block, D3M debt is higher than
  // what market info for dai reserve total liquidity is reported.
  // In this case, we cap the D3M proportion in DAI supply at 100%.
  const D3MProportionInDaiSupply =
    daiReserve?.totalLiquidity.gt(0) && D3MInfo
      ? Percentage(NormalizedNumber.min(D3MInfo.D3MCurrentDebtUSD.div(daiReserve.totalLiquidity), NormalizedNumber(1)))
      : Percentage(0)

  // Here we assume D3M's share of available DAI is proportional to its share in total supply.
  const totalValueLockedUSD = totalAvailableUSD.minus(
    NormalizedNumber(D3MProportionInDaiSupply.times(daiAvailable.toBigNumber())),
  )

  return {
    totalMarketSizeUSD: aggregatedValues.totalLiquidityUSD,
    totalValueLockedUSD,
    totalAvailableUSD,
    totalBorrowsUSD: aggregatedValues.totalDebtUSD,
  }
}
