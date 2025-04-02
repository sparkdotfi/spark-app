import BigNumber from 'bignumber.js'

import { NativeAssetInfo } from '@/config/chain/types'
import { AaveData, RawAaveUserReserve } from '@/domain/market-info/aave-data-layer/query'
import {
  MarketInfo,
  Reserve,
  UserConfiguration,
  UserPosition,
  UserPositionSummary,
} from '@/domain/market-info/marketInfo'
import { getCompoundedScaledBalance, getScaledBalance } from '@/domain/market-info/math'
import { mergeUserPositionIntoRawUserReserve, recalculateUserSummary } from '@/domain/market-info/utils'
import { bigNumberify } from '@sparkdotfi/common-universal'

import { CheckedAddress } from '@sparkdotfi/common-universal'
import { NormalizedNumber } from '@sparkdotfi/common-universal'
import { ReserveWithValue } from '../common/types'

export interface ReserveWithUseAsCollateralFlag {
  reserve: Reserve
  useAsCollateral: boolean
}

export interface UpdatePositionSummaryParams {
  borrows?: ReserveWithValue[]
  deposits?: ReserveWithValue[]
  withdrawals?: ReserveWithValue[]
  repays?: ReserveWithValue[]
  reservesWithUseAsCollateralFlag?: ReserveWithUseAsCollateralFlag[]
  aaveData: AaveData
  marketInfo: MarketInfo
  eModeCategoryId?: number
  nativeAssetInfo: NativeAssetInfo
}

export function updatePositionSummary({
  borrows = [],
  deposits = [],
  withdrawals = [],
  repays = [],
  reservesWithUseAsCollateralFlag = [],
  marketInfo,
  aaveData,
  eModeCategoryId,
  nativeAssetInfo,
}: UpdatePositionSummaryParams): UserPositionSummary {
  const timestamp = marketInfo.timestamp

  const mapperCommonArgs = {
    timestamp,
    nativeAssetInfo,
    userPositionSummary: marketInfo.userPositionSummary,
    userConfiguration: marketInfo.userConfiguration,
  }
  const newUserPositions = marketInfo.userPositions
    .map(getUserPositionMapper({ affectedReserves: deposits, type: 'deposit', ...mapperCommonArgs }))
    .map(getUserPositionMapper({ affectedReserves: withdrawals, type: 'withdraw', ...mapperCommonArgs }))
    .map(getUserPositionMapper({ affectedReserves: borrows, type: 'borrow', ...mapperCommonArgs }))
    .map(getUserPositionMapper({ affectedReserves: repays, type: 'repay', ...mapperCommonArgs }))

  const newRawUserReserves = mergeUserPositionIntoRawUserReserve(newUserPositions, aaveData.rawUserReserves).map(
    (r, index) =>
      tweakUseAsCollateral({
        rawUserReserve: aaveData.rawUserReserves[index]!,
        updatedRawUserReserve: r,
        reservesWithUseAsCollateralFlag,
        deposits,
        withdrawals,
        nativeAssetInfo,
      }),
  )

  const currentEModeCategoryId = marketInfo.userConfiguration.eModeState.enabled
    ? marketInfo.userConfiguration.eModeState.category.id
    : 0

  const userSummary = recalculateUserSummary({
    currentTimestamp: timestamp,
    formattedReserves: aaveData.formattedReserves,
    rawUserReserves: newRawUserReserves,
    baseCurrency: aaveData.baseCurrency,
    eModeCategoryId: eModeCategoryId ?? currentEModeCategoryId,
  })

  return userSummary
}

interface GetUserPositionMapperArgs {
  timestamp: number
  affectedReserves: ReserveWithValue[]
  nativeAssetInfo: NativeAssetInfo
  userPositionSummary: UserPositionSummary
  userConfiguration: UserConfiguration
  type: 'deposit' | 'withdraw' | 'borrow' | 'repay'
}
function getUserPositionMapper({
  timestamp,
  affectedReserves,
  nativeAssetInfo,
  userPositionSummary,
  userConfiguration,
  type,
}: GetUserPositionMapperArgs) {
  return (userPosition: UserPosition): UserPosition => {
    const value = getValueForUserPosition(userPosition, affectedReserves, nativeAssetInfo)
    if (!value) {
      return userPosition
    }

    if (type === 'deposit' || type === 'withdraw') {
      return tweakDepositPosition(timestamp, type, value, userPosition, userPositionSummary, userConfiguration)
    }

    return tweakBorrowPosition(timestamp, type, value, userPosition)
  }
}

function getValueForUserPosition(
  userPosition: UserPosition,
  reserves: ReserveWithValue[],
  nativeAssetInfo: NativeAssetInfo,
): NormalizedNumber | undefined {
  if (userPosition.reserve.token.symbol === nativeAssetInfo.wrappedNativeAssetSymbol) {
    const nativeAssetValue = reserves.find((d) => d.reserve.token.symbol === nativeAssetInfo.nativeAssetSymbol)?.value
    if (nativeAssetValue) {
      return nativeAssetValue
    }
  }

  return reserves.find((r) => r.reserve.token.symbol === userPosition.reserve.token.symbol)?.value
}

