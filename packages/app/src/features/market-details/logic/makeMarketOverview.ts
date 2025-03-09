import { CapAutomatorInfo } from '@/domain/cap-automator/types'
import { MarketInfo, Reserve } from '@/domain/market-info/marketInfo'
import { MarketSparkRewards } from '@/domain/spark-rewards/types'
import { NormalizedUnitNumber } from '@marsfoundation/common-universal'
import { MarketOverview } from '../types'
import { getReserveEModeCategoryTokens } from './getReserveEModeCategoryTokens'
import { getSparkAirdropDetails } from './getSparkAirdropDetails'

export interface MakeMarketOverviewParams {
  marketInfo: MarketInfo
  reserve: Reserve
  capAutomatorInfo: CapAutomatorInfo
  sparkRewards: MarketSparkRewards[]
}

export function makeMarketOverview({
  reserve,
  marketInfo,
  capAutomatorInfo,
  sparkRewards,
}: MakeMarketOverviewParams): MarketOverview {
  const eModeCategoryId = reserve.eModeCategory?.id
  const eModeCategoryTokens = getReserveEModeCategoryTokens(marketInfo, reserve)
  const { hasAirdropForBorrowing, hasAirdropForSupplying } = getSparkAirdropDetails({
    marketInfo,
    token: reserve.token.symbol,
  })
  const capLessThanLiquidity = Boolean(reserve.borrowCap?.lt(reserve.totalLiquidity))
  const borrowLiquidity = NormalizedUnitNumber(
    capLessThanLiquidity ? reserve.borrowCap!.minus(reserve.totalDebt) : reserve.availableLiquidity,
  )

  const supplySparkRewards = sparkRewards.filter((reward) => reward.action === 'supply')
  const borrowSparkRewards = sparkRewards.filter((reward) => reward.action === 'borrow')

  return {
    supply: {
      hasSparkAirdrop: hasAirdropForSupplying,
      status: reserve.supplyAvailabilityStatus,
      totalSupplied: reserve.totalLiquidity,
      supplyCap: reserve.supplyCap,
      apy: reserve.supplyAPY,
      capAutomatorInfo: capAutomatorInfo.supplyCap,
      sparkRewards: supplySparkRewards,
    },
    collateral: {
      status: reserve.collateralEligibilityStatus,
      token: reserve.token,
      maxLtv: reserve.maxLtv,
      liquidationThreshold: reserve.liquidationThreshold,
      liquidationPenalty: reserve.liquidationBonus,
      isolationModeInfo: { debt: reserve.isolationModeTotalDebt, debtCeiling: reserve.debtCeiling },
    },
    borrow: {
      hasSparkAirdrop: hasAirdropForBorrowing,
      status: reserve.borrowEligibilityStatus,
      totalBorrowed: reserve.totalDebt,
      borrowLiquidity,
      borrowCap: reserve.borrowCap,
      limitedByBorrowCap: capLessThanLiquidity,
      apy: reserve.variableBorrowApy,
      reserveFactor: reserve.reserveFactor,
      chartProps: {
        utilizationRate: reserve.utilizationRate,
        optimalUtilizationRate: reserve.optimalUtilizationRate,
        variableRateSlope1: reserve.variableRateSlope1,
        variableRateSlope2: reserve.variableRateSlope2,
        baseVariableBorrowRate: reserve.baseVariableBorrowRate,
      },
      capAutomatorInfo: capAutomatorInfo.borrowCap,
      sparkRewards: borrowSparkRewards,
    },
    summary: {
      type: 'default',
      marketSize: reserve.totalLiquidity,
      utilizationRate: reserve.utilizationRate,
      borrowed: reserve.totalDebt,
      available: reserve.availableLiquidity,
    },
    ...(eModeCategoryId === 1 || eModeCategoryId === 2 || eModeCategoryId === 3
      ? {
          eMode: {
            maxLtv: reserve.eModeCategory!.ltv,
            liquidationThreshold: reserve.eModeCategory!.liquidationThreshold,
            liquidationPenalty: reserve.eModeCategory!.liquidationBonus,
            categoryId: eModeCategoryId,
            eModeCategoryTokens,
          },
        }
      : {}),
  }
}
