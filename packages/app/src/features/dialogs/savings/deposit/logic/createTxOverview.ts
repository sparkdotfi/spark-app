import { SavingsAccount } from '@/domain/savings-converters/types'
import { TransferFromUserFormNormalizedData } from '@/features/dialogs/common/logic/transfer-from-user/form'
import { TxOverviewRouteItem } from '@/features/dialogs/common/types'
import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'
import { SavingsDialogTxOverview } from '../../common/types'

export interface CreateTxOverviewParams {
  formValues: TransferFromUserFormNormalizedData
  savingsAccount: SavingsAccount
}
export function createTxOverview({ formValues, savingsAccount }: CreateTxOverviewParams): SavingsDialogTxOverview {
  // the value is normalized, so assuming 1 to 1 conversion rate for USDC
  // value denominated in DAI equals to value denominated in USDC
  const value = formValues.value
  if (value.eq(0)) {
    return { status: 'no-overview' }
  }

  const savingsTokenOutAmount = savingsAccount.converter.convertToShares({ assets: value })
  const stableEarnRate = NormalizedUnitNumber(value.multipliedBy(savingsAccount.converter.apy))

  const route: TxOverviewRouteItem[] = getDepositRoute({
    formValues,
    savingsAccount,
    savingsTokenOutAmount,
  })

  return {
    underlyingToken: savingsAccount.underlyingToken,
    status: 'success',
    APY: savingsAccount.converter.apy,
    stableEarnRate,
    route,
    skyBadgeToken: formValues.token,
    outTokenAmount: savingsTokenOutAmount,
  }
}

export interface GetDepositRouteParams {
  formValues: TransferFromUserFormNormalizedData
  savingsAccount: SavingsAccount
  savingsTokenOutAmount: NormalizedUnitNumber
}
function getDepositRoute({
  formValues,
  savingsAccount,
  savingsTokenOutAmount,
}: GetDepositRouteParams): TxOverviewRouteItem[] {
  const value = formValues.value
  const intermediary = savingsAccount.underlyingToken

  return [
    ...(intermediary.symbol !== formValues.token.symbol
      ? [
          {
            token: formValues.token,
            usdValue: value,
            value,
          },
        ]
      : []),
    {
      token: intermediary,
      usdValue: value,
      value,
    },
    {
      token: savingsAccount.savingsToken,
      value: savingsTokenOutAmount,
      usdValue: savingsAccount.converter.convertToAssets({ shares: savingsTokenOutAmount }),
    },
  ]
}
