import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'
import BigNumber from 'bignumber.js'

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

  const accruedEarned = staked.multipliedBy(rewardRate).multipliedBy(BigNumber.max(timeDiff, 0)).dividedBy(totalSupply)
  const earnedInTotal = NormalizedUnitNumber(earned.plus(accruedEarned))

  return earnedInTotal
}
