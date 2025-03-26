import prettyMilliseconds from 'pretty-ms'
import { assert } from '../assert/assert.js'
import { NumberLike, bigNumberify } from '../math/bigNumber.js'
import { Opaque } from './Opaque.js'

/**
 * Represents a time span in seconds. i.e. 5.
 * Can be used to represent Unix timestamps. i.e. 1729691675
 */
export type UnixTime = Opaque<bigint, 'UnixTime'>
export function UnixTime(value: NumberLike): UnixTime {
  const valueAsBn = bigNumberify(value)
  assert(!valueAsBn.dp(), 'Value should not have decimal points in its representation.')
  const result = BigInt(valueAsBn.toFixed())

  assert(result >= 0, 'Value should be greater than or equal to 0.')
  assert(
    result <= YEAR_3000_TIMESTAMP,
    'Value should be less than or equal to 3000-01-01T00:00:00.000Z. Probably you passed milliseconds instead of seconds.',
  )

  return result as UnixTime
}

const ONE_MINUTE = 60

UnixTime.ONE_SECOND = (): UnixTime => {
  return UnixTime(1)
}

UnixTime.ONE_MINUTE = (): UnixTime => {
  return UnixTime(ONE_MINUTE)
}

UnixTime.FIFTEEN_MINUTES = (): UnixTime => {
  return UnixTime(15 * ONE_MINUTE)
}

UnixTime.ONE_HOUR = (): UnixTime => {
  return UnixTime(60 * ONE_MINUTE)
}

UnixTime.ONE_DAY = (): UnixTime => {
  return UnixTime(24 * 60 * ONE_MINUTE)
}

UnixTime.SEVEN_DAYS = (): UnixTime => {
  return UnixTime(7 * 24 * 60 * ONE_MINUTE)
}

UnixTime.THIRTY_DAYS = (): UnixTime => {
  return UnixTime(30 * 24 * 60 * ONE_MINUTE)
}

UnixTime.ONE_YEAR = (): UnixTime => {
  return UnixTime(365 * 24 * 60 * ONE_MINUTE)
}

UnixTime.fromDate = (date: Date): UnixTime => {
  return UnixTime(Math.floor(date.getTime() / 1000))
}

UnixTime.toDate = (unixTime: UnixTime): Date => {
  return new Date(Number(unixTime) * 1000)
}

UnixTime.toMilliseconds = (unixTime: UnixTime): number => {
  return Number(unixTime) * 1000
}

UnixTime.formatSpan = (span: UnixTime): string => {
  return prettyMilliseconds(UnixTime.toMilliseconds(span))
}

const YEAR_3000_TIMESTAMP = Math.floor(new Date('3000-01-01T00:00:00.000Z').getTime() / 1000)
