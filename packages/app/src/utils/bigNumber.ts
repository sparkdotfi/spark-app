import { NormalizedNumber } from '@sparkdotfi/common-universal'
import BigNumber from 'bignumber.js'

export function nonZeroOrDefault<T extends BigNumber>(value: T, defaultValue: T): T {
  return value.isZero() ? defaultValue : value
}

export function getWholePart(value: NormalizedNumber): string {
  const formatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })
  return formatter.format(value.integerValue(BigNumber.ROUND_DOWN).toNumber())
}

export function getFractionalPart(value: NormalizedNumber, precision: number): string {
  precision = Math.max(precision, 2)
  return value.minus(value.integerValue(BigNumber.ROUND_DOWN)).toFixed(precision).slice(1)
}
