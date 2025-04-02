import { getEndpointsConfig, updateEndpoints } from '@/features/dialogs/sandbox/logic/setupSpkStaking'
import { getWorker } from '@/features/dialogs/sandbox/logic/worker'
import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'
import { useEffect, useRef } from 'react'
import { useChainId } from 'wagmi'

interface UseStakedAmountWatcherProps {
  amountStaked: NormalizedUnitNumber
}

export function useStakedAmountWatcher({ amountStaked }: UseStakedAmountWatcherProps): void {
  const previousAmountRef = useRef(NormalizedUnitNumber(0))
  const timeoutRef = useRef<NodeJS.Timeout>()
  const chainId = useChainId()

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    const msw = getWorker()

    if (!msw) {
      return
    }
    const previousAmount = previousAmountRef.current

    if (!previousAmount.eq(amountStaked)) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        const endpointsConfig = getEndpointsConfig()
        const previousPendingAmount = NormalizedUnitNumber(endpointsConfig.walletData.pending_amount_normalized)
        const previousPendingAmountRate = NormalizedUnitNumber(endpointsConfig.walletData.pending_amount_rate)
        const previousTimestamp = endpointsConfig.walletData.timestamp
        const currentTimestamp = Math.ceil(Date.now() / 1000)

        const pendingAmount = previousPendingAmount.plus(
          previousPendingAmountRate.times(currentTimestamp - previousTimestamp),
        )

        const rate = amountStaked.times(0.00000001)

        updateEndpoints(msw, {
          walletData: {
            amount_staked: amountStaked.toString(),
            pending_amount_normalized: pendingAmount.toString(),
            pending_amount_rate: rate.toString(),
            timestamp: currentTimestamp,
          },
        })
      }, 10000)
    }

    previousAmountRef.current = amountStaked
  }, [amountStaked, chainId])
}
