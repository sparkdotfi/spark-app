import { NormalizedNumber } from '@sparkdotfi/common-universal'
import { TopbarAirdropDropdown } from './TopbarAirdropDropdown'
import { TopbarDynamicAirdrop } from './TopbarDynamicAirdrop'

export interface Airdrop {
  tokenReward: NormalizedNumber
  tokenRatePerSecond: NormalizedNumber
  timestampInMs: number
  tokenRatePrecision: number
  refreshIntervalInMs: number
}

export interface TopbarAirdropProps {
  airdrop: Airdrop | undefined
  isLoading: boolean
  isError: boolean
}

export function TopbarAirdrop({ airdrop, isLoading, isError }: TopbarAirdropProps) {
  if (isError) {
    return null
  }

  if (isLoading) {
    return <TopbarAirdropDropdown isLoading />
  }

  if (!airdrop) {
    return <TopbarAirdropDropdown />
  }

  return <TopbarDynamicAirdrop airdrop={airdrop} />
}
