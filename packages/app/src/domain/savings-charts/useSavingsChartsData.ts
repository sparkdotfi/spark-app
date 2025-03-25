import { MyEarningsQueryOptions, SavingsRateQueryOptions } from '@/config/chain/types'
import { useTimestamp } from '@/utils/useTimestamp'
import { CheckedAddress, NormalizedUnitNumber } from '@sparkdotfi/common-universal'
import { useAccount, useChainId } from 'wagmi'
import { SavingsConverter } from '../savings-converters/types'
import { UseMyEarningsInfoResult, useMyEarningsInfo } from './useMyEarningsInfo/useMyEarningsInfo'
import { UseSavingsRateInfoResult, useSavingsRateInfo } from './useSavingsRateInfo/useSavingsRateInfo'

export type UseSavingsChartsDataResult = {
  myEarningsInfo: UseMyEarningsInfoResult
  savingsRateInfo: UseSavingsRateInfoResult
  chartsSupported: boolean
}

const REFRESH_INTERVAL_IN_MS = 60 * 60 * 1_000 // 1 hour

interface UseSavingsChartsDataParams {
  savingsConverter: SavingsConverter | null
  savingsTokenBalance: NormalizedUnitNumber | undefined
  myEarningsQueryOptions: MyEarningsQueryOptions | undefined
  savingsRateQueryOptions: SavingsRateQueryOptions | undefined
}

export function useSavingsChartsData({
  savingsConverter,
  savingsTokenBalance,
  myEarningsQueryOptions,
  savingsRateQueryOptions,
}: UseSavingsChartsDataParams): UseSavingsChartsDataResult {
  const chainId = useChainId()

  const { address } = useAccount()
  const { timestamp } = useTimestamp({ refreshIntervalInMs: REFRESH_INTERVAL_IN_MS })

  const myEarningsInfo = useMyEarningsInfo({
    address: address ? CheckedAddress(address) : undefined,
    currentTimestamp: timestamp,
    staleTime: REFRESH_INTERVAL_IN_MS,
    savingsConverter,
    savingsTokenBalance,
    myEarningsQueryOptions,
  })

  const savingsRateInfo = useSavingsRateInfo({
    chainId,
    currentTimestamp: timestamp,
    staleTime: REFRESH_INTERVAL_IN_MS,
    savingsRateQueryOptions,
  })

  return {
    myEarningsInfo,
    savingsRateInfo,
    chartsSupported: !!savingsRateQueryOptions || !!myEarningsQueryOptions,
  }
}
