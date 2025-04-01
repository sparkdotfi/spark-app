import { BigNumber } from 'bignumber.js'

import { TokenWithValue } from '@/domain/common/types'
import { MarketInfo, UserPosition } from '@/domain/market-info/marketInfo'
import { USD_MOCK_TOKEN } from '@/domain/types/Token'
import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'
import { times } from 'remeda'

import { PositionSummary } from './types'

type Ticks = (
  | {
      label: string
      x: number
    }
  | {
      x: number
      label?: undefined
    }
)[]

interface GetTicksArgs {
  numLabels: number
  ticksPerLabel: number
  totalCollateralUSD?: NormalizedUnitNumber
  xAxisFallbackMax?: NormalizedUnitNumber
}

export function getTicks({
  numLabels,
  ticksPerLabel,
  totalCollateralUSD = NormalizedUnitNumber(0),
  xAxisFallbackMax = NormalizedUnitNumber(90_000),
}: GetTicksArgs): Ticks {
  const maxTickValue = totalCollateralUSD.gt(0) ? totalCollateralUSD : xAxisFallbackMax

  const numTicks = (numLabels - 1) * ticksPerLabel + 1
  const ticks = times(numTicks, (i) => {
    const x = (i / (numTicks - 1)) * 100

    const label = USD_MOCK_TOKEN.format(NormalizedUnitNumber(maxTickValue.div(numTicks - 1).times(i)), {
      style: 'compact',
    })
    if (i % ticksPerLabel === 0) return { label, x }
    return { x }
  })
  return ticks
}

export function getPositionFormattedValue(value?: NormalizedUnitNumber, fallback = '-'): string {
  return !value || value.eq(0) ? fallback : USD_MOCK_TOKEN.formatUSD(value, { compact: true })
}

export interface MakePositionSummaryParams {
  marketInfo: MarketInfo
}

export function makePositionSummary({ marketInfo }: MakePositionSummaryParams): PositionSummary {
  const collaterals = getCollaterals(marketInfo.userPositions)
  const totalCollateralUSD = marketInfo.userPositionSummary.totalCollateralUSD
  const hasCollaterals = totalCollateralUSD.gt(0)
  const hasDeposits = marketInfo.userPositions.some((position) => position.collateralBalance.gt(0))

  const currentBorrow = marketInfo.userPositionSummary.totalBorrowsUSD
  const maxBorrow = NormalizedUnitNumber(
    marketInfo.userPositionSummary.totalBorrowsUSD.plus(marketInfo.userPositionSummary.availableBorrowsUSD),
  )
  const { borrowPercent, restPercent, maxPercent } = getBorrowPercents(currentBorrow, maxBorrow, totalCollateralUSD)

  return {
    healthFactor: marketInfo.userPositionSummary.healthFactor,
    collaterals,
    hasCollaterals,
    hasDeposits,
    totalCollateralUSD,
    borrow: {
      current: currentBorrow,
      max: maxBorrow,
      percents: {
        borrowed: borrowPercent,
        rest: restPercent,
        max: maxPercent,
      },
    },
  }
}

function getCollaterals(userPositions: UserPosition[]): TokenWithValue[] {
  return userPositions
    .filter((position) => position.reserve.usageAsCollateralEnabledOnUser)
    .map((position) => ({
      token: position.reserve.token,
      value: position.collateralBalance,
    }))
    .filter(({ value }) => value.gt(0))
    .sort((a, b) => b.token.toUSD(b.value).comparedTo(a.token.toUSD(a.value)))
}

interface BorrowPercents {
  borrowPercent: number
  maxPercent: number
  restPercent: number
}

function getBorrowPercents(
  currentBorrow: NormalizedUnitNumber,
  maxBorrow: NormalizedUnitNumber,
  totalCollateralUSD: NormalizedUnitNumber,
): BorrowPercents {
  let borrowPercent = currentBorrow.div(totalCollateralUSD).times(100).toNumber()
  let restPercent = new BigNumber(100).minus(borrowPercent).toNumber()
  const maxPercent = maxBorrow.div(totalCollateralUSD).times(100).toNumber()
  if (borrowPercent < 0.5) {
    borrowPercent = 0
    restPercent = 100
  }
  if (borrowPercent > 99.5) {
    borrowPercent = 100
    restPercent = 0
  }

  return { borrowPercent, maxPercent, restPercent }
}
