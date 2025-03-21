import {
  lendingPoolAddress,
  migrationActionsConfig,
  testSparkStakingConfig,
  wethGatewayAddress,
} from '@/config/contracts-generated'
import { useChainConfigEntry } from '@/domain/hooks/useChainConfigEntry'
import { getContractAddress } from '@/domain/hooks/useContractAddress'
import { ActionsSettings } from '@/domain/state/actions-settings'
import { TokenSymbol } from '@/domain/types/TokenSymbol'
import { assert, BaseUnitNumber, raise } from '@marsfoundation/common-universal'
import { maxUint256 } from 'viem'
import { useChainId } from 'wagmi'
import { ApproveDelegationAction } from '../flavours/approve-delegation/types'
import { ApproveAction } from '../flavours/approve/types'
import { BorrowAction } from '../flavours/borrow/types'
import { ClaimMarketRewardsAction } from '../flavours/claim-market-rewards/types'
import { createConvertStablesActions } from '../flavours/convert-stables/logic/createConvertStablesActions'
import { createDepositToSavingsActions } from '../flavours/deposit-to-savings/logic/createDepositToSavingsActions'
import { DepositAction } from '../flavours/deposit/types'
import { DowngradeAction } from '../flavours/downgrade/types'
import { PermitAction } from '../flavours/permit/types'
import { RepayAction } from '../flavours/repay/types'
import { SetUseAsCollateralAction } from '../flavours/set-use-as-collateral/types'
import { SetUserEModeAction } from '../flavours/set-user-e-mode/logic/types'
import { StakeSparkAction } from '../flavours/stake-spark/types'
import { createStakeActions } from '../flavours/stake/logic/createStakeActions'
import { createUnstakeActions } from '../flavours/unstake/logic/createUnstakeActions'
import { UpgradeAction } from '../flavours/upgrade/types'
import { createWithdrawFromSavingsActions } from '../flavours/withdraw-from-savings/logic/createWithdrawFromSavingsActions'
import { WithdrawAction } from '../flavours/withdraw/types'
import { Action, ActionContext, Objective } from './types'

export interface UseCreateActionsParams {
  objectives: Objective[]
  actionsSettings: ActionsSettings
  context: ActionContext
  canWalletBatch: boolean
}

