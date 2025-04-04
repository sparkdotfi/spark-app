import { NormalizedNumber } from '@sparkdotfi/common-universal'

export interface calculateRewardParams {
  earned: NormalizedNumber
  staked: NormalizedNumber
  rewardRate: NormalizedNumber
  earnedTimestamp: number
  periodFinish: number
  timestampInMs: number
  totalSupply: NormalizedNumber
}

export function calculateReward({
  earned,
  staked,
  rewardRate,
  earnedTimestamp,
  periodFinish,
  timestampInMs,
  totalSupply,
}: calculateRewardParams): NormalizedNumber {
  if (totalSupply.isZero()) {
    return earned
  }

  const periodFinishInMs = periodFinish * 1000
  const earnedTimestampInMs = earnedTimestamp * 1000

  const timeDiff = ((timestampInMs > periodFinishInMs ? periodFinishInMs : timestampInMs) - earnedTimestampInMs) / 1000

  const accruedEarned = staked
    .times(rewardRate)
    .times(NormalizedNumber.max(NormalizedNumber(timeDiff), NormalizedNumber.ZERO))
    .div(totalSupply)
  return earned.plus(accruedEarned)
}
