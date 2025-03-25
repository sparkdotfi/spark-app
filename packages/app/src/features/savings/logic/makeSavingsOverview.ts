import { TokenWithBalance } from '@/domain/common/types'
import { SavingsConverter } from '@/domain/savings-converters/types'
import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'

const DEFAULT_PRECISION = 6
export const STEP_IN_MS = 50

export interface MakeSavingsOverviewParams {
  savingsTokenWithBalance: TokenWithBalance
  savingsConverter: SavingsConverter
  timestampInMs: number
}
export interface SavingsOverview {
  depositedAssets: NormalizedUnitNumber
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
  shares: NormalizedUnitNumber
  savingsConverter: SavingsConverter
  timestampInMs: number
}
function convertSharesToAssetsWithPrecision({
  shares,
  savingsConverter,
  timestampInMs,
}: ConvertSharesToAssetsWithPrecisionParams): [NormalizedUnitNumber, number] {
  if (!savingsConverter.supportsRealTimeInterestAccrual) {
    return [savingsConverter.convertToAssets({ shares }), DEFAULT_PRECISION]
  }

  const current = interpolateSharesToAssets({ shares, savingsConverter, timestampInMs })
  const next = interpolateSharesToAssets({ shares, savingsConverter, timestampInMs: timestampInMs + STEP_IN_MS })

  const precision = calculatePrecision({ current, next })

  return [current, precision]
}

interface InterpolateSharesToAssetsParams {
  shares: NormalizedUnitNumber
  savingsConverter: SavingsConverter
  timestampInMs: number
}

function interpolateSharesToAssets({
  shares,
  savingsConverter,
  timestampInMs,
}: InterpolateSharesToAssetsParams): NormalizedUnitNumber {
  const timestamp = Math.floor(timestampInMs / 1000)

  const now = savingsConverter.predictAssetsAmount({ timestamp, shares })
  const inASecond = savingsConverter.predictAssetsAmount({ timestamp: timestamp + 1, shares })

  const linearApproximation = NormalizedUnitNumber(now.plus(inASecond.minus(now).times((timestampInMs % 1000) / 1000)))
  return linearApproximation
}

interface CalculatePrecisionParams {
  current: NormalizedUnitNumber
  next: NormalizedUnitNumber
}
function calculatePrecision({ current, next }: CalculatePrecisionParams): number {
  const diff = next.minus(current)
  if (diff.lt(1e-12)) {
    return 12
  }

  return Math.max(-Math.floor(Math.log10(diff.toNumber())), 0)
}
