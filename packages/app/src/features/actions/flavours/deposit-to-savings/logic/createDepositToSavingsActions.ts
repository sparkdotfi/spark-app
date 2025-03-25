import {
  migrationActionsConfig,
  psm3Address,
  psmActionsConfig,
  usdcVaultAddress,
  usdsPsmActionsConfig,
} from '@/config/contracts-generated'
import { getContractAddress } from '@/domain/hooks/useContractAddress'
import { Action, ActionContext } from '@/features/actions/logic/types'
import { CheckedAddress, assertNever, raise } from '@sparkdotfi/common-universal'
import { ApproveAction } from '../../approve/types'
import { DepositToSavingsAction, DepositToSavingsObjective } from '../types'
import { getSavingsDepositActionPath } from './getSavingsDepositActionPath'

export function createDepositToSavingsActions(objective: DepositToSavingsObjective, context: ActionContext): Action[] {
  const tokenRepository = context.tokenRepository ?? raise('Tokens info is required for deposit to savings action')
  const chainId = context.chainId

  const depositAction: DepositToSavingsAction = {
    type: 'depositToSavings',
    value: objective.value,
    token: objective.token,
    savingsToken: objective.savingsToken,
  }
  function getApproveAction(spender: CheckedAddress): ApproveAction {
    return {
      type: 'approve',
      token: objective.token,
      spender,
      value: objective.value,
    }
  }

  const actionPath = getSavingsDepositActionPath({
    token: objective.token,
    savingsToken: objective.savingsToken,
    tokenRepository,
    chainId,
  })

  switch (actionPath) {
    case 'sexy-dai-to-sdai':
      return [depositAction]

    case 'usdc-to-sdai':
      return [getApproveAction(getContractAddress(psmActionsConfig.address, chainId)), depositAction]

    case 'usdc-to-susds':
      return [getApproveAction(getContractAddress(usdsPsmActionsConfig.address, chainId)), depositAction]

    case 'dai-to-susds':
      return [getApproveAction(getContractAddress(migrationActionsConfig.address, chainId)), depositAction]

    case 'dai-to-sdai':
    case 'usds-to-susds':
      return [getApproveAction(objective.savingsToken.address), depositAction]

    case 'usdc-to-susdc':
    case 'base-usdc-to-susdc':
    case 'arbitrum-usdc-to-susdc':
      return [getApproveAction(getContractAddress(usdcVaultAddress, chainId)), depositAction]

    case 'base-usdc-to-susds':
    case 'base-usds-to-susds':
    case 'arbitrum-usds-to-susds':
    case 'arbitrum-usdc-to-susds':
      return [getApproveAction(getContractAddress(psm3Address, chainId)), depositAction]

    default:
      assertNever(actionPath)
  }
}
