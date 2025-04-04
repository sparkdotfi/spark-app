import { SavingsConverter } from '@/domain/savings-converters/types'
import { filterDataByTimeframe } from '@/ui/charts/utils'
import { NormalizedNumber, assertNever } from '@sparkdotfi/common-universal'
import { calculatePredictions } from './calculatePredictions'
import { MyEarningsTimeframe } from './common'
import { MyEarningsInfoItem } from './types'

interface GetFilteredEarningsWithPredictionsParams {
  currentTimestamp: number
  timeframe: MyEarningsTimeframe
  myEarningsInfo: MyEarningsInfoItem[]
  savingsConverter: SavingsConverter | null
  savingsTokenBalance: NormalizedNumber | undefined
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function getFilteredEarningsWithPredictions({
  currentTimestamp,
  timeframe,
  myEarningsInfo,
  savingsConverter,
  savingsTokenBalance,
}: GetFilteredEarningsWithPredictionsParams) {
  if (!savingsConverter || !savingsTokenBalance) {
    return {
      data: [],
      predictions: [],
    }
  }

  const todaysItem = {
    date: new Date(currentTimestamp * 1000),
    balance: savingsConverter.convertToAssets({ shares: savingsTokenBalance }),
  }

  if (myEarningsInfo.length === 0 && todaysItem.balance.lte(0)) {
    return {
      data: [],
      predictions: [],
    }
  }

  const filteredData = filterDataByTimeframe({
    data: myEarningsInfo,
    timeframe,
    currentTimestamp,
  })

  // @note we remove the last item which is the todays current balance and create our own to avoid delayed values
  filteredData.pop()

  const predictionsLength = Math.ceil(
    (() => {
      switch (timeframe) {
        case '1M':
          return 30 * 0.5
        case '1Y':
          return 365 * 0.5
        case '3Y':
          return 365 * 1.5
        case 'All':
          return 365 * 3
        default:
          assertNever(timeframe)
      }
    })(),
  )

  const calculatedPredictions = calculatePredictions({
    savingsConverter,
    timestamp: Math.floor(getEndOfDayTimestamp(todaysItem.date) / 1000),
    shares: savingsTokenBalance,
    days: predictionsLength,
  })

  filteredData.push(todaysItem)
  // @note todaysItems shows the current balance so we put it into predictions to preserve the chart line continuity
  const predictions = [todaysItem, ...calculatedPredictions]

  return {
    data: filteredData,
    predictions,
  }
}

function getEndOfDayTimestamp(date: Date): number {
  const endOfDayUTC = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 9999)
  return endOfDayUTC
}
