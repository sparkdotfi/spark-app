import { Farm } from '@/domain/farms/types'
import { Token } from '@/domain/types/Token'
import { TransferFromUserFormNormalizedData } from '@/features/dialogs/common/logic/transfer-from-user/form'
import { TxOverviewRouteItem } from '@/features/dialogs/common/types'
import { NormalizedNumber } from '@sparkdotfi/common-universal'

export interface CreateTxOverviewParams {
  formValues: TransferFromUserFormNormalizedData
  farm: Farm
  isExiting: boolean
  earnedRewards: NormalizedNumber
}

export type TxOverview =
  | { status: 'no-overview' }
  | {
      status: 'success'
      stakingToken: Token
      rewardToken: Token
      earnedRewards: NormalizedNumber
      isExiting: boolean
      routeToOutcomeToken: TxOverviewRouteItem[]
    }

export function createTxOverview({ formValues, farm, isExiting, earnedRewards }: CreateTxOverviewParams): TxOverview {
  const value = formValues.value
  if (value.eq(0)) {
    return { status: 'no-overview' }
  }

  const routeToOutcomeToken: TxOverviewRouteItem[] = createRouteToOutcomeToken({
    formValues,
    stakingToken: farm.stakingToken,
  })

  return {
    status: 'success',
    stakingToken: farm.stakingToken,
    rewardToken: farm.rewardToken,
    earnedRewards,
    routeToOutcomeToken,
    isExiting,
  }
}

export interface CreateRouteToOutcomeTokenParams {
  formValues: TransferFromUserFormNormalizedData
  stakingToken: Token
}
function createRouteToOutcomeToken({
  formValues,
  stakingToken,
}: CreateRouteToOutcomeTokenParams): TxOverviewRouteItem[] {
  const outcomeTokenUsdValue = formValues.token.toUSD(formValues.value)
  const stakingTokenAmount = outcomeTokenUsdValue.div(stakingToken.unitPriceUsd)

  return [
    {
      token: stakingToken,
      usdValue: outcomeTokenUsdValue,
      value: stakingTokenAmount,
    },
    ...(stakingToken.symbol !== formValues.token.symbol
      ? [
          {
            token: formValues.token,
            usdValue: outcomeTokenUsdValue,
            value: formValues.value,
          },
        ]
      : []),
  ]
}
