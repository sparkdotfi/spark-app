import { getChainConfigEntry } from '@/config/chain'
import { getAirdropsData } from '@/config/chain/utils/airdrops'
import { paths } from '@/config/paths'
import { sortByUsdValue } from '@/domain/common/sorters'
import { MarketInfo, Reserve } from '@/domain/market-info/marketInfo'
import { RowClickOptions } from '@/ui/molecules/data-table/DataTable'
import { Transformer, TransformerResult, applyTransformers } from '@/utils/applyTransformers'
import { raise } from '@sparkdotfi/common-universal'
import { generatePath } from 'react-router-dom'
import { MarketEntry } from '../types'
import { SparkRewardsByReserve } from './useSparkRewardsByReserve'

export interface MarketEntryRowData extends MarketEntry {
  rowClickOptions: RowClickOptions
}

type MarketEntryTransformer = Transformer<
  [number, Reserve, Reserve[], SparkRewardsByReserve],
  TransformerResult<MarketEntryRowData>
>

function getTransformers(): MarketEntryTransformer[] {
  return [skipInactiveReserves, renameReserve, makeMarketEntry]
}

export function transformReserves(marketInfo: MarketInfo, sparkRewardsByReserve: SparkRewardsByReserve): MarketEntry[] {
  const transformers = getTransformers()
  return marketInfo.reserves
    .map((r) => {
      return applyTransformers(marketInfo.chainId, r, marketInfo.reserves, sparkRewardsByReserve)(transformers)
    })
    .filter((r): r is MarketEntryRowData => r !== null)
    .sort((a, b) => -sortByUsdValue(a, b, 'totalSupplied')) // this is needed for mobile view where we don't have sorting functions
}

function skipInactiveReserves(
  _: number,
  reserve: Reserve,
  _reserves: Reserve[],
  _sparkRewardsByReserve: SparkRewardsByReserve,
): undefined | null {
  if (reserve.status === 'not-active') return null

  return undefined
}

function renameReserve(
  chainId: number,
  reserve: Reserve,
  _reserves: Reserve[],
  sparkRewardsByReserve: SparkRewardsByReserve,
): MarketEntryRowData | undefined {
  const { tokenSymbolToReplacedName } =
    getChainConfigEntry(chainId).markets ?? raise('Markets config is not defined on this chain')
  if (Object.keys(tokenSymbolToReplacedName).includes(reserve.token.symbol)) {
    return makeMarketEntry(
      chainId,
      {
        ...reserve,
        token: reserve.token.clone({
          symbol: tokenSymbolToReplacedName[reserve.token.symbol]!.symbol,
          name: tokenSymbolToReplacedName[reserve.token.symbol]!.name,
        }),
      },
      _reserves,
      sparkRewardsByReserve,
    )
  }
}

export function makeMarketEntry(
  chainId: number,
  reserve: Reserve,
  _reserves: Reserve[],
  sparkRewardsByReserve: SparkRewardsByReserve,
): MarketEntryRowData {
  const airdrops = getAirdropsData(chainId, reserve.token.symbol)
  const sparkRewards = sparkRewardsByReserve[reserve.token.address]

  return {
    token: reserve.token,
    reserveStatus: reserve.status,
    totalSupplied: reserve.totalLiquidity,
    depositApyDetails: {
      baseApy: reserve.supplyAPY,
      legacyRewards: reserve.incentives.deposit,
      sparkRewards: sparkRewards?.supply,
      airdrops: airdrops.deposit,
    },
    totalBorrowed: reserve.totalDebt,
    borrowApyDetails: {
      baseApy: reserve.variableBorrowApy,
      legacyRewards: reserve.incentives.borrow,
      sparkRewards: sparkRewards?.borrow,
      airdrops: airdrops.borrow,
    },
    marketStatus: {
      supplyAvailabilityStatus: reserve.supplyAvailabilityStatus,
      collateralEligibilityStatus: reserve.collateralEligibilityStatus,
      borrowEligibilityStatus: reserve.borrowEligibilityStatus,
    },
    rowClickOptions: {
      destination: generatePath(paths.marketDetails, { asset: reserve.token.address, chainId: chainId.toString() }),
    },
  }
}
