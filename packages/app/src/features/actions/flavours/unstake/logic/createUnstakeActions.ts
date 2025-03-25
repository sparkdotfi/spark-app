import { migrationActionsConfig, usdsPsmWrapperConfig } from '@/config/contracts-generated'
import { getContractAddress } from '@/domain/hooks/useContractAddress'
import { Action, ActionContext } from '@/features/actions/logic/types'
import { assert, assertNever, raise } from '@sparkdotfi/common-universal'
import { ApproveAction } from '../../approve/types'
import { DowngradeAction } from '../../downgrade/types'
import { PsmConvertAction } from '../../psm-convert/types'
import { UnstakeAction, UnstakeObjective } from '../types'
import { getUnstakeActionPath } from './getUnstakeActionPath'

export function createUnstakeActions(objective: UnstakeObjective, context: ActionContext): Action[] {
  const { farmsInfo, chainId, tokenRepository } = context
  assert(farmsInfo && tokenRepository, 'Farms info and tokens info are required for stake action')

  const { stakingToken, rewardToken } = farmsInfo.findOneFarmByAddress(objective.farm)

  const unstakeAction: UnstakeAction = {
    type: 'unstake',
    farm: objective.farm,
    stakingToken,
    rewardToken,
    exit: objective.exit,
    amount: objective.amount,
  }

  const actionPath = getUnstakeActionPath({
    token: objective.token,
    tokenRepository,
    stakingToken,
  })

  switch (actionPath) {
    case 'farm-to-usds':
      return [unstakeAction]

    case 'farm-to-usds-to-dai': {
      const approveDowngradeAction: ApproveAction = {
        type: 'approve',
        token: stakingToken,
        spender: getContractAddress(migrationActionsConfig.address, chainId),
        value: objective.amount,
      }

      const downgradeAction: DowngradeAction = {
        type: 'downgrade',
        fromToken: stakingToken,
        toToken: objective.token,
        amount: objective.amount,
      }

      return [unstakeAction, approveDowngradeAction, downgradeAction]
    }

    case 'farm-to-usds-to-usdc': {
      const approveConvertAction: ApproveAction = {
        type: 'approve',
        token: stakingToken,
        spender: getContractAddress(usdsPsmWrapperConfig.address, chainId),
        value: objective.amount,
      }

      const convertToUsdcAction: PsmConvertAction = {
        type: 'psmConvert',
        inToken: tokenRepository.USDS ?? raise('USDS token is required for usds psm convert action'),
        outToken: objective.token,
        amount: objective.amount,
      }

      return [unstakeAction, approveConvertAction, convertToUsdcAction]
    }

    default:
      assertNever(actionPath)
  }
}
