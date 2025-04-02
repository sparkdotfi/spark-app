import BigNumber from 'bignumber.js'

import { trimCharEnd } from '@/utils/strings'

import { NormalizedUnitNumber, Percentage } from '@sparkdotfi/common-universal'
import { bigNumberify } from '@sparkdotfi/common-universal'

export interface FormatPercentageOptions {
  skipSign?: boolean
  minimumFractionDigits?: number
}
export function formatPercentage(
  percentage: Percentage | undefined,
  { skipSign, minimumFractionDigits = 2 }: FormatPercentageOptions = {},
): string {
  if (percentage === undefined) {
    return '—'
  }

  if (percentage.gt(0) && percentage.lt(0.0001)) {
    return skipSign ? '<0.01' : '<0.01%'
  }

  const percentageFormatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits,
  })

  const value = percentage.times(100).toNumber()
  return `${percentageFormatter.format(value)}${skipSign ? '' : '%'}`
}

const healthFactorFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
})
export function formatHealthFactor(healthFactor: BigNumber | undefined): string {
  if (healthFactor === undefined) {
    return '0.0'
  }
  if (!healthFactor.isFinite()) {
    return String.fromCharCode(0x221e)
  }

  return healthFactorFormatter.format(bigNumberify(healthFactor).toNumber())
}

export function formFormat(value: NormalizedUnitNumber, precision = 2): string {
  const roundedValue = value.toFixed(precision, BigNumber.ROUND_DOWN)

  // avoid trailing zeroes
  // @note: we can't use a Intl.formatter here because it doesn't support rounding modes :/
  return trimCharEnd(trimCharEnd(roundedValue, '0'), '.')
}

export function findSignificantPrecision(
  _unitPriceUsd: NormalizedUnitNumber,
  desiredPrecisionOfUsd = 2, // 0.01 = cents
): number {
  const unitPriceUsd = Number(_unitPriceUsd)
  return Math.max(Math.floor(Math.log10(unitPriceUsd)) + desiredPrecisionOfUsd, 0)
}
