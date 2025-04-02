import { MyEarningsQueryOptions } from '@/config/chain/types'
import { SimplifiedQueryResult } from '@/domain/common/query'
import { SavingsConverter } from '@/domain/savings-converters/types'
import { Timeframe } from '@/ui/charts/defaults'
import { CheckedAddress, NormalizedNumber } from '@sparkdotfi/common-universal'
import { skipToken, useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useChainId } from 'wagmi'
import { MY_EARNINGS_TIMEFRAMES, MyEarningsTimeframe } from './common'
import { getFilteredEarningsWithPredictions } from './getFilteredEarningsWithPredictions'
import { MyEarningsInfoItem } from './types'

export interface UseMyEarningsInfoParams {
  address?: CheckedAddress
  currentTimestamp: number
  staleTime: number
  savingsConverter: SavingsConverter | null
  savingsTokenBalance: NormalizedNumber | undefined
  myEarningsQueryOptions: MyEarningsQueryOptions | undefined
}

export type MyEarningsInfo =
  | {
      data: MyEarningsInfoItem[]
      predictions: MyEarningsInfoItem[]
    }
  | undefined

export interface UseMyEarningsInfoResult {
  queryResult: SimplifiedQueryResult<MyEarningsInfo>
  shouldDisplayMyEarnings: boolean
  selectedTimeframe: MyEarningsTimeframe
  setSelectedTimeframe: (timeframe: Timeframe) => void
  availableTimeframes: MyEarningsTimeframe[]
}

export function useMyEarningsInfo({
  address,
  currentTimestamp,
  staleTime,
  savingsConverter,
  savingsTokenBalance,
  myEarningsQueryOptions,
}: UseMyEarningsInfoParams): UseMyEarningsInfoResult {
  const [selectedTimeframe, setSelectedTimeframe] = useState<MyEarningsTimeframe>('All')
  const chainId = useChainId()

  const queryResult = useQuery({
    ...(myEarningsQueryOptions && address
      ? myEarningsQueryOptions(address, chainId)
      : { queryKey: ['unsupported-my-earnings-query'], queryFn: skipToken }),
    staleTime,
  })

  const dataWithPredictions = useMemo(() => {
    if (!queryResult.data) {
      return undefined
    }

    return getFilteredEarningsWithPredictions({
      currentTimestamp,
      timeframe: selectedTimeframe,
      myEarningsInfo: queryResult.data,
      savingsConverter,
      savingsTokenBalance,
    })
  }, [queryResult.data, selectedTimeframe, currentTimestamp, savingsConverter, savingsTokenBalance])

  const queryResultWithPredictions = useMemo(
    () =>
      ({
        ...queryResult,
        data: dataWithPredictions,
      }) as SimplifiedQueryResult<MyEarningsInfo>,
    [queryResult, dataWithPredictions],
  )

  const hasHistoricalData = (queryResultWithPredictions.data?.data?.length ?? 0) > 0
  const hasSavingTokenBalance = savingsTokenBalance?.gt(0) ?? false

  return {
    queryResult: queryResultWithPredictions,
    shouldDisplayMyEarnings: Boolean(myEarningsQueryOptions && address && (hasHistoricalData || hasSavingTokenBalance)),
    selectedTimeframe,
    setSelectedTimeframe: (selectedTimeframe) => {
      if (MY_EARNINGS_TIMEFRAMES.includes(selectedTimeframe)) {
        setSelectedTimeframe(selectedTimeframe as any)
      }
    },
    availableTimeframes: MY_EARNINGS_TIMEFRAMES,
  }
}
