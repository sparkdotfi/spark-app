import { assertNever } from '@sparkdotfi/common-universal'
import { useQueryClient } from '@tanstack/react-query'
import { Action, ActionContext, BatchActionHandler, BatchActionHandlerState } from './types'
import { BatchWriteStatus, useBatchWrite } from './useBatchWrite'
import { actionToConfig } from './useContractAction'
import { parseWriteErrorMessage } from './utils'

export interface UseBatchActionHandlerParams {
  actions: Action[]
  enabled: boolean
  onFinish?: () => void
  context: ActionContext
}

export function useBatchActionHandler({
  actions,
  enabled,
  onFinish,
  context,
}: UseBatchActionHandlerParams): BatchActionHandler {
  const queryClient = useQueryClient()

  const batchConfigs = actions.map((action) => actionToConfig(action, context))

  const contracts = batchConfigs.map((config) => config.getWriteConfig())
  function onTransactionSettled(): void {
    for (const config of batchConfigs) {
      const queryKeys = config.invalidates()
      for (const queryKey of queryKeys) {
        void queryClient.invalidateQueries({ queryKey })
      }
    }
    onFinish?.()
  }

  const { write, status } = useBatchWrite({
    enabled,
    contracts,
    callbacks: { onTransactionSettled },
  })

  return {
    actions,
    onAction: write,
    state: mapBatchWriteStatusToBatchActionState(status),
  }
}

function mapBatchWriteStatusToBatchActionState(status: BatchWriteStatus): BatchActionHandlerState {
  switch (status.kind) {
    case 'disabled':
      return { status: 'disabled' }

    case 'ready':
      return { status: 'ready' }

    case 'batch-sending':
      return { status: 'loading' }

    case 'batch-confirming':
      return { status: 'loading' }

    case 'success':
      return { status: 'success' }

    case 'error':
      return {
        status: 'error',
        errorKind: status.errorKind,
        message: parseWriteErrorMessage(status.error, { isBatchWrite: true }),
      }

    default:
      assertNever(status)
  }
}
