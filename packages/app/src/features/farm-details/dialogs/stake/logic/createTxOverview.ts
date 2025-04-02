import { Farm } from '@/domain/farms/types'
import { Token } from '@/domain/types/Token'
import { TransferFromUserFormNormalizedData } from '@/features/dialogs/common/logic/transfer-from-user/form'
import { TxOverviewRouteItem } from '@/features/dialogs/common/types'
import { NormalizedUnitNumber, Percentage } from '@sparkdotfi/common-universal'

const SECONDS_PER_YEAR = 60 * 60 * 24 * 365

export interface CreateTxOverviewParams {
  formValues: TransferFromUserFormNormalizedData
  farm: Farm
}

export type TxOverview = { showEstimatedRewards: boolean } & (
  | { status: 'no-overview' }
  | {
      status: 'success'
      apy: Percentage
      stakingToken: Token
      rewardToken: Token
      rewardsPerYear: NormalizedUnitNumber
      routeToStakingToken: TxOverviewRouteItem[]
    }
)

export function createTxOverview({ formValues, farm }: CreateTxOverviewParams): TxOverview {
  const value = formValues.value
  const showEstimatedRewards = farm.rewardType !== 'points'
  if (value.eq(0)) {
    return { status: 'no-overview', showEstimatedRewards }
  }

  const routeToStakingToken: TxOverviewRouteItem[] = createRouteToStakingToken({
    formValues,
    stakingToken: farm.stakingToken,
  })

  const stakedAmountUsd = formValues.token.toUSD(formValues.value)
  const rewardsPerYear = stakedAmountUsd
    .times(farm.rewardRate)
    .div(farm.totalSupply.plus(formValues.value))
    .times(SECONDS_PER_YEAR)
  const rewardsPerYearUsd = farm.rewardToken.toUSD(rewardsPerYear)
  const apy = stakedAmountUsd.gt(0)
    ? Percentage(rewardsPerYearUsd.div(stakedAmountUsd), { allowMoreThan1: true })
    : Percentage(0)

  return {
    status: 'success',
    showEstimatedRewards,
    apy,
    stakingToken: farm.stakingToken,
    rewardToken: farm.rewardToken,
    rewardsPerYear,
    routeToStakingToken,
  }
}

export interface CreateRouteToStakingTokenParams {
  formValues: TransferFromUserFormNormalizedData
  stakingToken: Token
}
function createRouteToStakingToken({
  formValues,
  stakingToken,
}: CreateRouteToStakingTokenParams): TxOverviewRouteItem[] {
  const entryTokenUsdValue = formValues.token.toUSD(formValues.value)
  const stakingTokenAmount = entryTokenUsdValue.div(stakingToken.unitPriceUsd)
  return [
    ...(stakingToken.symbol !== formValues.token.symbol
      ? [
          {
            token: formValues.token,
            usdValue: entryTokenUsdValue,
            value: formValues.value,
          },
        ]
      : []),
    {
      token: stakingToken,
      usdValue: entryTokenUsdValue,
      value: stakingTokenAmount,
    },
  ]
}
