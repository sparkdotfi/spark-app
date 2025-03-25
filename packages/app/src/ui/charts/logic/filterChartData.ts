import { assertNever } from '@sparkdotfi/common-universal'
import { sort } from 'd3-array'
import { Timeframe } from '../defaults'

interface BaseChartData {
  date: Date
}

export interface FilterChartDataParams<T extends BaseChartData> {
  data: T[]
  timeframe: Timeframe
  timestamp: number
  timestampInMs: number
}

export function filterChartData<T extends BaseChartData>({
  data,
  timeframe,
  timestamp,
  timestampInMs,
}: FilterChartDataParams<T>): T[] {
  const sortedData = sort(data, (a, b) => a.date.getTime() - b.date.getTime())
  const filteredData = filterDataByTimeframe({
    data: sortedData,
    timeframe,
    timestamp,
  })

  if (filteredData.length > 0) {
    filteredData.push({
      ...filteredData.at(-1)!,
      date: new Date(timestampInMs),
    })
  }

  return filteredData
}

interface FilterDataByTimeframeParams<T extends BaseChartData> {
  data: T[]
  timeframe: Timeframe
  timestamp: number
}

export function filterDataByTimeframe<T extends BaseChartData>({
  data,
  timeframe,
  timestamp,
}: FilterDataByTimeframeParams<T>): T[] {
  const now = new Date(timestamp * 1000)

  switch (timeframe) {
    case '7D': {
      const sevenDaysAgo = new Date(now)
      sevenDaysAgo.setDate(now.getDate() - 7)
      return data.filter((d) => new Date(d.date) >= sevenDaysAgo)
    }

    case '1M': {
      const oneMonthAgo = new Date(now)
      oneMonthAgo.setMonth(now.getMonth() - 1)
      return data.filter((d) => new Date(d.date) >= oneMonthAgo)
    }

    case '3M': {
      const threeMonthAgo = new Date(now)
      threeMonthAgo.setMonth(now.getMonth() - 3)
      return data.filter((d) => new Date(d.date) >= threeMonthAgo)
    }

    case '1Y': {
      const oneYearAgo = new Date(now)
      oneYearAgo.setFullYear(now.getFullYear() - 1)
      return data.filter((d) => new Date(d.date) >= oneYearAgo)
    }

    case '3Y': {
      const threeYearsAgo = new Date(now)
      threeYearsAgo.setFullYear(now.getFullYear() - 3)
      return data.filter((d) => new Date(d.date) >= threeYearsAgo)
    }

    case 'All':
      return data

    default:
      assertNever(timeframe)
  }
}
