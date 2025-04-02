import { TokenWithValue } from '@/domain/common/types'
import { useConditionalFreeze } from '@/domain/hooks/useConditionalFreeze'
import { LiquidationDetails, getLiquidationDetails } from '@/domain/market-info/getLiquidationDetails'
import { MarketInfo } from '@/domain/market-info/marketInfo'
import { NormalizedNumber, Percentage } from '@sparkdotfi/common-universal'

export interface UseLiquidationDetailsArgs {
  marketInfo: MarketInfo
  tokensToDeposit: TokenWithValue[]
  tokensToBorrow: TokenWithValue[]
  liquidationThreshold: Percentage
  freeze: boolean
}
export function useLiquidationDetails({
  marketInfo,
  tokensToDeposit,
  tokensToBorrow,
  liquidationThreshold,
  freeze,
}: UseLiquidationDetailsArgs): LiquidationDetails | undefined {
  const currentCollaterals = marketInfo.userPositions
    .filter((position) => position.collateralBalance.gt(0))
    .filter((position) => position.reserve.usageAsCollateralEnabledOnUser)
    .map((position) => ({ token: position.reserve.token, value: position.collateralBalance }))
  const currentBorrows = marketInfo.userPositions
    .filter((position) => position.borrowBalance.gt(0))
    .map((position) => ({ token: position.reserve.token, value: position.borrowBalance }))

  const collaterals = mergeTokensWithValues(currentCollaterals, tokensToDeposit)
  const borrows = mergeTokensWithValues(currentBorrows, tokensToBorrow)

  return useConditionalFreeze(getLiquidationDetails({ collaterals, borrows, marketInfo, liquidationThreshold }), freeze)
}

function mergeTokensWithValues(first: TokenWithValue[], second: TokenWithValue[]): TokenWithValue[] {
  const result: TokenWithValue[] = []
  for (const token of first) {
    const counterpart = second.find((t) => t.token.symbol === token.token.symbol)
    if (counterpart) {
      result.push({ token: token.token, value: NormalizedNumber(token.value.plus(counterpart.value)) })
    } else {
      result.push(token)
    }
  }
  for (const token of second) {
    if (!first.some((t) => t.token.symbol === token.token.symbol)) {
      result.push(token)
    }
  }
  return result
}
