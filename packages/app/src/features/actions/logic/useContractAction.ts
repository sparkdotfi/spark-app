import { UseWriteResult, useWrite } from '@/domain/hooks/useWrite'
import {
  Action,
  ActionHandler,
  ActionHandlerState,
  GetWriteConfigResult,
  InitialParamsBase,
  VerifyTransactionResultBase,
} from '@/features/actions/logic/types'
import { mapWriteResultToActionState } from '@/features/actions/logic/utils'
import { QueryKey, queryOptions, skipToken, useQuery, useQueryClient } from '@tanstack/react-query'
import { createApproveDelegationActionConfig } from '../flavours/approve-delegation/logic/approveDelegationAction'
import { createApproveActionConfig } from '../flavours/approve/logic/approveAction'
import { createBorrowActionConfig } from '../flavours/borrow/logic/borrowAction'
import { createClaimFarmRewardsActionConfig } from '../flavours/claim-farm-rewards/logic/claimFarmRewardsAction'
import { createClaimMarketRewardsActionConfig } from '../flavours/claim-market-rewards/logic/claimMarketRewardsAction'
import { createClaimSparkRewardsActionConfig } from '../flavours/claim-spark-rewards/logic/claimSparkRewardsAction'
import { createDepositToSavingsActionConfig } from '../flavours/deposit-to-savings/logic/depositToSavingsAction'
import { createDepositActionConfig } from '../flavours/deposit/logic/depositAction'
import { createDowngradeActionConfig } from '../flavours/downgrade/logic/downgradeAction'
import { createPsmConvertActionConfig } from '../flavours/psm-convert/logic/psmConvertAction'
import { createRepayActionConfig } from '../flavours/repay/logic/repayAction'
import { createSetUseAsCollateralActionConfig } from '../flavours/set-use-as-collateral/logic/setUseAsCollateralAction'
import { createSetUserEModeActionConfig } from '../flavours/set-user-e-mode/logic/setUserEModeAction'
import { createStakeSparkActionConfig } from '../flavours/stake-spark/logic/stakeSparkAction'
import { createStakeActionConfig } from '../flavours/stake/logic/stakeAction'
import { createUnstakeSparkActionConfig } from '../flavours/unstake-spark/logic/unstakeSparkAction'
import { createUnstakeActionConfig } from '../flavours/unstake/logic/unstakeAction'
import { createUpgradeActionConfig } from '../flavours/upgrade/logic/upgradeAction'
import { createWithdrawFromSavingsActionConfig } from '../flavours/withdraw-from-savings/logic/withdrawFromSavingsAction'
import { createWithdrawActionConfig } from '../flavours/withdraw/logic/withdrawAction'
import { ActionConfig, ActionContext, InitialParamsQueryResult, VerifyTransactionResult } from './types'

export interface UseContractActionParams {
  context: ActionContext
  action: Action
  enabled: boolean
}
export function useContractAction({ action, context, enabled }: UseContractActionParams): ActionHandler {
  const config = actionToConfig(action, context)
  const {
    initialParamsQueryOptions = defaultInitialParamsQueryOptions,
    getWriteConfig,
    verifyTransactionQueryOptions = defaultVerifyTransactionQueryOptions,
    invalidates,
    onSuccessfulAction,
  } = config

  const queryClient = useQueryClient()

  const initialParams = useQuery({
    ...initialParamsQueryOptions(),
    enabled,
  })

  const write = useWrite(
    {
      ...getWriteConfig(initialParams),
      enabled,
    },
    {
      onTransactionSettled: (txReceipt) => {
        invalidates().map((queryKey) => void queryClient.invalidateQueries({ queryKey }))
        onSuccessfulAction?.()
        context.txReceipts.push([action, txReceipt])
      },
    },
  )

  const verifyTransactionData = useQuery({
    ...verifyTransactionQueryOptions(),
    enabled: enabled && write.status.kind === 'success',
  })

  const state = mapStatusesToActionState({
    initialParams,
    write,
    verifyTransactionData,
    enabled,
  })

  return {
    action,
    state,
    onAction: write.write,
  }
}

