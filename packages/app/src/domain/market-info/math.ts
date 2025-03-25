import { calculateCompoundedInterest, calculateLinearInterest, rayDiv, rayMul } from '@aave/math-utils'
import BigNumber from 'bignumber.js'

import { NumberLike, bigNumberify } from '@sparkdotfi/common-universal'

import { BaseUnitNumber, Percentage } from '@sparkdotfi/common-universal'

interface GetScaledBalanceArgs {
  rate: BigNumber
  index: BigNumber
  timestamp: number
  lastUpdateTimestamp: number
  balance: BaseUnitNumber
}

export function getScaledBalance({
  balance,
  index,
  rate,
  lastUpdateTimestamp,
  timestamp,
}: GetScaledBalanceArgs): BaseUnitNumber {
  const updatedIndex = rayMul(
    calculateLinearInterest({
      currentTimestamp: timestamp,
      lastUpdateTimestamp,
      rate,
    }),
    index,
  )
  return BaseUnitNumber(rayDiv(balance, updatedIndex))
}
export function getCompoundedScaledBalance({
  balance,
  index,
  rate,
  lastUpdateTimestamp,
  timestamp,
}: GetScaledBalanceArgs): BaseUnitNumber {
  const updatedIndex = rayMul(
    calculateCompoundedInterest({
      currentTimestamp: timestamp,
      lastUpdateTimestamp,
      rate,
    }),
    index,
  )
  return BaseUnitNumber(rayDiv(balance, updatedIndex))
}

export function getCompoundedBalance({
  balance,
  index,
  rate,
  lastUpdateTimestamp,
  timestamp,
}: GetScaledBalanceArgs): BaseUnitNumber {
  const updatedIndex = rayMul(
    calculateCompoundedInterest({
      currentTimestamp: timestamp,
      lastUpdateTimestamp,
      rate,
    }),
    index,
  )
  return BaseUnitNumber(rayMul(balance, updatedIndex))
}

export function healthFactorToLtv(healthFactor: BigNumber, liquidationThreshold: Percentage): Percentage {
  return Percentage(bigNumberify(1).div(healthFactor).times(liquidationThreshold))
}

export function parseRawPercentage(
  value: NumberLike,
  { allowMoreThan1 }: { allowMoreThan1?: boolean } = { allowMoreThan1: true },
): Percentage {
  return Percentage(bigNumberify(value).div(10_000), { allowMoreThan1 })
}
