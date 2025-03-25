import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'
import { adjustTokenReward } from './adjustTokenReward'

describe(adjustTokenReward.name, () => {
  it('should adjust the value when airdrop timestamp is smaller than current timestamp', () => {
    const baseParams = {
      airdropTimestampInMs: 1000,
      tokenRatePerSecond: NormalizedUnitNumber(1),
      tokenReward: NormalizedUnitNumber(1),
    }

    expect(adjustTokenReward({ ...baseParams, currentTimestampInMs: 1100 })).toEqual(NormalizedUnitNumber(1.1))
    expect(adjustTokenReward({ ...baseParams, currentTimestampInMs: 2000 })).toEqual(NormalizedUnitNumber(2))
    expect(adjustTokenReward({ ...baseParams, currentTimestampInMs: 1500 })).toEqual(NormalizedUnitNumber(1.5))
    expect(adjustTokenReward({ ...baseParams, currentTimestampInMs: 20_000 })).toEqual(NormalizedUnitNumber(20))
    expect(adjustTokenReward({ ...baseParams, currentTimestampInMs: 120_000 })).toEqual(NormalizedUnitNumber(120))
  })

  it('should leave token reward same when airdrop and current timestamps are the same', () => {
    const params = {
      airdropTimestampInMs: 1000,
      currentTimestampInMs: 1000,
      tokenRatePerSecond: NormalizedUnitNumber(1),
      tokenReward: NormalizedUnitNumber(1),
    }

    expect(adjustTokenReward(params)).toEqual(NormalizedUnitNumber(1))
  })
})
