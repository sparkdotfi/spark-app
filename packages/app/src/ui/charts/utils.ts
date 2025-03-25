import { USD_MOCK_TOKEN } from '@/domain/types/Token'
import { NormalizedUnitNumber, assertNever } from '@sparkdotfi/common-universal'
import { Timeframe } from './defaults'

export function formatTooltipDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0') // Months are zero-based
  const year = date.getFullYear()

  return `${day}.${month}.${year}`
}

export function formatPercentageTick(value: { valueOf(): number }): string {
  const tickFormatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  })

  return `${tickFormatter.format(value.valueOf() * 100)}%`
}

export function formatUSDTicks(value: { valueOf(): number }): string {
  return USD_MOCK_TOKEN.formatUSD(NormalizedUnitNumber(value.valueOf()), { compact: true })
}

interface FilterDataByTimeframeParams<Data extends { date: Date }> {
  data: Data[]
  timeframe: Timeframe
  currentTimestamp: number
}
export function filterDataByTimeframe<Data extends { date: Date }>({
  data,
  timeframe,
  currentTimestamp,
}: FilterDataByTimeframeParams<Data>): Data[] {
  const now = new Date(currentTimestamp * 1000)

  if (timeframe === 'All') {
    return data
  }

  const cutoff = (() => {
    switch (timeframe) {
      case '7D': {
        const sevenDaysAgo = new Date(now)
        sevenDaysAgo.setDate(now.getDate() - 7)
        return sevenDaysAgo
      }
      case '1M': {
        const oneMonthAgo = new Date(now)
        oneMonthAgo.setMonth(now.getMonth() - 1)
        return oneMonthAgo
      }
      case '3M': {
        const threeMonthsAgo = new Date(now)
        threeMonthsAgo.setMonth(now.getMonth() - 3)
        return threeMonthsAgo
      }
      case '1Y': {
        const oneYearAgo = new Date(now)
        oneYearAgo.setFullYear(now.getFullYear() - 1)
        return oneYearAgo
      }
      case '3Y': {
        const threeYearsAgo = new Date(now)
        threeYearsAgo.setFullYear(now.getFullYear() - 3)
        return threeYearsAgo
      }
      default:
        assertNever(timeframe)
    }
  })()

  const filteredData = data.filter((d) => new Date(d.date) >= cutoff)

  return filteredData
}

export function getVerticalDomainWithPadding(min: number, max: number): [number, number] {
  const delta = max - min

  if (delta === 0) {
    return [min * 0.9, max * 1.1]
  }

  return [Math.max(0, min - delta * 0.1), max + delta * 0.1]
}
