import { TokenWithBalance } from '@/domain/common/types'
import { NormalizedNumber } from '@sparkdotfi/common-universal'

export interface CalculateMaxBalanceTokenAndTotalParams {
  assets: TokenWithBalance[]
}

export interface CalculateMaxBalanceTokenAndTotalResult {
  maxBalanceToken: TokenWithBalance
  totalUSD: NormalizedNumber
}

export function calculateMaxBalanceTokenAndTotal({
  assets,
}: CalculateMaxBalanceTokenAndTotalParams): CalculateMaxBalanceTokenAndTotalResult {
  const totalUSD = NormalizedNumber(
    assets.reduce((acc, { token, balance }) => acc.plus(token.toUSD(balance)), NormalizedNumber.ZERO),
  )
  const maxBalanceToken = assets.reduce((acc, token) => (token.balance.gt(acc.balance) ? token : acc), assets[0]!)

  return { totalUSD, maxBalanceToken }
}
