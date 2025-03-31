import BigNumber from 'bignumber.js'

import { assert, BaseUnitNumber, NormalizedUnitClass } from '../index.js'

// Only use scientific notation if number's exponent is greater than 1e9 (so 1e9 decimals of precision)
BigNumber.config({ EXPONENTIAL_AT: 1e9 })

export type NumberLike = string | number | BigNumber | bigint | NormalizedUnitClass

/**
 * Converts number-like value to BigNumber.
 *
 * @param value Number-like value used for a conversion (string | number | BigNumber | bigint)
 * @returns BigNumber representation of value
 * @throws If value argument cannot be converted to BigNumber
 */
export function bigNumberify(value: NumberLike): BigNumber {
  const result = new BigNumber(value.toString())
  assert(!result.isNaN(), `Value argument: ${value} cannot be converted to BigNumber.`)

  return result
}

/**
 * Parses number-like value to BigNumber.
 *
 * @param value Number-like value used for a conversion (string | number | BigNumber | bigint), empty string or undefined
 * @param [defaultValue] Default used in a case when a value cannot be converted to a BigNumber
 * @returns BigNumber representation of a value/defaultValue
 * @throws If value argument cannot be converted to a BigNumber and no default value is provided
 */
export function parseBigNumber(value: NumberLike | undefined, defaultValue?: number): BigNumber {
  assert(value !== undefined || defaultValue !== undefined, 'At least one argument must be defined.')

  const valueResult = BigNumber(value !== undefined ? value.toString() : Number.NaN)
  const defaultValueResult = BigNumber(defaultValue !== undefined ? defaultValue.toString() : Number.NaN)

  assert(!valueResult.isNaN() || !defaultValueResult.isNaN(), 'Value cannot be parsed to BigNumber.')

  return valueResult.isNaN() ? defaultValueResult : valueResult
}

export function toBigInt(value: BaseUnitNumber): bigint {
  return BigInt(value.toFixed())
}
