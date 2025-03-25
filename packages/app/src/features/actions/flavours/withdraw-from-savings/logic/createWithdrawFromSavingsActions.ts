import {
  migrationActionsConfig,
  psm3Address,
  psmActionsConfig,
  savingsXDaiAdapterAddress,
  usdsPsmActionsConfig,
} from '@/config/contracts-generated'
import { getContractAddress } from '@/domain/hooks/useContractAddress'
import { SavingsConverter } from '@/domain/savings-converters/types'
import { TokenSymbol } from '@/domain/types/TokenSymbol'
import { Action, ActionContext } from '@/features/actions/logic/types'
import {
  assert,
  BaseUnitNumber,
  CheckedAddress,
  NormalizedUnitNumber,
  assertNever,
  raise,
} from '@sparkdotfi/common-universal'
import BigNumber from 'bignumber.js'
import { gnosis } from 'viem/chains'
import { ApproveAction } from '../../approve/types'
import { WithdrawFromSavingsAction, WithdrawFromSavingsObjective } from '../types'
import { formatMaxAmountInForPsm3 } from './formatMaxAmountInForPsm3'
import { getSavingsWithdrawActionPath } from './getSavingsWithdrawActionPath'

export function createWithdrawFromSavingsActions(
  objective: WithdrawFromSavingsObjective,
  context: ActionContext,
): Action[] {
  const tokenRepository = context.tokenRepository ?? raise('Tokens info is required for deposit to savings action')
  const chainId = context.chainId

  const withdrawAction: WithdrawFromSavingsAction = {
    type: 'withdrawFromSavings',
    amount: objective.amount,
    token: objective.token,
    savingsToken: objective.savingsToken,
    isRedeem: objective.isRedeem,
    mode: objective.mode,
    receiver: objective.mode === 'send' ? objective.receiver : undefined,
  }

  const getSusdsApproveAction = createApproveActionFromSavingsConverter({
    objective,
    converter: context.savingsAccounts?.findBySavingsTokenSymbol(TokenSymbol('sUSDS'))?.converter,
  })
  const getSdaiApproveAction = createApproveActionFromSavingsConverter({
    objective,
    converter: context.savingsAccounts?.findBySavingsTokenSymbol(TokenSymbol('sDAI'))?.converter,
  })

  const actionPath = getSavingsWithdrawActionPath({
    token: objective.token,
    savingsToken: objective.savingsToken,
    tokenRepository,
    chainId,
  })

  switch (actionPath) {
    case 'susds-to-usds':
    case 'sdai-to-dai':
    case 'susdc-to-usdc':
    case 'base-susdc-to-usdc':
    case 'arbitrum-susdc-to-usdc':
      return [withdrawAction]

    case 'sdai-to-usdc':
      return [getSdaiApproveAction(getContractAddress(psmActionsConfig.address, chainId)), withdrawAction]

    case 'susds-to-usdc':
      return [getSusdsApproveAction(getContractAddress(usdsPsmActionsConfig.address, chainId)), withdrawAction]

    case 'sdai-to-usds':
      return [getSdaiApproveAction(getContractAddress(migrationActionsConfig.address, chainId)), withdrawAction]

    case 'sdai-to-sexy-dai':
      return [getSdaiApproveAction(CheckedAddress(savingsXDaiAdapterAddress[gnosis.id])), withdrawAction]

    case 'base-susds-to-usdc':
    case 'base-susds-to-usds':
    case 'arbitrum-susds-to-usds':
    case 'arbitrum-susds-to-usdc': {
      assert(
        context.savingsAccounts,
        'Savings accounts repository info is required for psm withdraw from savings action',
      )
      const { converter } = context.savingsAccounts.findOneBySavingsTokenSymbol(TokenSymbol('sUSDS'))

      const maxSharesAmount = converter.convertToShares({ assets: objective.amount })
      const maxAmountIn = BaseUnitNumber(
        formatMaxAmountInForPsm3({
          susds: objective.savingsToken,
          susdsAmount: maxSharesAmount,
          assetOut: objective.token,
        }),
      )
      return [
        {
          type: 'approve',
          token: objective.savingsToken,
          spender: getContractAddress(psm3Address, chainId),
          value: objective.isRedeem ? objective.amount : objective.savingsToken.fromBaseUnit(maxAmountIn),
        },
        withdrawAction,
      ]
    }

    default:
      assertNever(actionPath)
  }
}

interface CreateApproveActionFromSavingsConverterParams {
  objective: WithdrawFromSavingsObjective
  converter?: SavingsConverter
}

function createApproveActionFromSavingsConverter({
  objective,
  converter,
}: CreateApproveActionFromSavingsConverterParams) {
  return (spender: CheckedAddress): ApproveAction => {
    // @note This assert is here and not on the callsite
    // to prevent raising an error while only one of the savings info is provided
    assert(converter, 'Savings info is required for withdraw from savings action approval')
    const savingTokenApprovalAmountEstimate = converter.convertToShares({ assets: objective.amount })

    return {
      type: 'approve',
      token: objective.savingsToken,
      spender,
      value: objective.isRedeem
        ? objective.amount
        : NormalizedUnitNumber(
            savingTokenApprovalAmountEstimate.toFixed(objective.savingsToken.decimals, BigNumber.ROUND_UP),
          ),
    }
  }
}
