import { NormalizedNumber } from '@sparkdotfi/common-universal'

export interface ExtendAirdropResponseParams {
  tokenRatePerSecond: NormalizedNumber
  refreshIntervalInMs: number
}

export function getTokenRatePrecision({
  tokenRatePerSecond,
  refreshIntervalInMs,
}: ExtendAirdropResponseParams): number {
  const ratePerRefreshInterval = tokenRatePerSecond.div(1000 / refreshIntervalInMs)
  if (ratePerRefreshInterval.isZero()) {
    return 0
  }
  const mostSignificantDigitPosition = Math.min(Math.floor(Math.log10(ratePerRefreshInterval.toNumber())), 18)
  return mostSignificantDigitPosition < 0 ? Math.abs(mostSignificantDigitPosition) : 0
}