function findReserveWithValue<T extends { reserve: Reserve }>(
  rawUserReserve: RawAaveUserReserve,
  reserves: T[],
  nativeAssetInfo: NativeAssetInfo,
): T | undefined {
  return reserves.find((r) => {
    if (r.reserve.token.symbol === nativeAssetInfo.nativeAssetSymbol) {
      return nativeAssetInfo.wrappedNativeAssetAddress === CheckedAddress(rawUserReserve.underlyingAsset)
    }

    return r.reserve.token.address === CheckedAddress(rawUserReserve.underlyingAsset)
  })
}

function tweakDepositPosition(
  timestamp: number,
  type: 'deposit' | 'withdraw',
  value: NormalizedNumber,
  userPosition: UserPosition,
  userPositionSummary: UserPositionSummary,
  userConfiguration: UserConfiguration,
): UserPosition {
  if (value.eq(0)) {
    return userPosition
  }
  const reserve = userPosition.reserve

  if (type === 'deposit') {
    const isFirstDeposit = userPosition.scaledATokenBalance.eq(0)
    if (isFirstDeposit && !validateAutomaticUseAsCollateral({ reserve, userPositionSummary, userConfiguration })) {
      // If reserve should not be automatically used as collateral,
      //  the scaledATokenBalance will be 0.
      return userPosition
    }
  }

  const updatedBalance = getScaledBalance({
    balance: reserve.token.toBaseUnit(value),
    index: reserve.liquidityIndex,
    rate: reserve.liquidityRate,
    lastUpdateTimestamp: reserve.lastUpdateTimestamp,
    timestamp,
  }).times(type === 'withdraw' ? -1 : 1)

  return {
    ...userPosition,
    scaledATokenBalance: BigNumber.max(userPosition.scaledATokenBalance.plus(updatedBalance), 0),
  }
}

function tweakBorrowPosition(
  timestamp: number,
  type: 'borrow' | 'repay',
  value: NormalizedNumber,
  userPosition: UserPosition,
): UserPosition {
  if (value.eq(0)) {
    return userPosition
  }
  const reserve = userPosition.reserve

  const updatedBalance = getCompoundedScaledBalance({
    balance: reserve.token.toBaseUnit(value),
    index: reserve.variableBorrowIndex,
    rate: reserve.variableBorrowRate,
    lastUpdateTimestamp: reserve.lastUpdateTimestamp,
    timestamp,
  }).times(type === 'repay' ? -1 : 1)

  return {
    ...userPosition,
    scaledVariableDebt: BigNumber.max(userPosition.scaledVariableDebt.plus(updatedBalance), 0),
  }
}

export interface TweakUseAsCollateralParams {
  rawUserReserve: RawAaveUserReserve
  updatedRawUserReserve: RawAaveUserReserve
  reservesWithUseAsCollateralFlag: ReserveWithUseAsCollateralFlag[]
  deposits: ReserveWithValue[]
  withdrawals: ReserveWithValue[]
  nativeAssetInfo: NativeAssetInfo
}
function tweakUseAsCollateral({
  rawUserReserve,
  updatedRawUserReserve,
  reservesWithUseAsCollateralFlag,
  deposits,
  withdrawals,
  nativeAssetInfo,
}: TweakUseAsCollateralParams): RawAaveUserReserve {
  const reserve = findReserveWithValue(rawUserReserve, reservesWithUseAsCollateralFlag, nativeAssetInfo)
  if (reserve) {
    return {
      ...updatedRawUserReserve,
      usageAsCollateralEnabledOnUser: reserve.useAsCollateral,
    }
  }

  const withdrawnReserve = findReserveWithValue(rawUserReserve, withdrawals, nativeAssetInfo)
  if (
    withdrawnReserve &&
    bigNumberify(updatedRawUserReserve.scaledATokenBalance).eq(0) &&
    bigNumberify(rawUserReserve.scaledATokenBalance).gt(0)
  ) {
    return {
      ...updatedRawUserReserve,
      usageAsCollateralEnabledOnUser: false,
    }
  }

  const depositedReserve = findReserveWithValue(rawUserReserve, deposits, nativeAssetInfo)
  if (
    depositedReserve &&
    bigNumberify(updatedRawUserReserve.scaledATokenBalance).gt(0) &&
    bigNumberify(rawUserReserve.scaledATokenBalance).eq(0)
  ) {
    return {
      ...updatedRawUserReserve,
      usageAsCollateralEnabledOnUser: true,
    }
  }

  return updatedRawUserReserve
}

interface ValidateAutomaticUseAsCollateralParams {
  reserve: Reserve
  userPositionSummary: UserPositionSummary
  userConfiguration: UserConfiguration
}
function validateAutomaticUseAsCollateral({
  reserve,
  userPositionSummary,
  userConfiguration,
}: ValidateAutomaticUseAsCollateralParams): boolean {
  if (reserve.maxLtv.isZero()) {
    return false
  }

  // nothing is used as collateral
  if (userPositionSummary.totalCollateralUSD.isZero()) {
    return true
  }

  return !userConfiguration.isolationModeState.enabled && reserve.debtCeiling.isZero()
}
