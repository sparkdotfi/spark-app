import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'

interface AdjustTokenRewardParams {
  airdropTimestampInMs: number
  currentTimestampInMs: number
  tokenRatePerSecond: NormalizedUnitNumber
  tokenReward: NormalizedUnitNumber
}

export function adjustTokenReward({
  airdropTimestampInMs,
  currentTimestampInMs,
  tokenRatePerSecond,
  tokenReward,
}: AdjustTokenRewardParams): NormalizedUnitNumber {
  const timeElapsedInMs = currentTimestampInMs > airdropTimestampInMs ? currentTimestampInMs - airdropTimestampInMs : 0
  const tokensAccumulatedSinceSnapshot = tokenRatePerSecond.multipliedBy(timeElapsedInMs / 1000)
  return NormalizedUnitNumber(tokenReward.plus(tokensAccumulatedSinceSnapshot))
}
