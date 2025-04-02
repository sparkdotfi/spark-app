import { TokenWithBalance } from '@/domain/common/types'
import { SavingsConverter } from '@/domain/savings-converters/types'
import { NormalizedNumber } from '@sparkdotfi/common-universal'

const DEFAULT_PRECISION = 6
export const STEP_IN_MS = 50

export interface MakeSavingsOverviewParams {
  savingsTokenWithBalance: TokenWithBalance
  savingsConverter: SavingsConverter
  timestampInMs: number
}
export interface SavingsOverview {
  depositedAssets: NormalizedNumber
  depositedAssetsPrecision: number
}

export function makeSavingsOverview({
  savingsTokenWithBalance,
  savingsConverter,
  timestampInMs,
}: MakeSavingsOverviewParams): SavingsOverview {
  const [assets, precision] = convertSharesToAssetsWithPrecision({
    shares: savingsTokenWithBalance.balance,
    savingsConverter,
    timestampInMs,
  })

  return {
    depositedAssets: assets,
    depositedAssetsPrecision: precision,
  }
}

interface ConvertSharesToAssetsWithPrecisionParams {
  shares: NormalizedNumber
  savingsConverter: SavingsConverter
  timestampInMs: number
}
function convertSharesToAssetsWithPrecision({
  shares,
  savingsConverter,
  timestampInMs,
}: ConvertSharesToAssetsWithPrecisionParams): [NormalizedNumber, number] {
  if (!savingsConverter.supportsRealTimeInterestAccrual) {
    return [savingsConverter.convertToAssets({ shares }), DEFAULT_PRECISION]
  }

  const current = interpolateSharesToAssets({ shares, savingsConverter, timestampInMs })
  const next = interpolateSharesToAssets({ shares, savingsConverter, timestampInMs: timestampInMs + STEP_IN_MS })

  const precision = calculatePrecision({ current, next })

  return [current, precision]
}

interface InterpolateSharesToAssetsParams {
  shares: NormalizedNumber
  savingsConverter: SavingsConverter
  timestampInMs: number
}

function interpolateSharesToAssets({
  shares,
  savingsConverter,
  timestampInMs,
}: InterpolateSharesToAssetsParams): NormalizedNumber {
  const timestamp = Math.floor(timestampInMs / 1000)

  const now = savingsConverter.predictAssetsAmount({ timestamp, shares })
  const inASecond = savingsConverter.predictAssetsAmount({ timestamp: timestamp + 1, shares })

  const linearApproximation = NormalizedNumber(now.plus(inASecond.minus(now).times((timestampInMs % 1000) / 1000)))
  return linearApproximation
}

interface CalculatePrecisionParams {
  current: NormalizedNumber
  next: NormalizedNumber
}
function calculatePrecision({ current, next }: CalculatePrecisionParams): number {
  const diff = next.minus(current)
  if (diff.lt(1e-12)) {
    return 12
  }

  return Math.max(-Math.floor(Math.log10(diff.toNumber())), 0)
}
