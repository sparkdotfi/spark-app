import { rayDiv, rayMul, valueToBigNumber } from '@aave/math-utils'
import BigNumber from 'bignumber.js'

import { fromRay, toRay } from '@/utils/math'
import { Percentage, RAY } from '@sparkdotfi/common-universal'

import { GraphDataPoint } from '../types'

export interface InterestRateChartArgs {
  optimalUtilizationRate: Percentage
  variableRateSlope1: BigNumber
  variableRateSlope2: BigNumber
  baseVariableBorrowRate: BigNumber
}
export function getYields({
  optimalUtilizationRate,
  variableRateSlope1,
  variableRateSlope2,
  baseVariableBorrowRate,
}: InterestRateChartArgs): GraphDataPoint[] {
  const resolution = 200
  const step = 1 / resolution

  const optimalUtilizationRateRay = toRay(optimalUtilizationRate)
  const yields: GraphDataPoint[] = []

  for (let i = 0; i <= resolution; i++) {
    const utilization = i * step
    const utilizationRay = toRay(utilization)

    if (optimalUtilizationRate.gt(utilization)) {
      const rate = fromRay(
        baseVariableBorrowRate.plus(rayDiv(rayMul(variableRateSlope1, utilizationRay), optimalUtilizationRateRay)),
      ).toNumber()
      yields.push({
        x: utilization,
        y: rateToYield(rate),
      })
    } else {
      const excess = RAY().minus(optimalUtilizationRateRay).eq(0)
        ? valueToBigNumber(0)
        : rayDiv(utilizationRay.minus(optimalUtilizationRateRay), RAY().minus(optimalUtilizationRateRay))
      const rate = fromRay(
        baseVariableBorrowRate.plus(variableRateSlope1).plus(rayMul(variableRateSlope2, excess)),
      ).toNumber()
      yields.push({
        x: utilization,
        y: rateToYield(rate),
      })
    }
  }

  return yields
}

const SECONDS_PER_YEAR = 60 * 60 * 24 * 365

function rateToYield(rate: number): number {
  return (1 + rate / SECONDS_PER_YEAR) ** SECONDS_PER_YEAR - 1
}
