import { migrationActionsConfig, usdsPsmWrapperConfig } from '@/config/contracts-generated'
import { getContractAddress } from '@/domain/hooks/useContractAddress'
import { Token } from '@/domain/types/Token'
import { TokenSymbol } from '@/domain/types/TokenSymbol'
import { Action, ActionContext } from '@/features/actions/logic/types'
import { assert, BaseUnitNumber, NormalizedNumber, assertNever, raise } from '@sparkdotfi/common-universal'
import { TransactionReceipt, decodeEventLog, erc4626Abi } from 'viem'
import { ApproveAction } from '../../approve/types'
import { PsmConvertAction } from '../../psm-convert/types'
import { UpgradeAction } from '../../upgrade/types'
import { createWithdrawFromSavingsActions } from '../../withdraw-from-savings/logic/createWithdrawFromSavingsActions'
import { WithdrawFromSavingsObjective } from '../../withdraw-from-savings/types'
import { StakeAction, StakeObjective } from '../types'
import { getStakeActionPath } from './getStakeActionPath'

export function createStakeActions(objective: StakeObjective, context: ActionContext): Action[] {
  const { farmsInfo, chainId, tokenRepository } = context
  assert(farmsInfo && tokenRepository, 'Farms info and tokens info are required for stake action')

  const { stakingToken, rewardToken } = farmsInfo.findOneFarmByAddress(objective.farm)

  const approveStakeAction: ApproveAction = {
    type: 'approve',
    token: stakingToken,
    spender: objective.farm,
    value: objective.amount,
  }

  const stakeAction: StakeAction = {
    type: 'stake',
    farm: objective.farm,
    stakeAmount: objective.amount,
    rewardToken,
    stakingToken,
  }

  const actionPath = getStakeActionPath({
    token: objective.token,
    tokenRepository,
    stakingToken,
  })

  switch (actionPath) {
    case 'usds-to-farm':
      return [approveStakeAction, stakeAction]

    case 'dai-to-usds-to-farm': {
      const approveUpgradeAction: ApproveAction = {
        type: 'approve',
        token: objective.token,
        spender: getContractAddress(migrationActionsConfig.address, chainId),
        value: objective.amount,
      }

      const upgradeAction: UpgradeAction = {
        type: 'upgrade',
        fromToken: objective.token,
        toToken: stakingToken,
        amount: objective.amount,
      }

      return [approveUpgradeAction, upgradeAction, approveStakeAction, stakeAction]
    }

    case 'susds-to-usds-to-farm':
    case 'sdai-to-usds-to-farm': {
      const withdrawObjective: WithdrawFromSavingsObjective = {
        type: 'withdrawFromSavings',
        token: stakingToken,
        savingsToken: objective.token,
        amount: objective.amount,
        isRedeem: true,
        mode: 'withdraw',
      }

      let fallbackStakeAmount = NormalizedNumber.ZERO

      if (actionPath === 'susds-to-usds-to-farm') {
        assert(
          context.savingsAccounts,
          'Savings accounts repository info is required when input for stake is susds token',
        )
        const { converter } = context.savingsAccounts.findOneBySavingsTokenSymbol(TokenSymbol('sUSDS'))
        fallbackStakeAmount = converter.convertToAssets({ shares: objective.amount })
      }
      if (actionPath === 'sdai-to-usds-to-farm') {
        assert(
          context.savingsAccounts,
          'Savings accounts repository info is required when input for stake is sdai token',
        )
        const { converter } = context.savingsAccounts.findOneBySavingsTokenSymbol(TokenSymbol('sDAI'))
        fallbackStakeAmount = converter.convertToAssets({ shares: objective.amount })
      }

      const [, withdrawReceipt] = context.txReceipts.find(([action]) => action.type === 'withdrawFromSavings') ?? []
      const stakeAmount = withdrawReceipt
        ? getStakeAmountFromWithdrawReceipt(objective.token, withdrawReceipt)
        : fallbackStakeAmount

      return [
        ...createWithdrawFromSavingsActions(withdrawObjective, context),
        { ...approveStakeAction, value: stakeAmount },
        { ...stakeAction, stakeAmount },
      ]
    }

    case 'usdc-to-usds-to-farm': {
      const approveConvertAction: ApproveAction = {
        type: 'approve',
        token: objective.token,
        spender: getContractAddress(usdsPsmWrapperConfig.address, chainId),
        value: objective.amount,
      }

      const convertToUsdsAction: PsmConvertAction = {
        type: 'psmConvert',
        inToken: objective.token,
        outToken: tokenRepository.USDS ?? raise('USDS token is required for usds psm convert action'),
        amount: objective.amount,
      }

      return [approveConvertAction, convertToUsdsAction, approveStakeAction, stakeAction]
    }

    default:
      assertNever(actionPath)
  }
}

function getStakeAmountFromWithdrawReceipt(token: Token, receipt: TransactionReceipt): NormalizedNumber {
  for (const log of receipt.logs) {
    try {
      const decodedLog = decodeEventLog({
        abi: erc4626Abi,
        data: log.data,
        topics: log.topics,
      })
      if (decodedLog.eventName === 'Withdraw') {
        return token.fromBaseUnit(BaseUnitNumber(decodedLog.args.assets))
      }
    } catch {
      // ignore error - there may be some other events we are not able to parse
    }
  }
  throw new Error('Withdraw receipt does not contain withdraw event')
}
