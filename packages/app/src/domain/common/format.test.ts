import { describe } from 'vitest'

import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'

import { Percentage } from '@sparkdotfi/common-universal'
import BigNumber from 'bignumber.js'
import { findSignificantPrecision, formFormat, formatHealthFactor, formatPercentage } from './format'

describe(formatPercentage.name, () => {
  it('formats whole numbers', () => {
    const tests: [number, string][] = [
      [0, '0.00%'],
      [1, '100.00%'],
      [2, '200.00%'],
      [123_45, '1,234,500.00%'],
      [999_999, '99,999,900.00%'],
    ]

    // biome-ignore lint/complexity/noForEach: <explanation>
    tests.forEach(([value, expected]) => {
      expect(formatPercentage(Percentage(value, { allowMoreThan1: true }))).toEqual(expected)
    })
  })

  it('formats numbers with fractional part', () => {
    const tests: [number, string][] = [
      [0.1, '10.00%'],
      [0.2, '20.00%'],
      [0.5, '50.00%'],
      [0.01, '1.00%'],
      [0.001, '0.10%'],
      [0.0001, '0.01%'],
      [0.123, '12.30%'],
      [0.1234, '12.34%'],
      [0.12345, '12.35%'],
      [0.123456, '12.35%'],
      [0.999, '99.90%'],
      [0.9999, '99.99%'],
      [0.99999, '100.00%'],
    ]

    // biome-ignore lint/complexity/noForEach: <explanation>
    tests.forEach(([value, expected]) => {
      expect(formatPercentage(Percentage(value, { allowMoreThan1: true }))).toEqual(expected)
    })
  })

  it('formats small numbers', () => {
    const tests: [number, string][] = [
      [0.0001, '0.01%'],
      [0.00001, '<0.01%'],
      [0.00002, '<0.01%'],
      [0.000001, '<0.01%'],
      [0.00009999999, '<0.01%'],
    ]

    // biome-ignore lint/complexity/noForEach: <explanation>
    tests.forEach(([value, expected]) => {
      expect(formatPercentage(Percentage(value, { allowMoreThan1: true }))).toEqual(expected)
    })
  })
})

describe(formatHealthFactor.name, () => {
  it('handles undefined', () => {
    expect(formatHealthFactor(undefined)).toEqual('0.0')
  })

  it('formats whole numbers', () => {
    const tests: [number, string][] = [
      [0, '0'],
      [1, '1'],
      [2, '2'],
      [40, '40'],
      [999, '999'],
    ]

    // biome-ignore lint/complexity/noForEach: <explanation>
    tests.forEach(([value, expected]) => {
      expect(formatHealthFactor(BigNumber(value))).toEqual(expected)
    })
  })

  it('formats numbers with fractional part', () => {
    const tests: [number, string][] = [
      [0.1, '0.1'],
      [0.2, '0.2'],
      [1.123, '1.12'],
      [2.125, '2.13'],
      [3.12345, '3.12'],
      [9.999, '10'],
      [9.99, '9.99'],
    ]

    // biome-ignore lint/complexity/noForEach: <explanation>
    tests.forEach(([value, expected]) => {
      expect(formatHealthFactor(BigNumber(value))).toEqual(expected)
    })
  })
})

describe(formFormat.name, () => {
  it('formats bigger numbers', () => {
    expect(formFormat(NormalizedUnitNumber(100.2), 18)).toBe('100.2')
  })

  it('avoids unnecessary zeroes', () => {
    expect(formFormat(NormalizedUnitNumber(0), 10)).toBe('0')
    expect(formFormat(NormalizedUnitNumber(1), 10)).toBe('1')
  })

  it('rounds down', () => {
    expect(formFormat(NormalizedUnitNumber(0.9999), 2)).toBe('0.99')
  })
})

describe(findSignificantPrecision.name, () => {
  it('finds precision for stablecoins', () => {
    expect(findSignificantPrecision(NormalizedUnitNumber(1), 2)).toBe(2)
  })

  it('finds precision for BTC like', () => {
    expect(findSignificantPrecision(NormalizedUnitNumber(48_000), 2)).toBe(6)
  })

  it('finds precision for ETH like', () => {
    expect(findSignificantPrecision(NormalizedUnitNumber(2_500), 2)).toBe(5)
  })

  it('finds precision for coins with tiny prices', () => {
    expect(findSignificantPrecision(NormalizedUnitNumber(0.0001), 2)).toBe(0)
  })

  it('finds precision for BTC like and whole dollars', () => {
    expect(findSignificantPrecision(NormalizedUnitNumber(48_000), 0)).toBe(4)
  })
})