interface MapStatusesToActionStateParams {
  initialParams: InitialParamsQueryResult
  write: UseWriteResult
  verifyTransactionData: VerifyTransactionResult
  enabled: boolean
}

function mapStatusesToActionState({
  initialParams,
  write,
  verifyTransactionData,
  enabled,
}: MapStatusesToActionStateParams): ActionHandlerState {
  if (!enabled) {
    return { status: 'disabled' }
  }

  if (initialParams.fetchStatus === 'fetching') {
    return { status: 'loading' }
  }

  if (initialParams.status === 'error') {
    return { status: 'error', errorKind: 'initial-params', message: initialParams.error.message }
  }

  if (initialParams.data?.canBeSkipped && initialParams.fetchStatus === 'idle') {
    return { status: 'success' }
  }

  if (verifyTransactionData.fetchStatus === 'fetching') {
    return { status: 'loading' }
  }

  if (verifyTransactionData.status === 'error') {
    return { status: 'error', errorKind: 'tx-verify', message: verifyTransactionData.error.message }
  }

  // Transaction result didn't reach it's objective,
  // for instance user went through the approval flow but manually tweaked approval level
  // and it's still too low
  if (write.status.kind === 'success' && verifyTransactionData.data?.success === false) {
    return { status: 'ready' }
  }

  return mapWriteResultToActionState(write)
}

export function actionToConfig(action: Action, context: ActionContext): ActionConfig {
  switch (action.type) {
    case 'approve':
      return createApproveActionConfig(action, context)
    case 'deposit':
      return createDepositActionConfig(action, context)
    case 'borrow':
      return createBorrowActionConfig(action, context)
    case 'setUseAsCollateral':
      return createSetUseAsCollateralActionConfig(action, context)
    case 'approveDelegation':
      return createApproveDelegationActionConfig(action, context)
    case 'setUserEMode':
      return createSetUserEModeActionConfig(action, context)
    case 'repay':
      return createRepayActionConfig(action, context)
    case 'claimMarketRewards':
      return createClaimMarketRewardsActionConfig(action, context)
    case 'withdraw':
      return createWithdrawActionConfig(action, context)
    case 'withdrawFromSavings':
      return createWithdrawFromSavingsActionConfig(action, context)
    case 'depositToSavings':
      return createDepositToSavingsActionConfig(action, context)
    case 'upgrade':
      return createUpgradeActionConfig(action, context)
    case 'downgrade':
      return createDowngradeActionConfig(action, context)
    case 'stake':
      return createStakeActionConfig(action, context)
    case 'unstake':
      return createUnstakeActionConfig(action, context)
    case 'psmConvert':
      return createPsmConvertActionConfig(action, context)
    case 'claimFarmRewards':
      return createClaimFarmRewardsActionConfig(action, context)
    case 'claimSparkRewards':
      return createClaimSparkRewardsActionConfig(action, context)
    case 'stakeSpark':
      return createStakeSparkActionConfig(action, context)
    case 'unstakeSpark':
      return createUnstakeSparkActionConfig(action, context)
    case 'permit':
      return createEmptyActionConfig()
  }
}

function createEmptyActionConfig(): ActionConfig {
  return {
    initialParamsQueryOptions: () => ({ queryKey: [], queryFn: skipToken }),
    getWriteConfig: () => ({}) as GetWriteConfigResult,
    verifyTransactionQueryOptions: () => ({ queryKey: [], queryFn: skipToken }),
    invalidates: () => [],
    beforeWriteCheck: () => {},
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function defaultInitialParamsQueryOptions() {
  return queryOptions<InitialParamsBase>({
    queryKey: ['default-initial-params'] as QueryKey,
    queryFn: () => ({ canBeSkipped: false }),
  })
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function defaultVerifyTransactionQueryOptions() {
  return queryOptions<VerifyTransactionResultBase>({
    queryKey: ['default-verify-transaction'] as QueryKey,
    queryFn: () => ({ success: true }),
  })
}
