import { NormalizedNumber } from '@sparkdotfi/common-universal'

interface AdjustTokenRewardParams {
  airdropTimestampInMs: number
  currentTimestampInMs: number
  tokenRatePerSecond: NormalizedNumber
  tokenReward: NormalizedNumber
}

export function adjustTokenReward({
  airdropTimestampInMs,
  currentTimestampInMs,
  tokenRatePerSecond,
  tokenReward,
}: AdjustTokenRewardParams): NormalizedNumber {
  const timeElapsedInMs = currentTimestampInMs > airdropTimestampInMs ? currentTimestampInMs - airdropTimestampInMs : 0
  const tokensAccumulatedSinceSnapshot = tokenRatePerSecond.times(timeElapsedInMs / 1000)
  return tokenReward.plus(tokensAccumulatedSinceSnapshot)
}
