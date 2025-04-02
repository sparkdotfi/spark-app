import { SavingsAccount } from '@/domain/savings-converters/types'
import { TransferFromUserFormNormalizedData } from '@/features/dialogs/common/logic/transfer-from-user/form'
import { TxOverviewRouteItem } from '@/features/dialogs/common/types'
import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'
import { SavingsDialogTxOverview } from '../../common/types'

export interface CreateTxOverviewParams {
  formValues: TransferFromUserFormNormalizedData
  savingsAccount: SavingsAccount
  savingsTokenBalance: NormalizedUnitNumber
}
export function createTxOverview({
  formValues,
  savingsAccount,
  savingsTokenBalance,
}: CreateTxOverviewParams): SavingsDialogTxOverview {
  const converter = savingsAccount.converter

  const [outTokenAmount, savingsTokenInAmount] = (() => {
    if (formValues.isMaxSelected) {
      const outTokenAmount = converter.convertToAssets({ shares: savingsTokenBalance })

      return [outTokenAmount, savingsTokenBalance]
    }

    const outTokenAmount = formValues.value
    const savingsTokenInAmount = converter.convertToShares({ assets: outTokenAmount })
    return [outTokenAmount, savingsTokenInAmount]
  })()

  if (outTokenAmount.eq(0)) {
    return { status: 'no-overview' }
  }

  const savingsRate = savingsTokenInAmount.times(NormalizedUnitNumber(converter.apy))
  const route = getWithdrawRoute({
    formValues,
    savingsAccount,
    savingsTokenInAmount,
  })

  return {
    underlyingToken: savingsAccount.underlyingToken,
    status: 'success',
    APY: converter.apy,
    stableEarnRate: savingsRate,
    route,
    skyBadgeToken: formValues.token,
    outTokenAmount,
  }
}

export interface GetWithdrawRouteParams {
  formValues: TransferFromUserFormNormalizedData
  savingsAccount: SavingsAccount
  savingsTokenInAmount: NormalizedUnitNumber
}
function getWithdrawRoute({
  formValues,
  savingsAccount,
  savingsTokenInAmount,
}: GetWithdrawRouteParams): TxOverviewRouteItem[] {
  const value = formValues.value
  const intermediary = savingsAccount.underlyingToken

  return [
    {
      token: savingsAccount.savingsToken,
      value: savingsTokenInAmount,
      usdValue: savingsAccount.converter.convertToAssets({ shares: savingsTokenInAmount }),
    },
    {
      token: intermediary,
      value,
      usdValue: value,
    },
    ...(intermediary.symbol !== formValues.token.symbol
      ? [
          {
            token: formValues.token,
            value,
            usdValue: value,
          },
        ]
      : []),
  ]
}
