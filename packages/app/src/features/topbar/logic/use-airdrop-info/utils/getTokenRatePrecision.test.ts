import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'
import { getTokenRatePrecision } from './getTokenRatePrecision'

describe(getTokenRatePrecision.name, () => {
  it('should return correct precision for refresh interval 100ms', () => {
    const refreshIntervalInMs = 100
    expect(getTokenRatePrecision({ tokenRatePerSecond: NormalizedUnitNumber(2.34), refreshIntervalInMs })).toEqual(1)
    expect(getTokenRatePrecision({ tokenRatePerSecond: NormalizedUnitNumber(0.323), refreshIntervalInMs })).toEqual(2)
    expect(getTokenRatePrecision({ tokenRatePerSecond: NormalizedUnitNumber(0.0043), refreshIntervalInMs })).toEqual(4)
  })

  it('should return correct precision for refresh interval 1s', () => {
    const refreshIntervalInMs = 1000
    expect(getTokenRatePrecision({ tokenRatePerSecond: NormalizedUnitNumber(2.34), refreshIntervalInMs })).toEqual(0)
    expect(getTokenRatePrecision({ tokenRatePerSecond: NormalizedUnitNumber(0.323), refreshIntervalInMs })).toEqual(1)
    expect(getTokenRatePrecision({ tokenRatePerSecond: NormalizedUnitNumber(0.0043), refreshIntervalInMs })).toEqual(3)
  })

  it('should return correct precision for refresh interval 10s', () => {
    const refreshIntervalInMs = 1000 * 10
    expect(getTokenRatePrecision({ tokenRatePerSecond: NormalizedUnitNumber(2.34), refreshIntervalInMs })).toEqual(0)
    expect(getTokenRatePrecision({ tokenRatePerSecond: NormalizedUnitNumber(0.323), refreshIntervalInMs })).toEqual(0)
    expect(getTokenRatePrecision({ tokenRatePerSecond: NormalizedUnitNumber(0.0043), refreshIntervalInMs })).toEqual(2)
  })

  it('should return correct precision for very small number', () => {
    const refreshIntervalInMs = 1000
    expect(
      getTokenRatePrecision({ tokenRatePerSecond: NormalizedUnitNumber('2.8442E-14'), refreshIntervalInMs }),
    ).toEqual(14)
  })

  it('should return correct precision for zero rate', () => {
    const refreshIntervalInMs = 1000
    expect(getTokenRatePrecision({ tokenRatePerSecond: NormalizedUnitNumber('0'), refreshIntervalInMs })).toEqual(0)
  })

  it('should return correct precision for very large number', () => {
    const refreshIntervalInMs = 1000
    expect(
      getTokenRatePrecision({ tokenRatePerSecond: NormalizedUnitNumber('2.8442E+14'), refreshIntervalInMs }),
    ).toEqual(0)

    expect(
      getTokenRatePrecision({ tokenRatePerSecond: NormalizedUnitNumber('2.8442E+32'), refreshIntervalInMs }),
    ).toEqual(0)
  })
})
