import { trackUserAddress } from '@/domain/analytics/mixpanel'
import { CheckedAddress } from '@sparkdotfi/common-universal'
import { useEffect } from 'react'
import { useAccount } from 'wagmi'

export function useTrackAccount(): void {
  const { address } = useAccount()
  useEffect(() => {
    if (address) {
      trackUserAddress(CheckedAddress(address))
    }
  }, [address])
}