export function useCreateActions({
  objectives,
  actionsSettings: _actionSettings,
  context,
  canWalletBatch,
}: UseCreateActionsParams): Action[] {
  const chainConfig = useChainConfigEntry()
  const chainId = useChainId()
  const actionsSettings = { ..._actionSettings, preferPermits: canWalletBatch ? false : _actionSettings.preferPermits }

  function getNativeAssetInfoSymbol(): TokenSymbol {
    return chainConfig.markets?.nativeAssetInfo.nativeAssetSymbol ?? raise('Native asset info is not defined')
  }

  return objectives.flatMap((objective): Action[] => {
    // @note: you can create hooks (actions) conditionally, but ensure that component will be re-mounted when condition changes
    // to accomplish this, tweak stringifyObjectivesToStableActions function

    switch (objective.type) {
      case 'deposit': {
        const lendingPool = getContractAddress(lendingPoolAddress, chainId)

        const depositAction: DepositAction = {
          type: 'deposit',
          token: objective.token,
          value: objective.value,
        }

        if (objective.token.symbol === getNativeAssetInfoSymbol()) {
          return [depositAction]
        }

        if (actionsSettings.preferPermits && chainConfig.permitSupport[objective.token.address]) {
          const permitAction: PermitAction = {
            type: 'permit',
            token: objective.token,
            spender: lendingPool,
            value: objective.value,
          }

          return [permitAction, depositAction]
        }

        const approveAction: ApproveAction = {
          type: 'approve',
          token: objective.token,
          spender: lendingPool,
          value: objective.value,
        }
        return [approveAction, depositAction]
      }

      case 'withdraw': {
        const wethGateway = getContractAddress(wethGatewayAddress, chainId)

        const withdrawValue = objective.all
          ? objective.reserve.token.fromBaseUnit(BaseUnitNumber(maxUint256))
          : objective.value

        if (objective.reserve.token.symbol === getNativeAssetInfoSymbol()) {
          assert(objective.gatewayApprovalValue, 'gatewayApprovalValue is required for native asset')
          const approveAction: ApproveAction = {
            type: 'approve',
            token: objective.reserve.aToken,
            spender: wethGateway,
            value: objective.gatewayApprovalValue,
          }

          const withdrawAction: WithdrawAction = {
            type: 'withdraw',
            token: objective.reserve.token,
            value: withdrawValue,
          }
          return [approveAction, withdrawAction]
        }

        const withdrawAction: WithdrawAction = {
          type: 'withdraw',
          token: objective.reserve.token,
          value: withdrawValue,
        }
        return [withdrawAction]
      }

      case 'borrow': {
        if (objective.token.symbol === getNativeAssetInfoSymbol()) {
          const approveDelegationAction: ApproveDelegationAction = {
            type: 'approveDelegation',
            token: objective.token,
            value: objective.value,
          }

          const borrowAction: BorrowAction = {
            type: 'borrow',
            token: objective.token,
            value: objective.value,
          }
          return [approveDelegationAction, borrowAction]
        }

        const borrowAction: BorrowAction = {
          type: 'borrow',
          token: objective.token,
          value: objective.value,
        }
        return [borrowAction]
      }

      case 'repay': {
        const lendingPool = getContractAddress(lendingPoolAddress, chainId)

        const repayAction: RepayAction = {
          type: 'repay',
          reserve: objective.reserve,
          value: objective.value,
          useAToken: objective.useAToken,
        }

        if (objective.reserve.token.symbol === getNativeAssetInfoSymbol() || objective.useAToken) {
          return [repayAction]
        }

        if (actionsSettings.preferPermits && chainConfig.permitSupport[objective.reserve.token.address]) {
          const permitAction: PermitAction = {
            type: 'permit',
            token: objective.reserve.token,
            spender: lendingPool,
            value: objective.value,
          }

          return [permitAction, repayAction]
        }

        const approveAction: ApproveAction = {
          type: 'approve',
          token: objective.reserve.token,
          spender: lendingPool,
          requiredValue: objective.requiredApproval,
          value: objective.value,
        }
        return [approveAction, repayAction]
      }

      case 'setUseAsCollateral': {
        const setUseAsCollateralAction: SetUseAsCollateralAction = {
          type: 'setUseAsCollateral',
          token: objective.token,
          useAsCollateral: objective.useAsCollateral,
        }
        return [setUseAsCollateralAction]
      }

      case 'setUserEMode': {
        const setUserEModeAction: SetUserEModeAction = {
          type: 'setUserEMode',
          eModeCategoryId: objective.eModeCategoryId,
        }
        return [setUserEModeAction]
      }

      case 'claimMarketRewards': {
        const ClaimMarketRewardsActions: ClaimMarketRewardsAction = {
          type: 'claimMarketRewards',
          token: objective.token,
          incentiveControllerAddress: objective.incentiveControllerAddress,
          assets: objective.assets,
        }

        return [ClaimMarketRewardsActions]
      }

      case 'upgrade': {
        const approveAction: ApproveAction = {
          type: 'approve',
          token: objective.fromToken,
          spender: getContractAddress(migrationActionsConfig.address, chainId),
          value: objective.amount,
        }

        const upgradeAction: UpgradeAction = {
          type: 'upgrade',
          fromToken: objective.fromToken,
          toToken: objective.toToken,
          amount: objective.amount,
        }

        return [approveAction, upgradeAction]
      }

      case 'downgrade': {
        const approveAction: ApproveAction = {
          type: 'approve',
          token: objective.fromToken,
          spender: getContractAddress(migrationActionsConfig.address, chainId),
          value: objective.amount,
        }

        const downgradeAction: DowngradeAction = {
          type: 'downgrade',
          fromToken: objective.fromToken,
          toToken: objective.toToken,
          amount: objective.amount,
        }

        return [approveAction, downgradeAction]
      }

      case 'unstake': {
        return createUnstakeActions(objective, context)
      }

      case 'withdrawFromSavings': {
        return createWithdrawFromSavingsActions(objective, context)
      }

      case 'depositToSavings': {
        return createDepositToSavingsActions(objective, context)
      }

      case 'stake': {
        return createStakeActions(objective, context)
      }

      case 'claimFarmRewards': {
        return [
          {
            type: 'claimFarmRewards',
            farm: objective.farm,
            rewardToken: objective.rewardToken,
            rewardAmount: objective.rewardAmount,
          },
        ]
      }

      case 'claimSparkRewards': {
        return [
          {
            type: 'claimSparkRewards',
            token: objective.token,
            epoch: objective.epoch,
            cumulativeAmount: objective.cumulativeAmount,
            merkleRoot: objective.merkleRoot,
            merkleProof: objective.merkleProof,
          },
        ]
      }

      case 'convertStables': {
        return createConvertStablesActions(objective, context)
      }

      case 'stakeSpark': {
        const approveAction: ApproveAction = {
          type: 'approve',
          token: objective.spk,
          spender: getContractAddress(testSparkStakingConfig.address, chainId),
          value: objective.amount,
        }
        const stakeSparkAction: StakeSparkAction = {
          type: 'stakeSpark',
          spk: objective.spk,
          amount: objective.amount,
        }
        return [approveAction, stakeSparkAction]
      }

      case 'unstakeSpark': {
        return [
          {
            type: 'unstakeSpark',
            spk: objective.spk,
            amount: objective.amount,
            accountActiveShares: objective.accountActiveShares,
            unstakeAll: objective.unstakeAll,
          },
        ]
      }
    }
  })
}
