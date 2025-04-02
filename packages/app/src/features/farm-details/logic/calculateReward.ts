import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'

export interface calculateRewardParams {
  earned: NormalizedUnitNumber
  staked: NormalizedUnitNumber
  rewardRate: NormalizedUnitNumber
  earnedTimestamp: number
  periodFinish: number
  timestampInMs: number
  totalSupply: NormalizedUnitNumber
}

export function calculateReward({
  earned,
  staked,
  rewardRate,
  earnedTimestamp,
  periodFinish,
  timestampInMs,
  totalSupply,
}: calculateRewardParams): NormalizedUnitNumber {
  if (totalSupply.isZero()) {
    return earned
  }

  const periodFinishInMs = periodFinish * 1000
  const earnedTimestampInMs = earnedTimestamp * 1000

  const timeDiff = ((timestampInMs > periodFinishInMs ? periodFinishInMs : timestampInMs) - earnedTimestampInMs) / 1000

  const accruedEarned = staked
    .times(rewardRate)
    .times(NormalizedUnitNumber.max(NormalizedUnitNumber(timeDiff), NormalizedUnitNumber.zero))
    .div(totalSupply)
  return earned.plus(accruedEarned)
}
