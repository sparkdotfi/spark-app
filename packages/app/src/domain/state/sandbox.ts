import { DeepPartial } from 'ts-essentials'
import { StateCreator } from 'zustand'

import { tryOrDefault } from '@/utils/tryOrDefault'

import type { SetupWorker } from 'msw/browser'
import { StoreState } from '.'

const SANDBOX_EXPIRY = 6 * 3600 * 1000 // 6 hours

export interface SandboxNetwork {
  name: string // will be displayed to the user in wallet UI
  forkUrl: string
  originChainId: number
  forkChainId: number
  createdAt: Date
  ephemeralAccountPrivateKey?: `0x${string}`
  msw?: SetupWorker
}

export interface Sandbox {
  network: SandboxNetwork | undefined
  setNetwork: (network: SandboxNetwork | undefined) => void
}

export interface SandboxSlice {
  sandbox: Sandbox
}

// eslint-disable-next-line func-style
export const initSandboxSlice: StateCreator<StoreState, [], [], SandboxSlice> = (set) => ({
  sandbox: {
    network: undefined,
    setNetwork: (network: SandboxNetwork | undefined) =>
      set((state) => ({ sandbox: { network, setNetwork: state.sandbox.setNetwork } })),
  },
})

export interface PersistedSandboxSlice {
  sandbox: {
    network?: {
      name: string
      forkUrl: string
      originChainId: number
      forkChainId: number
      createdAt: string
      ephemeralAccountPrivateKey?: `0x${string}`
    }
  }
}

export function persistSandboxSlice(state: StoreState): PersistedSandboxSlice {
  if (!state.sandbox.network) {
    return {
      sandbox: {},
    }
  }

  const { msw: _, ...serializableFields } = state.sandbox.network

  return {
    sandbox: {
      network: {
        ...serializableFields,
        createdAt: serializableFields.createdAt.toISOString(),
      },
    },
  }
}

export function unPersistSandboxSlice(persistedState: DeepPartial<PersistedSandboxSlice>): DeepPartial<SandboxSlice> {
  if (
    !persistedState.sandbox?.network ||
    (import.meta.env.VITE_FEATURE_CLEAR_STALE_SANDBOX === '1' && isPersistedSandboxExpired(persistedState))
  ) {
    return {}
  }

  return {
    sandbox: {
      network: {
        ...persistedState.sandbox.network,
        createdAt: tryOrDefault(() => {
          const date = persistedState.sandbox?.network?.createdAt

          return date ? new Date(date) : undefined
        }, undefined),
      },
    },
  }
}

function isPersistedSandboxExpired(persistedState: DeepPartial<PersistedSandboxSlice>): boolean {
  const createdAt = tryOrDefault(() => {
    const createdAt = persistedState?.sandbox?.network?.createdAt
    return createdAt ? new Date(createdAt) : undefined
  }, undefined)

  if (createdAt === undefined) {
    return true
  }

  const now = new Date()
  return now.getTime() - createdAt.getTime() > SANDBOX_EXPIRY
}
