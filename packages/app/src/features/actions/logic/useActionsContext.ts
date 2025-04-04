import { useSandboxState } from '@/domain/sandbox/useSandboxState'
import { useConnectedAddress } from '@/domain/wallet/useConnectedAddress'
import { useMemo, useRef } from 'react'
import { TransactionReceipt } from 'viem'
import { useChainId, useConfig } from 'wagmi'
import { createPermitStore } from './permits'
import { Action, ActionContext, InjectedActionsContext } from './types'

export function useActionsContext(injectedContext?: InjectedActionsContext): ActionContext {
  const permitStore = useMemo(() => createPermitStore(), []) // useMemo not to call createPermitStore on every render
  const txReceipts = useRef<[Action, TransactionReceipt][]>([]).current
  const chainId = useChainId()
  const { account } = useConnectedAddress()
  const wagmiConfig = useConfig()
  const { isInSandbox } = useSandboxState()

  return {
    ...injectedContext,
    permitStore,
    txReceipts,
    wagmiConfig,
    account,
    chainId,
    isInSandbox,
  }
}
