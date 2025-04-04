import { NormalizedNumber } from '@sparkdotfi/common-universal'
import { adjustTokenReward } from './adjustTokenReward'

describe(adjustTokenReward.name, () => {
  it('should adjust the value when airdrop timestamp is smaller than current timestamp', () => {
    const baseParams = {
      airdropTimestampInMs: 1000,
      tokenRatePerSecond: NormalizedNumber(1),
      tokenReward: NormalizedNumber(1),
    }

    expect(adjustTokenReward({ ...baseParams, currentTimestampInMs: 1100 })).toEqual(NormalizedNumber(1.1))
    expect(adjustTokenReward({ ...baseParams, currentTimestampInMs: 2000 })).toEqual(NormalizedNumber(2))
    expect(adjustTokenReward({ ...baseParams, currentTimestampInMs: 1500 })).toEqual(NormalizedNumber(1.5))
    expect(adjustTokenReward({ ...baseParams, currentTimestampInMs: 20_000 })).toEqual(NormalizedNumber(20))
    expect(adjustTokenReward({ ...baseParams, currentTimestampInMs: 120_000 })).toEqual(NormalizedNumber(120))
  })

  it('should leave token reward same when airdrop and current timestamps are the same', () => {
    const params = {
      airdropTimestampInMs: 1000,
      currentTimestampInMs: 1000,
      tokenRatePerSecond: NormalizedNumber(1),
      tokenReward: NormalizedNumber(1),
    }

    expect(adjustTokenReward(params)).toEqual(NormalizedNumber(1))
  })
})
