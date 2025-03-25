import { useTimestamp } from '@/utils/useTimestamp'
import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'
import { Airdrop } from '../../components/topbar-airdrop/TopbarAirdrop'
import { adjustTokenReward } from './utils/adjustTokenReward'

export function useGrowingAirdropAmount(airdrop: Airdrop, enabled: boolean): NormalizedUnitNumber {
  const { timestampInMs } = useTimestamp({
    refreshIntervalInMs: enabled && airdrop.tokenRatePerSecond.gt(0) ? airdrop.refreshIntervalInMs : undefined,
  })

  return adjustTokenReward({
    airdropTimestampInMs: airdrop.timestampInMs,
    currentTimestampInMs: timestampInMs,
    tokenRatePerSecond: airdrop.tokenRatePerSecond,
    tokenReward: airdrop.tokenReward,
  })
}
