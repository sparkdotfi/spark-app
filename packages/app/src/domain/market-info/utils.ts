import { formatUserSummary } from '@aave/math-utils'
import { assert, CheckedAddress } from '@sparkdotfi/common-universal'
import { NormalizedNumber, Percentage } from '@sparkdotfi/common-universal'
import { bigNumberify } from '@sparkdotfi/common-universal'
import { AaveBaseCurrency, AaveFormattedReserve, AaveUserSummary, RawAaveUserReserve } from './aave-data-layer/query'
import type {
  IsolatedBorrowingState,
  Reserve,
  SiloBorrowingState,
  UserPosition,
  UserPositionSummary,
} from './marketInfo'

interface RecalculateUserSummaryArgs {
  currentTimestamp: number
  formattedReserves: AaveFormattedReserve[]
  rawUserReserves: RawAaveUserReserve[]
  baseCurrency: AaveBaseCurrency
  eModeCategoryId: number
}

export function recalculateUserSummary({
  currentTimestamp,
  formattedReserves,
  rawUserReserves,
  eModeCategoryId,
  baseCurrency,
}: RecalculateUserSummaryArgs): UserPositionSummary {
  const aaveFormattedUserSummary = formatUserSummary({
    currentTimestamp,
    marketReferencePriceInUsd: baseCurrency.marketReferenceCurrencyPriceInUsd,
    marketReferenceCurrencyDecimals: baseCurrency.marketReferenceCurrencyDecimals,
    userReserves: rawUserReserves,
    formattedReserves,
    userEmodeCategoryId: eModeCategoryId,
  })

  return normalizeUserSummary(aaveFormattedUserSummary)
}

export function normalizeUserSummary(formattedUserSummary: AaveUserSummary): UserPositionSummary {
  const loanToValue =
    formattedUserSummary.totalCollateralMarketReferenceCurrency === '0'
      ? bigNumberify(0)
      : bigNumberify(formattedUserSummary.totalBorrowsMarketReferenceCurrency).div(
          formattedUserSummary.totalCollateralMarketReferenceCurrency,
        )
  const rawHealthFactor = bigNumberify(formattedUserSummary.healthFactor)
  const healthFactor = rawHealthFactor.eq(-1) ? undefined : rawHealthFactor

  return {
    loanToValue: Percentage(loanToValue, { allowMoreThan1: true }),
    healthFactor,
    maxLoanToValue: Percentage(formattedUserSummary.currentLoanToValue),
    availableBorrowsUSD: NormalizedNumber(formattedUserSummary.availableBorrowsUSD),
    totalBorrowsUSD: NormalizedNumber(formattedUserSummary.totalBorrowsUSD),
    currentLiquidationThreshold: Percentage(formattedUserSummary.currentLiquidationThreshold, { allowMoreThan1: true }),
    totalCollateralUSD: NormalizedNumber(formattedUserSummary.totalCollateralUSD),
    totalLiquidityUSD: NormalizedNumber(formattedUserSummary.totalLiquidityUSD),
  }
}

export function mergeUserPositionIntoRawUserReserve(
  userPositions: UserPosition[],
  rawUserReserves: RawAaveUserReserve[],
): RawAaveUserReserve[] {
  return rawUserReserves.map((r) => {
    const userPosition = userPositions.find((up) => up.reserve.token.address === r.underlyingAsset)
    if (!userPosition) {
      return r
    }

    return {
      ...r,
      scaledATokenBalance: userPosition.scaledATokenBalance.toString(),
      scaledVariableDebt: userPosition.scaledVariableDebt.toString(),
    }
  })
}

export function determineSiloBorrowingState(userPositions: UserPosition[]): SiloBorrowingState {
  const siloedUserReserves = userPositions.filter((pos) => pos.borrowBalance.gt(0) && pos.reserve.isSiloedBorrowing)

  assert(siloedUserReserves.length <= 1, 'There should be at most one siloed reserve per user')

  if (siloedUserReserves.length === 0) {
    return { enabled: false }
  }
  return {
    enabled: true,
    siloedBorrowingReserve: siloedUserReserves[0]!.reserve,
  }
}

export function determineIsolationModeState(userSummary: AaveUserSummary, reserves: Reserve[]): IsolatedBorrowingState {
  if (!userSummary.isInIsolationMode) {
    return { enabled: false }
  }
  assert(userSummary.isolatedReserve, 'Isolated borrowing reserve should be defined')
  const isolatedBorrowingReserve = reserves.find(
    (r) => r.token.address === CheckedAddress(userSummary.isolatedReserve?.underlyingAsset!),
  )
  assert(isolatedBorrowingReserve, 'Isolated borrowing reserve should be found in reserves')

  return {
    enabled: true,
    isolatedBorrowingReserve,
  }
}
